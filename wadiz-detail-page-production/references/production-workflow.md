# Production Workflow

Use this reference for real Wadiz-style detail-page planning, cut blueprints, image prompt sets, QA reviews, and production packaging. This is the execution layer that keeps the skill from becoming a vague strategy guide.

## Non-Negotiable Output

For any production request, return these sections unless the user explicitly asks for a smaller artifact:

1. Product fact map
2. OpenCrab evidence matrix
3. Wadiz-style page strategy
4. 12-cut or 15-cut detail-page plan
5. Cut-by-cut copy and visual direction
6. Asset requirements and asset gate status
7. Claim guard
8. Production readiness and QA checklist

If OpenCrab packs are not installed or smoke-tested, still use this structure, but mark evidence as `pack_not_verified` or `evidence_missing`.

## Production Mode Gate

Choose the output mode before producing anything. This gate prevents the skill from turning a failed pack lookup or weak asset state into low-quality final images.

| Mode | Conditions | Allowed output | Forbidden output |
|---|---|---|---|
| `planning_only` | OpenCrab pack missing, pack smoke test failed, or evidence returns only metadata/fallback rows | fact map, evidence gaps, strategy, 12/15-cut blueprint, asset list | final images, HTML gallery, ZIP, long image, claim-final copy |
| `blueprint_only` | pack verified but product facts are incomplete | fact map, evidence matrix, cut structure, copy draft with `confirmation_needed`, asset requirements | final images, final CTA, final offer/pricing claim |
| `prompt_brief_only` | pack verified but asset gate is `conditional` | cut plan, copy draft, image/GIF direction, image-generation prompt briefs, shot list, required assets | final images, finished detail page, gallery, ZIP |
| `final_production_allowed` | pack verified, product facts confirmed, and asset gate is `ready` | final copy, image generation, HTML/gallery/ZIP, QA report | unsupported claims, unverified assets, copied Wadiz media |

Stop rules:

- If mode is `planning_only`, say `pack_not_verified` and do not create final visual assets.
- If marketplace search returns unrelated packs, treat that as `pack_not_verified`.
- If mode is `blueprint_only`, say which facts block final production.
- If mode is `prompt_brief_only`, say `asset_gate_conditional` and do not generate final images.
- If mode is not `final_production_allowed`, the correct next deliverable is a production brief, not a mock image.
- Never use PIL/simple shapes/wireframes as a substitute for final Wadiz-style detail-page images. If a wireframe is explicitly requested, label it `internal_wireframe`, not final output.

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

## Step 3. Fact Map

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

## Step 4. Default Detail-Page Structure

Default production shape:

- 12 cuts
- 1080 x 1600 per cut when making image pages
- optional long image: 1080 x 19200
- mobile-first Korean copy
- 1-2 messages per cut
- no final image generation before asset gate is ready
- if the gate is `conditional`, create prompt briefs and asset requirements only
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

## Step 5. Copy Rules

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

## Step 6. Visual And GIF Rules

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

## Step 7. Product Image Policy

When the user provides product photos:

- Analyze shape, color, material, logo, marking, scale, packaging, and distinctive details.
- Do not automatically cut out and composite the original product photo.
- Prefer original generated scenes based on the product details unless the user explicitly requests compositing.
- If photo quality is low, state uncertainty and avoid over-specific visual claims.
- Keep brand marks and product labels consistent with provided or verified assets.

## Step 8. Asset Gate

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
- `conditional`: planning and prompt briefs can continue, but final image/copy production is not allowed
- `blocked`: do not generate final detail-page images

Minimum `ready` criteria:

- official product/service facts are confirmed
- offer, price, benefit, delivery, return, caution, or terms are confirmed where used
- brand logo, product image, service screenshot, venue/event/photo reference, or approved generated visual direction exists for every cut that needs it
- proof cuts have real evidence, not invented reviews or awards
- regulated or financial/legal-like claims have explicit source support or are removed

For premium service pages such as executive golf, membership, consulting, finance, or B2B services, `ready` normally requires professional-grade visual sources or user-approved generated scene direction. Without those, the mode is `prompt_brief_only`.

## Step 9. Required Plan Template

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

## 3. Page Strategy

- first hook:
- problem framing:
- product reveal:
- core appeal:
- evidence placement:
- objection removal:
- final CTA:

## 4. Cut Plan

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

## 5. Image Generation Directions

| Cut | Prompt direction | Product detail to preserve | Text-safe area | Risk |
|---:|---|---|---|---|
| 01 |  |  |  |  |

## 6. Asset Requirements

- ready:
- conditional:
- missing:
- blocked until:

## 7. Claim Guard

| Claim | Status | Evidence | Action |
|---|---|---|---|
|  | confirmed / assumption / blocked |  |  |

## 8. Production Readiness

- pack smoke test:
- fact map:
- asset gate:
- OCR/readability QA:
- final image generation:
- package output:
```

## Step 10. Final QA Checklist

Before final delivery:

- OpenCrab evidence matrix is filled or explicitly marked `pack_not_verified`.
- All major pack families were considered.
- Product facts are separated from assumptions.
- Unsupported claims were removed or softened.
- Source Wadiz media is not used as final output.
- The cut count is exact.
- Every cut has a role, headline, subcopy, visual direction, evidence/fact, and QA note.
- Product image prompts preserve real product details.
- Asset gate is `ready` before final image generation.
- If asset gate is `conditional` or `blocked`, final visual production was stopped and reported.
- No placeholder, diagrammatic, PIL-generated, or wireframe image is presented as final output.
- Korean text OCR/readability QA is planned or complete.
- Final package includes requested files: cut images, optional long image, gallery HTML, ZIP, and QA report.
