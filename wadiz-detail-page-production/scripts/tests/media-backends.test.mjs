import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { discoverImageCapabilities, importGeneratedImage, prepareMediaJobs, verifyImageProvenance } from '../media/image-backends.mjs';
import { sha256 } from '../media/common.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wadiz-backend-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await sharp({ create: { width: 50, height: 50, channels: 3, background: '#fff' } }).png().toFile(path.join(root, 'product.png'));
  return root;
}
const jobs = (backend = 'ima2') => ({ schema_version: 1, jobs: [{ id: 'hero', kind: 'image', backend, model_requested: 'gpt-image-2.5-sunburst', input_refs: [{ file: 'product.png', role: 'identity' }], prompt: 'Preserve product identity', operation: 'generate' }] });
const capabilities = { schema_version: 1, ima2: { available: true, model_pinning: true, references: true, edit: true, supported_models: [{ id: 'gpt-image-2.5-sunburst', lane: 'oauth' }], generation_contract: { source: 'documented_contract', contract_reference: 'hypothetical future OAuth image-model pinning contract fixture', image_model_flag: '--model', provider_flag: '--provider', supported_lanes: ['oauth'], supported_models: ['gpt-image-2.5-sunburst'], api_only: false } }, codex_native: { model_pinning: false, supported_models: [] } };

test('ima2 handoff pins 2.5 and refs, approval required, generation is never called', async (t) => {
  const root = await fixture(t);
  const result = await prepareMediaJobs(jobs(), { baseDir: root, capabilities });
  assert.equal(result.generated_images, 0); assert.equal(result.jobs[0].status, 'planned'); assert.equal(result.jobs[0].execution_allowed, false);
  assert.ok(result.jobs[0].request.args.includes('gpt-image-2.5-sunburst')); assert.ok(result.jobs[0].request.args.includes('--provider')); assert.ok(result.jobs[0].request.args.includes('oauth'));
  assert.ok(result.jobs[0].request.args.includes('--ref')); assert.ok(result.jobs[0].input_refs[0].sha256);
  const approved = await prepareMediaJobs(jobs(), { baseDir: root, capabilities, approval: { approved: true, job_ids: ['hero'], estimated_usage: '1 image; approved account quota' } });
  assert.equal(approved.jobs[0].execution_allowed, true); assert.equal(approved.generated_images, 0);
});

test('2.5 unavailable, native pinning absent and missing refs never fall back', async (t) => {
  const root = await fixture(t);
  for (const [backend, cap] of [['codex_native', capabilities], ['ima2', { ima2: { ...capabilities.ima2, supported_models: ['gpt-image-2'] } }], ['ima2', { ima2: { ...capabilities.ima2, references: false } }]]) {
    const result = await prepareMediaJobs(jobs(backend), { baseDir: root, capabilities: cap });
    assert.equal(result.jobs[0].status, 'blocked'); assert.equal(result.jobs[0].request, null);
  }
  const bad = jobs(); bad.jobs[0].model_requested = 'gpt-image-2';
  await assert.rejects(prepareMediaJobs(bad, { baseDir: root, capabilities }), /Only exact GPT Image 2.5/);
  const missing = jobs(); missing.jobs[0].input_refs[0].file = 'missing.png';
  await assert.rejects(prepareMediaJobs(missing, { baseDir: root, capabilities }), /ENOENT/);
});

test('read-only live discovery handles server unavailable without startup or spend', async () => {
  const calls = [];
  const run = async (command, args) => {
    calls.push([command, ...args].join(' '));
    const text = args.join(' ');
    return { stdout: text.includes('--version') ? '3.10.0' : text.includes('capabilities') ? '{"ok":true,"commands":["edit"]}' : text.includes('models') ? '{"ok":false,"code":"SERVER_UNREACHABLE"}' : '--model --ref' };
  };
  const cap = await discoverImageCapabilities({ run });
  assert.equal(cap.ima2.available, false); assert.equal(cap.ima2.reason, 'SERVER_UNREACHABLE');
  assert.ok(!calls.some((s) => /\b(serve|gen [^-]|edit [^-])/.test(s)));
  assert.equal(cap.codex_native.model_pinning, false);
});

