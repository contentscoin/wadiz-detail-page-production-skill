---
name: wadiz-detail-page-production
description: "Unified skill for ecommerce/product/service/Wadiz-style Korean detail pages: plan cut-based marketplace pages, verify product/service facts, use OpenCrab Wadiz ontology packs when available, generate briefs/assets/packages, and run claim/visual/OCR QA."
---

# Wadiz Detail Page Production

## High-value references

- `references/publication-preflight-package.md` — package near-final premium detail-page previews when real photos, final terms, or rights approvals are partially missing; includes status labels, asset slot maps, readiness reports, and ZIP verification gates.
- `references/publication-ready-approval-and-terms-lock.md` — promote a detail-page package from review-required to publication-ready after explicit user approval; lock final terms into rendered cuts and docs, remove contradictory pending language, and verify image/ZIP outputs.
- `references/platform-and-runtime-adapters.md` — keep shared rules portable across Hermes, Codex/OpenAI, Cursor/Claude, and local CLI; runtime-specific assumptions must stay behind adapter gates.
- `references/stepwise-concept-production-gates.md` — staged detail-page production gates: planning → copy → humanized marketing copy → visual wireframes → prompt set → wireframe images → concept-only images → publication-ready. Use for text-safe Korean rendering, no-photo-overlay layouts, and QA against internal-label leakage.
- `references/luxury-layout-production-preview-lessons.md` — repair path when a detail-page image set still looks like a concept/card/moodboard: switch to photoreal text-free scenes, deterministic Korean panels, varied luxury layout system, and manual wrap QA.
- `references/hybrid-film-information-layout.md` — premium detail-page layout repair when repeated photo-frame/text-card compositions feel template-like; use large film-like scenes plus precise information inserts, then QA hero/price/profile/CTA cuts.
- `references/layered-typography-background-matching.md` — repair path when users reject plain font overlays or ask for image-generated typography/text layers: use image generation as style reference only, match background to typography, then rebuild exact Korean copy as deterministic design layers with line-break/overlap QA.
- `references/layered-text-production.md` — layered production pattern when text feels pasted on: create background-only images, transparent designed text layers, editable SVG text layers, final composites, and use image-generated typography only as QA’d style reference for exact Korean terms.
- `references/complete-layout-reset-after-color-rejection.md` — structural reset pattern when the user says the problem is not color/tone but the whole design; replace the section mechanics and mobile scroll language, then run upload-readiness refinement.
- `references/final-upload-stabilization-and-mobile-qa.md` — final upload gate after a structure is accepted: preserve the design language, enlarge small support copy, lighten dark cuts, generate mobile-ratio viewport crops when live browser QA is unavailable, and package full + lite ZIPs with verification.

## Unified Detail Page Scope

This is now the single canonical detail-page skill. It absorbs the older `ecommerce-detail-page` skill and covers:

- physical product detail pages
- marketplace/ecommerce product pages
- Wadiz/funding-style pages
- service detail pages
- memberships, courses, consulting, B2B packages, events, experiences, hospitality, SaaS/onboarding, and hybrid offers

When any session asks for `ecommerce-detail-page`, `이커머스 상세페이지`, `제품 상세페이지`, `상품 상세페이지`, `서비스 상세페이지`, `와디즈 상세페이지`, or just `상세페이지 제작`, use this skill. Treat `ecommerce-detail-page` as a compatibility alias only.

## Purpose

Use this skill as the production protocol for cut-based Korean detail pages. It turns product/service facts, channel constraints, approved assets, and optional OpenCrab Wadiz ontology packs into an execution workflow: source-bound planning, cut-structure selection, copy and evidence rules, original image generation guidance, visual/OCR QA, and delivery packaging.

This skill does not train a model or copy source Wadiz pages. It retrieves and applies the way Wadiz-style persuasion is assembled.

## Relationship To The Base Ecommerce Skill

This skill includes the older `ecommerce-detail-page` pipeline as its execution backbone. The Wadiz ontology packs do not replace the detail-page production pipeline; they guide and constrain it.

