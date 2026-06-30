# Image Production Workflow

Use this after the user approves a cut plan and chooses image generation.

## Parallel Generation

Generate images through simultaneous parallel agents by default. The purpose is to reduce waiting time by starting all cut-production work before waiting for any single cut to finish. Use the maximum concurrency the environment supports.

1. Fix the approved cut count first.
2. The main agent is the coordinator only: it splits work, starts workers, collects outputs, runs QA, and builds the final gallery.
3. Create one independent image-generation agent/job per cut by default: `cut-01`, `cut-02`, ..., `cut-N`.
4. Give each cut agent only its assigned cut copy, layout, style template, product photo reference, and required output filename.
5. Start all available cut agents/jobs at the same time when the environment supports parallel agents or parallel tool calls.
6. Do not wait for `cut-01` before launching `cut-02`; launch every possible cut worker first, then collect results.
7. If the environment has a worker/tool limit, run the largest supported batch and immediately launch the next waiting cut when one slot finishes. Keep the workflow parallel, not one-by-one.
8. Each cut job must stay inside its assigned ownership. A worker for `cut-04` must not rewrite or regenerate `cut-03`.
9. If the approved plan marks a product photo as `재생성 권장`, the cut job must use that photo as a reference only and generate a cleaner ecommerce-ready product visual with improved lighting, background, crop, and composition.
10. Reference-based regeneration must preserve visible product shape, color, package structure, and readable labels, but must not invent unreadable labels, certifications, ingredients, or claims.
11. Do not merge cuts into one tall image unless the user explicitly asks.
12. Collect all outputs before final delivery.

If the environment cannot truly run image jobs in parallel, keep the job design parallel and explain only if needed; do not change the required output count or collapse multiple cuts into one image.

## Wadiz/OpenCrab Runtime File Contract

For Wadiz-style production, create and keep these files inside the project root:

- `input-intake.json`
- `opencrab-runtime-query.json`
- `opencrab-runtime-context.md`
- `fact-map.json`
- `cut-plan.json`
- `brief.md`
- `prompts/cut-XX.md`
- `imagegen-jobs.json`
- `cuts/cut-XX.png`
- `qa/asset-inventory.json`
- `qa/ocr-results.json`
- `qa/text-match.json`
- `qa/readability.json`
- `qa/layout-overlap.json`
- `qa/product-consistency.json`
- `qa/claim-alignment.json`
- `qa/frame-sampling.json` when GIF/video proof is used
- `qa/qa-rollup.json`
- `regen-queue.json`
- `detail-page-manifest.json`
- `qa-report.md`
- `index.html`
- `{project_id}-cuts.zip`

The coordinator owns the runtime context, fact map, cut plan, QA rollup, manifest, gallery, ZIP, and delivery report. Cut workers own only their assigned `cut-XX` prompt and image.

## Korean Text QA

After all images are generated, review every cut against the approved `이미지 내 삽입 문구`.

Fail and regenerate a cut if:

- Korean text is missing.
- Hangul is broken, garbled, or unreadable.
- Text is translated to English or replaced with nonsense.
- Approved wording changed materially.
- Text is too small for mobile reading.
- Information claims conflict with provided facts or use unverified claims.

Regeneration prompt rule:

- Repeat the exact Korean text.
- Reduce the number of text blocks if needed.
- Use larger type.
- Simplify the layout.
- Explicitly state that Korean text must not be changed, translated, or omitted.

## HTML Review and Download Page

When generated files are available locally, create an HTML page after all cuts are complete.

Requirements:

- Show cuts sequentially from `cut-01` to `cut-N`.
- Display each image full-width in a mobile-detail-page preview column.
- Include a visible per-cut download link.
- Include a `전체 다운로드` button that triggers all image downloads.
- Include a simple QA status area for each cut: `통과`, `재생성 필요`, or `확인 필요`.

Use the helper script:

```bash
node scripts/build-image-gallery.mjs <image-dir> <output-html>
```

Example:

```bash
node scripts/build-image-gallery.mjs \
  /Users/firstandre/.codex/generated_images/019e... \
  /Users/firstandre/dev_test_file/detail_page_codex_skill/generated/lipstick/index.html
```

Browser note: some browsers may ask permission before downloading multiple files. Per-cut links must remain visible as fallback.
