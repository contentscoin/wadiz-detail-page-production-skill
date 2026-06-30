# Production Workflow

Use this reference for real Wadiz-style detail-page planning, cut blueprints, image prompt sets, QA reviews, and production packaging. This is the execution layer that keeps the skill from becoming a vague strategy guide.

## Non-Negotiable Output

For any production request, return these sections unless the user explicitly asks for a smaller artifact:

1. Product fact map
2. OpenCrab evidence matrix
3. Source attribution matrix
4. Wadiz-style page strategy
5. 12-cut or 15-cut detail-page plan
6. Cut-by-cut copy and visual direction
7. Asset requirements and asset gate status
8. Claim guard
9. Production readiness and QA checklist
10. Base ecommerce pipeline artifacts: exact cut count, prompt/job queue, gallery/ZIP plan, QA/regen plan

If OpenCrab packs are not installed or smoke-tested, still use this structure, but mark evidence as `pack_not_verified` or `evidence_missing`.

## Process Overview

Run every request through this stateful sequence. Do not jump to later stages just because the user asked for images; the gates decide what is allowed.

| Stage | Name | Main question | Required output |
|---:|---|---|---|
| 0 | Request classification | Is the user asking for setup, planning, prompts, final assets, QA, or packaging? | work type and expected deliverable |
| 1 | Product fact intake | What is actually true about this product, offer, and channel? | fact map with `confirmed`, `assumption`, `confirmation_needed`, `blocked` |
| 2 | Pack install and retrieval gate | Are Wadiz packs installed and returning useful evidence? | pack status and evidence matrix |
| 3 | Mode gate | What output level is allowed now? | `planning_only`, `blueprint_only`, `prompt_brief_only`, or `final_production_allowed` |
| 3.5 | Source attribution | Which source supports each pattern, fact, asset, and example? | source matrix with `wadiz_pattern_source`, `product_fact_source`, `asset_source`, `example_source`, `not_verified` |
| 4 | Base ecommerce backbone | Has the cloned ecommerce execution pipeline been applied? | photo analysis, exact cut count, cut contract, job queue, gallery/ZIP, QA/regen plan |
| 5 | Strategy and section route | Which Wadiz-style persuasion route fits this product? | page strategy and section sequence |
| 6 | Cut blueprint | What does each cut do? | 12-cut or 15-cut table |
| 7 | Copy and claim guard | Which copy can be said safely? | draft copy and claim table |
| 8 | Asset and visual direction | What visual source or prompt is needed for each cut? | asset gate and image/GIF direction |
| 9 | Final production | Are images, HTML, long image, and ZIP allowed? | final artifacts only if all gates pass |
| 10 | QA and repair | What failed and what should be regenerated? | QA report and targeted regen queue |
| 11 | Delivery and learning | What is safe to deliver or reuse? | package report and sanitized lessons only |

## Status Vocabulary

Use these exact statuses so downstream agents can make the same decision.

| Status | Meaning | Allowed next action |
|---|---|---|
| `pack_not_verified` | Required Wadiz pack/project is missing, unavailable, or marketplace result is unrelated. | planning skeleton only |
| `pack_retrieval_weak` | Project or workflow exists, but retrieval returns metadata, fallback rows, unrelated chunks, ledger-only text, or generic advice. | production brief and evidence repair plan |
| `pack_verified` | Required pack families return relevant, source-backed Wadiz evidence that changes production decisions. | blueprint, prompt brief, or final production depending on facts/assets |
| `fact_map_incomplete` | Product facts, price, offer, terms, or source evidence are missing. | fact map and confirmation list |
| `asset_gate_blocked` | Required visual/proof/legal assets are missing or prohibited. | rework report and asset request list |
| `asset_gate_conditional` | Planning and prompt briefs are possible, but final visual production is not safe yet. | prompt brief and shot list only |
| `concept_generation_allowed` | The user explicitly wants generated visuals, product-reference detail is sufficient for a concept, and all outputs will be labeled concept/publication-blocked. | concept images, concept gallery/ZIP, QA package, publication blocker list |
| `final_production_allowed` | Pack retrieval, facts, assets, and claim guard are ready. | final images, HTML, ZIP, QA package |

`pack_retrieval_weak` is not a failure of package existence. It is a failure of usable evidence. Treat it like `planning_only` until a retrieval smoke test proves otherwise.

## Production Mode Gate

