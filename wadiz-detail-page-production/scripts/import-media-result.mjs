#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { importGeneratedImage } from './media/image-backends.mjs';
import { isMain, readJson, writeJson } from './media/common.mjs';
export { importGeneratedImage };

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2), flag = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args[i + 1]; };
  if (!args[0] || args.includes('--help')) console.log('Usage: node import-media-result.mjs <request-plan.json> --job <job-id> --result <tool-result.json> --out <media-results.json>\nVerifies actual model/ref provenance and output hash; does not generate. Existing result IDs are never overwritten.');
  else {
    try {
      if (!flag('job') || !flag('result') || !flag('out')) throw new Error('--job, --result and --out are required');
      const prepared = await readJson(args[0]), job = prepared.jobs?.find((j) => j.id === flag('job'));
      if (!job || job.status === 'blocked' || job.execution_allowed !== true) throw new Error('Job must have a verified backend and explicit usage approval');
      const resultFile = path.resolve(flag('result'));
      const result = await importGeneratedImage(job, await readJson(resultFile), { baseDir: path.dirname(resultFile) });
      const output = path.resolve(flag('out'));
      const document = await readJson(output).catch((error) => { if (error.code === 'ENOENT') return { schema_version: 1, results: [] }; throw error; });
      if (document.schema_version !== 1 || !Array.isArray(document.results)) throw new Error('Invalid media-results document');
      if (document.results.some((r) => r.job_id === result.job_id)) throw new Error(`Duplicate result job: ${result.job_id}`);
      result.file = path.relative(path.dirname(output), path.resolve(path.dirname(resultFile), result.file)).replaceAll('\\', '/');
      document.results.push(result);
      await fs.mkdir(path.dirname(output), { recursive: true }); await writeJson(output, document);
      console.log(JSON.stringify({ job_id: result.job_id, status: result.status, output }));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
