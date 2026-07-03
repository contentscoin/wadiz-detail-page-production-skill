#!/usr/bin/env node
// Mechanical QA for a detail-page project directory. No native dependencies:
// PNG dimensions are read from the IHDR chunk directly.
//
// Checks:
//   1. cut file count vs imagegen-jobs.json / cut-plan.json expectation
//   2. per-cut dimensions (default 1080x1600, tolerance configurable)
//   3. file size floor (placeholder/blank detection) and ceiling
//   4. layers.json presence + editable text layers when text_render_mode=svg_layer
//   5. korean_text_required coverage: text must exist in SVG layer or be flagged for OCR
//
// Usage:
//   node qa-detail-page.mjs <project-root> [--cuts cuts] [--width 1080] [--height 1600]
//
// Output: qa/mechanical-qa.json + console summary. Exit 1 when any cut fails.

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const projectRoot = args[0];
if (!projectRoot) {
  console.error("Usage: node qa-detail-page.mjs <project-root> [--cuts cuts] [--width 1080] [--height 1600]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const cutsDirName = flag("cuts", "cuts");
const expectWidth = Number(flag("width", 1080));
const expectHeight = Number(flag("height", 1600));
const MIN_BYTES = 30_000; // below this a 1080x1600 cut is almost certainly blank/placeholder
const MAX_BYTES = 15_000_000;

const root = path.resolve(projectRoot);
const cutsDir = path.join(root, cutsDirName);

async function readJson(p) {
  try {
    return JSON.parse(await fs.readFile(p, "utf8"));
  } catch {
    return null;
  }
}

function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const jobs = await readJson(path.join(root, "imagegen-jobs.json"));
const cutPlan = await readJson(path.join(root, "cut-plan.json"));
const expectedCount =
  jobs?.jobs?.filter((j) => j.kind?.includes("cut") || /^cut-/.test(j.id)).length ??
  cutPlan?.cuts?.length ??
  null;

let entries = [];
try {
  entries = await fs.readdir(cutsDir);
} catch {
  console.error(`cuts directory not found: ${cutsDir}`);
  process.exit(1);
}

// One finding per cut id; prefer composite output. Search cuts/ root AND
// layered subdirectories cuts/cut-XX/ (compose-layers output location).
const cutFiles = new Map();
const consider = (id, relPath, isComposite) => {
  if (!cutFiles.has(id) || isComposite) cutFiles.set(id, relPath);
};
for (const f of entries.filter((f) => /^cut-\d+.*\.png$/i.test(f))) {
  consider(f.match(/^cut-\d+/i)[0].toLowerCase(), f, f.includes(".composite."));
}
for (const dir of entries.filter((e) => /^cut-\d+$/i.test(e))) {
  const sub = path.join(cutsDir, dir);
  const stat = await fs.stat(sub).catch(() => null);
  if (!stat?.isDirectory()) continue;
  for (const f of (await fs.readdir(sub)).filter((f) => /\.png$/i.test(f) && !/^layer-/i.test(f))) {
    consider(dir.toLowerCase(), path.join(dir, f), f.includes(".composite."));
  }
}

const results = [];
for (const [cutId, file] of [...cutFiles.entries()].sort()) {
  const filePath = path.join(cutsDir, file);
  const issues = [];
  const buf = await fs.readFile(filePath);
  const size = pngSize(buf);

  if (!size) issues.push("not_a_valid_png");
  else {
    if (size.width !== expectWidth) issues.push(`width_${size.width}_expected_${expectWidth}`);
    if (Math.abs(size.height - expectHeight) > expectHeight * 0.05)
      issues.push(`height_${size.height}_expected_${expectHeight}`);
  }
  if (buf.length < MIN_BYTES) issues.push("file_too_small_possible_placeholder");
  if (buf.length > MAX_BYTES) issues.push("file_too_large");

  // Layer manifest checks (layered pipeline)
  const layersManifest = await readJson(path.join(cutsDir, cutId, "layers.json"));
  const job = jobs?.jobs?.find((j) => j.id === cutId);
  const requiredText = job?.korean_text_required ?? [];
  let textCheck = "ocr_required";
  if (layersManifest?.text_render_mode === "svg_layer" || layersManifest?.text_render_mode === "hybrid") {
    const svgLayers = (layersManifest.layers ?? []).filter((l) => l.type === "svg");
    if (!svgLayers.length) issues.push("svg_layer_mode_but_no_svg_layers");
    const svgText = (
      await Promise.all(
        svgLayers.map((l) =>
          fs.readFile(path.join(cutsDir, cutId, l.path), "utf8").catch(() => ""),
        ),
      )
    ).join("\n");
    const missing = requiredText.filter((t) => !svgText.includes(t));
    if (missing.length) issues.push(`svg_text_missing:${missing.join("|")}`);
    else if (requiredText.length) textCheck = "svg_verbatim_pass";
  }

  results.push({
    cut_id: cutId,
    file,
    bytes: buf.length,
    dimensions: size,
    text_check: textCheck,
    korean_text_required: requiredText,
    issues,
    status: issues.length ? "fail" : "pass",
  });
}

const report = {
  generated_by: "qa-detail-page.mjs",
  project_root: root,
  expected_cut_count: expectedCount,
  actual_cut_count: results.length,
  cut_count_match: expectedCount === null ? "unknown" : expectedCount === results.length,
  expected_dimensions: { width: expectWidth, height: expectHeight },
  results,
  regen_queue: results.filter((r) => r.status === "fail").map((r) => r.cut_id),
  note: "Mechanical checks only. OCR, logo fidelity, claim alignment, and readability QA remain separate gates.",
};

await fs.mkdir(path.join(root, "qa"), { recursive: true });
await fs.writeFile(path.join(root, "qa", "mechanical-qa.json"), JSON.stringify(report, null, 2));

const failed = report.regen_queue.length;
const countMismatch = report.cut_count_match === false;
const noCuts = results.length === 0;
console.log(
  `cuts: ${results.length}${expectedCount !== null ? `/${expectedCount}` : ""}, pass: ${results.length - failed}, fail: ${failed}`,
);
if (failed) console.log(`regen queue: ${report.regen_queue.join(", ")}`);
if (countMismatch) console.error(`FAIL: cut count mismatch (expected ${expectedCount}, found ${results.length})`);
if (noCuts) console.error("FAIL: no cut outputs found");
if (failed || countMismatch || noCuts) process.exit(1);
