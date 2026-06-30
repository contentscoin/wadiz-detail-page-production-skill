# Base Ecommerce Pipeline

This file is the self-contained execution backbone cloned from the older
`ecommerce-detail-page` skill published at
https://github.com/aisyncclub/detail_page_codex_skill. The Wadiz production
skill extends this pipeline; it must not replace it with OpenCrab lookup alone.

Canonical OpenCrab platform source: https://opencrab.sh

## Role Split

Use these roles when the Wadiz skill is active:

| Layer | Responsibility |
|---|---|
| Base ecommerce pipeline | product intake, photo analysis, category/style choice, exact cut count, cut plan, approved copy, image prompt/job queue, parallel generation, gallery/ZIP, QA, regen queue |
| OpenCrab Wadiz ontology packs | choose Wadiz-style section flow, hook type, copy density, proof/GIF placement, objection handling, offer structure, claim-evidence rules, visual/OCR QA rules from the user's OpenCrab workspace at https://opencrab.sh |
| Detail page reference analyzer | privately analyze external reference/detail pages, collect reference images, reverse-plan reusable patterns |
| Wadiz production skill | orchestrate the above, enforce gates, keep product facts separate from reference patterns, and report concept vs publication readiness honestly |

## Default Execution Order

1. Classify request: setup, planning, prompt brief, concept generation, final production, QA repair, or packaging.
2. Intake product facts and source links. Mark missing facts as `confirmation_needed`.
3. Check product photos or reference images before planning.
4. If photos exist, analyze product shape, material, label/logo, color, visible facts, photo quality, and best cut usage.
5. Decide whether photos are `actual_asset`, `reference_only`, `regeneration_recommended`, or `not_usable`.
6. Query OpenCrab Wadiz packs when available and fill the evidence matrix.
7. Select a 12-cut or 15-cut structure from Wadiz evidence first, then base ecommerce defaults.
8. Write cut-by-cut role, headline, subcopy, in-image Korean text, visual direction, facts/evidence, and QA notes.
9. Build `fact-map.json`, `cut-plan.json`, prompt files, and `imagegen-jobs.json` before any image generation.
10. Launch one independent cut job per cut when image generation is allowed. Keep the cut count exact.
11. Build gallery HTML and ZIP only for generated artifacts that the current gate allows.
12. Run QA: file count, dimensions, OCR/text match, layout/readability, product consistency, claim alignment, asset truth, and ZIP integrity.
13. Put only failed cuts in `regen-queue.json`; regenerate failed cuts only.
14. Report the state as concept-ready, publication-blocked, or publication-ready.

## Cut Count Contract

- Default: 12 mobile cuts.
- High-consideration, service, membership, subscription, or policy-heavy products: 15 cuts.
- If the user chooses a count, output exactly that count.
- Do not collapse a 12-cut or 15-cut plan into one image unless explicitly asked.
- For image pages, use 1080 x 1600 per cut by default. Long images are derived packaging, not the source of truth.

## Product Photo Policy

When a user provides a product photo:

- Treat it as the visual source of truth for product shape, color, logo placement, label location, material, and distinctive details.
- Do not automatically cut it out and composite it into every section.
- If the photo is weak but product details are clear, prefer full-scene generation from product-detail analysis.
- Preserve visible product facts, but do not invent unreadable labels, certifications, ingredients, awards, reviews, or policy claims.
- If exact brand/logo fidelity is mandatory, use an official logo or vector asset in a documented brand-layer pass. Do not pretend the image model reproduced the official mark perfectly.

## Concept Generation Mode

The older ecommerce skill could generate images as drafts. The Wadiz skill may do the same only under a stricter label:

`concept_generation_allowed`

Use this mode when:

- the user explicitly wants visual generation,
- the product details are enough for a concept,
- OpenCrab/Wadiz evidence or local production rules have shaped the cut order,
- product photos are only reference quality or assets are incomplete,
- and the output is clearly labeled concept-only.

Concept generation may produce cut images, gallery HTML, ZIP, contact sheet, and QA files, but it must not be called final marketplace-ready production.

## Publication Gate

Use `final_production_allowed` only when all are true:

- Wadiz pack retrieval is verified or explicitly replaced by a user-approved structure source.
- Product facts, price, offer, terms, delivery, returns, and risky claims are confirmed.
- Required product/package/logo/proof assets are approved or a documented generation route is approved.
- OCR/text-match is pass or manually approved.
- Logo fidelity, generated package truth, and legal/policy wording have been checked.
- ZIP/gallery/manifest/QA artifacts pass validation.

## Required Runtime Artifacts

For serious production or concept generation, create or update:

- `opencrab-runtime-context.md`
- `fact-map.json`
- `cut-plan.json`
- `production-brief.md` or `brief.md`
- `prompts/cut-XX.md` or a structured prompt set
- `imagegen-jobs.json`
- `cuts/` or `cuts/full-scene-1080x1600/`
- `qa/asset-inventory.json`
- `qa/text-match*.json`
- `qa/ocr-results.json`
- `qa/readability.json`
- `qa/layout-overlap.json`
- `qa/product-consistency.json`
- `qa/claim-alignment.json`
- `regen-queue.json`
- `detail-page-manifest.json`
- `qa-report.md`
- `index.html` or a named gallery HTML
- ZIP package when allowed by the current gate

## Completion Labels

Use three separate labels instead of one vague `done`:

```json
{
  "concept_generation_status": "not_started | complete | failed",
  "production_asset_status": "missing | incomplete | ready",
  "publication_status": "blocked | review_required | ready"
}
```

This prevents a strong concept draft from being mistaken for a finished sales page.
