#!/usr/bin/env node
/**
 * Build imagegen-jobs.json skeleton for ecommerce detail-page cuts.
 * Prompt files must exist or be filled before Codex generation.
 */
import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    projectId: "detail-page",
    outputRoot: null,
    cuts: 12,
    engine: "gpt_image",
    refs: [],
    out: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project-id") args.projectId = argv[++i];
    else if (a === "--output-root") args.outputRoot = argv[++i];
    else if (a === "--cuts") args.cuts = Number(argv[++i]);
    else if (a === "--engine") args.engine = argv[++i];
    else if (a === "--ref") args.refs.push(argv[++i]);
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help") {
      console.log(`Usage: node build-imagegen-jobs.mjs \\
  --project-id <id> \\
  --output-root <dir> \\
  --cuts <6|12|15> \\
  [--engine gpt_image|nano_banana] \\
  [--ref refs/product.png ...] \\
  [--out path/to/imagegen-jobs.json]`);
      process.exit(0);
    }
  }
  if (!args.outputRoot) args.outputRoot = path.join("projects", args.projectId);
  if (!args.out) args.out = path.join(args.outputRoot, "imagegen-jobs.json");
  return args;
}

function padCut(n) {
  return `cut-${String(n).padStart(2, "0")}`;
}

function buildInputImages(refs) {
  return refs.map((p) => ({
    path: p.replace(/\\/g, "/"),
    role: "product reference; preserve shape, color, and readable labels only",
  }));
}

async function main() {
  const args = parseArgs(process.argv);
  if (!Number.isFinite(args.cuts) || args.cuts < 1) {
    console.error("Invalid --cuts");
    process.exit(1);
  }

  const inputImages = buildInputImages(args.refs);
  const jobs = [];

  for (let i = 1; i <= args.cuts; i++) {
    const id = padCut(i);
    jobs.push({
      id,
      kind: "detail-page-cut",
      status: "pending",
      prompt_file: `prompts/${id}.md`,
      input_images: inputImages,
      output_path: `cuts/${id}.png`,
      depends_on: [],
      generation_skill: "$imagegen",
      engine: args.engine,
      parallelizable_after: [],
      korean_text_required: [],
      aspect_ratio: "9:16",
      recording_owner: "parent",
    });
  }

  const doc = {
    schema_version: 1,
    project_id: args.projectId,
    output_root: args.outputRoot.replace(/\\/g, "/"),
    primary_generation_skill: "$imagegen",
    default_engine: args.engine,
    jobs,
  };

  await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
  await fs.writeFile(path.resolve(args.out), `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`Wrote ${args.out} (${jobs.length} jobs)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