test('image result import verifies actual model, ref and output hash', async (t) => {
  const root = await fixture(t), prepared = await prepareMediaJobs(jobs(), { baseDir: root, capabilities, approval: { approved: true, job_ids: ['hero'], estimated_usage: '1 image' } }), job = prepared.jobs[0];
  const provenance = { backend: 'ima2', model_actual: job.model_requested, request_id: 'fixture-request', model_evidence: { source: 'tool_response', model_actual: job.model_requested, request_id: 'fixture-request', input_refs: job.input_refs }, input_refs: job.input_refs, output_sha256: sha256(await fs.readFile(path.join(root, 'product.png'))) };
  const result = await importGeneratedImage(job, { file: 'product.png', provenance }, { baseDir: root });
  assert.equal(result.status, 'complete'); assert.equal(result.qa.provenance_verified, true);
  assert.equal(verifyImageProvenance(job, { ...provenance, model_actual: 'gpt-image-2' }).verified, false);
  assert.equal(verifyImageProvenance(job, { ...provenance, input_refs: [] }).verified, false);
  await assert.rejects(importGeneratedImage(job, { file: 'product.png', provenance: { ...provenance, output_sha256: 'mismatch' } }, { baseDir: root }), /hash/);
  await assert.rejects(importGeneratedImage({ ...job, status: 'blocked' }, { file: 'product.png', provenance }, { baseDir: root }), /approval/);
  await assert.rejects(importGeneratedImage({ ...job, execution_allowed: false }, { file: 'product.png', provenance }, { baseDir: root }), /approval/);
  await sharp({ create: { width: 50, height: 50, channels: 3, background: '#f00' } }).png().toFile(path.join(root, 'changed.png'));
  await fs.copyFile(path.join(root, 'changed.png'), path.join(root, 'product.png'));
  await assert.rejects(importGeneratedImage(job, { file: 'product.png', provenance }, { baseDir: root }), /changed since preparation/);
});

test('GIF storyboard expands inherited frame jobs and waits for real verified output', async (t) => {
  const root = await fixture(t), input = jobs();
  input.jobs[0].kind = 'gif'; input.jobs[0].frame_jobs = [{ id: 'hero-frame-1', prompt: 'First product frame' }, { id: 'hero-frame-2', prompt: 'Second product frame' }];
  const result = await prepareMediaJobs(input, { baseDir: root, capabilities });
  assert.equal(result.jobs.length, 3);
  assert.deepEqual(result.jobs[2].depends_on, ['hero-frame-1', 'hero-frame-2']);
  assert.equal(result.jobs[2].status, 'blocked');
  assert.ok(result.jobs[0].input_refs[0].sha256); assert.equal(result.jobs[0].backend, 'ima2'); assert.equal(result.jobs[0].model_requested, 'gpt-image-2.5-sunburst');
});

test('physical products require references while explicitly nonproduct service imagery may proceed', async (t) => {
  const root = await fixture(t), input = jobs(); input.jobs[0].input_refs = []; input.jobs[0].operation = 'generate';
  const options = { baseDir: root, capabilities, approval: { approved: true, job_ids: ['hero'], estimated_usage: '1 image' } };
  input.jobs[0].requires_product_reference = true;
  const physical = await prepareMediaJobs(input, options); assert.equal(physical.jobs[0].status, 'blocked'); assert.equal(physical.jobs[0].execution_allowed, false); assert.ok(physical.jobs[0].reasons.includes('product_reference_required'));
  delete input.jobs[0].requires_product_reference;
  assert.equal((await prepareMediaJobs(input, options)).jobs[0].status, 'blocked');
  input.jobs[0].requires_product_reference = false;
  const service = await prepareMediaJobs(input, options); assert.equal(service.jobs[0].status, 'planned'); assert.equal(service.jobs[0].execution_allowed, true);
  input.jobs[0].kind = 'gif'; input.jobs[0].requires_product_reference = true; input.jobs[0].frame_jobs = [{ id: 'service-frame', prompt: 'frame', requires_product_reference: false }];
  const frames = await prepareMediaJobs(input, options); assert.equal(frames.jobs[0].requires_product_reference, true); assert.equal(frames.jobs[0].status, 'blocked');
});

