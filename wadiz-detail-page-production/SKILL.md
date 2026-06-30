---
name: wadiz-detail-page-production
description: Use when creating, planning, QAing, or troubleshooting Wadiz-style Korean ecommerce detail pages with OpenCrab Wadiz ontology packs, public pack install gates, cut plans, fact maps, asset gates, claim QA, visual/OCR QA, or runtime delivery packaging.
---

# Wadiz Detail Page Production

## Purpose

Use this skill as the production protocol for Wadiz-style Korean ecommerce detail pages. It turns installed OpenCrab Wadiz ontology packs into an execution workflow: source-bound planning, cut-structure selection, copy and evidence rules, original image generation guidance, visual/OCR QA, and delivery packaging.

This skill does not train a model or copy source Wadiz pages. It retrieves and applies the way Wadiz-style persuasion is assembled.

## Relationship To The Base Ecommerce Skill

This skill includes the older `ecommerce-detail-page` pipeline as its execution backbone. The Wadiz ontology packs do not replace the detail-page production pipeline; they guide and constrain it.

- Use the base ecommerce pipeline for intake, product-photo analysis, category/style choice, exact cut count, cut-by-cut copy, image prompt/job queue, parallel cut generation, gallery/ZIP packaging, OCR/text QA, and regeneration.
- Use OpenCrab Wadiz packs for Wadiz-specific section order, hook type, copy density, proof/GIF placement, objection handling, offer structure, visual rhythm, and claim-evidence rules.
- Use `detail-page-reference-analyzer` when the task is to inspect an existing detail page or private reference URL before creating a reusable production pattern.
- Use this Wadiz skill as the orchestrator that combines those layers and enforces pack, fact, asset, concept, publication, and QA gates.

The cloned base pipeline lives in `references/base-ecommerce-clone/`; the clean operating contract is `references/base-ecommerce-pipeline.md`.

## Source Of Truth

- Public mode: do not assume any private owner project, private package ID, local path, MCP URL, or token is available.
- Before pack-backed production, read `references/opencrab-public-install.md` and verify that the user has installed the required Wadiz ontology pack in OpenCrab.
- Use the user's OpenCrab project created from installed public/team/company packs as the primary source.
- Do not use offline/local files as the primary production source. Local files are runbooks, QA evidence, backups, and rebuild sources.
- If a maintainer provides private owner IDs separately, use them only in that private workspace and never require them for public users.
- Always distinguish five source classes in outputs: `wadiz_pattern_source`, `product_fact_source`, `asset_source`, `example_source`, and `not_verified`.
- Wadiz/OpenCrab evidence can justify structure, rhythm, proof placement, and copy pattern. It cannot verify the current product's price, benefit, policy, certification, legal condition, delivery promise, review, or ranking.
- Product-specific facts must come from official URLs, seller-provided documents, user-approved materials, attached assets, or explicitly confirmed user statements.

## Workflow

1. Product intake: collect product name, category, audience, offer, source URL, approved photos, factual claims, pricing, delivery/returns, restrictions, and required channel specs.
2. Install gate: verify that the public Wadiz pack is installed, create/register a project if needed, attach the required packs, and run smoke tests.
3. Production workflow: for any real page plan, cut blueprint, image prompt set, QA, or delivery package, read `references/production-workflow.md` and `references/base-ecommerce-pipeline.md` before drafting the answer.
4. Mode gate: choose the allowed output level from `references/production-workflow.md`. If packs or assets are not ready, stop at the strongest allowed artifact: strategy, cut blueprint, prompt brief, concept-only generation, asset list, or QA repair.
5. Fact map: separate verified facts, inferred benefits, and unsupported claims. Unsupported claims must be downgraded, removed, or marked evidence-pending.
6. OpenCrab retrieval: query the active project for relevant category playbooks, section flow, copy patterns, visual/GIF patterns, claim-evidence rules, objection-resolution patterns, and production bridge rules.
7. Evidence matrix: map each required pack family to the production decision it changed. If evidence is weak, say `evidence_missing` instead of filling the gap with generic ecommerce advice.
8. Source attribution: create a source matrix that explains which decisions came from Wadiz/OpenCrab patterns, which facts came from product sources, which assets were used or referenced, which examples informed the process, and which items remain unverified.
9. Base ecommerce backbone: apply the cloned ecommerce pipeline for photo analysis, exact cut count, cut-level copy, prompt/job files, parallel generation design, gallery/ZIP packaging, and QA/regen artifacts.
10. Cut blueprint: produce the required output template: product fact map, evidence matrix, source attribution matrix, page strategy, 12-cut or 15-cut plan, asset requirements, claim guard, and production readiness.
11. Asset gate: decide which existing assets can be used as factual reference, which must be regenerated, and which must not be reused. For user-provided product photos, analyze product details and generate new scene prompts unless the user explicitly asks for direct compositing.
12. Production: build concept or final detail-page files, images, long image, gallery HTML, ZIP/package, or implementation artifacts only when the mode gate allows that exact artifact class.
13. QA: run practical verification before calling the work done. Check factual consistency, claim risk, source attribution, Korean copy tone, mobile readability, text overlap, image fit, OCR legibility when possible, file sizes, delivery format, asset truth, logo fidelity, and publication blockers.
14. Report: summarize what was produced, which OpenCrab project/packs were used, what product/asset sources were used, what passed QA, what remains evidence-pending, what was blocked, where the files are, and whether the result is `concept`, `publication_review_required`, or `publication_ready`.

