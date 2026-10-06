import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { assertId, execFileAsync, localFile, sha256 } from './common.mjs';
import { MODELS } from '../lib/contracts.mjs';

export const GPT_IMAGE_25_MODELS = Object.freeze([...MODELS]);
export const isImage25 = (model) => GPT_IMAGE_25_MODELS.includes(model);
export const ALLOWED_IMA2_LANES = Object.freeze(['oauth', 'native', 'codex']);

function pinContractFromHelp(help, version, command) {
  const lines = help.split(/\r?\n/);
  const blockAt = (index) => {
    if (index < 0) return '';
    const block = [lines[index]];
    for (let i = index + 1; i < lines.length && !/^\s*(?:-[a-z],\s*)?--[a-z]/i.test(lines[i]); i++) block.push(lines[i]);
    return block.join('\n');
  };
  const pinIndex = lines.findIndex((line) => /--(?:image-tool-model|model)\b/.test(line) && GPT_IMAGE_25_MODELS.some((model) => line.includes(model)));
  const pinBlock = blockAt(pinIndex), providerBlock = blockAt(lines.findIndex((line) => /--provider\b/.test(line)));
  return {
    source: 'live_cli_help', contract_reference: `ima2 ${version} ${command} --help`,
    image_model_flag: pinIndex < 0 ? null : lines[pinIndex].match(/--(?:image-tool-model|model)\b/)?.[0],
    supported_models: pinIndex < 0 ? [] : GPT_IMAGE_25_MODELS.filter((model) => lines[pinIndex].includes(model)),
    provider_flag: providerBlock ? '--provider' : null,
    supported_lanes: ALLOWED_IMA2_LANES.filter((lane) => new RegExp(`\\b${lane}\\b`).test(providerBlock)),
    api_only: /API[ -]only|API only/i.test(pinBlock),
  };
}

function supportsPinContract(contract, supported, requestedModel) {
  return !!(contract && ['live_cli_help', 'documented_contract'].includes(contract.source) && contract.contract_reference && ['--model', '--image-tool-model'].includes(contract.image_model_flag) && contract.provider_flag === '--provider' && contract.supported_lanes?.includes(supported?.lane) && contract.supported_models?.includes(requestedModel) && contract.api_only === false);
}

async function readOnlyIma2(args, run) {
  // On Windows the npm CLI is a .cmd/.ps1 wrapper. All discovery arguments
  // below are constants; no project prompt or user path is interpolated here.
  const command = process.platform === 'win32' ? 'powershell.exe' : 'ima2';
  const argv = process.platform === 'win32' ? ['-NoProfile', '-NonInteractive', '-Command', `ima2 ${args.join(' ')}`] : args;
  const result = await run(command, argv, { timeout: 15_000, windowsHide: true, maxBuffer: 1024 * 1024 });
  return result.stdout.trim();
}

function modelEntries(value) {
  // Only explicit image model lists count. Mainline planner/default model IDs
  // and names appearing in free-form descriptions do not prove 2.5 support.
  const entries = [];
  const add = (model, lane) => {
    const id = typeof model === 'string' ? model : model.id ?? model.model ?? model.model_id;
    if (isImage25(id)) entries.push({ id, lane: model.lane ?? model.provider ?? lane });
  };
  for (const model of Array.isArray(value.models) ? value.models : []) add(model);
  for (const model of Array.isArray(value.imageModels) ? value.imageModels : []) add(model);
  for (const lane of Array.isArray(value.lanes) ? value.lanes : []) {
    if (lane.kind && lane.kind !== 'image') continue;
    for (const model of lane.models ?? lane.imageModels ?? []) add(model, lane.id ?? lane.lane ?? lane.provider);
  }
  return entries;
}

export async function discoverImageCapabilities({ run = execFileAsync } = {}) {
  const result = {
    schema_version: 1, captured_at: new Date().toISOString(),
    codex_native: { source: 'documented_tool_contract', model_pinning: false, supported_models: [], references: true, edit: true, reason: 'Native image tool contract has no model selection parameter; GPT Image 2.5 cannot be pinned.' },
    ima2: { source: 'live_cli', available: false, supported_models: [], references: false, edit: false },
  };
  try {
    result.ima2.version = await readOnlyIma2(['--version'], run);
    const capabilities = JSON.parse(await readOnlyIma2(['capabilities', '--json'], run));
    const models = JSON.parse(await readOnlyIma2(['models', '--kind', 'image', '--json'], run));
    const help = await readOnlyIma2(['gen', '--help'], run);
    const editHelp = await readOnlyIma2(['edit', '--help'], run);
    result.ima2.available = models.ok === true;
    result.ima2.supported_models = models.ok === true ? modelEntries(models) : [];
    result.ima2.model_pinning = /--model\b/.test(help);
    result.ima2.references = /--ref\b/.test(help);
    result.ima2.generation_contract = pinContractFromHelp(help, result.ima2.version, 'gen');
    result.ima2.edit = capabilities.ok === true && capabilities.commands?.includes('edit') === true;
    result.ima2.edit_contract = { ...pinContractFromHelp(editHelp, result.ima2.version, 'edit'), max_refs: 1, prompt_flag: /--prompt\b/.test(editHelp) };
    result.ima2.reason = models.ok === true ? null : models.code ?? 'model_discovery_failed';
  } catch (error) { result.ima2.reason = `discovery_failed: ${error.message}`; }
  return result;
}

