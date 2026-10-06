import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildCopySvg, composeMediaText } from '../scripts/lib/text-composition.mjs';
import { sha256 } from '../scripts/media/common.mjs';
const sharp = createRequire(new URL('../scripts/package.json', import.meta.url))('sharp');

test('long Korean text wraps by rendered glyph bounds and remains above minimum size', async () => {
  const copy = { headline: '선물 구성', body: '정확하게 확인한 상품의 구성과 사용 방법을 상세하게 설명합니다. '.repeat(7) };
  const panel = await buildCopySvg(copy, { height: 2400, image_height: 600 });
  const body = panel.lines.filter((line) => line.field === 'body');
  assert.ok(body.length > 2);
  assert.equal(body.map((line) => line.text).join(''), copy.body);
  assert.ok(panel.lines.every((line) => line.font_size >= 24 && line.y < 1800));
  assert.equal(panel.copy_sha256, sha256(Buffer.from(JSON.stringify(copy))));
  const meta = await sharp(panel.png).metadata();
  assert.equal(meta.width, 1080); assert.equal(meta.height, 1800);
});

test('XML characters remain literal approved copy and cannot insert SVG elements', async () => {
  const copy = { headline: '가격 & 구성', body: '표기 <확인> "완료" 및 A & B', footnote: "판매자 '확인'" };
  const panel = await buildCopySvg(copy);
  assert.ok(panel.svg.includes('&lt;확인&gt;'));
  assert.ok(panel.svg.includes('&amp;'));
  assert.ok(panel.svg.includes('&quot;완료&quot;'));
  assert.ok(!panel.svg.includes('<확인>'));
  assert.deepEqual(panel.lines.filter((line) => line.field === 'body').map((line) => line.text).join(''), copy.body);
  assert.equal((await buildCopySvg(copy, panel.layout)).svg, panel.svg);
});

test('overflow, undersized fonts, placeholders and missing glyphs are rejected', async () => {
  await assert.rejects(buildCopySvg({ headline: '확인', body: '긴 상품 설명 '.repeat(800) }, { height: 600, image_height: 300 }), /overflow/);
  await assert.rejects(buildCopySvg({ headline: '확인' }, { sizes: { headline: 23 } }), /font size/);
  await assert.rejects(buildCopySvg({ headline: '[자료 필요: 가격]' }), /placeholder/);
  await assert.rejects(buildCopySvg({ headline: '확인', body: String.fromCodePoint(0x10ffff) }), /lacks glyph/);
});