## Operating Direction

This is a general Wadiz-style detail-page skill, not a product-specific skill. Product names, client cases, pilot outputs, and local runtime folders are examples or QA history only; never bake them into the reusable skill logic.

Run the work as a gated production pipeline:

1. Decide the work type: setup check, production brief, cut blueprint, prompt brief, concept generation, final production, QA repair, or packaging.
2. Load the detailed procedure in `references/production-workflow.md` and the base execution contract in `references/base-ecommerce-pipeline.md`.
3. Establish the current state: `pack_not_verified`, `pack_retrieval_weak`, `pack_verified`, `asset_gate_conditional`, `asset_gate_blocked`, `concept_generation_allowed`, or `final_production_allowed`.
4. Produce only the artifacts allowed by that state.
5. Report the next gate that would unlock the following state.

The main quality decision is evidence usefulness, not package count. A project with many attached packages still fails the gate if retrieval returns only metadata, fallback rows, unrelated chunks, ledger text, or generic ecommerce advice.

## Hard Rules

- Never treat high node count as quality by itself. Prefer retrieval relevance, evidence traceability, section coverage, and production usefulness.
- Never let handoff/index packs replace completed ontology packs for production decisions.
- Never make legally risky claims such as first, best, guaranteed, No.1, medical/financial certainty, or insurance-like promises without source evidence and compliance review.
- Never produce a final image page by merely reusing existing product/site images when the user asked for generated original visuals.
- Always distinguish Wadiz reference logic from the specific product's verified facts.
- If OpenCrab MCP/session is unavailable, say so and use local runbooks only for planning skeletons. Mark all pack-derived evidence as not live-verified.
- If the public pack is not installed or the install gate fails, do not run as a pack-backed production skill. Report the missing listing/package/project/smoke-test step.
- If retrieval returns only pack metadata, fallback rows, or unrelated chunks, treat the pack as not production-ready even when project package count is nonzero.
- Never return only broad strategy for a production request. Return the concrete production template from `references/production-workflow.md`.
- If pack status is `pack_not_verified`, do not create final images, HTML, ZIPs, or finished detail-page assets. Return planning documents only.
- If asset gate is `conditional` or `blocked`, do not create final marketplace images. Concept-only images are allowed only when the user explicitly asks for visual generation, product-detail references are sufficient, and every artifact is labeled concept/publication-blocked.
- Never present PIL, diagrammatic, placeholder, wireframe, or low-fidelity mock images as final Wadiz-style detail-page output.
- Never let a concept draft, normalized image set, gallery, or ZIP imply publication readiness unless OCR/text match, logo fidelity, asset truth, legal/policy copy, and claim alignment have passed or been manually approved.
- Never publish or hand off a production brief, cut blueprint, prompt package, QA report, or final package without explicit source attribution for pattern evidence, product facts, and assets.

## References

- Read `references/production-workflow.md` for any real detail-page plan, cut structure, image prompt, QA, or delivery task.
- Read `references/base-ecommerce-pipeline.md` whenever producing a cut plan, image prompt set, generated concept, gallery, ZIP, QA package, or regeneration queue.
- Read `references/luckyball-pilot-lessons.md` when deciding whether concept generation can proceed from a product-reference photo and incomplete publication assets.
- Read `references/opencrab-public-install.md` before sharing this skill publicly or using it outside a maintainer's private workspace.
- Read `references/source-and-boundary.md` when preparing README, marketplace copy, compliance notes, or source attribution.

## Completion Standard

A result is complete only when there is an artifact the user can inspect, the installed Wadiz pack has shaped the structure, the base ecommerce pipeline has produced or planned the actual cuts, product facts are separated from persuasion patterns, risky claims are handled, and practical visual/runtime QA has been attempted or explicitly reported as blocked. Always separate concept completion from publication readiness.
