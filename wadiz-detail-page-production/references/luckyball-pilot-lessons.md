# Luckyball Pilot Lessons

Use this as a reusable QA lesson from the FMG Luckyball pilot. It is not a
product-specific default and must not inject FMG/Luckyball facts into unrelated
projects.

## Verified Lesson

The successful part of the pilot was not simple asset reuse. The better route was:

1. analyze the user-provided product photo for product details,
2. do not cut out and composite the original photo,
3. generate each whole detail-page section as a complete full-scene image,
4. keep the product's visible identity consistent,
5. run visual QA, size normalization, ZIP integrity checks, and OCR/text QA,
6. label the result as concept-ready until publication gates pass.

## What Worked

- Full-scene generation produced a stronger Wadiz-style concept than product-photo cutout compositing.
- The sequence worked because it followed a high-consideration 15-cut ecommerce flow: hero, problem, product reveal, custom proof, subscription value, benefit, comparison, pricing, discount, B2B use case, process, conditions, FAQ, cancellation, CTA.
- 1080 x 1600 normalization made the output reviewable and packageable.
- Contact sheets and gallery HTML made visual QA faster.
- OCR tooling exposed that visually promising images still needed Korean text review.

## What Must Become A Rule

- Do not call generated concept images final marketplace assets unless OCR, logo fidelity, asset truth, and policy wording pass.
- Use `concept_generation_allowed` for visually generated drafts when assets are incomplete but the user explicitly wants generation.
- Add `asset_truth_level` per cut:
  - `actual_asset`
  - `reference_based`
  - `generated_concept`
  - `needs_replacement`
- Generated package, box, proof, screenshot, award, review, or certificate visuals must be labeled concept-only unless approved source assets exist.
- Money, discount, legal, benefit, warranty, and policy copy must be locked before publication.
- Regenerate failed cuts only; preserve the approved fact map and claim guard.

## QA Minimum For Concept Images

- JSON syntax passes for fact map, cut plan, prompt queue, job queue, manifest, text-match, and OCR result files.
- Exact generated cut count matches the plan.
- Every review image has stable dimensions, preferably 1080 x 1600.
- ZIP integrity passes.
- Contact sheet or gallery is visually inspected.
- OCR/text-match is run when text is inside images. `review_required` is acceptable for concept status, not for publication status.

## Publication Blockers Seen In The Pilot

- OCR/text match did not pass every cut on the first machine check.
- Model-rendered logo was not official brand artwork.
- Generated package/box visuals were not approved real packaging.
- Legal and financial benefit wording needed final approval.
- Some generated image sizes needed normalization after generation.

## Skill Decision

The Wadiz skill should treat the older ecommerce pipeline as the execution
engine, then add the Wadiz/OpenCrab evidence layer and stronger gates on top.
The best state label for this kind of output is:

`concept_v1_full_scene_generated_pass_with_publication_blockers`
