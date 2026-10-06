---
name: wadiz-detail-page-production
description: "Plan and produce Korean product, service, and Wadiz-style detail pages from product facts and optional OpenCrab evidence, with category/topic-specific copy, verified GPT Image 2.5 jobs, GIFs, and delivery QA."
---

# Wadiz Detail Page Production

Create a marketplace detail-page sequence from the actual product or service, its campaign topic, verified facts, and usable reference evidence. The default is an adaptive section plan; 12/15 cuts are explicit compatibility presets. `ecommerce-detail-page` is a compatibility alias. A website route or moodboard alone does not satisfy an image/GIF detail-page request.

## Start with the requested stage

For planning, image/GIF production, QA, or delivery, read [production-workflow.md](references/production-workflow.md). For CLI execution and legacy artifacts, read [base-ecommerce-pipeline.md](references/base-ecommerce-pipeline.md). Read only the relevant category in [category-playbooks/README.md](references/category-playbooks/README.md).

For services, memberships, courses, B2B offers, events, hospitality, or SaaS, also read [service-intangible-detail-page.md](references/service-intangible-detail-page.md). Process, people, deliverables, operating terms, and actual proof replace physical-product photo/spec assumptions. Missing product photos are not themselves a service blocker.

## Canonical pipeline

1. **ProductBrief:** interview for missing decisions, not every possible field. Capture category, topic, SKU/options, customer, purchase objections, offer, sources, assets, and unknowns. Inspect supplied product images for shape, material, color, logo, labels, scale, and identity constraints.
2. **OpenCrab evidence:** when pack-backed work is requested, verify access and retrieve raw source-backed results. Reject metadata, unrelated product groups, truncated fragments, and title-only matches. Preserve source/page/section/media links. Reference patterns cannot establish current product facts. See [opencrab-public-install.md](references/opencrab-public-install.md).
3. **PagePlan:** run `scripts/compile-page-plan.mjs`. Select category × topic × product sections and an appropriate style. The eight sangse purchase questions are coverage checks, not a mandatory section order. Each section has a customer question, copy, fact/evidence links, visual direction, media role, and placement reason.
4. **Copy approval:** run `scripts/validate-page-plan.mjs` for copy-slot and numeric-source checks; inspect claims, arithmetic, and terms separately. Obtain approval of the actual copy before producing its visual set. Source linkage is not proof that a number is true.
5. **Media jobs:** run `scripts/prepare-media-jobs.mjs`. Only `codex_native` or `ima2` may generate images, and actual GPT Image 2.5 capability, reference forwarding, and editing support must be verified. If the runtime cannot confirm the model or preserve required references, keep jobs blocked. Do not downgrade models or switch to a separately billed API.
6. **Generation and GIFs:** hand off approved image jobs to the verified tool and import the actual output/model/reference provenance with `scripts/import-media-result.mjs`. For `hybrid`/`svg_layer` image sections, use `scripts/compose-media-text.mjs` to place exact approved copy in a separate editable SVG panel and preserve base-image provenance. Use `scripts/build-motion-cut.mjs` for image-frame sequences or supplied real footage. AI video generation is outside this workflow. A storyboard or keyframe set is not a completed GIF.
7. **Delivery:** run `scripts/build-delivery-package.mjs`, inspect the ordered images/GIFs and posters, and complete visual/text/claim QA. Deliver the plan, sources, media, sequential preview, manifest, QA report, and requested ZIP. Preserve the distinction between concept completion and publication readiness.

Scripts prepare, validate, transform, or package local artifacts; a prepared request is not an image-tool invocation. Paid generation requires the user's approval of its expected usage/cost and scope before execution. Never infer approval from elapsed time or a prepared job.

## Facts, assets, and publication

- Keep `wadiz_pattern_source`, `product_fact_source`, `asset_source`, `example_source`, and `not_verified` distinct. Retrieve product-specific price, benefits, conditions, credentials, shipping, and terms from official or seller/user-approved material.
- Never invent reviews, awards, certifications, performance numbers, named expert bios, outcomes, refund terms, or urgency. Remove unsupported first/best/guaranteed/medical/financial claims; check the applicable category rules.
- Supplied product photos are the visual source of truth. Respect the user's requested original-scene/compositing route; do not automatically replace the request with repeated cutouts. Use official brand assets when exact logo fidelity is needed, and mark uncertain details instead of inventing them.
- Generated products, packaging, UI, scenes, before/after images, or people are not real proof. Keep `asset_truth_level` and actual sources in QA. Use real footage for performance demonstrations; source-less scenes can illustrate a use case only.
- Generate text-free scenes for `hybrid`/`svg_layer` jobs, then compose exact prices, specs, policies, and other critical Korean copy in editable deterministic text layers; use [layered-production.md](references/layered-production.md) when needed. Check the actual final composite against approved copy, not just the prompt or background result.
- Publication requires factual/terms approval, product and logo fidelity, asset truth, OCR/text-match or explicit manual review, mobile readability, and claim alignment. File existence or a successful ZIP build does not imply those checks passed.
- A planning-only request creates planning artifacts only. If packs/facts/assets are missing, produce the strongest supported brief, copy draft, or prompt set. Concept visuals require an explicit visual-generation request, sufficient identity references, and concept/publication-blocked status outside customer-facing imagery.

## Detail-page presentation

The customer-facing sequence starts with the product/service and answers purchase questions with varied, useful sections. Use the planned section count; default output width is 1080 px. A legacy image preset uses 1080 × 1600 cuts, but it must not force every GIF or information section into that height.

Keep fact maps, sources, QA labels, cut numbers, and debug notes in documents or filenames, not sales imagery. A route preview renders the media in plan order without explanatory wrappers unless requested. A long static image cannot preserve animation; retain GIF files and the HTML preview in delivery.

"No text overlay" does not automatically mean a no-copy moodboard: preserve sales information in separate designed panels. For an explicitly confirmed zero-text image set, read [true-no-text-visual-detail-page.md](references/true-no-text-visual-detail-page.md); put offer/CTA facts outside those images. When the user resets rejected work to planning, resume from planning and copy before regenerating.

## Conditional references

- [case-history-routing.md](references/case-history-routing.md): publication locks, premium-layout repairs, no-overlay distinctions, official expert-source checks, reset workflows, and mobile upload QA. Read only the matching case; examples do not supply new products with facts or universal design rules.
- [platform-and-runtime-adapters.md](references/platform-and-runtime-adapters.md): portability and adapter boundaries. Do not assume private OpenCrab IDs, Hermes profiles, local folders, or messaging channels.
- [source-and-boundary.md](references/source-and-boundary.md): attribution and public distribution. Source media and private credentials do not belong in the public repository.
- [media-production.md](references/media-production.md): capability/approval files, actual tool-result import, GIF configuration, and delivery preview/publication checks.
- [sangse-compatibility.md](references/sangse-compatibility.md): legacy cuts, legal terms, image-job conversion, retained sources, and the compatibility report.

## Completion

Report inspectable artifacts, actual OpenCrab evidence used, executed generation/model provenance, GIF playback checks, completed QA, and unresolved blockers. Maintain separate `concept_generation_status`, `production_asset_status`, and `publication_status`. Never convert an unavailable image runtime, pending manual check, or generated claim-proof into a passing status. Do not mandate a particular agent execution model or parallel reviewers; apply Sol-Astra evidence and counterexample checks in proportion to the task. The GPT Image 2.5 requirement for image generation still applies.