- Use the base ecommerce pipeline for intake, product-photo analysis, category/style choice, exact cut count, cut-by-cut copy, image prompt/job queue, parallel cut generation, gallery/ZIP packaging, OCR/text QA, and regeneration.
- If the subject is not a physical product, switch the base layer from product-photo/spec logic to the service/intangible workflow: buyer problem, process, people, proof, deliverables, operating conditions, risk removal, and consultation CTA.
- Use OpenCrab Wadiz packs for Wadiz-specific section order, hook type, copy density, proof/GIF placement, objection handling, offer structure, visual rhythm, and claim-evidence rules when the active runtime can actually verify/query those packs.
- Use `detail-page-reference-analyzer` when the task is to inspect an existing detail page or private reference URL before creating a reusable production pattern.
- Use this Wadiz skill as the orchestrator that combines those layers and enforces pack, fact, asset, concept, publication, and QA gates.

The cloned base pipeline lives in `references/base-ecommerce-clone/`; the clean operating contract is `references/base-ecommerce-pipeline.md`.

## Source Of Truth

- Public mode: do not assume any private owner project, private package ID, Hermes profile, local path, MCP URL, gateway, or token is available.
- Before pack-backed production, read `references/opencrab-public-install.md` and verify that the user has installed the required Wadiz ontology pack in OpenCrab.
- Use the user's OpenCrab project created from installed public/team/company packs as the primary source.
- Do not use offline/local files as the primary production source. Local files are runbooks, QA evidence, backups, and rebuild sources.
- If a maintainer provides private owner IDs separately, use them only in that private workspace and never require them for public users.

## Workflow

1. Runtime gate: read `references/platform-and-runtime-adapters.md` if the task may run outside the current agent or if the output will be published to the shared GitHub repo; keep Hermes/Codex/OpenAI assumptions adapter-scoped.
2. Product/service intake: collect product or service name, category, audience, offer, source URL, approved photos/proof assets, factual claims, pricing, delivery/returns or service terms, restrictions, and required channel specs.
3. Offer type routing: if the subject is a service, membership, course, consulting, B2B package, event, tour, SaaS/onboarding, or professional program, read `references/service-intangible-detail-page.md` and use its service fact map/story spine instead of forcing product-photo/spec logic.
4. Install gate: verify that the public Wadiz pack is installed, create/register a project if needed, attach the required packs, and run smoke tests.
5. Production workflow: for any real page plan, cut blueprint, image prompt set, QA, or delivery package, read `references/production-workflow.md` and `references/base-ecommerce-pipeline.md` before drafting the answer.
6. Mode gate: choose the allowed output level from `references/production-workflow.md`. If packs or assets are not ready, stop at the strongest allowed artifact: strategy, cut blueprint, prompt brief, concept-only generation, asset list, or QA repair.
7. Fact map: separate verified facts, inferred benefits, and unsupported claims. Unsupported claims must be downgraded, removed, or marked evidence-pending.
8. OpenCrab retrieval: query the active project for relevant category playbooks, section flow, copy patterns, visual/GIF patterns, claim-evidence rules, objection-resolution patterns, and production bridge rules.
9. Evidence matrix: map each required pack family to the production decision it changed. If evidence is weak, say `evidence_missing` instead of filling the gap with generic ecommerce advice.
10. Base ecommerce/service backbone: apply the cloned ecommerce pipeline or the service-intangible workflow for photo/proof analysis, exact cut count, cut-level copy, prompt/job files, parallel generation design, gallery/ZIP packaging, and QA/regen artifacts.
11. Cut blueprint: produce the required output template: product/service fact map, evidence matrix, page strategy, 12-cut or 15-cut plan, asset requirements, claim guard, and production readiness.
12. Asset gate: decide which existing assets can be used as factual reference, which must be regenerated, and which must not be reused. For user-provided product photos, analyze product details and generate new scene prompts unless the user explicitly asks for direct compositing; for services, analyze service-scene/proof assets and generated-scene approval instead.
13. Production: build concept or final detail-page files, images, long image, gallery HTML, ZIP/package, or implementation artifacts only when the mode gate allows that exact artifact class.
14. QA: run practical verification before calling the work done. Check factual consistency, claim risk, Korean copy tone, mobile readability, text overlap, image fit, OCR legibility when possible, file sizes, delivery format, asset truth, logo fidelity, and publication blockers.
15. Publication approval lock: when the user explicitly approves the full visual set or final terms, read `references/publication-ready-approval-and-terms-lock.md`; update customer-facing cuts and package docs together, remove contradictory `확인 필요`/pending language, regenerate, and re-verify before marking `publication_ready`.
16. Report: summarize what was produced, which OpenCrab project/packs were used, what passed QA, what remains evidence-pending, what was blocked, where the files are, and whether the result is `concept`, `publication_review_required`, or `publication_ready`.

