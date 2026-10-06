import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { buildMotionCut, inspectGif } from '../media/motion.mjs';
import { buildDeliveryPackage, calculateReviewSnapshot, calculateMediaReviewBinding } from '../media/delivery.mjs';
import { importGeneratedImage, prepareMediaJobs } from '../media/image-backends.mjs';
import { execFileAsync, sha256, writeJson } from '../media/common.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-media-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await sharp({ create: { width: 160, height: 100, channels: 3, background: '#fff' } }).composite([{ input: Buffer.from('<svg width="40" height="40"><rect width="40" height="40" fill="red"/></svg>'), left: 10, top: 30 }]).png().toFile(path.join(root, 'a.png'));
  await sharp({ create: { width: 160, height: 100, channels: 3, background: '#fff' } }).composite([{ input: Buffer.from('<svg width="40" height="40"><rect width="40" height="40" fill="red"/></svg>'), left: 105, top: 30 }]).png().toFile(path.join(root, 'b.png'));
  return root;
}

test('real moving GIF includes an infinite closed loop, poster and preview', async (t) => {
  const root = await fixture(t), out = path.join(root, 'motion');
  const result = await buildMotionCut({ id: 'demo', frames: ['a.png', 'b.png'], source_type: 'verified_images', width: 320 }, { baseDir: root, outDir: out });
  const inspected = await inspectGif(path.join(out, result.output));
  assert.equal(inspected.width, 320); assert.equal(inspected.height, 200);
  assert.ok(inspected.frames >= 2); assert.ok(inspected.distinct_frames >= 2);
  assert.equal(inspected.loop, 0); assert.equal(inspected.loop_join_identical, true);
  assert.ok(inspected.bytes <= 8_000_000);
  assert.ok((await fs.readFile(path.join(out, result.preview), 'utf8')).includes('./demo.gif'));
  const poster = await sharp(await fs.readFile(path.join(out, result.poster))).metadata(); assert.equal(poster.width, 320); assert.equal(poster.pages ?? 1, 1);
});

test('motion rejects generated performance proof, identical frames and byte cap', async (t) => {
  const root = await fixture(t);
  await assert.rejects(buildMotionCut({ source_type: 'generated_explainer', purpose: 'performance-proof', frames: ['a.png', 'b.png'] }, { baseDir: root }), /Performance proof/);
  await assert.rejects(buildMotionCut({ source_type: 'verified_images', frames: ['a.png', 'a.png'] }, { baseDir: root }), /no visual motion/);
  await assert.rejects(buildMotionCut({ source_type: 'verified_images', frames: ['a.png', 'b.png'], width: 160, max_bytes: 100 }, { baseDir: root }), /byte cap/);
});

test('JPEG/WebP frame inputs are normalized to valid PNG before GIF encoding', async (t) => {
  const root = await fixture(t);
  await sharp(await fs.readFile(path.join(root, 'a.png'))).jpeg().toFile(path.join(root, 'a.jpg'));
  await sharp(await fs.readFile(path.join(root, 'b.png'))).webp().toFile(path.join(root, 'b.webp'));
  const result = await buildMotionCut({ id: 'mixed', source_type: 'verified_images', frames: ['a.jpg', 'b.webp'], width: 160 }, { baseDir: root });
  assert.equal(result.qa.animated, true);
});

test('real footage conversion path detects a video stream and motion', async (t) => {
  const root = await fixture(t);
  // Synthetic video is a mechanical fixture, not a claimed product performance sample.
  await execFileAsync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=160x100:rate=10:duration=1', '-c:v', 'mpeg4', path.join(root, 'fixture.mp4')], { timeout: 30_000, windowsHide: true });
  const result = await buildMotionCut({ id: 'clip', source_type: 'actual_footage', purpose: 'performance-proof', footage: 'fixture.mp4', width: 160, duration_seconds: 1 }, { baseDir: root });
  assert.ok(result.qa.animated); assert.equal(result.truth_level, 'actual_footage'); assert.equal(result.qa.loop_reviewed, false);
});

