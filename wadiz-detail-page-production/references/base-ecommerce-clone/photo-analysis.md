# Product Photo Analysis and Placement

Use this whenever the user provides product photos or reference images.

## What to Analyze

For each image, identify:

- Image id or filename.
- Product angle: front, side, top, detail, package, label, texture, usage, component, shipping.
- Visible facts: brand, option, color, volume, composition, labels, warnings, expiration, certification marks. Do not infer facts that are not readable.
- Visual strengths: clean background, sharpness, premium mood, scale reference, good crop, label readability, texture/detail.
- Visual issues: blur, low resolution, bad lighting, clutter, cut-off product, distorted color, text too small, label unreadable, background mismatch.
- Quality status: `그대로 사용 가능`, `보정 후 사용`, `참고용만 사용`, or `재생성 권장`.
- Best use: hero, detail, texture, size comparison, option/configuration, usage, trust/proof, delivery/package, FAQ/caution, CTA.
- Crop recommendation: full product, square crop, vertical crop, close-up, background removal, or use as reference only.
- Text placement: top, bottom, left overlay, right overlay, card beside image, or avoid overlay.
- Regeneration recommendation: if the image is visually weak for sales use, say whether to request cleaner regenerated visuals using the photo as the reference.

## Output Section

When photos are provided, add this section before strategy:

```markdown
## 2. 상품 사진 분석 및 배치 추천

| 이미지 | 파악한 내용 | 품질 상태 | 강점 | 주의점 | 추천 컷/용도 | 배치/재생성 추천 |
|---|---|---|---|---|---|---|
| 이미지 1 |  |  |  |  |  |  |
```

## Placement Rules

- Use the cleanest full-product image for the hero cut.
- Use package/label photos for trust, composition, ingredient, caution, and delivery/return guide cuts.
- Use texture/detail photos for material, ingredients, formula, finish, freshness, or craftsmanship cuts.
- Use usage-scene photos for lifestyle, routine, size comparison, and before/after context.
- If a photo has clutter or weak lighting, use it as a reference only or recommend background cleanup before final production.
- If a photo is too blurry, dark, cluttered, low-resolution, cropped, distorted, or not premium enough for a sales page, mark it as `재생성 권장` and recommend generating a cleaner ecommerce-ready product visual from the photo reference.
- Do not place text over important labels, faces, small details, or busy backgrounds.
- If product colors matter, prefer real photo colors over generated colors and warn when lighting may distort color.

## Regeneration Request Rules

Recommend reference-based regeneration when any of these are true:

- The product is identifiable, but the photo would weaken trust if used directly.
- Background, lighting, crop, or resolution is poor enough to look amateur in a marketplace page.
- A hero, texture, option, or lifestyle cut needs a cleaner composition than the original photo provides.
- The user wants final sales-ready images and the available photo is only useful as appearance reference.

When recommending regeneration, ask one choice-based question:

```text
이 사진은 상품 형태 참고용으로는 쓸 수 있지만, 판매용 상세페이지 이미지로는 품질이 약합니다. 어떻게 할까요?

A. 사진을 참고로 깨끗한 상품 이미지 재생성 (추천)
B. 더 좋은 사진을 추가
C. 현재 사진 그대로 사용
```

If proceeding with regeneration, preserve visible product shape, color, package structure, and readable text. Do not recreate unreadable labels as invented facts.

## Final Image Prompt Use

In final image-generation prompts, explicitly state how to use the provided photo:

- `Use the provided product photo as the source of truth for product shape, color, package, and label.`
- `The original photo quality is weak, so use it as a reference only and regenerate a cleaner ecommerce-ready product visual.`
- `Place the product photo in the center hero area.`
- `Use the package photo only for the caution/info section.`
- `Do not invent unseen labels, certifications, ingredients, or claims.`