test('ima2 edit requires its exact 2.5 edit contract and is never replaced by gen', async (t) => {
  const root = await fixture(t), input = jobs(); input.jobs[0].operation = 'edit';
  const unknown = await prepareMediaJobs(input, { baseDir: root, capabilities });
  assert.equal(unknown.jobs[0].status, 'blocked'); assert.ok(unknown.jobs[0].reasons.includes('ima2_edit_2_5_contract_not_verified')); assert.equal(unknown.jobs[0].request, null);
  const explicit = { ima2: { ...capabilities.ima2, edit_contract: { ...capabilities.ima2.generation_contract, prompt_flag: true, max_refs: 1 } } };
  const future = await prepareMediaJobs(input, { baseDir: root, capabilities: explicit });
  assert.equal(future.jobs[0].status, 'planned'); assert.equal(future.jobs[0].request.args[0], 'edit'); assert.ok(future.jobs[0].request.args.includes('--prompt')); assert.ok(!future.jobs[0].request.args.includes('gen'));
});

test('ima2 forbids separate API/external/unknown lanes and undocumented 2.5 image pinning', async (t) => {
  const root = await fixture(t);
  for (const lane of ['api', 'grok-api', 'gemini-api', 'atlascloud', 'runway', undefined]) {
    const cap = structuredClone(capabilities); cap.ima2.supported_models[0].lane = lane;
    const prepared = await prepareMediaJobs(jobs(), { baseDir: root, capabilities: cap });
    assert.equal(prepared.jobs[0].status, 'blocked'); assert.equal(prepared.jobs[0].request, null);
  }
  for (const mutation of [(c) => { delete c.generation_contract; }, (c) => { c.generation_contract.api_only = true; }, (c) => { c.generation_contract.supported_models = ['gpt-6-luna']; }, (c) => { delete c.generation_contract.contract_reference; }]) {
    const cap = structuredClone(capabilities); mutation(cap.ima2);
    const prepared = await prepareMediaJobs(jobs(), { baseDir: root, capabilities: cap });
    assert.equal(prepared.jobs[0].status, 'blocked'); assert.ok(prepared.jobs[0].reasons.includes('ima2_image_model_pin_contract_not_verified'));
  }
});

test('API-only edit image-tool-model is never mistaken for an OAuth --model contract', async (t) => {
  const root = await fixture(t);
  const run = async (_command, args) => {
    const command = args.join(' ');
    return { stdout: command.includes('--version') ? '3.26.2' : command.includes('capabilities') ? JSON.stringify({ ok: true, commands: ['edit'] }) : command.includes('models') ? JSON.stringify({ ok: true, models: [{ id: 'gpt-image-2.5-sunburst', lane: 'oauth' }] }) : command.includes('edit') ? '--image-tool-model <gpt-image-2.5-sunburst|gpt-image-2.5-flare> API only\n--model <gpt-6-luna>\n--provider <oauth|api>\n--prompt <text>\n--ref <file>' : '--model <gpt-image-2.5-sunburst>\n--provider <oauth>\n--ref <file>' };
  };
  const cap = await discoverImageCapabilities({ run });
  assert.equal(cap.ima2.edit_contract.image_model_flag, '--image-tool-model'); assert.equal(cap.ima2.edit_contract.api_only, true);
  const input = jobs(); input.jobs[0].operation = 'edit';
  const prepared = await prepareMediaJobs(input, { baseDir: root, capabilities: cap });
  assert.equal(prepared.jobs[0].status, 'blocked'); assert.ok(prepared.jobs[0].reasons.includes('ima2_edit_2_5_contract_not_verified')); assert.equal(prepared.jobs[0].request, null);
});