test('generated GIF frames require actual 2.5 provenance and approval', async (t) => {
  const root = await fixture(t);
  const document = { schema_version: 1, jobs: ['a', 'b'].map((id) => ({ id, kind: 'image', backend: 'ima2', model_requested: 'gpt-image-2.5-sunburst', input_refs: [], requires_product_reference: false, prompt: `frame ${id}` })) };
  const plan = await prepareMediaJobs(document, { baseDir: root, capabilities: { ima2: { available: true, model_pinning: true, supported_models: [{ id: 'gpt-image-2.5-sunburst', lane: 'oauth' }], generation_contract: { source: 'documented_contract', contract_reference: 'hypothetical future OAuth pinning fixture', image_model_flag: '--model', provider_flag: '--provider', supported_lanes: ['oauth'], supported_models: ['gpt-image-2.5-sunburst'], api_only: false } } }, approval: { approved: true, job_ids: ['a', 'b'], estimated_usage: '2 images' } });
  const results = [];
  for (const job of plan.jobs) {
    const file = `${job.id}.png`, hash = sha256(await fs.readFile(path.join(root, file)));
    results.push(await importGeneratedImage(job, { file, provenance: { backend: 'ima2', request_id: job.id, model_actual: job.model_requested, model_evidence: { source: 'tool_response', request_id: job.id, model_actual: job.model_requested }, input_refs: [], output_sha256: hash } }, { baseDir: root }));
  }
  const config = { id: 'generated', source_type: 'generated_explainer', frames: ['a.png', 'b.png'], width: 160 };
  await assert.rejects(buildMotionCut(config, { baseDir: root }), /frame result provenance/);
  const motion = await buildMotionCut({ ...config, frame_results: results }, { baseDir: root });
  assert.equal(motion.truth_level, 'generated_concept'); assert.equal(motion.frame_provenance.length, 2);
});

async function deliveryFixture(t) {
  const root = await fixture(t);
  const motion = await buildMotionCut({ id: 'demo', source_type: 'verified_images', frames: ['a.png', 'b.png'], width: 320 }, { baseDir: root });
  await writeJson(path.join(root, 'page-plan.json'), { schema_version: 1, product_name: '상품 <한정판>', pack_status: 'pack_verified', missing_information: [], sections: [
    { id: 'intro', role: 'hook', questions: ['Q1', 'Q2', 'Q3', 'Q8'], media_job_id: 'still', copy_render_mode: 'separate', copy: { headline: '정확한 카피', body: '조건 3,000원' }, fact_ids: ['price'], evidence_ids: [] },
    { id: 'how', role: 'explainer', questions: ['Q4', 'Q5', 'Q6', 'Q7'], media_job_id: 'moving', copy: { headline: '구성 변화' }, fact_ids: [], evidence_ids: ['source'] },
  ] });
  await writeJson(path.join(root, 'media-results.json'), { schema_version: 1, results: [
    { job_id: 'still', status: 'complete', file: 'a.png', kind: 'image', truth_level: 'verified_images', qa: { copy_reviewed: true, visual_reviewed: true, product_identity_reviewed: true } },
    { job_id: 'moving', status: 'complete', file: `motion/${motion.output}`, poster: `motion/${motion.poster}`, kind: 'gif', truth_level: 'verified_images', qa: { copy_reviewed: true, visual_reviewed: true, product_identity_reviewed: true, loop_reviewed: true } },
  ] });
  await fs.writeFile(path.join(root, 'legal.md'), '거래 조건 원문\n가격 3,000원\n');
  await fs.writeFile(path.join(root, 'production-brief.md'), '# 기획서 원문\n상품별 계획\n');
  await fs.writeFile(path.join(root, '.env'), 'DO_NOT_PACKAGE=secret');
  await fs.writeFile(path.join(root, 'facts.md'), '조건 3,000원');
  await writeJson(path.join(root, 'product-brief.json'), { schema_version: 1, product: { name: '상품 <한정판>', category: 'living', topic: 'gift' }, assets: [], facts: [{ id: 'price', text: '조건 3,000원', status: 'confirmed', source: { file: 'facts.md', quote: '조건 3,000원', reviewed: true } }] });
  await writeJson(path.join(root, 'media-jobs.json'), { schema_version: 1, jobs: [{ id: 'still', kind: 'image', purpose: 'hook', truth_level: 'actual_asset' }, { id: 'moving', kind: 'gif', purpose: 'options', truth_level: 'actual_asset', motion: { source_type: 'verified_images' } }] });
  await writeJson(path.join(root, 'evidence-matrix.json'), { schema_version: 1, status: 'pack_verified', rows: [{ id: 'source', status: 'accepted_pattern' }] });
  const plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  plan.copy_approval = { status: 'approved', snapshot_sha256: await calculateReviewSnapshot(root) };
  await writeJson(path.join(root, 'page-plan.json'), plan);
  const reviewedMedia = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8'));
  for (const result of reviewedMedia.results) result.qa.review_binding = await calculateMediaReviewBinding(root, plan.sections.find((s) => s.media_job_id === result.job_id), result);
  await writeJson(path.join(root, 'media-results.json'), reviewedMedia);
  return root;
}

