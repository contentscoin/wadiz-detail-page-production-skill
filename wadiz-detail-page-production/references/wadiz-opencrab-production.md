# Wadiz OpenCrab Production Reference

## OpenCrab Target Model

This public skill must not require a maintainer's private OpenCrab workspace,
project ID, workflow ID, package ID, MCP URL, or token.

At runtime, create or reuse the user's own OpenCrab project:

- Recommended project name: `wadiz_detail_page_full_fidelity_project`
- Recommended workflow name: `wadiz_detail_page_production_workflow`
- Required source: installed public, team, or company Wadiz detail-page ontology packs
- Quarantine/delete projects are maintainer-side cleanup concepts only and must not be used for production retrieval.

If a maintainer has private project IDs for internal work, keep them outside this
public skill and inject them only in that private workspace.

## Pack Usage Model

The Wadiz ontology is not a single mega-pack. It is a production set with separate responsibilities:

- Source/reference packs preserve original crawl facts and page-level evidence.
- Section-flow packs explain ordering, transitions, and page rhythm.
- Copy packs explain Korean persuasion patterns and wording density.
- Visual/GIF packs explain proof type, motion proof, layout, cut rhythm, and visual emphasis.
- Claim/evidence packs control what needs proof and what should be softened.
- Objection/resolution and offer/pricing packs shape FAQ, anxiety removal, and final CTA.
- Category playbooks select the most likely sequence for the product category.
- Production bridge packs translate planning into cut sizes, gallery output, long image, and QA packaging.

Avoid evaluating a pack only by node count. Useful production retrieval should return:

- Relevant category/section/copy/visual/claim rules
- Evidence or source examples where available
- A clear application rule for the current product
- A risk or non-use condition
- Enough specificity to change the actual cut plan

## Source Attribution Model

Pack-backed production must keep Wadiz pattern evidence separate from product-specific truth.

| Source family | Primary use |
|---|---|
| `wadiz_pattern_source` | OpenCrab Wadiz pack evidence for section flow, hook type, copy density, proof/GIF placement, objection handling, offer structure, visual rhythm, and QA rules |
| `product_fact_source` | Official product/service URLs, seller documents, user-approved materials, attached files, or explicit user confirmation for facts, claims, price, options, delivery, terms, and policies |
| `asset_source` | Product photos, logos, brand assets, screenshots, videos, renders, approved generated directions, and final visual asset approvals |
| `example_source` | Lessons from pilot runs such as Luckyball, used only to guide workflow and QA behavior |
| `not_verified` | Missing, inferred, unsupported, or publication-blocking items |

OpenCrab Wadiz packs can decide how to arrange persuasion. They must not be treated as proof of the current product's price, legal condition, guarantee, certification, ranking, performance, discount, delivery promise, or policy text.

## Detail-Page Production Formula

For a typical product page, retrieve and assemble in this order:

1. Category playbook: choose the dominant persuasion route for the category.
2. First hook: select promise, problem, novelty, proof, or offer-led opening.
3. Problem and user situation: define the discomfort, aspiration, or comparison frame.
4. Product reveal: introduce the product as the specific solution.
5. Proof sequence: map features to demo, evidence, before/after, structure, materials, specs, reviews, or source facts.
6. Objection removal: handle price, quality, durability, delivery, difficulty, trust, warranty, and restrictions.
7. Offer and option logic: organize pricing, bundles, bonuses, urgency, and channel-specific CTA.
8. Compliance pass: soften or remove claims that outpace evidence.
9. Visual production pass: assign each cut an image generation direction, text density, and mobile readability target.
10. OCR/visual QA: inspect final rendered cuts for Korean legibility, overlap, poor cropping, and inconsistent product depiction.

## Product Image Policy

When the user provides product photos:

- Use them to analyze product identity, shape, materials, markings, color, scale, and notable details.
- Do not automatically cut out and composite the source image into the page.
- Prefer generating original product-scene images from a detailed prompt unless the user explicitly requests direct use of the image.
- Keep product-specific facts grounded in the provided photo or verified source URL.
- If the product image quality is low, state what details are uncertain and avoid over-specific claims.

## Required Outputs For Page Work

At minimum, a production run should create or update:

- A fact map separating verified facts, inferred benefits, and unsupported claims.
- A cut blueprint with section role, copy, visual direction, evidence source, and risk note.
- Image prompts or generated image assets, depending on task scope.
- A renderable page or gallery artifact when visual output is requested.
- QA notes covering claims, Korean readability, mobile layout, OCR if available, asset consistency, and delivery packaging.

## OpenCrab Failure Mode

If MCP auth, session, ingest, or workflow execution fails:

- Report the exact blocked step.
- Do not pretend the OpenCrab project was live-queried.
- Continue only with local runbooks as a fallback planning skeleton.
- Mark pack retrieval and evidence matching as pending.

Local fallback files, if available in a maintainer workspace:

- `detailpage.md`
- `AGENTS.md`
- `project-index.md`
- `project-manifest.json`
- QA reports describing pack/workflow cleanup

For public users, these files are optional examples. They do not replace live
OpenCrab pack installation and retrieval smoke tests.

## Reporting Template

Use this shape after each completed stage:

```text
Stage:
Completed:
OpenCrab source:
Artifacts:
QA:
Risks / pending evidence:
Next:
```
