---
name: wadiz-detail-page-production
description: Use when creating, planning, QAing, or troubleshooting Wadiz-style Korean ecommerce detail pages with OpenCrab Wadiz ontology packs, public pack install gates, cut plans, fact maps, asset gates, claim QA, visual/OCR QA, or runtime delivery packaging.
---

# Wadiz Detail Page Production

## Purpose

Use this skill as the production protocol for Wadiz-style Korean ecommerce detail pages. It turns installed OpenCrab Wadiz ontology packs into an execution workflow: source-bound planning, cut-structure selection, copy and evidence rules, original image generation guidance, visual/OCR QA, and delivery packaging.

This skill does not train a model or copy source Wadiz pages. It retrieves and applies the way Wadiz-style persuasion is assembled.

## Source Of Truth

- Public mode: do not assume any private owner project, private package ID, local path, MCP URL, or token is available.
- Before pack-backed production, read `references/opencrab-public-install.md` and verify that the user has installed the required Wadiz ontology pack in OpenCrab.
- Use the user's OpenCrab project created from installed public/team/company packs as the primary source.
- Do not use offline/local files as the primary production source. Local files are runbooks, QA evidence, backups, and rebuild sources.
- If a maintainer provides private owner IDs separately, use them only in that private workspace and never require them for public users.

## Workflow

1. Product intake: collect product name, category, audience, offer, source URL, approved photos, factual claims, pricing, delivery/returns, restrictions, and required channel specs.
2. Install gate: verify that the public Wadiz pack is installed, create/register a project if needed, attach the required packs, and run smoke tests.
3. Production workflow: for any real page plan, cut blueprint, image prompt set, QA, or delivery package, read `references/production-workflow.md` before drafting the answer.
4. Mode gate: choose the allowed output level from `references/production-workflow.md`. If packs or assets are not ready, stop at strategy, cut blueprint, prompt brief, and asset list.
5. Fact map: separate verified facts, inferred benefits, and unsupported claims. Unsupported claims must be downgraded, removed, or marked evidence-pending.
6. OpenCrab retrieval: query the active project for relevant category playbooks, section flow, copy patterns, visual/GIF patterns, claim-evidence rules, objection-resolution patterns, and production bridge rules.
7. Evidence matrix: map each required pack family to the production decision it changed. If evidence is weak, say `evidence_missing` instead of filling the gap with generic ecommerce advice.
8. Cut blueprint: produce the required output template: product fact map, evidence matrix, page strategy, 12-cut or 15-cut plan, asset requirements, claim guard, and production readiness.
9. Asset gate: decide which existing assets can be used as factual reference, which must be regenerated, and which must not be reused. For user-provided product photos, analyze product details and generate new scene prompts unless the user explicitly asks for direct compositing.
10. Production: build final detail-page files, images, long image, gallery HTML, ZIP/package, or implementation artifacts only when the mode gate allows final production.
11. QA: run practical verification before calling the work done. Check factual consistency, claim risk, Korean copy tone, mobile readability, text overlap, image fit, OCR legibility when possible, file sizes, and delivery format.
12. Report: summarize what was produced, which OpenCrab project/packs were used, what passed QA, what remains evidence-pending, what was blocked, and where the files are.

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
- If asset gate is `conditional` or `blocked`, do not create final images. Return cut plans, copy drafts, prompt briefs, and the required asset list.
- Never present PIL, diagrammatic, placeholder, wireframe, or low-fidelity mock images as final Wadiz-style detail-page output.

## References

- Read `references/production-workflow.md` for any real detail-page plan, cut structure, image prompt, QA, or delivery task.
- Read `references/opencrab-public-install.md` before sharing this skill publicly or using it outside a maintainer's private workspace.
- Read `references/source-and-boundary.md` when preparing README, marketplace copy, compliance notes, or source attribution.

## Completion Standard

A result is complete only when there is an artifact the user can inspect, the installed Wadiz pack has shaped the structure, product facts are separated from persuasion patterns, risky claims are handled, and practical visual/runtime QA has been attempted or explicitly reported as blocked.