test('delivery preserves GIF bytes, order, copy, legal and portable refs in ZIP', async (t) => {
  const root = await deliveryFixture(t), out = path.join(root, 'delivery');
  const manifest = await buildDeliveryPackage(root, { outDir: out, publication: true });
  assert.equal(manifest.publication_ready, true);
  assert.equal(manifest.publication_status, 'ready');
  assert.deepEqual(manifest.sections.map((s) => s.id), ['intro', 'how']);
  const gif = await fs.readFile(path.join(out, 'media/how.gif'));
  assert.equal(sha256(gif), sha256(await fs.readFile(path.join(root, 'motion/demo.gif'))));
  assert.ok((await inspectGif(path.join(out, 'media/how.gif'))).animated);
  const html = await fs.readFile(path.join(out, 'index.html'), 'utf8');
  assert.ok(html.indexOf('id="intro"') < html.indexOf('id="how"')); assert.ok(html.includes('src="./media/how.gif"'));
  assert.ok(html.includes('상품 &lt;한정판&gt;')); assert.ok(html.includes('3,000원'));
  assert.ok(html.includes('거래 조건 원문')); assert.ok(!html.includes('<header>')); assert.ok(!html.includes('data-job-id'));
  assert.ok(!html.includes('<h2>구성 변화</h2>')); assert.ok(html.includes('<h2>정확한 카피</h2>'));
  assert.equal(await fs.readFile(path.join(out, 'legal.md'), 'utf8'), '거래 조건 원문\n가격 3,000원\n');
  for (const name of ['product-brief.json', 'production-brief.md', 'evidence-matrix.json']) assert.deepEqual(await fs.readFile(path.join(out, name)), await fs.readFile(path.join(root, name)));
  const zip = await fs.readFile(path.join(out, 'delivery.zip'));
  assert.equal(zip.readUInt32LE(0), 0x04034b50); assert.ok(zip.includes(Buffer.from('media/how.gif'))); assert.ok(!zip.includes(Buffer.from('DO_NOT_PACKAGE')));
  assert.ok(!manifest.included_files.some((f) => f.includes('.env')));
});

test('delivery blocks missing, failed and duplicate media, generated proof and pending reviews', async (t) => {
  const root = await deliveryFixture(t), original = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8'));
  for (const [mutate, expected] of [
    [(d) => { d.results.pop(); }, /Missing or failed/],
    [(d) => { d.results[0].status = 'failed'; }, /Missing or failed/],
    [(d) => { d.results.push(d.results[0]); }, /Duplicate result/],
    [(d) => { d.results[1].truth_level = 'generated_concept'; d.results[1].purpose = 'performance-proof'; }, /Media purpose differs/],
    [(d) => { d.results[1].qa.visual_reviewed = false; }, /Publication requires/],
  ]) {
    const value = structuredClone(original); mutate(value); await writeJson(path.join(root, 'media-results.json'), value);
    await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), expected);
  }
  await writeJson(path.join(root, 'media-results.json'), original);
  original.results[1].qa.visual_reviewed = false; await writeJson(path.join(root, 'media-results.json'), original);
  assert.equal((await buildDeliveryPackage(root, { outDir: path.join(root, 'preview') })).publication_ready, false);
});

