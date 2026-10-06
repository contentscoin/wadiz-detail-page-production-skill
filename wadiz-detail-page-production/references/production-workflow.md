# Production workflow

Use this workflow for actual page plans, copy, images, GIFs, QA, and delivery. Return the requested stage's inspectable artifact; planning does not require generating media. The executable commands are in [base-ecommerce-pipeline.md](base-ecommerce-pipeline.md).

## 1. Interview and ProductBrief

Start from existing sources. Ask only for missing information that changes the next decision: product/service identity, category and topic, SKU/options, audience, offer, source facts, purchase objections, approved assets, and channel constraints. Mark unknowns instead of inventing answers.

Create `ProductBrief` using the shipped schema. Each fact has an ID, text, status, and source; confirmed facts need reviewed official/seller/user-approved material. Keep source linkage and verification separate. `confirmed`, `assumption`, `confirmation_needed`, and `blocked` retain their existing meanings. An arithmetic calculation also needs its inputs and a checked result.

For physical products, inspect reference images for shape, colors, material, labels/logo, scale, packaging, and visible identity. For services, inspect process, people, deliverables, real outcomes, operation terms, and scene/proof assets. Named experts require verified actual bio bullets; labels such as `공개 프로필` are not biography evidence. If the user supplies an official site, inspect relevant sub-routes before relying on outside snippets.

## 2. OpenCrab evidence gate

Verify the active runtime's OpenCrab access and installed pack/workflow context. Installation/project mutation is a setup action, not an implicit side effect of planning. Do not assume maintainer-private IDs, tokens, local files, or Hermes profiles. Read [opencrab-public-install.md](opencrab-public-install.md) for setup.

Retrieve raw results with actual source text, package IDs, source/page/section/media links, category/topic relevance, and the decision they inform. Run `check-opencrab-evidence.mjs` and keep the rejected rows and reasons as well as accepted rows.

| Family | Decisions informed |
|---|---|
| source_reference / normalized_page_unit | Traceable page and section examples |
| category_playbook / section_flow / assembly_formula | Section roles and order |
| copy_pattern / visual_block | Korean copy slots, density, layout rhythm |
| gif_motion_proof | Why movement helps, its sequence, source media and placement |
| offer_pricing / objection_resolution | Offer clarity and purchase anxiety |
| claim_evidence / product_fact_map | Evidence requirements and facts vs unknowns |
| production_bridge / visual_ocr_qa / runtime_execution_bridge | Media jobs, text/layout checks and packaging |

Pack count, workflow existence, titles, relation counts, ingest ledgers, and retrieval score alone do not pass the gate. An earphone query returning office furniture fails relevance even if its package is named category_playbook. Search references and current product facts have separate source roles; never import another product's review, certification, price, or number as a current fact.

Retain `pack_not_verified`, `pack_retrieval_weak`, or `pack_verified` as an evidence state. A GIF's dimensions/page link can be confirmed while the visual meaning remains unverified. Do not invent what an unseen clip demonstrates. Remote pack deletion, rewriting, or workflow activation is a separately authorized maintenance action.

## 3. Compile category × topic × product PagePlan

Read [category-playbooks/README.md](category-playbooks/README.md), then only the matching playbook. Canonical categories are food, beauty, tech, fashion, living, and service. For hybrids, combine the relevant information requirements. Funding/maker is a campaign overlay; it does not replace the product category.

Topics are `gift`, `problem_solution`, `new_product`, `premium`, `comparison`, and `relaunch`. Apply them to the hook, section order, offer, objections, and GIF purpose. Use actual SKU/options and source facts to decide which sections are necessary. A different topic must change more than the headline.

The default is adaptive: split distinct explanations, combine repeated ones, and omit unsupported proof. The compiler defines the exact resulting sequence. Use `--preset 12` or `--preset 15` only for explicit compatibility requests. A fixed count must not justify fabricated evidence or filler sections.

Each section must state its ID/role, buyer question, headline/body/CTA as applicable, fact IDs, evidence IDs, visual direction, media job, and placement reason. Maintain an evidence matrix explaining what each accepted result changed.

Use the eight sangse questions to check coverage; they are not a forced sequence:

| ID | Buyer question |
|---|---|
| Q1 | 이게 나를 위한 건가? |
| Q2 | 그래서 나는 뭘 얻나? |
| Q3 | 왜 이 방식이어야 하나? |
| Q4 | 정말 나도 가능할까? |
| Q5 | 얼마나 힘들고 오래 해야 하나? |
| Q6 | 정확히 뭘 받나? |
| Q7 | 실패하면 어떡하지? |
| Q8 | 왜 지금 결제해야 하나? |

Q8 can explain the current offer or next action without manufactured scarcity. Select a suitable style from story-first, proof-first, lookbook, spec-showcase, offer-first, or checkpoint; style cannot add product facts.

## 4. Copy checks and approval

Run the plan validator for slot lengths, purchase-question coverage, numeric-source links, and section/media coherence. Compilation produces a draft: refine copy to its actual layout slots and resolve missing-fact markers before approval. Then inspect the underlying facts, calculations, policy wording, and claims. A linked number is not automatically correct. Approval locks the current reviewed copy/source snapshot that the next visual set uses; changing price/conditions later requires the rendered sections and documents to be updated together and the snapshot to be reapproved.

