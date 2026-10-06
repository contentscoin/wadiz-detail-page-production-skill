import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { importSangseDocuments, importSangseProject } from '../scripts/import-sangse.mjs';
import { checkQuantitativeLinks } from '../scripts/compat/copy-checks.mjs';
import { parseCuts } from '../scripts/compat/sangse-format.mjs';
import { validateBrief, validatePlan } from '../scripts/lib/contracts.mjs';
import { validateProject } from '../scripts/validate-page-plan.mjs';

const cuts = '# 실제 주전자 컷 시트\nplatform: wadiz\nstyle: spec-showcase\nbrand: primary=#123456\n\n## C01 · S1 · Q3 · h=1000\nheadline: 물을 따르는 순간\nsub: 정확한 선택\nbody: |\n  용량 700mL\n  유리 손잡이\nvisual: 상품 측면 사진\nbg: #FFFFFF\ncustom: preserve me\n\n## C02 · C1 · Q7 · h=750\nheadline: 교환 안내\nbody: |\n  미사용 제품 교환\ncta: 조건 확인하기\n';
const raw = '# 입력\n- 상품: 실제 주전자\n- 타겟: 차를 즐기는 고객\n- 용량 700mL\n';
const legal = '## 배송·교환\n미사용 제품 교환 가능\n';

test('import preserves cut copy, arbitrary metadata, legal terms and source-review distinction', () => {
  const result = importSangseDocuments({ 'cuts.md': cuts, 'legal.md': legal, 'raw-input.md': raw }, { category: 'living', topic: 'gift', sourceDir: '/original' });
  assert.equal(result.pagePlan.sections[0].copy.body, '용량 700mL\n유리 손잡이');
  assert.equal(result.pagePlan.sections[0].legacy.fields.custom, 'preserve me');
  assert.equal(result.pagePlan.legacy.metadata.brand, 'primary=#123456');
  assert.equal(result.pagePlan.legal[0].text, '미사용 제품 교환 가능');
  assert.equal(result.productBrief.product.name, '실제 주전자');
  assert.equal(result.pagePlan.sections[0].id, 'C01');
  assert.equal(result.pagePlan.sections[0].media_job_id, 'media-C01');
  assert.equal(result.mediaJobs.jobs[0].status, 'blocked');
  assert.equal(result.mediaJobs.jobs[0].requires_product_reference, true);
  assert.deepEqual(result.pagePlan.sections[0].fact_ids, ['R003']);
  assert.deepEqual(result.pagePlan.sections[0].questions, ['Q3']);
  assert.ok(result.productBrief.facts.every(fact => fact.status === 'confirmation_needed' && fact.source.reviewed === false));
  assert.equal(result.report.checks.quantitative_links.semantic_verification, 'not_performed');
  validateBrief(result.productBrief);
  validatePlan(result.pagePlan);
});

test('linking a number does not authorize a different attribute or changed sentence', () => {
  const source = '- 용량 700mL';
  const approved = '```quantitative-facts\n' + JSON.stringify([{ at: 'C01.body', claim: '용량 700mL', sources: [{ file: 'raw-input.md', quote: source }] }]) + '\n```';
  const good = [{ id: 'C01', fields: { body: '용량 700mL' } }];
  assert.equal(checkQuantitativeLinks(good, '', { 'raw-input.md': source, 'intake-checklist.md': approved }).status, 'PASS');
  const changed = [{ id: 'C01', fields: { body: '최대 700mL 사용 가능' } }];
  assert.equal(checkQuantitativeLinks(changed, '', { 'raw-input.md': source, 'intake-checklist.md': approved }).status, 'FAIL');
  const wrongAttribute = [{ id: 'C01', fields: { body: '보온력 700시간' } }];
  assert.equal(checkQuantitativeLinks(wrongAttribute, '', { 'raw-input.md': source, 'intake-checklist.md': approved }).status, 'FAIL');
});