test('publication requires current plan/source snapshot, verified pack and complete information', async (t) => {
  const root = await deliveryFixture(t), original = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  for (const change of [(p) => { p.missing_information = ['size']; }, (p) => { p.pack_status = 'pack_retrieval_weak'; }, (p) => { p.copy_approval.status = 'pending'; }, (p) => { p.sections[0].copy.headline = 'Changed after review'; }]) {
    const value = structuredClone(original); change(value); await writeJson(path.join(root, 'page-plan.json'), value);
    await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Publication requires/);
  }
  await writeJson(path.join(root, 'page-plan.json'), original);
  await fs.appendFile(path.join(root, 'facts.md'), '\n원문 변경');
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /copy_approval_missing_or_stale/);
});

test('changing displayed legal terms after approval invalidates publication', async (t) => {
  const root = await deliveryFixture(t), before = await calculateReviewSnapshot(root);
  await fs.appendFile(path.join(root, 'legal.md'), '\n배송비 변경: 5,000원\n');
  assert.notEqual(await calculateReviewSnapshot(root), before);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /copy_approval_missing_or_stale/);
});

test('review snapshot binds every linked and original legacy source file, not just a primary quote', async (t) => {
  const root = await deliveryFixture(t), brief = JSON.parse(await fs.readFile(path.join(root, 'product-brief.json'), 'utf8'));
  await fs.writeFile(path.join(root, 'source.md'), '보조 근거 원문');
  await fs.writeFile(path.join(root, 'raw-input.md'), '수입된 상품 원문');
  await fs.writeFile(path.join(root, 'cuts.md'), '원본 상세페이지 카피');
  brief.facts[0].sources = [{ file: 'source.md', quote: '보조 근거 원문' }];
  brief.source_links = [{ sources: [{ file: 'raw-input.md', quote: '수입된 상품 원문' }] }];
  await writeJson(path.join(root, 'product-brief.json'), brief);
  await writeJson(path.join(root, 'legacy-source-bundle.json'), { schema_version: 1, source_directory: root, files: { 'cuts.md': { content: '원본 상세페이지 카피', sha256: sha256(Buffer.from('원본 상세페이지 카피')) } } });
  const plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  plan.copy_approval = { status: 'approved', snapshot_sha256: await calculateReviewSnapshot(root) }; await writeJson(path.join(root, 'page-plan.json'), plan);
  for (const name of ['source.md', 'raw-input.md', 'cuts.md']) {
    const before = await fs.readFile(path.join(root, name));
    await fs.appendFile(path.join(root, name), '\n승인 후 수정');
    await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /copy_approval_missing_or_stale/);
    await fs.writeFile(path.join(root, name), before);
  }
  const out = path.join(root, 'ready'); await buildDeliveryPackage(root, { outDir: out, publication: true });
  assert.deepEqual(await fs.readFile(path.join(out, 'legacy-source-bundle.json')), await fs.readFile(path.join(root, 'legacy-source-bundle.json')));
});

test('planned GIF cannot be satisfied by a complete PNG with the same job ID', async (t) => {
  const root = await deliveryFixture(t), media = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8'));
  media.results[1] = { ...media.results[1], kind: 'image', file: 'b.png' }; await writeJson(path.join(root, 'media-results.json'), media);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Media kind differs/);
});

test('planned performance proof cannot be bypassed by changing or omitting result purpose', async (t) => {
  const root = await deliveryFixture(t), jobs = JSON.parse(await fs.readFile(path.join(root, 'media-jobs.json'), 'utf8'));
  jobs.jobs[1].purpose = 'performance-proof'; jobs.jobs[1].motion = { source_type: 'actual_footage', requires_actual_footage: true }; await writeJson(path.join(root, 'media-jobs.json'), jobs);
  const media = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8'));
  media.results[1].purpose = 'options'; await writeJson(path.join(root, 'media-results.json'), media);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Media purpose differs/);
  delete media.results[1].purpose; await writeJson(path.join(root, 'media-results.json'), media);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Generated performance proof/);
});

test('planned generated GIF cannot skip 2.5 lineage by claiming verified images', async (t) => {
  const root = await deliveryFixture(t), jobs = JSON.parse(await fs.readFile(path.join(root, 'media-jobs.json'), 'utf8'));
  jobs.jobs[1].truth_level = 'generated_concept'; jobs.jobs[1].motion.source_type = 'generated_explainer'; await writeJson(path.join(root, 'media-jobs.json'), jobs);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /cannot be relabeled/);
  jobs.jobs.push(jobs.jobs[1]); await writeJson(path.join(root, 'media-jobs.json'), jobs);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Duplicate planned media job/);
});

