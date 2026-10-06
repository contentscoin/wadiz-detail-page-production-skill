# Base ecommerce pipeline and CLI contract

This reference describes the executable pipeline inside the installed Wadiz skill. The older [base-ecommerce-clone/](base-ecommerce-clone/) remains a compatibility/history resource. The current adaptive compiler owns new plans; OpenCrab provides reference evidence and sangse supplies purchase-question, copy-slot, and numeric-link checks.

## Inputs and artifacts

| Contract | Purpose |
|---|---|
| `ProductBrief` | Product name, category/topic, SKU/options, audience, source-backed facts, reference assets, and unknowns |
| `PagePlan` | Ordered sections with role, customer questions, copy, fact/evidence links, visual direction, placement reason, and media job |
| `MediaJob` | Image/GIF intent, reference files, requested/confirmed model, storyboard, status, and result provenance |
| `DeliveryManifest` | Ordered output media, posters, paths, truth/source information, QA and publication status |

Use the JSON schemas and examples shipped in `schemas/` and `assets/`; do not guess field names from prose. Work in a fresh output directory so source briefs and legacy artifacts are preserved.

## Planning commands

Commands below run from the installed skill folder. Node.js 20.9.0 or newer and the dependencies in `scripts/package.json` are required.

```powershell
node scripts/check-opencrab-evidence.mjs product-brief.json opencrab-raw.json --out evidence-matrix.json
node scripts/compile-page-plan.mjs product-brief.json --out project --evidence opencrab-raw.json
node scripts/validate-page-plan.mjs project
```

`check-opencrab-evidence` assesses raw retrieval relevance and provenance. `compile-page-plan` creates a draft structured plan, copy, media jobs, and planning documents. `validate-page-plan` writes `qa/plan-qa.json`. Refine generated copy to its actual slots, resolve missing-fact markers, and revalidate. A successful compilation alone is not approved or finished retail copy.

Inspect the actual plan and source facts, then record approval of the current copy snapshot before generation. The read-only snapshot command is:

```powershell
node scripts/build-delivery-package.mjs project --review-snapshot
```

The approval records `page-plan.json`'s `copy_approval` as `{ "status": "approved", "snapshot_sha256": "<reviewed snapshot hash>" }`. Review the reported inputs before setting it. A changed source/plan invalidates the previous approval. Approval files do not represent an unobserved human decision.

Optional `--style <id>` chooses `checkpoint`, `lookbook`, `offer-first`, `proof-first`, `spec-showcase`, or `story-first`. `--preset 12` or `--preset 15` preserves an explicitly selected legacy cut count. Without a preset, category/topic/product requirements determine section count and order. The compiler's purchase-question coverage does not require one section for each question.

## Image handoff

```powershell
node scripts/prepare-media-jobs.mjs project/media-jobs.json --out project/request-plan.json
```

Read-only discovery is the default. A deployment with verified runtime information may supply `--capabilities <file>`; that file must describe actual runtime capabilities rather than a wish to use 2.5. Only `codex_native` and `ima2` are supported. The prepared plan is a handoff to the image tool, not evidence that generation occurred.

Require exact GPT Image 2.5 availability and reference forwarding; verify editing when the job requires it. The native image tool's public arguments may lack model selection/confirmation. ima2 may be installed while its server is unreachable. Those conditions produce blocked jobs; do not claim generation or substitute another model/backend. Before a paid invocation, present the expected usage/cost and obtain scope approval.

For an approved handoff, also supply `--approval <approval.json>`; this file names the approved jobs and expected usage. It does not invoke generation. Read [media-production.md](media-production.md) for the exact capability, approval, and tool-result formats.

After actual tool execution, import the returned model/reference/output provenance:

```powershell
node scripts/import-media-result.mjs project/request-plan.json --job section-job-id --result tool-result.json --out project/media-results.json
```

Verify product identity and rendered copy. Required approval/status/result fields are defined by the shipped schemas and preparation report. Model/reference/output hashes bind the recorded result to the job, but manual visual checks still require observing the output.

For image sections with `hybrid` or `svg_layer` text, generate a text-free scene (no prices, specs, policies or invented lettering), import that result, then compose exact copy:

```powershell
node scripts/compose-media-text.mjs project --out project/composed-results.json
```

The original image and result file stay unchanged. The new result records base generation provenance, composition/copy/SVG hashes, and a separate editable text SVG. Default output is 1080 × 1600 with image above and text below. Korean glyph coverage and actual rendered widths are checked; unreadable characters, small fonts and overflow fail rather than clip. `--height`, `--image-height`, or an explicit Korean `--font-file`/`--font-family` can adapt the panel. Review the composed output again; earlier image review flags are not automatically reused. GIFs keep animation and essential copy in adjacent static information.

## GIF and packaging

```powershell
node scripts/build-motion-cut.mjs motion-config.json
node scripts/build-delivery-package.mjs project --out delivery
node scripts/build-delivery-package.mjs project --media-results project/composed-results.json --out composed-delivery
```

Use image-frame sequences for option changes, explanations, and illustrative scenes. Use supplied actual footage for operation/performance evidence. A generated before/after is a concept, not an observed product outcome. No AI video model is invoked. Inspect the GIF and poster; the conversion report cannot judge product distortion, copy readability, or truthfulness by itself.

Delivery includes image/GIF files, posters, an ordered preview, manifest, QA report, and ZIP. Long-image output is optional and static; GIFs remain separate files. Default packaging is a preview. `--publication` requests strict publication checks and rejects pending reviews instead of converting them into a passing result.

Use `--media-results` for the new composition results without overwriting the imported originals. Delivery rechecks the base generation, exact approved copy, editable SVG, font, and reconstructed composite pixels, and packages the base image/SVG with the final output.

## Legacy sangse import

```powershell
node scripts/import-sangse.mjs legacy-project --out imported-project
node scripts/convert-legacy-jobs.mjs legacy-image-jobs.json --out media-jobs.json
```

Keep `cuts.md`, `legal.md`, and legacy image jobs unchanged. Import into a fresh directory, inspect preserved copy and trading terms, and review the compatibility report. Imported facts start as `confirmation_needed` with source review incomplete. Optional `--category`, `--topic`, `--product-name`, and `--style` resolve legacy metadata; they do not verify facts. Legacy model/backend data is history, not GPT Image 2.5 capability. New adaptive section/GIF/provenance fields may not export back to the old format; report that limitation instead of silently discarding data. See [sangse-compatibility.md](sangse-compatibility.md).

## Practical completion checks

Check actual section order and media count against the plan, product/option/brand fidelity, mobile copy, exact prices/policies, image and GIF dimensions, GIF playback/loop/size, poster fallback, and archive contents. Regenerate or rebuild only failed media and recheck the affected sections. Separate concept completion, asset completeness, and publication approval.
