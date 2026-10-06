import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { assertId, escapeHtml, localFile, readJson, sha256, writeJson } from './common.mjs';
import { inspectGif } from './motion.mjs';
import { isImage25, verifyImageProvenance } from './image-backends.mjs';
import { writeZip } from './zip.mjs';
import { validateProject } from '../validate-page-plan.mjs';

const SOURCE_DOCUMENTS = ['legal.md', 'product-brief.json', 'media-jobs.json', 'evidence.json', 'evidence-matrix.json', 'evidence-ledger.json', 'production-brief.md', 'planning.md', 'compatibility-report.json', 'legacy-source-bundle.json'];
async function readSourceDocuments(projectDir) {
  return new Map(await Promise.all(SOURCE_DOCUMENTS.map(async (name) => [name, await fs.readFile(path.join(projectDir, name)).catch((error) => { if (error.code === 'ENOENT') return null; throw error; })])));
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonical(value[key])]));
  return value;
}
export async function calculateReviewSnapshot(projectDir, { documents, plan: capturedPlan } = {}) {
  const sourceDocuments = documents ?? await readSourceDocuments(projectDir);
  const plan = capturedPlan ?? await readJson(path.join(projectDir, 'page-plan.json'));
  const brief = JSON.parse(sourceDocuments.get('product-brief.json')?.toString('utf8') ?? 'null');
  const evidence = JSON.parse(sourceDocuments.get('evidence-matrix.json')?.toString('utf8') ?? 'null');
  if (!brief || !evidence) throw new Error('Product brief and evidence matrix are required for review snapshot');
  const sourceFiles = new Set();
  const addFile = (file, base = brief.source_root ?? projectDir) => { if (typeof file === 'string' && file.trim()) sourceFiles.add(path.resolve(base, file)); };
  const collectSource = (value) => {
    if (Array.isArray(value)) { value.forEach(collectSource); return; }
    if (!value || typeof value !== 'object') return;
    addFile(value.file);
    for (const child of Object.values(value)) if (child && typeof child === 'object') collectSource(child);
  };
  for (const fact of brief.facts ?? []) { collectSource(fact.source); collectSource(fact.sources); }
  collectSource(brief.source_links);
  const bundleBytes = sourceDocuments.get('legacy-source-bundle.json');
  if (bundleBytes) {
    const bundle = JSON.parse(bundleBytes.toString('utf8'));
    if (typeof bundle.source_directory !== 'string' || !bundle.files || typeof bundle.files !== 'object') throw new Error('Invalid legacy source bundle');
    for (const name of Object.keys(bundle.files)) addFile(name, bundle.source_directory);
  }
  for (const name of plan.legacy?.source_files ?? []) addFile(name);
  const sources = await Promise.all([...sourceFiles].sort().map(async (file) => ({ file, sha256: sha256(await fs.readFile(file)) })));
  const documentHashes = [...sourceDocuments].map(([file, bytes]) => ({ file, sha256: bytes === null ? null : sha256(bytes) }));
  const approvedPlan = { ...plan, copy_approval: undefined, publication_status: undefined, alternate_source_approval: undefined };
  return sha256(Buffer.from(JSON.stringify(canonical({ plan: approvedPlan, brief, evidence, sources, documentHashes }))));
}

function rejectSecretText(value, label) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (/\b(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]|\bsk-[a-zA-Z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) throw new Error(`Credential-like text in ${label}; remove it before packaging`);
}

export async function calculateMediaReviewBinding(projectDir, section, result, plannedJob) {
  const root = path.resolve(projectDir);
  const job = plannedJob ?? (await readJson(path.join(root, 'media-jobs.json'))).jobs?.find((entry) => entry.id === section.media_job_id);
  if (!job) throw new Error(`Missing planned media job: ${section.media_job_id}`);
  const references = await Promise.all((job.input_refs ?? []).map(async (reference) => {
    const file = await localFile(root, typeof reference === 'string' ? reference : reference.file);
    return { file, sha256: sha256(await fs.readFile(file)) };
  }));
  return mediaReviewBinding(section, result, {
    mediaHash: sha256(await fs.readFile(await localFile(root, result.file))),
    posterHash: result.poster ? sha256(await fs.readFile(await localFile(root, result.poster))) : null,
    references,
  });
}
function mediaReviewBinding(section, result, { mediaHash, posterHash, references }) {
  return {
    media_sha256: mediaHash,
    poster_sha256: posterHash,
    copy_sha256: sha256(Buffer.from(JSON.stringify(section.copy))),
    composition_sha256: result.composition ? sha256(Buffer.from(JSON.stringify(canonical(result.composition)))) : null,
    references_sha256: sha256(Buffer.from(JSON.stringify(canonical(references)))),
  };
}