async function compositionFixture(t, generated = false) {
  const root = await deliveryFixture(t), plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  plan.sections[0].text_render_mode = 'hybrid'; delete plan.sections[0].copy_render_mode;
  await writeJson(path.join(root, 'page-plan.json'), plan);
  if (generated) {
    const jobs = JSON.parse(await fs.readFile(path.join(root, 'media-jobs.json'), 'utf8'));
    jobs.jobs[0].truth_level = 'generated_concept'; await writeJson(path.join(root, 'media-jobs.json'), jobs);
    const media = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8')), result = media.results[0];
    const reference = { file: 'a.png', sha256: sha256(await fs.readFile(path.join(root, 'a.png'))) };
    result.truth_level = 'generated_concept'; result.backend = 'ima2'; result.model_requested = 'gpt-image-2.5-sunburst'; result.input_refs = [reference];
    result.provenance = { backend: 'ima2', model_actual: result.model_requested, request_id: 'fixture-request', input_refs: [reference], output_sha256: reference.sha256, model_evidence: { source: 'tool_response', model_actual: result.model_requested, request_id: 'fixture-request', input_refs: [reference] } };
    await writeJson(path.join(root, 'media-results.json'), media);
  }
  const { composeMediaText } = await import('../lib/text-composition.mjs');
  const composed = await composeMediaText(root, { outFile: path.join(root, 'composed-results.json'), width: 720, height: 800, image_height: 300 });
  for (const result of composed.results.results) result.qa = { ...result.qa, copy_reviewed: true, visual_reviewed: true, product_identity_reviewed: true, review_binding: await calculateMediaReviewBinding(root, plan.sections.find((s) => s.media_job_id === result.job_id), result) };
  await writeJson(path.join(root, 'composed-results.json'), composed.results);
  plan.copy_approval = { status: 'approved', snapshot_sha256: await calculateReviewSnapshot(root) }; await writeJson(path.join(root, 'page-plan.json'), plan);
  return root;
}

test('composed 2.5 image validates original model base and packages editable SVG without duplicate copy', async (t) => {
  const root = await compositionFixture(t, true), out = path.join(root, 'delivery'), original = await fs.readFile(path.join(root, 'a.png'));
  const sourceResults = await fs.readFile(path.join(root, 'media-results.json'));
  const manifest = await buildDeliveryPackage(root, { outDir: out, publication: true, mediaResultsFile: 'composed-results.json' });
  assert.equal(manifest.publication_status, 'ready');
  assert.equal(manifest.sections[0].composition.verified, true);
  assert.deepEqual(await fs.readFile(path.join(out, manifest.sections[0].composition.base_file)), original);
  assert.ok((await fs.readFile(path.join(out, manifest.sections[0].composition.text_file), 'utf8')).includes('정확한 카피'));
  assert.ok((await fs.readFile(path.join(out, 'delivery.zip'))).includes(Buffer.from('media/intro.text.svg')));
  const html = await fs.readFile(path.join(out, 'index.html'), 'utf8'); assert.ok(!html.includes('<h2>정확한 카피</h2>'));
  assert.deepEqual(await fs.readFile(path.join(root, 'media-results.json')), sourceResults);
});

test('composition refuses changed composite, current copy, base source or SVG bytes', async (t) => {
  const root = await compositionFixture(t), document = JSON.parse(await fs.readFile(path.join(root, 'composed-results.json'), 'utf8')), result = document.results[0];
  for (const [file, expected] of [[result.file, /base\/output hash mismatch/], [result.composition.base_file, /base\/output hash mismatch/], [result.composition.text_file, /editable layer hash mismatch/]]) {
    const original = await fs.readFile(path.join(root, file)); await fs.appendFile(path.join(root, file), '\nchanged');
    await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), expected);
    await fs.writeFile(path.join(root, file), original);
  }
  const compositeFile = path.join(root, result.file), originalComposite = await fs.readFile(compositeFile);
  const otherImage = await sharp(originalComposite).modulate({ brightness: 0.8 }).png().toBuffer();
  await fs.writeFile(compositeFile, otherImage); result.composition.output_sha256 = sha256(otherImage); await writeJson(path.join(root, 'composed-results.json'), document);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), /pixels differ/);
  await fs.writeFile(compositeFile, originalComposite); result.composition.output_sha256 = sha256(originalComposite); await writeJson(path.join(root, 'composed-results.json'), document);
  const plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8')); plan.sections[0].copy.headline = '승인 후 바뀐 카피'; await writeJson(path.join(root, 'page-plan.json'), plan);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), /copy has changed/);
});

