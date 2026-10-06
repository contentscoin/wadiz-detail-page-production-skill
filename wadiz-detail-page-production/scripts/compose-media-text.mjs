#!/usr/bin/env node
import path from 'node:path';
import { isMain } from './media/common.mjs';
import { composeMediaText } from './lib/text-composition.mjs';
export { composeMediaText, buildCopySvg } from './lib/text-composition.mjs';

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  if (!args[0] || args.includes('--help')) console.log('Usage: node compose-media-text.mjs <project-dir> --out <new-results.json> [--width 1080] [--height 1600] [--image-height 800] [--font-file path --font-family name]\nComposes validated exact text in a separate SVG panel; preserves originals/provenance and leaves GIFs unchanged.');
  else {
    const options = {}, numbers = new Set(['width', 'height', 'image-height']);
    try {
      for (let i = 1; i < args.length; i += 2) {
        const key = args[i]?.slice(2), value = args[i + 1];
        if (!['out', ...numbers, 'font-file', 'font-family'].includes(key) || !value || value.startsWith('--')) throw new Error(`Unknown or missing option: ${args[i]}`);
        options[key === 'out' ? 'outFile' : key.replaceAll('-', '_')] = numbers.has(key) ? Number(value) : value;
      }
      if (!options.outFile) throw new Error('--out is required');
      await composeMediaText(path.resolve(args[0]), options).then((result) => console.log(JSON.stringify({ output: result.output, composed_images: result.composed_images, unchanged_gifs: result.unchanged_gifs }, null, 2)));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
