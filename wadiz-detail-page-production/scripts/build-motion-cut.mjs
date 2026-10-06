#!/usr/bin/env node
import path from 'node:path';
import { buildMotionCut } from './media/motion.mjs';
import { isMain, readJson } from './media/common.mjs';
export { buildMotionCut };

if (isMain(import.meta.url)) {
  const [configFile, outDir] = process.argv.slice(2);
  if (!configFile || configFile === '--help') console.log('Usage: node build-motion-cut.mjs <motion-config.json> [output-directory]');
  else buildMotionCut(await readJson(configFile), { baseDir: path.dirname(path.resolve(configFile)), ...(outDir ? { outDir: path.resolve(outDir) } : {}) }).then((r) => console.log(JSON.stringify(r, null, 2))).catch((e) => { console.error(e.message); process.exitCode = 1; });
}