async function fixture(root) {
  const copy = { headline: '선물 구성', body: '머플러와 선물 상자로 구성됩니다.\n구성 가격은 39000원입니다.' };
  const facts = [{ id: 'components', text: '머플러와 선물 상자로 구성됩니다.', status: 'confirmed', role: 'components', source: { file: 'source.md', quote: '머플러와 선물 상자로 구성됩니다.', reviewed: true } }, { id: 'price', text: '구성 가격은 39000원입니다.', status: 'confirmed', role: 'offer', source: { file: 'source.md', quote: '구성 가격은 39000원입니다.', reviewed: true } }];
  await fs.writeFile(path.join(root, 'source.md'), facts.map((fact) => fact.text).join('\n'));
  const source = await sharp({ create: { width: 180, height: 240, channels: 4, background: '#c3b2a1' } }).png().toBuffer();
  await fs.writeFile(path.join(root, 'original.png'), source);
  const model = 'gpt-image-2.5-sunburst', provenance = { backend: 'ima2', model_actual: model, request_id: 'fixture-request', input_refs: [], output_sha256: sha256(source), model_evidence: { source: 'tool_response', model_actual: model, request_id: 'fixture-request', input_refs: [] } };
  const original = { job_id: 'media-01', status: 'complete', kind: 'image', backend: 'ima2', model_requested: model, file: 'original.png', truth_level: 'generated_concept', input_refs: [], provenance, qa: { copy_reviewed: true, visual_reviewed: true, product_identity_reviewed: true } };
  const gif = { job_id: 'media-02', status: 'complete', kind: 'gif', file: 'options.gif', truth_level: 'verified_images', qa: { copy_reviewed: true } };
  const plan = { schema_version: 1, product_name: '머플러', sections: [{ id: 'section-01', role: 'components', questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'], copy, fact_ids: ['components', 'price'], evidence_ids: [], media_job_id: original.job_id, text_render_mode: 'svg_layer' }, { id: 'section-02', role: 'options', questions: ['Q6'], copy: { headline: '선물 구성' }, fact_ids: [], evidence_ids: [], media_job_id: gif.job_id, text_render_mode: 'hybrid' }], required_information: [], missing_information: [] };
  const documents = { 'product-brief.json': { schema_version: 1, product: { name: '머플러', category: 'fashion', topic: 'gift' }, facts, assets: [], source_root: root }, 'page-plan.json': plan, 'media-results.json': { schema_version: 1, results: [original, gif] }, 'media-jobs.json': { schema_version: 1, jobs: [{ id: original.job_id, kind: 'image', purpose: 'components' }, { id: gif.job_id, kind: 'gif', purpose: 'options' }] }, 'evidence-matrix.json': { schema_version: 1, rows: [] } };
  for (const [file, document] of Object.entries(documents)) await fs.writeFile(path.join(root, file), JSON.stringify(document));
  return { source, original, gif, plan, documents };
}

test('composition preserves originals/model provenance and binds exact copy, PNG and SVG hashes', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-text-'));
  try {
    const input = await fixture(root), before = await fs.readFile(path.join(root, 'media-results.json'));
    const out = path.join(root, 'composed-results.json');
    const report = await composeMediaText(root, { outFile: out });
    assert.equal(report.composed_images, 1); assert.equal(report.unchanged_gifs, 1);
    const result = report.results.results[0], layer = result.composition;
    assert.deepEqual(result.provenance, input.original.provenance);
    assert.equal(layer.base_sha256, sha256(input.source));
    assert.equal(result.provenance.output_sha256, layer.base_sha256);
    assert.equal(layer.copy_sha256, sha256(Buffer.from(JSON.stringify(input.plan.sections[0].copy))));
    assert.equal(layer.output_sha256, sha256(await fs.readFile(path.resolve(root, result.file))));
    assert.equal(layer.text_sha256, sha256(await fs.readFile(path.resolve(root, layer.text_file))));
    assert.equal((await buildCopySvg(input.plan.sections[0].copy, layer.layout)).svg, await fs.readFile(path.resolve(root, layer.text_file), 'utf8'));
    assert.deepEqual(await fs.readFile(path.join(root, 'original.png')), input.source);
    assert.deepEqual(await fs.readFile(path.join(root, 'media-results.json')), before);
    assert.deepEqual(report.results.results[1], input.gif);
    assert.equal(result.qa.copy_reviewed, false); assert.equal(result.qa.visual_reviewed, false);
    const metadata = await sharp(path.resolve(root, result.file)).metadata();
    assert.equal(metadata.width, 1080); assert.equal(metadata.height, 1600);
    await assert.rejects(composeMediaText(root, { outFile: out }), /already exists/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('changed base generation and changed source facts prevent composition', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-text-hash-'));
  try {
    const input = await fixture(root);
    await fs.writeFile(path.join(root, 'original.png'), await sharp(input.source).modulate({ brightness: 0.5 }).png().toBuffer());
    await assert.rejects(composeMediaText(root, { outFile: path.join(root, 'bad-base.json') }), /provenance\/hash/);
    await fs.writeFile(path.join(root, 'original.png'), input.source);
    await fs.writeFile(path.join(root, 'source.md'), '다른 자료');
    await assert.rejects(composeMediaText(root, { outFile: path.join(root, 'bad-source.json') }), /copy\/source checks/);
    assert.equal(await fs.stat(path.join(root, 'bad-base.composition')).catch(() => null), null);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