Choose the output mode before producing anything. This gate prevents the skill from turning a failed pack lookup or weak asset state into low-quality final images.

| Mode | Conditions | Allowed output | Forbidden output |
|---|---|---|---|
| `planning_only` | OpenCrab pack missing, pack smoke test failed, or evidence returns only metadata/fallback rows | fact map, evidence gaps, strategy, 12/15-cut blueprint, asset list | final images, HTML gallery, ZIP, long image, claim-final copy |
| `blueprint_only` | pack verified but product facts are incomplete | fact map, evidence matrix, cut structure, copy draft with `confirmation_needed`, asset requirements | final images, final CTA, final offer/pricing claim |
| `prompt_brief_only` | pack verified but asset gate is `conditional` and the user has not approved concept generation | cut plan, copy draft, image/GIF direction, image-generation prompt briefs, shot list, required assets | final images, finished detail page, gallery, ZIP |
| `concept_generation_allowed` | pack/evidence route is usable, the user explicitly requests visual generation, product details are sufficient for a concept, and publication assets are incomplete | concept cut images, concept gallery, concept ZIP, contact sheet, QA report, blocker list | publication-ready claims, final marketplace status, unlabelled package/proof/logo visuals |
| `final_production_allowed` | pack verified, product facts confirmed, and asset gate is `ready` | final copy, image generation, HTML/gallery/ZIP, QA report | unsupported claims, unverified assets, copied Wadiz media |

Stop rules:

- If mode is `planning_only`, say `pack_not_verified` and do not create final visual assets.
- If project/package count is nonzero but retrieval is weak, say `pack_retrieval_weak` and keep mode as `planning_only`.
- If marketplace search returns unrelated packs, treat that as `pack_not_verified`.
- If mode is `blueprint_only`, say which facts block final production.
- If mode is `prompt_brief_only`, say `asset_gate_conditional` and do not generate images.
- If mode is `concept_generation_allowed`, every image, gallery, ZIP, and report must say concept-only and publication-blocked until OCR, logo, asset truth, policy copy, and claim alignment pass.
- If mode is not `final_production_allowed`, the correct next deliverable is a production brief, not a mock image.
- Exception: when the user explicitly asks for visual generation and the gate is `concept_generation_allowed`, the correct deliverable is a concept image set plus QA, not a publication candidate.
- Never use PIL/simple shapes/wireframes as a substitute for final Wadiz-style detail-page images. If a wireframe is explicitly requested, label it `internal_wireframe`, not final output.

## Work Type Routing

Classify the user's request before doing the work.

| User intent | Route | Must produce |
|---|---|---|
| "Check/install/use OpenCrab pack" | setup check | pack/project/workflow status, smoke result, next fix |
| "Make a Wadiz-style page plan" | production brief | non-negotiable output sections |
| "Give me the cut structure" | blueprint | cut table, copy draft, visual direction, evidence/fact column |
| "Make prompts" | prompt brief | per-cut prompt brief, product details to preserve, text-safe area, asset gaps |
| "Generate a concept/draft page from references" | concept generation | concept-only images/package if gate allows, plus QA and publication blockers |
| "Generate final page/images/ZIP" | final production | only if `final_production_allowed`; otherwise explain gate and stop at allowed output |
| "Review/QA this page" | QA repair | findings, failed gates, claim risks, OCR/layout issues, regen queue |
| "Package/deliver" | delivery | manifest, gallery, ZIP, QA report only if final artifacts are allowed |

If a user asks for a later-stage artifact while the gate is earlier, do not refuse vaguely. Return the strongest allowed artifact and name the exact gate that blocks the requested output.

## Retrieval Smoke Test

Before claiming pack-backed production, run or request a retrieval smoke test across the required pack families.

Smoke query shape:

```text
For a [category] product detail page, return source-backed Wadiz section flow,
hook type, proof/GIF placement, copy density, objection handling, offer structure,
claim-evidence cautions, visual layout rhythm, and production/QA rules.
Reject metadata-only or unrelated evidence.
```

Pass criteria:

- At least five major pack families return relevant evidence.
- Evidence changes a concrete decision, such as section order, GIF placement, copy density, asset requirement, claim wording, or QA rule.
- Source reference, section flow, copy/visual, claim-evidence, and production bridge are represented.
- Results are not only package snapshots, node/edge counts, upload ledgers, or broad ecommerce advice.

Fail criteria:

