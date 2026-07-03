#!/usr/bin/env node
// Compose a detail-page cut from a layers.json manifest.
// Layers: PNG image layers (generated scenes) + SVG layers (Korean text, badges)
// rendered with @resvg/resvg-js and stacked with sharp.
//
// Usage:
//   node compose-layers.mjs <cut-dir>            # expects <cut-dir>/layers.json
//   node compose-layers.mjs <layers.json path>
//
// Dependencies (install once at repo root):
//   npm i sharp @resvg/resvg-js

import fs from "node:fs/promises";
import path from "node:path";

let sharp, Resvg;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("Missing dependency: sharp. Run: npm i sharp @resvg/resvg-js");
  process.exit(1);
}
try {
  ({ Resvg } = await import("@resvg/resvg-js"));
} catch {
  console.error("Missing dependency: @resvg/resvg-js. Run: npm i sharp @resvg/resvg-js");
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node compose-layers.mjs <cut-dir | layers.json>");
  process.exit(1);
}

const manifestPath = (await fs.stat(path.resolve(arg))).isDirectory()
  ? path.resolve(arg, "layers.json")
  : path.resolve(arg);
const cutDir = path.dirname(manifestPath);
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

const width = manifest.canvas?.width ?? 1080;
const height = manifest.canvas?.height ?? 1600;
const layers = [...(manifest.layers ?? [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
if (!layers.length) {
  console.error(`No layers defined in ${manifestPath}`);
  process.exit(1);
}

async function renderLayer(layer) {
  const filePath = path.resolve(cutDir, layer.path);
  if (layer.type === "svg") {
    const svg = await fs.readFile(filePath, "utf8");
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
      font: {
        loadSystemFonts: true,
        defaultFontFamily: layer.font ?? "Pretendard",
      },
    });
    return resvg.render().asPng();
  }
  // image layer: resize to canvas width, keep aspect
  return sharp(filePath).resize({ width, withoutEnlargement: false }).png().toBuffer();
}

const composites = [];
for (const layer of layers.slice(1)) {
  composites.push({
    input: await renderLayer(layer),
    top: layer.offset?.y ?? 0,
    left: layer.offset?.x ?? 0,
  });
}

const base = layers[0];
const baseBuffer = await renderLayer(base);
const outputPath = path.resolve(cutDir, manifest.output ?? `${manifest.cut_id ?? "cut"}.composite.png`);

await sharp(baseBuffer)
  .resize(width, height, { fit: "cover", position: "centre" })
  .composite(composites)
  .png()
  .toFile(outputPath);

// Copy to the cuts/ root so gallery/ZIP/long-image tooling that only scans
// the flat cuts/ directory picks up the composited output.
const cutsRoot = path.dirname(cutDir);
const rootCopy = path.join(cutsRoot, path.basename(outputPath));
if (path.resolve(rootCopy) !== path.resolve(outputPath)) {
  await fs.copyFile(outputPath, rootCopy);
}

const meta = await sharp(outputPath).metadata();
console.log(
  JSON.stringify(
    {
      cut_id: manifest.cut_id ?? path.basename(cutDir),
      output: outputPath,
      root_copy: path.resolve(rootCopy) !== path.resolve(outputPath) ? rootCopy : null,
      width: meta.width,
      height: meta.height,
      layer_count: layers.length,
      text_render_mode: manifest.text_render_mode ?? "svg_layer",
    },
    null,
    2,
  ),
);