## Operating Direction

This is a general Wadiz-style detail-page skill, not a product-specific or runtime-specific skill. Product names, client cases, pilot outputs, Hermes/Codex session details, and local runtime folders are examples or QA history only; never bake them into the reusable core logic.

Run the work as a gated production pipeline:

1. Decide the work type: setup check, production brief, cut blueprint, prompt brief, concept generation, final production, QA repair, or packaging.
2. Decide the offer type: physical product, service/intangible, membership/subscription, course/program, B2B/professional service, event/experience, or hybrid. For non-product offers, use `references/service-intangible-detail-page.md` before planning cuts.
3. Load the detailed procedure in `references/production-workflow.md` and the base execution contract in `references/base-ecommerce-pipeline.md`.
4. Establish the current state: `pack_not_verified`, `pack_retrieval_weak`, `pack_verified`, `asset_gate_conditional`, `asset_gate_blocked`, `concept_generation_allowed`, or `final_production_allowed`.
5. **Keep the product/detail-page deliverable primary:** if the user asks for `와디즈 상세페이지`, `제품 상세페이지`, `서비스 상세페이지`, or `상세페이지 제작`, produce a marketplace-style cut sequence and allowed image/package artifacts. Do not substitute a homepage, landing page, or Next.js route unless the user explicitly asks for a web page preview.
6. **Separate internal artifacts from customer-facing cuts:** fact maps, OpenCrab status, QA labels, `pack_not_verified`, and production notes belong in docs/QA reports, not in the rendered product-detail images.
7. Produce only the artifacts allowed by that state.
8. Report the next gate that would unlock the following state.

The main quality decision is evidence usefulness, not package count. A project with many attached packages still fails the gate if retrieval returns only metadata, fallback rows, unrelated chunks, ledger text, or generic ecommerce advice.

## Hard Rules