- Evidence contains unrelated product domains.
- Evidence is only `pack_metadata`, fallback rows, package title lists, or ingest ledgers.
- Evidence cannot explain why the cut order, copy shape, visual rule, or QA rule was chosen.
- The project has many packages but no source-backed chunks are retrieved.

When the smoke test fails, write `pack_retrieval_weak` and continue in `planning_only`.

## Output Progression

Use this ladder to decide what to produce next.

| Current gate | Output now | What unlocks next |
|---|---|---|
| no product facts | intake checklist | official source URL, seller fact sheet, or user-approved facts |
| `pack_not_verified` | production brief skeleton | install/attach Wadiz packs and pass smoke test |
| `pack_retrieval_weak` | evidence gap matrix and repair plan | retrieval returns relevant source-backed evidence |
| `pack_verified` + incomplete facts | `blueprint_only` | missing facts confirmed |
| facts ready + `asset_gate_conditional` | `prompt_brief_only` | approved product/brand/proof assets |
| user-approved concept route + `asset_gate_conditional` | `concept_generation_allowed` | OCR/text match, official logo route, asset truth approval, policy copy lock |
| facts ready + `asset_gate_ready` | final production | QA after generation |
| final assets generated but QA failed | regen queue only | failed cuts regenerated and rechecked |
| final assets generated and QA passed | delivery package | manifest, gallery, ZIP, QA report |

## Agent Behavior

Act like a production director, not a generic copywriter.

- Ask only for missing facts that block the next gate; otherwise proceed with marked assumptions.
- Keep Wadiz pattern evidence separate from product-specific facts.
- Use the product's official source for price, benefits, conditions, terms, claims, and contacts.
- Use OpenCrab only to decide persuasion structure, copy pattern, visual rhythm, GIF/proof placement, objection handling, and QA rules.
- Create source attribution for every production-facing artifact. Pattern sources, product fact sources, asset sources, examples, and unverified assumptions must be separately labeled.
- Mark every invented-looking claim as `confirmation_needed` or `blocked`.
- When images are not allowed, create visual direction and prompt briefs instead of mock images.
- When concept images are allowed, generate or build the concept package and run practical QA, but keep publication blocked.
- When final images are allowed, generate or build the full delivery package and run practical QA before calling it complete.

## Base Ecommerce Execution Backbone

The older `ecommerce-detail-page` skill is the default execution engine inside this Wadiz skill. OpenCrab packs provide the Wadiz reference intelligence; they do not replace the production mechanics.

Before producing a cut plan, prompt set, generated concept, gallery, ZIP, QA report, or regeneration queue, apply `base-ecommerce-pipeline.md`:

- analyze provided product photos or reference images before planning
- choose 12 or 15 cuts and keep the exact count
- define each cut's role, headline, subcopy, in-image Korean text, visual direction, source facts, and QA risk
- build fact map, cut plan, prompt/job queue, and QA artifacts before or alongside generation
- prefer one independent cut job per cut when generation is allowed
- build a sequential HTML gallery and ZIP only for artifacts allowed by the current gate
- run OCR/text-match, readability, layout, product consistency, claim alignment, asset truth, and ZIP checks before reporting completion

Use `detail-page-reference-analyzer` only when a reference page or URL needs private reverse analysis. Its output can inform the Wadiz evidence matrix, but it does not override product fact verification.

## Step 1. Product Intake

Collect or mark missing:

- product name
- category
- sales channel
- target customer
- top 1-5 product features
- offer, price, option, bundle, delivery, return, caution details
- source URL or seller-provided fact sheet
- official homepage or official seller page for product/service fact verification
- certifications, tests, awards, review data, performance numbers
- approved product photos, renders, videos, or generated reference directions
- prohibited claims or regulated expressions

Write missing fields as `confirmation_needed`.

For product-specific copy, verify facts against an official source URL, seller-provided document, or user-approved source. If no source is available, keep claims in `confirmation_needed` or `assumption`; do not turn them into final copy.

Never invent:

- price
- discount
- delivery promise
- warranty
- certification
- review
- ranking
- performance number
- medical, safety, financial, or legal effect

## Step 2. OpenCrab Evidence Matrix

Use the user's installed OpenCrab Wadiz project when available. Retrieve evidence for every required pack family.

