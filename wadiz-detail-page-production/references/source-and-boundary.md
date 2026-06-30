# Source And Boundary

## Source

This skill is based on structural analysis of Wadiz-style Korean ecommerce detail pages. The analyzed dimensions include:

- detail-page section order
- first-hook patterns
- problem and empathy framing
- product reveal structure
- proof, evidence, demo, GIF, and motion placement
- Korean mobile copy density
- offer, pricing, option, and CTA rhythm
- objection handling and FAQ logic
- claim-evidence risk signals
- visual/OCR QA requirements

## Source Families

Use these source families consistently in README files, production briefs, cut blueprints, prompt briefs, QA reports, and delivery manifests.

| Source family | What it can support | What it cannot support |
|---|---|---|
| `wadiz_pattern_source` | Wadiz-style section order, hook pattern, proof/GIF placement, copy density, visual rhythm, objection handling, and QA rules retrieved from OpenCrab Wadiz ontology packs | The current product's price, promise, certificate, review, ranking, delivery term, warranty, legal condition, or factual performance |
| `product_fact_source` | Product/service facts confirmed by an official URL, seller document, attached file, product photo, or explicit user confirmation | General Wadiz persuasion rules unless also supported by pack evidence |
| `asset_source` | Which product photos, logos, renders, screenshots, videos, or generated directions were used as factual reference or final visual assets | Claims about performance, benefits, price, legality, or certification unless the asset itself proves them |
| `example_source` | Operational lessons from pilots such as FMG Luckyball, including concept-only generation, full-scene prompt strategy, and QA workflow | Reusable product facts or claims for unrelated products |
| `not_verified` | Items that are assumptions, missing evidence, placeholders, or publication blockers | Final copy, final CTA, final offer, final proof, or publication-ready status |

## Required Attribution Format

Every production-facing output should include a source attribution table.

```markdown
| Item | Source family | Source name or link | Used for | Verification status | Publication rule |
|---|---|---|---|---|---|
| section order | wadiz_pattern_source | OpenCrab Wadiz section-flow evidence | cut sequence | verified / weak / missing | may guide structure only |
| product price | product_fact_source | official seller page or user-approved sheet | offer copy | confirmed / confirmation_needed | do not publish until confirmed |
| product photo | asset_source | user-provided photo or approved asset folder | visual prompt / final asset | reference_only / approved_final | label concept if not final-approved |
| Luckyball pilot | example_source | `luckyball-pilot-lessons.md` | concept workflow | example_only | not a fact source |
| unsupported claim | not_verified | none | claim guard | blocked | remove or soften |
```

If a production run cannot fill the source table, the result must stay at `planning_only`, `blueprint_only`, or `prompt_brief_only`.

## Not Included

This repository does not include:

- original Wadiz HTML
- original Wadiz images, GIFs, or videos
- crawler output
- OpenCrab ontology pack ZIP files
- private OpenCrab workspace IDs or tokens
- specific product pricing, claims, certifications, delivery, or legal terms

## Usage Boundary

Use the pack-derived patterns to create new pages for products where the user owns or is authorized to use the product facts and assets. Do not copy original Wadiz page text, layouts, images, GIFs, or maker content verbatim.

Product-specific claims must be checked against official product sources, certificates, test reports, terms, and seller-provided facts before publication.