- Never force a non-product offer into physical-product logic. For services, memberships, courses, B2B packages, events, experiences, SaaS onboarding, or professional programs, use a service story spine: buyer problem, service reveal, process, people/proof, deliverables, use cases, offer, objections, policy, CTA. Missing product photos are not by themselves a blocker; missing service facts, proof, expert bios, process details, or terms are the blockers.
- Never treat high node count as quality by itself. Prefer retrieval relevance, evidence traceability, section coverage, and production usefulness.
- Never let handoff/index packs replace completed ontology packs for production decisions.
- Never make legally risky claims such as first, best, guaranteed, No.1, medical/financial certainty, or insurance-like promises without source evidence and compliance review.
- Never produce a final image page by merely reusing existing product/site images when the user asked for generated original visuals.
- Always distinguish Wadiz reference logic from the specific product's verified facts.
- If OpenCrab MCP/session is unavailable in the active runtime, say so and use public/local runbooks only for planning skeletons. Mark all pack-derived evidence as not live-verified; do not assume Hermes profile-local OpenCrab or Codex MCP exists.
- If the public pack is not installed or the install gate fails, do not run as a pack-backed production skill. Report the missing listing/package/project/smoke-test step.
- If retrieval returns only pack metadata, fallback rows, or unrelated chunks, treat the pack as not production-ready even when project package count is nonzero.
- Never return only broad strategy for a production request. Return the concrete production template from `references/production-workflow.md`.
- When the user asks for `제품 상세페이지`, `상세페이지 이미지`, `와디즈 상세페이지`, or marketplace/product detail-page output, do **not** satisfy it with a website route, landing page, or homepage-like HTML page. The default deliverable is cut-based product detail-page assets: exact-count 1080×1600 cuts, optional 1080×N long image, contact sheet, gallery/ZIP, and QA. A web route is only a preview or implementation wrapper, not the product-detail deliverable.
- If a detail-page task is deployed to `/detail`, `/detail2`, or another web route, the route must render the cut assets sequentially. Do not report completion from route existence, SEO metadata, JSON-LD, FAQ, CTA, or responsive layout alone; verify live HTML references the promised cut images.
- If pack status is `pack_not_verified`, do not create final images, HTML, ZIPs, or finished detail-page assets. Return planning documents only unless the user explicitly approves concept generation/publication-blocked assets.
- If asset gate is `conditional` or `blocked`, do not create final marketplace images. Concept-only images are allowed only when the user explicitly asks for visual generation, product-detail references are sufficient, and every artifact is labeled concept/publication-blocked.
- Never present PIL, diagrammatic, placeholder, wireframe, or low-fidelity mock images as final Wadiz-style detail-page output.
- Never satisfy a professional-profile/약력 requirement with mere labels such as `공개 프로필`, `KLPGA 프로`, or `USGTF 프로`. If a profile appears in the rendered sales cut, include actual verified/user-provided bio bullets and record the source; if a named profile is unverified or ambiguous, exclude it or mark it as source-needed outside the sales claim. When the user points to an official client/service site, inspect that site's relevant sub-routes/sitemap before relying on external search snippets; official page facts win over external snippets.
- When a deployed `/detail*` route is a preview wrapper for a product/detail-page image sequence, do not add visible explanatory headers, badges, QA notes, or report copy unless explicitly requested. The visible page should start with the first cut image and continue as a pure image sequence; keep docs/metadata separate.
- Do not leave production/debug overlays like `CUT 01`, `CUT 02`, `publication review required`, or internal status labels on final sales cut images. Cut numbers belong in filenames, source docs, or screen-reader-only captions, not on the rendered customer-facing images.
- When a user says not to use text overlays or asks for image-only/no-source/no-cut-number output, do **not** default to a no-text moodboard. Preserve the product-detail sales function: remove debug/source/cut-number/top-wrapper text and keep copy in separated editorial information panels unless the user explicitly asks for a no-text mood test.
- If the user explicitly asks for `텍스트오버레이없는 상세페이지 이미지생성` or otherwise confirms a true no-text image set, switch to the true no-text visual mode in `references/true-no-text-visual-detail-page.md`: final cut images must contain zero intentional typography, logos, prices, CTAs, cut labels, source labels, or frame borders; all offer/CTA/source facts live outside the images in docs/HTML/body text.
- If the user rejects a no-overlay output as wrong/errored, archive or supersede that failed set, restart from the last good detail-page structure, visually QA the contact sheet, then deploy. Do not defend or incrementally patch a stick-figure/placeholder/moodboard result.
- Never present stick figures, placeholder icon cards, fake UI bars, contact-sheet-only visuals, or abstract moodboards as final Wadiz-style product-detail assets.
- If the user says to start over from the beginning or asks to begin with 상품 상세페이지 기획 after rejecting drafts, treat it as a workflow reset: produce a planning-stage document first and do not regenerate/deploy more images until the planning and cut-copy stages are complete.
- Never let a concept draft, normalized image set, gallery, or ZIP imply publication readiness unless OCR/text match, logo fidelity, asset truth, legal/policy copy, and claim alignment have passed or been manually approved.

## References