| Pack family | Required decision |
|---|---|
| `source_reference` | source-backed Wadiz persuasion examples |
| `normalized_page_unit` | page, section, media, option, notice decomposition |
| `section_flow` | ordered section sequence |
| `category_playbook` | category-specific persuasion route |
| `assembly_formula` | cut count, cut role, CTA placement |
| `copy_pattern` | Korean mobile copy shape and density |
| `visual_block` | composition, text placement, rhythm, contrast |
| `gif_motion_proof` | whether motion is needed, why, and where |
| `offer_pricing` | offer stack, price anchor, option logic |
| `objection_resolution` | FAQ, anxiety removal, care, caution |
| `claim_evidence` | risky claim scan and evidence requirement |
| `product_fact_map` | source-bound fact table and unknowns |
| `production_bridge` | blueprint, asset brief, generation queue |
| `visual_ocr_qa` | Korean readability and layout checks |
| `runtime_execution_bridge` | render, package, gallery, ZIP, QA report |

Reject evidence when it is only package metadata, fallback rows, unrelated asset chunks, unrelated brands, or generic ecommerce advice.

Evidence matrix format:

```markdown
| Pack family | Evidence used | Decision changed | Risk |
|---|---|---|---|
| source_reference |  |  |  |
| section_flow |  |  |  |
| category_playbook |  |  |  |
| copy_pattern |  |  |  |
| visual_block |  |  |  |
| gif_motion_proof |  |  |  |
| offer_pricing |  |  |  |
| objection_resolution |  |  |  |
| claim_evidence |  |  |  |
| production_bridge |  |  |  |
| visual_ocr_qa |  |  |  |
```

## Step 3. Source Attribution Matrix

Create this before final copy, prompt generation, visual production, QA, or delivery packaging:

```markdown
| Item | Source family | Source name or link | Used for | Verification status | Publication rule |
|---|---|---|---|---|---|
| section order | wadiz_pattern_source |  | page route | verified / weak / missing | may guide structure only |
| hook/copy pattern | wadiz_pattern_source |  | headline style | verified / weak / missing | do not copy original text |
| product fact | product_fact_source |  | claim/copy | confirmed / confirmation_needed | publish only if confirmed |
| price/offer/terms | product_fact_source |  | CTA/offer cut | confirmed / confirmation_needed | block final CTA if missing |
| product image/logo | asset_source |  | prompt/final asset | reference_only / approved_final | label concept if not final-approved |
| pilot lesson | example_source |  | workflow/QA | example_only | not a fact source |
| assumption | not_verified | none | planning placeholder | blocked | remove or soften before publication |
```

Source family meanings:

| Source family | Meaning |
|---|---|
| `wadiz_pattern_source` | Wadiz/OpenCrab pack evidence for structure, section flow, copy rhythm, proof placement, visual/GIF rules, and QA rules |
| `product_fact_source` | Official URL, seller document, user-approved material, attached file, or explicit user confirmation for current product facts |
| `asset_source` | Product photo, logo, render, screenshot, video, brand asset, or approved generated visual direction |
| `example_source` | Pilot/example lesson, such as Luckyball concept-generation workflow |
| `not_verified` | Missing, inferred, assumed, unsupported, or publication-blocking item |

If the source attribution matrix cannot be filled, do not call the output final or publication-ready.

## Step 4. Fact Map

Create this before final copy:

```json
{
  "product_name": "",
  "category": "",
  "target_customer": "",
  "confirmed_facts": [],
  "assumptions": [],
  "confirmation_needed": [],
  "blocked_claims": [],
  "allowed_claims": [],
  "asset_inventory": [],
  "source_links_or_files": []
}
```

Fact statuses:

| Status | Meaning |
|---|---|
| `confirmed` | verified by source URL, seller data, asset, or attached document |
| `assumption` | plausible but must not be written as fact |
| `confirmation_needed` | missing or needs seller/source confirmation |
| `blocked` | must not appear in final detail page |

## Step 5. Default Detail-Page Structure

Default production shape:

- 12 cuts
- 1080 x 1600 per cut when making image pages
- optional long image: 1080 x 19200
- mobile-first Korean copy
- 1-2 messages per cut
- no final image generation before asset gate is ready
- if the gate is `conditional`, create prompt briefs and asset requirements only
- if the user explicitly approves concept generation and the concept gate passes, create concept-only 1080 x 1600 cuts and keep publication blocked
- if the gate is `blocked`, stop at a rework report

12-cut structure:

