import test from 'node:test';
import assert from 'node:assert/strict';
import { convertLegacyJobs } from '../scripts/convert-legacy-jobs.mjs';

const source = { schema_version: 1, default_engine: 'gpt_image', project_id: 'legacy', jobs: [{ id: 'cut-01', prompt_file: 'prompts/01.md', output_path: 'cuts/01.png', input_images: [{ path: 'refs/product.png', role: 'shape and logo' }], status: 'completed', korean_text_required: ['700mL'] }] };

test('explicit conversion preserves references and required text, resets paid execution state', () => {
  const converted = convertLegacyJobs(source, { backend: 'ima2', model: 'gpt-image-2.5-flare' });
  assert.equal(converted.jobs[0].model_requested, 'gpt-image-2.5-flare');
  assert.equal(converted.jobs[0].backend, 'ima2');
  assert.equal(converted.jobs[0].kind, 'image');
  assert.equal(converted.jobs[0].status, 'pending');
  assert.equal(converted.jobs[0].model_confirmed, null);
  assert.equal(converted.jobs[0].input_refs[0].file, 'refs/product.png');
  assert.deepEqual(converted.jobs[0].korean_text_required, ['700mL']);
  assert.equal(converted.jobs[0].legacy.status, 'completed');
  assert.equal(source.jobs[0].status, 'completed');
});

test('unsupported engines and API paths fail explicitly', () => {
  assert.throws(() => convertLegacyJobs({ ...source, default_engine: 'nano_banana' }), /unsupported/);
  assert.throws(() => convertLegacyJobs(source, { backend: 'images_api' }), /Only codex_native and ima2/);
  assert.throws(() => convertLegacyJobs(source, { model: 'gpt-image-2' }), /2.5 variant/);
});

test('legacy physical-product jobs without baseline references stay blocked', () => {
  const empty = { ...source, jobs: [{ ...source.jobs[0], input_images: [] }] };
  const converted = convertLegacyJobs(empty);
  assert.equal(converted.jobs[0].requires_product_reference, true);
  assert.equal(converted.jobs[0].status, 'blocked');
  assert.equal(converted.jobs[0].blocked_reason, 'product_reference_images_required');
  const service = convertLegacyJobs(empty, { category: 'service' });
  assert.equal(service.jobs[0].requires_product_reference, false);
  assert.equal(service.jobs[0].status, 'pending');
  const background = convertLegacyJobs({ ...empty, jobs: [{ ...empty.jobs[0], operation: 'background' }] });
  assert.equal(background.jobs[0].requires_product_reference, false);
  assert.equal(background.jobs[0].status, 'pending');
  assert.equal(background.jobs[0].operation, 'generate');
});
