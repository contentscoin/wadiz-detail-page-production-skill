# Base Ecommerce Pipeline

This file is the self-contained execution backbone cloned from the older
`ecommerce-detail-page` skill. The Wadiz production skill extends this pipeline;
it must not replace it with OpenCrab lookup alone.

## Role Split

Use these roles when the Wadiz skill is active:

| Layer | Responsibility |
|---|---|
| Base ecommerce/service pipeline | product/service intake, product photo or service proof analysis, category/style choice, exact cut count, cut plan, approved copy, image prompt/job queue, parallel generation, gallery/ZIP, QA, regen queue |
| OpenCrab Wadiz ontology packs | choose Wadiz-style section flow, hook type, copy density, proof/GIF placement, objection handling, offer structure, claim-evidence rules, visual/OCR QA rules |
| Detail page reference analyzer | privately analyze external reference/detail pages, collect reference images, reverse-plan reusable patterns |
| Wadiz production skill | orchestrate the above, enforce gates, keep product facts separate from reference patterns, and report concept vs publication readiness honestly |

## Default Execution Order

1. Classify request: setup, planning, prompt brief, concept generation, final production, QA repair, or packaging.
2. Classify offer type: physical product, service/intangible, membership/subscription, course/program, B2B/professional package, event/experience, or hybrid.
3. Intake product/service facts and source links. Mark missing facts as `confirmation_needed`.
4. For physical products, check product photos or reference images before planning.
5. For services/intangibles, analyze service evidence before planning: process, people, proof, deliverables, environment, operating terms, policy/caution copy, and buyer scenarios.
6. If photos exist, analyze product shape, material, label/logo, color, visible facts, photo quality, and best cut usage.
7. Decide whether photos/proof assets are `actual_asset`, `reference_only`, `regeneration_recommended`, or `not_usable`.
8. Query OpenCrab Wadiz packs when available and fill the evidence matrix.
9. Select a 12-cut or 15-cut structure from Wadiz evidence first, then base ecommerce/service defaults.
10. Write cut-by-cut role, headline, subcopy, in-image Korean text or separate text-panel copy, visual direction, facts/evidence, and QA notes.
11. Build `fact-map.json`, `cut-plan.json`, prompt files, and `imagegen-jobs.json` before any image generation.
12. Launch one independent cut job per cut when image generation is allowed. Keep the cut count exact.
13. Build gallery HTML and ZIP only for generated artifacts that the current gate allows.
14. Run QA: file count, dimensions, OCR/text match, layout/readability, product/service consistency, claim alignment, asset truth, and ZIP integrity.
15. Put only failed cuts in `regen-queue.json`; regenerate failed cuts only.
16. Report the state as concept-ready, publication-blocked, or publication-ready.

## Cut Count Contract

- Default physical product: 12 mobile cuts.
- High-consideration service, membership, subscription, course, B2B/professional package, event/experience, or policy-heavy offer: 15 cuts.
- If a non-product offer is simple, 12 cuts are allowed only after merging repeated proof/policy sections intentionally.
- If the user chooses a count, output exactly that count.
- Do not collapse a 12-cut or 15-cut plan into one image unless explicitly asked.
- For image pages, use 1080 x 1600 per cut by default. Long images are derived packaging, not the source of truth.

## Service / Intangible Offer Policy

When there is no physical product photo, do not degrade into generic branding, a company homepage, or abstract mood cuts. Use service evidence instead:

- Treat process, people, proof, deliverables, environment, terms, and buyer scenarios as the service equivalent of product specs.
- Read `service-intangible-detail-page.md` and choose the 15-cut service story spine unless the offer is clearly simple.
- Build visuals around real evidence roles: journey diagram, expert proof, scene proof, deliverable proof, use-case scenarios, offer cards, FAQ/policy cards, and CTA.
- If real service-scene photos or proof assets are missing, concept visuals may be generated only with concept/publication-blocked labels.
- Named experts or professionals require verified bios; otherwise exclude them from customer-facing claims.
- Outcomes must be bounded; avoid guaranteed success, revenue, health, legal, tax, or financial claims.

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
- Product/service facts, price, offer, terms, delivery/returns or service operation/refund/cancel rules, and risky claims are confirmed.
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