export async function prepareMediaJobs(document, { baseDir = process.cwd(), capabilities, approval } = {}) {
  if (document.schema_version !== 1 || !Array.isArray(document.jobs)) throw new Error('Expected MediaJob schema_version:1 with jobs');
  const discovered = capabilities ?? await discoverImageCapabilities();
  const ids = new Set(), prepared = [], expanded = [];
  for (const job of document.jobs) {
    for (const frame of job.kind === 'gif' ? job.frame_jobs ?? [] : []) expanded.push({
      section_id: job.section_id, backend: job.backend, model_requested: job.model_requested,
      input_refs: job.input_refs, truth_level: job.truth_level, status: 'pending',
      output_file: `media/${frame.id}.png`, ...frame, kind: 'image', parent_job_id: job.id,
      requires_product_reference: job.requires_product_reference !== false || frame.requires_product_reference === true,
    });
    expanded.push(job);
  }
  for (const job of expanded) {
    assertId(job.id, 'job id');
    if (ids.has(job.id)) throw new Error(`Duplicate media job: ${job.id}`);
    ids.add(job.id);
    if (!['image', 'gif'].includes(job.kind)) throw new Error(`Invalid kind for ${job.id}`);
    if (!['codex_native', 'ima2'].includes(job.backend)) throw new Error(`Unsupported image backend: ${job.backend}`);
    if (!isImage25(job.model_requested)) throw new Error(`Only exact GPT Image 2.5 models are supported: ${job.model_requested}`);
    if (job.operation !== undefined && !['generate', 'edit'].includes(job.operation)) throw new Error(`Unsupported image operation: ${job.operation}`);
    if (job.kind === 'gif') {
      prepared.push({ id: job.id, status: 'blocked', kind: 'gif', backend: job.backend, model_requested: job.model_requested,
        reasons: ['awaiting_verified_frames_or_actual_footage'], execution_allowed: false,
        depends_on: (job.frame_jobs ?? []).map((f) => f.id),
        note: 'Storyboard is not a completed GIF. Import frame results, then use build-motion-cut with verified provenance or actual footage.', ...(job.motion ? { motion: job.motion } : {}) });
      continue;
    }
    const inputRefs = await Promise.all((job.input_refs ?? []).map(async (ref) => {
      const file = await localFile(baseDir, typeof ref === 'string' ? ref : ref.file);
      const buffer = await fs.readFile(file), image = await sharp(buffer).metadata();
      if (!['png', 'jpeg', 'webp'].includes(image.format) || (image.pages ?? 1) > 1) throw new Error(`Reference must be a static PNG/JPEG/WebP: ${file}`);
      return { file, role: typeof ref === 'string' ? 'product reference' : ref.role, sha256: sha256(buffer) };
    }));
    let prompt = job.prompt;
    if (!prompt && job.prompt_file) prompt = await fs.readFile(await localFile(baseDir, job.prompt_file), 'utf8');
    if (typeof prompt !== 'string' || !prompt.trim()) throw new Error(`Missing image prompt: ${job.id}`);
    const capability = discovered[job.backend] ?? {};
    const entries = (capability.supported_models ?? []).map((item) => typeof item === 'string' ? { id: item } : item);
    const supported = entries.find((item) => item.id === job.model_requested);
    const reasons = [];
    const requiresProductReference = job.requires_product_reference !== false;
    if (requiresProductReference && !inputRefs.length) reasons.push('product_reference_required');
    if (job.backend === 'ima2' && !capability.available) reasons.push(capability.reason ?? 'ima2_unavailable');
    if (!capability.model_pinning || !supported) reasons.push('requested_2_5_model_not_verified');
    if (job.backend === 'ima2' && !ALLOWED_IMA2_LANES.includes(supported?.lane)) reasons.push(supported?.lane ? 'separate_api_or_external_lane_disallowed' : 'image_lane_not_verified');
    const generationContract = capability.generation_contract;
    if (job.backend === 'ima2' && job.operation !== 'edit' && !supportsPinContract(generationContract, supported, job.model_requested)) reasons.push('ima2_image_model_pin_contract_not_verified');
    if (inputRefs.length && capability.references !== true) reasons.push('reference_transport_not_verified');
    if (job.operation === 'edit' && (!inputRefs.length || capability.edit !== true)) reasons.push('edit_support_or_reference_missing');
    if (job.operation === 'edit' && job.backend === 'ima2' && !(supportsPinContract(capability.edit_contract, supported, job.model_requested) && capability.edit_contract.prompt_flag === true && inputRefs.length === capability.edit_contract.max_refs)) reasons.push('ima2_edit_2_5_contract_not_verified');
    const output = path.resolve(baseDir, job.output_file ?? `media/${job.id}.png`);
    const approved = approval?.approved === true && approval.job_ids?.includes(job.id) && typeof approval.estimated_usage === 'string' && approval.estimated_usage.trim();
    let request = null;
    if (!reasons.length) {
      if (job.backend === 'codex_native') {
        // A future native contract can enable pinning only with its documented
        // model parameter. Today's contract remains blocked by discovery.
        if (typeof capability.model_parameter !== 'string' || !capability.contract_reference) reasons.push('native_model_parameter_not_documented');
        else request = { tool: 'image_gen.imagegen', arguments: { prompt, referenced_image_paths: inputRefs.map((r) => r.file), [capability.model_parameter]: job.model_requested, transparent_background: false } };
      } else {
        request = { executable: 'ima2', args: job.operation === 'edit' ? ['edit', inputRefs[0].file, '--prompt', prompt, '--provider', supported.lane, capability.edit_contract.image_model_flag, supported.id, '--json', '--out', output] : ['gen', prompt, '--provider', supported.lane, generationContract.image_model_flag, supported.id, '--json', '--out', output, ...inputRefs.flatMap((r) => ['--ref', r.file])] };
      }
    }
    prepared.push({
      id: job.id, kind: 'image', backend: job.backend, model_requested: job.model_requested,
      requires_product_reference: requiresProductReference,
      ...(job.parent_job_id ? { parent_job_id: job.parent_job_id } : {}),
      status: reasons.length ? 'blocked' : 'planned', reasons, input_refs: inputRefs,
      request: reasons.length ? null : request, execution_allowed: !reasons.length && !!approved,
      approval_status: approved ? 'approved' : 'awaiting_explicit_usage_approval',
      output_file: output, note: 'Preparation does not invoke generation. A handoff must record actual model and reference provenance before completion.',
    });
  }
  return { schema_version: 1, capabilities: discovered, generated_images: 0, jobs: prepared };
}