test('quotes existing only inside declaration are rejected and fictional source stays unconfirmed', () => {
  const declaration = '```quantitative-facts\n' + JSON.stringify([{ at: 'C01.body', claim: '용량 700mL', sources: [{ file: 'intake-checklist.md', quote: '용량 700mL' }] }]) + '\n```';
  const result = importSangseDocuments({ 'cuts.md': cuts, 'raw-input.md': '# 가상 시연용\n- 상품: 예시\n', 'intake-checklist.md': declaration });
  assert.equal(result.report.fictional_source, true);
  assert.equal(result.report.checks.quantitative_links.status, 'FAIL');
  assert.ok(result.productBrief.facts.every(fact => fact.status !== 'confirmed'));
});

test('duplicate IDs fail and new Q order remains unchanged', () => {
  assert.throws(() => parseCuts(cuts + '\n## C01 · S1 · Q1 · h=1000\nheadline: duplicate'), /Duplicate/);
  assert.deepEqual(parseCuts(cuts).cuts.map(cut => cut.questions[0]), ['Q3', 'Q7']);
});

test('filesystem import preserves source bytes and refuses overwrite', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sangse-compat-'));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');
  await fs.mkdir(source);
  await fs.writeFile(path.join(source, 'cuts.md'), cuts);
  await fs.writeFile(path.join(source, 'legal.md'), legal);
  await importSangseProject(source, output, { category: 'living', topic: 'gift' });
  assert.equal(await fs.readFile(path.join(source, 'cuts.md'), 'utf8'), cuts);
  const bundle = JSON.parse(await fs.readFile(path.join(output, 'legacy-source-bundle.json'), 'utf8'));
  assert.equal(bundle.files['legal.md'].content, legal);
  assert.equal(await fs.readFile(path.join(output, 'legal.md'), 'utf8'), legal);
  const qa = await validateProject(output);
  assert.equal(qa.status, 'failed');
  assert.ok(qa.errors.some(error => error.code === 'question_missing'));
  assert.ok(!qa.errors.some(error => error.code === 'media_job_missing'));
  await assert.rejects(importSangseProject(source, output), /already exists/);
  await assert.rejects(importSangseProject(source, path.join(source, 'new')), /outside/);
  await assert.rejects(importSangseProject(source, path.join(source, '..nested')), /outside/);
});

test('source aliases cannot redirect an import output into the source project', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sangse-alias-'));
  try {
    const source = path.join(root, 'source'), alias = path.join(root, 'alias');
    await fs.mkdir(source); await fs.writeFile(path.join(source, 'cuts.md'), cuts);
    await fs.symlink(source, alias, process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(importSangseProject(source, path.join(alias, 'new')), /outside/);
    assert.equal(await fs.stat(path.join(source, 'new')).catch(() => null), null);
    assert.equal(await fs.readFile(path.join(source, 'cuts.md'), 'utf8'), cuts);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('explicit baseline reference creates linked pending media jobs without claiming verification', () => {
  const result = importSangseDocuments({ 'cuts.md': cuts, 'raw-input.md': raw }, { category: 'living', topic: 'gift', refs: ['refs/product.png'], sourceDir: '/source' });
  assert.equal(result.mediaJobs.jobs[0].status, 'pending');
  assert.equal(result.mediaJobs.jobs[0].input_refs[0].truth_level, 'reference_only');
  assert.equal(result.mediaJobs.jobs[0].model_confirmed, null);
  assert.ok(result.productBrief.facts.every(fact => fact.source.reviewed === false));
});

test('service import permits a pending concept scene without product baseline photos', () => {
  const result = importSangseDocuments({ 'cuts.md': cuts, 'raw-input.md': raw }, { category: 'service-membership', topic: 'gift' });
  assert.equal(result.mediaJobs.jobs[0].requires_product_reference, false);
  assert.equal(result.mediaJobs.jobs[0].status, 'pending');
  assert.ok(!result.productBrief.unknowns.includes('product_reference_images'));
});
