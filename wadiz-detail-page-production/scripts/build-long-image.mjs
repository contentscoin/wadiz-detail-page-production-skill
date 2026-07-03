#!/usr/bin/env node
// Assemble cut-01..cut-N PNGs into one vertical long image (default 1080 wide).
// Long images are derived packaging; cuts remain the source of truth.
//
// Usage:
//   node build-long-image.mjs <cuts-dir> [output.png] [--width 1080]
//
// Dependency: npm i sharp

import fs from "node:fs/promises";
import path from "node:path";

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("Missing dependency: sharp. Run: npm i sharp");
  process.exit(1);
}

const args = process.argv.slice(2);
const cutsDir = args[0];
if (!cutsDir) {
  console.error("Usage: node build-long-image.mjs <cuts-dir> [output.png] [--width 1080]");
  process.exit(1);
}
const widthFlag = args.indexOf("--width");
const targetWidth = widthFlag >= 0 ? Number(args[widthFlag + 1]) : 1080;
const outputPath = path.resolve(
  args[1] && !args[1].startsWith("--") ? args[1] : path.join(cutsDir, "detail-page-long.png"),
);

const absDir = path.resolve(cutsDir);
const entries = await fs.readdir(absDir);

// Prefer composited outputs when both cut-XX.png and cut-XX.composite.png exist.
// Scan the flat cuts/ root AND layered subdirectories cuts/cut-XX/.
const byCut = new Map();
const consider = (id, relPath, isComposite) => {
  if (!byCut.has(id) || isComposite) byCut.set(id, relPath);
};
for (const f of entries.filter((f) => /^cut-\d+\.(composite\.)?png$/i.test(f))) {
  consider(f.match(/^cut-\d+/i)[0].toLowerCase(), f, f.includes(".composite."));
}
for (const dir of entries.filter((e) => /^cut-\d+$/i.test(e))) {
  const sub = path.join(absDir, dir);
  const stat = await fs.stat(sub).catch(() => null);
  if (!stat?.isDirectory()) continue;
  for (const f of (await fs.readdir(sub)).filter((f) => /\.png$/i.test(f) && !/^layer-/i.test(f))) {
    consider(dir.toLowerCase(), path.join(dir, f), f.includes(".composite."));
  }
}
const selected = [...byCut.entries()]
  .sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }))
  .map(([, f]) => f);
if (!selected.length) {
  console.error(`No cut-XX.png files found in ${absDir}`);
  process.exit(1);
}

const buffers = [];
let totalHeight = 0;
for (const file of selected) {
  const buf = await sharp(path.join(absDir, file)).resize({ width: targetWidth }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  buffers.push({ buf, height: meta.height });
  totalHeight += meta.height;
}

let top = 0;
const composites = buffers.map(({ buf, height }) => {
  const entry = { input: buf, top, left: 0 };
  top += height;
  return entry;
});

await sharp({
  create: { width: targetWidth, height: totalHeight, channels: 3, background: "#ffffff" },
})
  .composite(composites)
  .png()
  .toFile(outputPath);

console.log(
  JSON.stringify(
    { output: outputPath, cuts: selected, width: targetWidth, height: totalHeight },
    null,
    2,
  ),
);