export function verifyImageProvenance(job, provenance) {
  const issues = [];
  const evidence = provenance?.model_evidence;
  if (!provenance || provenance.backend !== job.backend) issues.push('backend_mismatch');
  if (!isImage25(provenance?.model_actual) || provenance?.model_actual !== job.model_requested) issues.push('actual_model_mismatch_or_unverified');
  if (!provenance?.request_id || !['tool_response', 'embedded_metadata'].includes(evidence?.source) || evidence?.model_actual !== provenance?.model_actual || evidence?.request_id !== provenance?.request_id) issues.push('model_provenance_missing');
  for (const ref of job.input_refs ?? []) {
    if (!ref.sha256 || !provenance?.input_refs?.some((actual) => actual.sha256 === ref.sha256) || !evidence?.input_refs?.some((actual) => actual.sha256 === ref.sha256)) issues.push('reference_provenance_missing');
  }
  return { verified: issues.length === 0, issues };
}

export async function importGeneratedImage(job, output, { baseDir = process.cwd() } = {}) {
  if (job.kind !== 'image' || !['ima2', 'codex_native'].includes(job.backend) || !isImage25(job.model_requested)) throw new Error('A prepared GPT Image 2.5 image job is required');
  if (job.status !== 'planned' || job.execution_allowed !== true || job.approval_status !== 'approved' || !job.request) throw new Error('A supported prepared job with explicit generation approval is required');
  if (!Array.isArray(job.input_refs) || job.input_refs.some((ref) => !/^[a-f0-9]{64}$/.test(ref.sha256))) throw new Error('Preparation reference hashes are required');
  if (job.requires_product_reference !== false && !job.input_refs.length) throw new Error('Product reference required by prepared job');
  for (const ref of job.input_refs) if (sha256(await fs.readFile(await localFile(baseDir, ref.file))) !== ref.sha256) throw new Error('Product reference changed since preparation');
  const verified = verifyImageProvenance(job, output.provenance);
  if (!verified.verified) throw new Error(`Unverified image provenance: ${verified.issues.join(', ')}`);
  const file = await localFile(baseDir, output.file), buffer = await fs.readFile(file), meta = await sharp(buffer).metadata();
  if (!['png', 'jpeg', 'webp'].includes(meta.format) || (meta.pages ?? 1) > 1 || !meta.width || !meta.height) throw new Error('Generation output must be a valid static PNG/JPEG/WebP');
  if (output.provenance.output_sha256 !== sha256(buffer)) throw new Error('Generated output hash does not match tool provenance');
  return {
    job_id: job.id, status: 'complete', kind: 'image', backend: job.backend,
    model_requested: job.model_requested, file: output.file, truth_level: 'generated_concept',
    input_refs: job.input_refs, provenance: output.provenance, prepared_job: job,
    qa: { ...output.qa, mechanical: 'pass', provenance_verified: true, width: meta.width, height: meta.height, bytes: buffer.length, sha256: sha256(buffer) },
  };
}
