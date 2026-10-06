#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { categoryOf } from './lib/contracts.mjs';

export function convertLegacyJobs(document, { backend = 'codex_native', model = 'gpt-image-2.5-sunburst', category } = {}) {
  if (document.schema_version !== 1 || !Array.isArray(document.jobs)) throw new Error('Expected legacy imagegen-jobs schema_version:1 and jobs array.');
  if (!['codex_native', 'ima2'].includes(backend)) throw new Error('Only codex_native and ima2 are supported.');
  if (!['gpt-image-2.5-sunburst', 'gpt-image-2.5-flare'].includes(model)) throw new Error('Choose an explicit GPT Image 2.5 variant.');
  const jobs = document.jobs.map(job => {
    const engine = job.engine ?? document.default_engine;
    if (engine !== 'gpt_image') throw new Error(`${job.id ?? '(unnamed job)'}: unsupported legacy engine ${engine}; nano_banana is not converted.`);
    if (!job.id || (!job.prompt_file && !job.prompt)) throw new Error('Each legacy job needs id and prompt or prompt_file.');
    const refs = (job.input_images ?? []).map(ref => {
      const file = typeof ref === 'string' ? ref : ref.path;
      if (typeof file !== 'string' || !file.trim()) throw new Error(`${job.id}: invalid reference file.`);
      return { file, role: typeof ref === 'string' ? 'product_reference' : ref.role ?? 'product_reference', truth_level: 'reference_only' };
    });
    const requiresProductReference = categoryOf(job.category ?? category ?? document.category ?? document.product?.category) !== 'service' && job.operation !== 'background';
    const blocked = requiresProductReference && refs.length === 0;
    return {
      id: job.id, kind: 'image', backend, model_requested: model, model_confirmed: null, status: blocked ? 'blocked' : 'pending',
      requires_product_reference: requiresProductReference,
      ...(blocked ? { blocked_reason: 'product_reference_images_required' } : {}),
      operation: job.operation === 'background' ? 'generate' : job.operation ?? (refs.length ? 'edit' : 'generate'),
      ...(job.prompt ? { prompt: job.prompt } : {}), ...(job.prompt_file ? { prompt_file: job.prompt_file } : {}),
      input_refs: refs, output_file: job.output_path ?? `cuts/${job.id}.png`,
      depends_on: job.depends_on ?? [], korean_text_required: job.korean_text_required ?? [],
      legacy: { ...job },
    };
  });
  if (new Set(jobs.map(job => job.id)).size !== jobs.length) throw new Error('Duplicate legacy job IDs.');
  return {
    schema_version: 1, project_id: document.project_id ?? 'imported-sangse', output_root: document.output_root ?? '.', jobs,
    compatibility: { source_schema: 'legacy-imagegen-jobs-v1', source_review: 'not_performed', warnings: ['Legacy completion/approval state is reset; missing required references block jobs.', 'Conversion requests GPT Image 2.5; runtime capability must be verified before generation.'], backwards_incompatibilities: ['GIF, explicit model selection and confirmed backend capabilities cannot be represented in the old image-only format.'] },
  };
}

async function main(argv) {
  if (argv.includes('--help')) { console.log('Usage: node convert-legacy-jobs.mjs <legacy.json> --out <new.json> [--backend codex_native|ima2] [--model gpt-image-2.5-sunburst|gpt-image-2.5-flare] [--category service|food|beauty|tech|fashion|living]'); return; }
  const input = argv.shift();
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--out', '--backend', '--model', '--category'].includes(argv[i]) || !argv[i + 1]) throw new Error(`Invalid argument: ${argv[i]}`);
    options[argv[i].slice(2)] = argv[i + 1];
  }
  if (!input || !options.out) throw new Error('input and --out are required.');
  if (path.resolve(input) === path.resolve(options.out)) throw new Error('Use a new output file; source jobs are preserved.');
  const converted = convertLegacyJobs(JSON.parse(await fs.readFile(input, 'utf8')), options);
  await fs.mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
  await fs.writeFile(options.out, `${JSON.stringify(converted, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  console.log(`Converted ${converted.jobs.length} jobs to ${options.out}; ${converted.jobs.filter(job => job.status === 'pending').length} pending, ${converted.jobs.filter(job => job.status === 'blocked').length} blocked.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