- Read `references/production-workflow.md` for any real detail-page plan, cut structure, image prompt, QA, or delivery task.
- Read `references/service-intangible-detail-page.md` whenever the subject is a service, membership, course, consulting/B2B package, event, hospitality, SaaS/onboarding, professional profile, or other non-physical offer.
- Read `references/product-detail-not-homepage.md` when the user asks for 제품/상품/서비스 상세페이지 so the deliverable stays cut-image/detail-page based rather than drifting into a homepage or landing route.
- Read `references/fmgs-logo-no-photo-overlay-layout.md` only as a reusable case-study pattern for logo-led premium service pages where the user provides a logo and says not to use text overlay; do not assume the FMGS/CEO Golf facts or assets apply to other work.
- Read `references/fmgs-premium-layered-typography.md` as a reusable case-study pattern when the user says the text feels plain/overlaid, asks for image-generated text layers, requests a high-end version, or flags line breaks/overlap; use image-generated typography only as a style reference, rebuild final Korean copy deterministically, and QA contact sheet plus price/map/profile/CTA cuts.
- Read `references/real-profile-bio-evidence.md` when a detail page includes named professionals, instructors, experts, public profiles, rosters, or 약력; render actual verified/user-provided bio bullets, not labels like `공개 프로필`, and save source notes.
- Read `references/pure-image-route-and-official-profile-source.md` when deploying a cut-image detail page to a route or when the user says profile facts are on an official site; keep the route wrapper invisible, remove visible cut-number/debug overlays, and prefer official sub-route facts over external snippets.
- Read `references/fmgs-wadiz-safe-svg-rework.md` only as a reusable case-study pattern when premium/Wadiz drafts are rejected for overlays, text collisions, low-fidelity moodboards, official-source misses, or OpenCrab pack retrieval uncertainty; do not inherit case-specific facts.
- Read `references/base-ecommerce-pipeline.md` whenever producing a cut plan, image prompt set, generated concept, gallery, ZIP, QA package, or regeneration queue.
- Read `references/luckyball-pilot-lessons.md` when deciding whether concept generation can proceed from a product-reference photo and incomplete publication assets.
- Read `references/no-overlay-image-text-orchestration.md` when continuing from a Wadiz brief into concept cut images, especially for deterministic Korean text panels, contact sheets, ZIP packaging, and mixed Korean/English wrapping QA.
- Read `references/true-no-text-visual-detail-page.md` when the user explicitly requests a text-overlay-free detail-page image set; generate real image-only cut artifacts with no typography/logos/frames inside the images and keep sales facts/CTA in external docs or platform body text.
- Read `references/recovering-from-no-overlay-misinterpretation.md` when a user rejects an image-only/no-overlay output or says to discard/restart; it captures how to preserve sales-page copy in separate panels without cut/source/debug overlays.
- Read `references/copy-design-upgrade-lessons.md` when a user criticizes a detail-page draft as too uniform, thin, generic, or asks to redo copy/design; treat it as a structural repair requiring stronger positioning, cut-specific copy density, varied layouts, and regenerated QA/package artifacts.
- Read `references/hybrid-film-information-layout.md` when a user says the design is still too card-like, asks whether images need to be split into frames, or requests a more premium layout rhythm; switch to Hybrid Film + Information Inserts and manually QA hero/profile/price/CTA crops before delivery.
- Read `references/layered-typography-background-matching.md` when a user asks for non-overlay text layers, image-generated typography, more designed text, or says the background must match the text; use image-generated typography as a reference only, rebuild exact Korean copy deterministically, and QA line breaks/collisions/clipping before delivery.
- Read `references/complete-layout-reset-after-color-rejection.md` when the user says the issue is not color/tone but the entire design, says a revision is only a color change, or rejects a private-club/palette reset as structurally unchanged; rebuild cut mechanics and section language before polishing.
- Read `references/final-upload-stabilization-and-mobile-qa.md` when the structural direction is accepted and the next task is final upload stabilization, mobile-scroll QA, small-copy/dark-tone polishing, or full/lite ZIP packaging.
- Read `references/restart-from-planning-after-repeated-rejections.md` when a user rejects repeated drafts and says to start from the beginning or asks to begin with 상품 상세페이지 기획; stop regenerating images and produce a planning-stage artifact first.
- Read `references/platform-and-runtime-adapters.md` before pushing public repo changes or using this skill across Hermes/Codex/OpenAI runtimes.
- Read `references/opencrab-public-install.md` before sharing this skill publicly or using it outside a maintainer's private workspace.
- Read `references/source-and-boundary.md` when preparing README, marketplace copy, compliance notes, or source attribution.

## Completion Standard

A result is complete only when there is an artifact the user can inspect, the installed Wadiz pack has shaped the structure, the base ecommerce pipeline has produced or planned the actual cuts, product facts are separated from persuasion patterns, risky claims are handled, and practical visual/runtime QA has been attempted or explicitly reported as blocked. Always separate concept completion from publication readiness.