test('review flags are invalid without current media, poster, copy and source bindings', async (t) => {
  const root = await deliveryFixture(t), original = JSON.parse(await fs.readFile(path.join(root, 'media-results.json'), 'utf8'));
  const missing = structuredClone(original); delete missing.results[0].qa.review_binding; await writeJson(path.join(root, 'media-results.json'), missing);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Publication requires/);
  await writeJson(path.join(root, 'media-results.json'), original);
  const imageFile = path.join(root, original.results[0].file), image = await fs.readFile(imageFile);
  await fs.copyFile(path.join(root, 'b.png'), imageFile);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Publication requires/);
  await fs.writeFile(imageFile, image);
  const posterFile = path.join(root, original.results[1].poster), poster = await fs.readFile(posterFile);
  await sharp(await fs.readFile(path.join(root, 'b.png'))).resize(320, 200).png().toFile(path.join(root, 'changed-poster.png'));
  await fs.copyFile(path.join(root, 'changed-poster.png'), posterFile);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Publication requires/);
  await fs.writeFile(posterFile, poster);
  const plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  plan.sections[0].copy.headline = '검수 후 변경'; await writeJson(path.join(root, 'page-plan.json'), plan);
  plan.copy_approval = { status: 'approved', snapshot_sha256: await calculateReviewSnapshot(root) }; await writeJson(path.join(root, 'page-plan.json'), plan);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /Publication requires/);
});

test('publication rejects blank or unresolved legal terms even with refreshed approval', async (t) => {
  const root = await deliveryFixture(t), plan = JSON.parse(await fs.readFile(path.join(root, 'page-plan.json'), 'utf8'));
  for (const legal of ['  \n', '[자료 필요: 공식 거래·고시 문구]']) {
    await fs.writeFile(path.join(root, 'legal.md'), legal); plan.copy_approval = { status: 'approved', snapshot_sha256: await calculateReviewSnapshot(root) }; await writeJson(path.join(root, 'page-plan.json'), plan);
    await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true }), /legal_information_missing_or_unresolved/);
  }
});

test('generated results must retain planned reference hashes and unchanged actual sources', async (t) => {
  const root = await compositionFixture(t, true), jobs = JSON.parse(await fs.readFile(path.join(root, 'media-jobs.json'), 'utf8'));
  jobs.jobs[0].requires_product_reference = true; jobs.jobs[0].input_refs = [{ file: 'a.png', role: 'product_identity' }]; await writeJson(path.join(root, 'media-jobs.json'), jobs);
  const original = JSON.parse(await fs.readFile(path.join(root, 'composed-results.json'), 'utf8'));
  const missing = structuredClone(original); missing.results[0].input_refs = []; missing.results[0].provenance.input_refs = []; missing.results[0].provenance.model_evidence.input_refs = []; await writeJson(path.join(root, 'composed-results.json'), missing);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), /Planned generation reference missing/);
  await writeJson(path.join(root, 'composed-results.json'), original);
  const reference = await fs.readFile(path.join(root, 'a.png')); await fs.copyFile(path.join(root, 'b.png'), path.join(root, 'a.png'));
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), /reference missing or changed/);
  await fs.writeFile(path.join(root, 'a.png'), reference); jobs.jobs[0].input_refs = []; await writeJson(path.join(root, 'media-jobs.json'), jobs);
  await assert.rejects(buildDeliveryPackage(root, { outDir: path.join(root, 'blocked'), publication: true, mediaResultsFile: 'composed-results.json' }), /Planned product reference missing/);
});