| Cut | Role | Purpose |
|---:|---|---|
| 01 | Hero hook | show the product promise and visual signal immediately |
| 02 | Pain/problem | name the customer's discomfort or desire in one sharp situation |
| 03 | Product reveal | introduce the product as the specific solution |
| 04 | Core benefit | explain the first key benefit through use context |
| 05 | Motion/proof | place GIF/demo/operation/before-after proof if movement matters |
| 06 | Detail proof | prove material, structure, detail, spec, or component value |
| 07 | Use scene | show realistic usage and customer self-recognition |
| 08 | Comparison | compare before/after, old/new, ordinary/specific, or option differences |
| 09 | Offer/option | organize price, bundle, option, benefit, and CTA logic |
| 10 | Objection/FAQ | remove purchase anxiety with direct questions |
| 11 | Delivery/caution | clarify delivery, usage, notice, return, and caution facts |
| 12 | Final CTA | restate the purchase reason and next action without overclaiming |

For 15 cuts, split:

- core benefit into 2-3 cuts
- proof into detail/use/comparison cuts
- FAQ into trust/caution/delivery cuts

## Step 6. Copy Rules

Good Wadiz-style copy:

- starts with a concrete promise or situation
- moves from problem to product appearance
- speaks in usage scenes before feature lists
- pairs every strong claim with evidence
- uses verified numbers only
- removes purchase anxiety with direct FAQ-style questions

Avoid:

- `first in Korea`
- `No.1`
- `100%`
- `guaranteed`
- `no side effects`
- medical or therapeutic effects
- fabricated certifications, awards, reviews, rankings, or performance numbers
- invented free shipping, same-day shipping, limited quantity, or discount claims

## Step 7. Visual And GIF Rules

Visual rules:

- The product must be clearly visible in the first viewport.
- Text must remain readable on mobile.
- One cut should carry only 1-2 main messages.
- Product image and text must not overlap incoherently.
- Options, specs, and FAQ should be organized as information blocks, not decorative filler.

GIF/motion rules:

- Do not use GIF as decoration.
- Use motion only for operation, transformation, fit, installation, texture, elasticity, before/after, or proof that static images cannot show.
- Preferred placement is right after problem framing or right after the first feature explanation.
- If no real motion asset exists, produce a motion storyboard or image-generation direction instead of pretending a GIF exists.

## Step 8. Product Image Policy

When the user provides product photos:

- Analyze shape, color, material, logo, marking, scale, packaging, and distinctive details.
- Do not automatically cut out and composite the original product photo.
- Prefer original generated scenes based on the product details unless the user explicitly requests compositing.
- If photo quality is low, state uncertainty and avoid over-specific visual claims.
- Keep brand marks and product labels consistent with provided or verified assets.
- For concept generation, full-scene generation from product-detail analysis is preferred over simple product cutout compositing.
- If exact logo fidelity is required, use an official logo/brand-layer route and document it separately from image-model generation.

## Step 9. Asset Gate

Before final image production, classify assets:

| Asset type | Status |
|---|---|
| product front/package photo | required |
| product detail/macro photo | required when making proof cuts |
| usage scene photo or approved generated direction | required |
| option/color/component photo | required if options are sold |
| label/ingredient/caution image | required for regulated products |
| price/offer/delivery facts | required before CTA and offer cuts |

Asset gate statuses:

- `ready`: enough facts/assets for final image production
- `conditional`: planning and prompt briefs can continue; concept generation can continue only when explicitly approved and labeled concept-only
- `blocked`: do not generate final detail-page images

Minimum `ready` criteria:

- official product/service facts are confirmed
- offer, price, benefit, delivery, return, caution, or terms are confirmed where used
- brand logo, product image, service screenshot, venue/event/photo reference, or approved generated visual direction exists for every cut that needs it
- proof cuts have real evidence, not invented reviews or awards
- regulated or financial/legal-like claims have explicit source support or are removed

Concept-generation minimum criteria:

- user explicitly asks to generate draft/concept visuals
- product-reference details are enough to preserve visible identity
- cut order and copy are already planned
- risky publication claims are removed, softened, or marked conditionally
- output labels include `concept`, `publication_blocked`, and missing gates
- generated package, proof, certificate, award, review, screenshot, or logo visuals have `asset_truth_level`

For premium service pages such as executive golf, membership, consulting, finance, or B2B services, `ready` normally requires professional-grade visual sources or user-approved generated scene direction. Without those, the mode is `prompt_brief_only`.

## Step 10. Required Plan Template

Use this template for production planning:

