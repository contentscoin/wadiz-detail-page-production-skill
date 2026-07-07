# Luckyball Concept Gate Sample

This sample shows how to report a strong concept generation result without
claiming it is publication-ready.

## Request Shape

```text
와디즈 스타일로 이 상품 상세페이지 15컷 기획하고 콘셉트 이미지까지 만들어줘.
제품 사진은 참고만 하고, 누끼 합성하지 말고 전체 장면을 생성해줘.
```

## Correct State

```json
{
  "concept_generation_status": "complete",
  "production_asset_status": "incomplete",
  "publication_status": "blocked"
}
```

## Why Concept Passed

- 15 planned cuts were generated.
- Each cut used a full-scene image direction rather than simple cutout compositing.
- Product details from the user-provided reference photo shaped the generated visuals.
- Cut roles followed a high-consideration Wadiz-style flow: hero, problem, product reveal, custom proof, subscription value, benefit, comparison, pricing, discount, B2B use case, process, conditions, FAQ, cancellation, CTA.
- 1080 x 1600 review images, gallery, ZIP, and QA artifacts were produced.

## Why Publication Was Blocked

- OCR/text match required manual review or regeneration for some cuts.
- Official brand logo fidelity was not guaranteed by the image model.
- Generated package/box visuals were concept assets, not approved real packaging.
- Legal, policy, money, discount, and benefit wording needed final approval.

## Correct Final Label

`concept_v1_full_scene_generated_pass_with_publication_blockers`

## Rule

Do not call concept images final marketplace assets until OCR/text match,
official logo route, asset truth, policy copy lock, and claim alignment pass.