export async function calculateMediaReviewSnapshots(projectDir, { mediaResultsFile = 'media-results.json' } = {}) {
  const root = path.resolve(projectDir), plan = await readJson(path.join(root, 'page-plan.json'));
  const media = await readJson(await localFile(root, mediaResultsFile)), jobs = await readJson(path.join(root, 'media-jobs.json'));
  const results = [];
  for (const section of plan.sections ?? []) {
    const matches = media.results?.filter((r) => r.job_id === section.media_job_id) ?? [], planned = jobs.jobs?.filter((j) => j.id === section.media_job_id) ?? [];
    if (matches.length !== 1 || planned.length !== 1) throw new Error(`A unique result and planned job are required: ${section.media_job_id}`);
    results.push({ job_id: section.media_job_id, review_binding: await calculateMediaReviewBinding(root, section, matches[0], planned[0]), note: 'These hashes identify the current files for manual review; no review flag is approved automatically.' });
  }
  return { schema_version: 1, results };
}

export async function buildDeliveryPackage(projectDir, { outDir = path.join(projectDir, 'delivery'), publication = false, mediaResultsFile = 'media-results.json' } = {}) {
  const root = path.resolve(projectDir), output = path.resolve(outDir);
  if (root === output) throw new Error('Delivery output must be a separate directory');
  if (await fs.stat(output).catch(() => null)) throw new Error(`Delivery directory already exists: ${output}`);
  const plan = await readJson(path.join(root, 'page-plan.json'));
  const media = await readJson(await localFile(root, mediaResultsFile));
  const plannedMedia = await readJson(path.join(root, 'media-jobs.json'));
  if (plan.schema_version !== 1 || !Array.isArray(plan.sections) || !plan.sections.length) throw new Error('Expected nonempty PagePlan schema_version:1');
  if (media.schema_version !== 1 || !Array.isArray(media.results)) throw new Error('Expected media-results schema_version:1');
  if (plannedMedia.schema_version !== 1 || !Array.isArray(plannedMedia.jobs)) throw new Error('Expected media-jobs schema_version:1');
  rejectSecretText(plan, 'page plan');
  const results = new Map(), plannedJobs = new Map(), sectionIds = new Set();
  for (const job of plannedMedia.jobs) {
    assertId(job.id, 'planned job id');
    if (plannedJobs.has(job.id)) throw new Error(`Duplicate planned media job: ${job.id}`);
    if (!['image', 'gif'].includes(job.kind) || typeof job.purpose !== 'string' || !job.purpose.trim()) throw new Error(`Planned media kind and purpose required: ${job.id}`);
    plannedJobs.set(job.id, job);
  }
  for (const result of media.results) {
    assertId(result.job_id, 'job id');
    if (results.has(result.job_id)) throw new Error(`Duplicate result job: ${result.job_id}`);
    results.set(result.job_id, result);
  }
  const assets = [], checks = [], sections = [], consumed = new Set();
  for (const section of plan.sections) {
    assertId(section.id, 'section id');
    if (sectionIds.has(section.id)) throw new Error(`Duplicate section: ${section.id}`);
    sectionIds.add(section.id);
    if (!section.media_job_id) throw new Error(`Missing media_job_id: ${section.id}`);
    if (consumed.has(section.media_job_id)) throw new Error(`Duplicate section media job: ${section.media_job_id}`);
    consumed.add(section.media_job_id);
    const plannedJob = plannedJobs.get(section.media_job_id);
    if (!plannedJob) throw new Error(`Missing planned media job: ${section.media_job_id}`);
    const result = results.get(section.media_job_id);
    if (!result || result.status !== 'complete') throw new Error(`Missing or failed media job: ${section.media_job_id}`);
    if (!['image', 'gif'].includes(result.kind)) throw new Error(`Unsupported media kind: ${result.kind}`);
    if (result.kind !== plannedJob.kind) throw new Error(`Media kind differs from planned job: ${result.job_id}`);
    if (result.purpose !== undefined && result.purpose !== plannedJob.purpose) throw new Error(`Media purpose differs from planned job: ${result.job_id}`);
    if (!['generated_concept', 'verified_images', 'actual_footage', 'actual_asset', 'reference_only', 'verified_product_image', 'actual_product_image'].includes(result.truth_level)) throw new Error(`Missing/invalid truth_level: ${result.job_id}`);
    const requiresFootage = plannedJob.purpose === 'performance-proof' || plannedJob.motion?.requires_actual_footage === true || plannedJob.motion?.source_type === 'actual_footage' || section.role === 'performance-proof';
    if (requiresFootage && result.truth_level !== 'actual_footage') throw new Error(`Generated performance proof rejected: ${result.job_id}`);
    if (!requiresFootage && (plannedJob.truth_level === 'generated_concept' || plannedJob.motion?.source_type === 'generated_explainer') && result.truth_level !== 'generated_concept') throw new Error(`Generated job cannot be relabeled as verified source: ${result.job_id}`);
    if (!requiresFootage && ['actual_asset', 'verified_images', 'verified_product_image', 'actual_product_image'].includes(plannedJob.truth_level) && !['actual_asset', 'verified_images', 'verified_product_image', 'actual_product_image'].includes(result.truth_level)) throw new Error(`Actual-source job truth differs: ${result.job_id}`);
    if (plannedJob.truth_level === 'reference_only' && result.truth_level !== 'reference_only') throw new Error(`Reference-only job cannot be relabeled as product source: ${result.job_id}`);
    if (plannedJob.requires_product_reference === true && !(plannedJob.input_refs ?? []).length) throw new Error(`Planned product reference missing: ${result.job_id}`);
    const currentReferences = await Promise.all((plannedJob.input_refs ?? []).map(async (reference) => {
      const file = await localFile(root, typeof reference === 'string' ? reference : reference.file);
      return { file, sha256: sha256(await fs.readFile(file)) };
    }));
    if (result.truth_level === 'generated_concept' && result.kind === 'image') {
      for (const reference of currentReferences) if (!result.input_refs?.some((actual) => actual.sha256 === reference.sha256 && actual.file && path.resolve(root, actual.file) === reference.file)) throw new Error(`Planned generation reference missing or changed: ${result.job_id}`);
      if (plannedJob.backend && plannedJob.backend !== result.backend || plannedJob.model_requested && plannedJob.model_requested !== result.model_requested) throw new Error(`Generated backend/model differs from planned job: ${result.job_id}`);
    }
    const file = await localFile(root, result.file), buffer = await fs.readFile(file);
    const metadata = await sharp(buffer, { animated: true }).metadata();
    if (result.kind === 'gif' && metadata.format !== 'gif') throw new Error(`GIF job output is not GIF: ${result.job_id}`);
    if (result.kind === 'image' && !['png', 'jpeg', 'webp'].includes(metadata.format)) throw new Error(`Image output must be PNG/JPEG/WebP: ${result.job_id}`);
    if (result.kind === 'image' && (metadata.pages ?? 1) > 1) throw new Error(`Animated output declared static: ${result.job_id}`);
    const extension = { png: 'png', jpeg: 'jpg', webp: 'webp', gif: 'gif' }[metadata.format];
    const fileName = `media/${section.id}.${extension}`;
    assets.push({ name: fileName, source: file, buffer, bytes: buffer.length, sha256: sha256(buffer) });
    let posterName = null, motion = null, posterHash = null;
    if (result.kind === 'gif') {
      motion = await inspectGif(buffer);
      if (!motion.animated || motion.loop !== 0 || motion.bytes > 8_000_000 || motion.width > 1080) throw new Error(`GIF mechanical QA failed: ${result.job_id}`);
      if (!result.poster) throw new Error(`GIF requires a static poster: ${result.job_id}`);
      const poster = await localFile(root, result.poster), posterBuffer = await fs.readFile(poster), posterMeta = await sharp(posterBuffer).metadata();
      posterHash = sha256(posterBuffer);
      if (!['png', 'jpeg', 'webp'].includes(posterMeta.format) || (posterMeta.pages ?? 1) > 1 || posterMeta.width !== motion.width || posterMeta.height !== motion.height) throw new Error(`GIF poster dimensions/format mismatch: ${result.job_id}`);
      posterName = `media/${section.id}.poster.${{ png: 'png', jpeg: 'jpg', webp: 'webp' }[posterMeta.format]}`;
      assets.push({ name: posterName, source: poster, buffer: posterBuffer, bytes: posterBuffer.length, sha256: sha256(posterBuffer) });
      if (result.truth_level === 'generated_concept') {
        if (!result.motion_meta) throw new Error(`Generated GIF requires frame provenance: ${result.job_id}`);
        const meta = await readJson(await localFile(root, result.motion_meta));
        if (meta.qa?.sha256 !== motion.sha256 || !meta.frame_provenance?.length || meta.frame_provenance.length !== meta.inputs?.length) throw new Error(`Generated GIF provenance/hash mismatch: ${result.job_id}`);
        for (let i = 0; i < meta.frame_provenance.length; i++) {
          const entry = meta.frame_provenance[i];
          for (const reference of currentReferences) if (!entry.input_refs?.some((actual) => actual.sha256 === reference.sha256 && actual.file && path.resolve(root, actual.file) === reference.file)) throw new Error(`Planned GIF frame reference missing or changed: ${result.job_id}`);
          if (plannedJob.backend && plannedJob.backend !== entry.backend || plannedJob.model_requested && plannedJob.model_requested !== entry.model_requested) throw new Error(`GIF frame backend/model differs from planned job: ${result.job_id}`);
          if (!isImage25(entry.model_requested) || !verifyImageProvenance(entry, entry.provenance).verified || entry.provenance.output_sha256 !== meta.inputs[i].sha256) throw new Error(`Unverified 2.5 GIF frame: ${result.job_id}`);
        }
      }
    }
    let provenance = null, composition = null, provenanceBuffer = buffer;
    if (result.composition) {
      const layer = result.composition;
      if (result.kind !== 'image' || layer.type !== 'deterministic_text' || metadata.format !== 'png') throw new Error(`Unsupported text composition: ${result.job_id}`);
      const baseFile = await localFile(root, layer.base_file), baseBuffer = await fs.readFile(baseFile), baseMeta = await sharp(baseBuffer).metadata();
      if (!['png', 'jpeg', 'webp'].includes(baseMeta.format) || (baseMeta.pages ?? 1) > 1 || sha256(baseBuffer) !== layer.base_sha256 || sha256(buffer) !== layer.output_sha256) throw new Error(`Text composition base/output hash mismatch: ${result.job_id}`);
      if (layer.copy_sha256 !== sha256(Buffer.from(JSON.stringify(section.copy)))) throw new Error(`Text composition copy has changed: ${result.job_id}`);
      const textFile = await localFile(root, layer.text_file), textBuffer = await fs.readFile(textFile);
      if (!/\.svg$/i.test(textFile) || sha256(textBuffer) !== layer.text_sha256) throw new Error(`Text composition editable layer hash mismatch: ${result.job_id}`);
      if (!layer.layout?.font_file || !layer.layout.font_sha256 || sha256(await fs.readFile(await localFile(root, layer.layout.font_file))) !== layer.layout.font_sha256) throw new Error(`Text composition font has changed: ${result.job_id}`);
      const { buildCopySvg } = await import('../lib/text-composition.mjs');
      const expectedText = await buildCopySvg(section.copy, layer.layout);
      if (expectedText.svg !== textBuffer.toString('utf8') || sha256(Buffer.from(expectedText.svg)) !== layer.text_sha256) throw new Error(`Text composition SVG does not match current copy: ${result.job_id}`);
      const expectedImage = await sharp(baseBuffer).resize(expectedText.layout.width, expectedText.layout.image_height, { fit: 'contain', background: expectedText.layout.background }).png().toBuffer();
      const expectedComposite = await sharp({ create: { width: expectedText.layout.width, height: expectedText.layout.height, channels: 4, background: expectedText.layout.background } }).composite([{ input: expectedImage, top: 0, left: 0 }, { input: expectedText.png, top: expectedText.layout.image_height, left: 0 }]).png().toBuffer();
      if (sha256(expectedComposite) !== sha256(buffer)) throw new Error(`Text composition pixels differ from base and editable text: ${result.job_id}`);
      const baseName = `media/${section.id}.base.${{ png: 'png', jpeg: 'jpg', webp: 'webp' }[baseMeta.format]}`, textName = `media/${section.id}.text.svg`;
      assets.push({ name: baseName, source: baseFile, buffer: baseBuffer, bytes: baseBuffer.length, sha256: sha256(baseBuffer) }, { name: textName, source: textFile, buffer: textBuffer, bytes: textBuffer.length, sha256: sha256(textBuffer) });
      provenanceBuffer = baseBuffer;
      composition = { ...layer, base_file: baseName, text_file: textName, verified: true };
    }
    if (result.truth_level === 'generated_concept' && result.kind === 'image') {
      provenance = verifyImageProvenance({ backend: result.backend, model_requested: result.model_requested, input_refs: result.input_refs ?? [] }, result.provenance);
      if (!isImage25(result.model_requested) || !provenance.verified || result.provenance?.output_sha256 !== sha256(provenanceBuffer)) throw new Error(`GPT Image 2.5 provenance not verified: ${result.job_id}`);
    }
    const reviews = {
      copy_reviewed: result.qa?.copy_reviewed === true,
      visual_reviewed: result.qa?.visual_reviewed === true,
      product_identity_reviewed: result.qa?.product_identity_reviewed === true,
      source_verified: result.truth_level !== 'reference_only',
      ...(result.kind === 'gif' ? { loop_reviewed: result.qa?.loop_reviewed === true } : {}),
    };
    // Use the exact captured bytes that will be written into the package, not a
    // later filesystem reread which could bind approval to a different image.
    const reviewBinding = mediaReviewBinding(section, result, { mediaHash: sha256(buffer), posterHash, references: currentReferences });
    const bindingMatches = !!result.qa?.review_binding && Object.entries(reviewBinding).every(([key, value]) => result.qa.review_binding[key] === value);
    reviews.current_files_reviewed = bindingMatches;
    checks.push({ section_id: section.id, job_id: result.job_id, mechanical: 'pass', reviews, review_binding: reviewBinding, ready: Object.values(reviews).every(Boolean), ...(motion ? { motion } : {}), ...(provenance ? { provenance } : {}), ...(composition ? { composition } : {}) });
    sections.push({ ...section, file: fileName, poster: posterName, kind: result.kind, truth_level: result.truth_level, ...(composition ? { composition } : {}) });
  }
  // Capture all publication source documents once. The approval hash and output
  // bytes refer to this same snapshot, including the displayed legal terms.
  const documents = await readSourceDocuments(root);
  const optional = [...documents].filter(([, buffer]) => buffer !== null).map(([name, buffer]) => {
    const contents = buffer.toString('utf8'); rejectSecretText(contents, name);
    return { name, buffer, contents };
  });
  const planIssues = [];
  let planQa, snapshot;
  try { planQa = await validateProject(root); snapshot = await calculateReviewSnapshot(root, { documents, plan }); }
  catch (error) { planIssues.push(`plan_or_source_validation_unavailable: ${error.message}`); }
  if (planQa?.status !== 'draft_valid' || planQa?.errors?.length) planIssues.push('plan_qa_failed_or_missing');
  if ((plan.missing_information ?? []).length || plan.sections.some((s) => (s.unknowns ?? []).length || Object.values(s.copy ?? {}).some((v) => typeof v === 'string' && v.includes('[자료 필요:')))) planIssues.push('required_information_or_copy_missing');
  const legalText = optional.find((file) => file.name === 'legal.md')?.contents ?? '';
  if (!legalText.trim() || /\[(?:자료 필요|선택|이미지 생성 실패)[^\]]*\]/.test(legalText)) planIssues.push('legal_information_missing_or_unresolved');
  if (plan.pack_status !== 'pack_verified' && !(plan.alternate_source_approval?.status === 'approved' && plan.alternate_source_approval?.snapshot_sha256 === snapshot && plan.alternate_source_approval?.reason)) planIssues.push('pack_or_alternate_source_not_approved');
  if (plan.copy_approval?.status !== 'approved' || !snapshot || plan.copy_approval?.snapshot_sha256 !== snapshot) planIssues.push('copy_approval_missing_or_stale');
  const ready = !planIssues.length && checks.every((check) => check.ready);
  const publicationStatus = planIssues.some((reason) => reason !== 'copy_approval_missing_or_stale') ? 'blocked' : ready ? 'ready' : 'review_required';
  if (publication && !ready) throw new Error(`Publication requires reviewed copy, visual/product identity and GIF loop QA plus validated planning sources: ${planIssues.join(', ')}`);
  await fs.mkdir(path.join(output, 'media'), { recursive: true });
  const archive = [];
  const addText = async (name, text) => { const file = path.join(output, name); await fs.writeFile(file, text, 'utf8'); archive.push({ name, file }); };
  for (const asset of assets) { const file = path.join(output, asset.name); await fs.writeFile(file, asset.buffer ?? await fs.readFile(asset.source)); archive.push({ name: asset.name, file }); }
  for (const file of optional) { const destination = path.join(output, file.name); await fs.writeFile(destination, file.buffer); archive.push({ name: file.name, file: destination }); }
  const title = plan.product_name ?? '상세페이지';
  const htmlSections = sections.map((s) => {
    const copyPanel = s.copy_render_mode === 'separate' ? `<div class="copy"><h2>${escapeHtml(s.copy?.headline ?? '')}</h2>${s.copy?.subcopy ? `<p class="subcopy">${escapeHtml(s.copy.subcopy)}</p>` : ''}${s.copy?.body ? `<p>${escapeHtml(Array.isArray(s.copy.body) ? s.copy.body.join('\n') : s.copy.body)}</p>` : ''}${s.copy?.footnote ? `<small>${escapeHtml(s.copy.footnote)}</small>` : ''}${s.copy?.cta ? `<p>${escapeHtml(s.copy.cta)}</p>` : ''}</div>` : '';
    return `<section id="${s.id}">${copyPanel}<img src="./${s.file}" alt="${escapeHtml(s.copy?.headline ?? s.role ?? s.id)}" ${s.kind === 'gif' ? `data-poster="./${s.poster}"` : ''}>${s.truth_level === 'generated_concept' ? '<small>연출 이미지</small>' : ''}${s.kind === 'gif' ? `<noscript><p><a href="./${s.poster}">정지 이미지 보기</a></p></noscript>` : ''}</section>`;
  }).join('\n');
  const legalHtml = legalText ? `<section class="legal"><h2>상품 및 거래 조건</h2><pre>${escapeHtml(legalText)}</pre></section>` : '';
  await addText('index.html', `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;background:#f7f7f7;color:#202020;font-family:system-ui,sans-serif}header,main{max-width:1080px;margin:auto}header{padding:20px}section{background:white;margin-bottom:0}img{width:100%;height:auto;display:block}.copy,.legal{padding:32px}p,pre{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-family:inherit}small{display:block;padding:8px 32px;color:#666}h2{margin:0 0 12px}@media(prefers-reduced-motion:reduce){img[data-poster]{visibility:hidden}}</style></head><body>${publication ? '' : `<header><h1>${escapeHtml(title)}</h1><p>${ready ? '검수 완료' : '검수용 미리보기'}</p></header>`}<main>${htmlSections}${legalHtml}</main><script>if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('img[data-poster]').forEach(img=>{img.src=img.dataset.poster;img.style.visibility='visible'})}</script></body></html>`);
  await addText('page-plan.json', `${JSON.stringify(plan, null, 2)}\n`);
  if (!optional.some((f) => f.name === 'planning.md')) await addText('planning.md', `# ${title}\n\n${sections.map((s) => `## ${s.id}: ${s.role}\n\n${s.copy?.headline ?? ''}\n\n${s.copy?.subcopy ?? ''}\n\n${Array.isArray(s.copy?.body) ? s.copy.body.join('\n') : s.copy?.body ?? ''}\n\nFact IDs: ${(s.fact_ids ?? []).join(', ')}\nEvidence IDs: ${(s.evidence_ids ?? []).join(', ')}\nMedia: ${s.file}`).join('\n\n')}\n`);
  const qa = { schema_version: 1, publication_ready: ready, publication_status: publicationStatus, planning: { snapshot_sha256: snapshot, issues: planIssues, qa: planQa }, checks, note: 'Mechanical checks are measured; review flags and copy/source snapshot approval are supplied by reviewers. No automatic claim/identity approval.' };
  await addText('qa-report.json', `${JSON.stringify(qa, null, 2)}\n`);
  const manifest = {
    schema_version: 1, product_name: title, publication_ready: ready, publication_status: publicationStatus, entrypoint: 'index.html',
    sections: sections.map((s) => ({ id: s.id, role: s.role, job_id: s.media_job_id, kind: s.kind, file: s.file, ...(s.poster ? { poster: s.poster } : {}), truth_level: s.truth_level, sha256: assets.find((a) => a.name === s.file).sha256, fact_ids: s.fact_ids ?? [], evidence_ids: s.evidence_ids ?? [], ...(s.composition ? { composition: s.composition } : {}) })),
    assets: assets.map(({ name, bytes, sha256 }) => ({ file: name, bytes, sha256 })),
    included_files: [...archive.map((e) => e.name), 'delivery-manifest.json'],
  };
  await addText('delivery-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  await writeZip(path.join(output, 'delivery.zip'), archive);
  return manifest;
}
