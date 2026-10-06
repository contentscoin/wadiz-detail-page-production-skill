#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { discoverImageCapabilities, prepareMediaJobs } from './media/image-backends.mjs';
import { isMain, readJson, writeJson } from './media/common.mjs';
export { discoverImageCapabilities, prepareMediaJobs };

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2), flag = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args[i + 1]; };
  if (!args[0] || args.includes('--help')) console.log('Usage: node prepare-media-jobs.mjs <media-jobs.json> --out <request-plan.json> [--capabilities <capabilities.json>] [--approval <approval.json>]\nRead-only backend discovery and generation plan export. No generation or server startup.');
  else {
    try {
      const out = flag('out');
      if (!out) throw new Error('--out is required');
      const input = path.resolve(args[0]);
      const plan = await prepareMediaJobs(await readJson(input), { baseDir: path.dirname(input), ...(flag('capabilities') ? { capabilities: await readJson(flag('capabilities')) } : {}), ...(flag('approval') ? { approval: await readJson(flag('approval')) } : {}) });
      await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
      await writeJson(path.resolve(out), plan);
      console.log(JSON.stringify({ output: path.resolve(out), planned: plan.jobs.filter((j) => j.status === 'planned').length, blocked: plan.jobs.filter((j) => j.status === 'blocked').length, generated_images: 0 }));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