```markdown
# [Product Name] Wadiz-Style Detail Page Plan

## 1. Product Fact Map

- product name:
- category:
- target customer:
- sales channel:
- confirmed facts:
- assumptions:
- confirmation needed:
- blocked claims:
- usable assets:

## 2. OpenCrab Evidence Matrix

| Pack family | Evidence used | Decision changed | Risk |
|---|---|---|---|
| source_reference |  |  |  |
| section_flow |  |  |  |
| category_playbook |  |  |  |
| copy_pattern |  |  |  |
| visual_block |  |  |  |
| gif_motion_proof |  |  |  |
| offer_pricing |  |  |  |
| objection_resolution |  |  |  |
| claim_evidence |  |  |  |
| production_bridge |  |  |  |
| visual_ocr_qa |  |  |  |

## 3. Source Attribution Matrix

| Item | Source family | Source name or link | Used for | Verification status | Publication rule |
|---|---|---|---|---|---|
|  | wadiz_pattern_source / product_fact_source / asset_source / example_source / not_verified |  |  |  |  |

## 4. Page Strategy

- first hook:
- problem framing:
- product reveal:
- core appeal:
- evidence placement:
- objection removal:
- final CTA:

## 5. Cut Plan

| Cut | Role | Headline | Subcopy | Visual/GIF direction | Evidence/fact | QA |
|---:|---|---|---|---|---|---|
| 01 | Hero hook |  |  |  |  |  |
| 02 | Pain/problem |  |  |  |  |  |
| 03 | Product reveal |  |  |  |  |  |
| 04 | Core benefit |  |  |  |  |  |
| 05 | Motion/proof |  |  |  |  |  |
| 06 | Detail proof |  |  |  |  |  |
| 07 | Use scene |  |  |  |  |  |
| 08 | Comparison |  |  |  |  |  |
| 09 | Offer/option |  |  |  |  |  |
| 10 | Objection/FAQ |  |  |  |  |  |
| 11 | Delivery/caution |  |  |  |  |  |
| 12 | Final CTA |  |  |  |  |  |

## 6. Image Generation Directions

| Cut | Prompt direction | Product detail to preserve | Text-safe area | Risk |
|---:|---|---|---|---|
| 01 |  |  |  |  |

## 7. Asset Requirements

- ready:
- conditional:
- missing:
- blocked until:

## 8. Claim Guard

| Claim | Status | Evidence | Action |
|---|---|---|---|
|  | confirmed / assumption / blocked |  |  |

## 9. Production Readiness

- pack smoke test:
- fact map:
- source attribution:
- asset gate:
- concept generation status:
- production asset status:
- publication status:
- OCR/readability QA:
- final image generation:
- package output:
```

## Step 11. Final QA Checklist

Before final delivery:

- OpenCrab evidence matrix is filled or explicitly marked `pack_not_verified`.
- Source attribution matrix separates Wadiz pattern evidence, product facts, asset sources, examples, and unverified assumptions.
- All major pack families were considered.
- Product facts are separated from assumptions.
- Unsupported claims were removed or softened.
- Source Wadiz media is not used as final output.
- The cut count is exact.
- Every cut has a role, headline, subcopy, visual direction, evidence/fact, and QA note.
- Product image prompts preserve real product details.
- Asset gate is `ready` before final image generation.
- If asset gate is `conditional` or `blocked`, final publication production was stopped and reported.
- If concept generation was allowed, every artifact is labeled concept-only and publication-blocked.
- No placeholder, diagrammatic, PIL-generated, or wireframe image is presented as final output.
- Korean text OCR/readability QA is planned or complete.
- Concept generation status, production asset status, and publication status are separate.
- Generated package/box/proof/logo visuals have asset truth labels.
- Money, discount, policy, legal, warranty, delivery, and benefit copy is source-locked before publication.
- Final package includes requested files: cut images, optional long image, gallery HTML, ZIP, and QA report.

## Step 12. Pilot Learning Rule

When a user provides a weak but informative product photo and asks not to use cutout compositing, use the Luckyball pilot lesson:

1. analyze product details from the photo,
2. use the photo as a reference only,
3. generate complete full-scene cuts instead of compositing the source photo,
4. keep generated package/proof/logo visuals concept-only unless approved assets exist,
5. normalize or request 1080 x 1600 outputs,
6. run OCR/text-match and visual QA,
7. label the result as `concept_v1_full_scene_generated_pass_with_publication_blockers` unless publication gates pass.

Read `luckyball-pilot-lessons.md` before applying this exception.