Source-lock price, discounts, warranty, delivery, returns/cancellation, ingredients, specifications, and regulated wording. Avoid unsupported first/best/No.1/guaranteed/medical/financial certainty. Actual testimonials, certificates, awards, expert credentials, and results require actual sources and assets.

## 5. Image preparation and execution

Prepare `MediaJob` requests with `prepare-media-jobs.mjs`. Only `codex_native` and `ima2` are supported. Require verified GPT Image 2.5 model capability, input-reference forwarding, and editing support where needed. No older-model fallback or separate API transport is permitted. A tool with no exposed model confirmation remains blocked until the runtime provides verifiable information; a locally installed ima2 CLI is insufficient if its server cannot be reached.

The script prepares a handoff; it does not generate images. Present expected usage/cost and obtain approval immediately before paid generation. Record the tool-returned model, actual reference inputs, output path, and execution provenance, then visually compare the product with its fixed identity references. A manually declared capability does not prove what a completed tool call used.

Use approved original scenes when requested. Do not automatically substitute simple cutouts; do not invent unreadable labels or official marks. For `hybrid`/`svg_layer` image sections, generate a text-free background, import it, then use `compose-media-text.mjs` for a separate editable deterministic Korean panel from the exact validated copy. Prices, specs and terms are not image-model lettering. The composer checks actual glyph coverage, measured line width and overflow, preserves the original generated image and its provenance, and binds the composite to the current copy. Recheck the actual final composite for text match, product identity and visual quality; the original background's review does not approve the new composite. GIFs remain animated with essential information in adjacent static copy. Brand-layer and typography details are in [layered-production.md](layered-production.md).

## 6. Actual GIFs

Plan the GIF's purpose, source, start/change/end states, timing, loop point, placement, neighboring copy, and poster. Two execution modes are supported:

- **Image frame sequence:** option/component reveals, annotated steps, diagrams, or clearly illustrative scenes. Inspect each frame for product identity and readable text.
- **Actual footage:** operation, test, texture, fit, installation, or performance demonstrations from supplied real video. Preserve the factual source and avoid edits that change the claim.

Run `build-motion-cut.mjs` and inspect the actual GIF, first-frame poster, dimensions, frame count, duration/loop, and file size. AI video generation is not part of this pipeline. Generated frames cannot substitute for actual performance proof. If real evidence is missing, retain that blocker and deliver explanatory animation only if its purpose allows it. A prompt, storyboard, or several PNGs is not a completed GIF.

Do not confine GIFs to one mandatory cut number. Put motion where it answers the relevant buyer question; offer static neighboring copy so essential facts are not available only in a moving frame.

## 7. Delivery and readiness

Package the plan, evidence/fact sources, approved copy, image/GIF files, GIF posters, ordered HTML preview, manifest, QA report, and requested ZIP. Long-image output is optional and static; keep motion as separate files. Check the actual media and archive, not just command exit codes.

| State | Supported result |
|---|---|
| pack not verified / weak | Evidence-gap brief and explicitly unverified planning skeleton |
| facts incomplete | Section/copy draft with missing-fact list |
| assets conditional | Prompts and asset list; explicitly requested concepts only with sufficient identity references |
| image model/reference capability blocked | Prepared/blocked jobs and exact unblock condition |
| concept complete | Inspectable concept media and QA, publication still blocked |
| production assets ready | Complete media and delivery package, visual/factual review still separate |
| publication ready | Verified facts/assets/terms, logo/product fidelity, text match, readability, claim alignment and actual package review |

Keep separate completion labels:

```json
{
  "concept_generation_status": "not_started | complete | failed",
  "production_asset_status": "missing | incomplete | ready",
  "publication_status": "blocked | review_required | ready"
}
```

Preserve established `planning_only`, `blueprint_only`, `prompt_brief_only`, `concept_generation_allowed`, and `final_production_allowed` mode labels when importing older projects. Do not silently promote a legacy concept into publication-ready production.

Manual visual checks include product/option/brand consistency, mobile text density and collisions, exact price/terms, generated asset truth, actual GIF playback and loop, and page placement. Automated file/numeric checks do not replace these observations. Rebuild only failed media/sections and recheck their affected consumers.

Keep QA status, source notes, cut numbers, and debug labels outside customer-facing imagery. A detail-page preview starts directly with ordered media. If the user explicitly requests a true zero-text image set, follow its conditional reference and put copy/CTA in the separate platform body; do not turn an ambiguous no-overlay request into a no-copy moodboard.

## Compatibility and case history

Import sangse `cuts.md`, `legal.md`, and legacy jobs into a fresh project. Preserve source text and trading terms, report conversions and unsupported reverse-export fields, and require new model/provenance verification for new generation. Detailed migration is in [base-ecommerce-pipeline.md](base-ecommerce-pipeline.md).

Use [case-history-routing.md](case-history-routing.md) for publication locks, premium design repair, profile sources, workflow resets, or upload stabilization. Case-specific prices, people, assets, model defaults, and cut counts are not inherited by new products. Parallel reviewers and named agent execution models are optional; apply Sol-Astra evidence and counterexample checks appropriate to the task. Image generation still requires GPT Image 2.5.
