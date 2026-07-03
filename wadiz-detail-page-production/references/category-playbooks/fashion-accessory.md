# Playbook: 패션 / 잡화

Default: 12 cuts. 텍스트 밀도 최소, 비주얼 중심. 구매 결정이 착용 모습 상상과 소재감에서 나는 카테고리.

## Cut-Role Overrides

| Cut | Override |
|---:|---|
| 01 | 히어로 = 착용씬 또는 무드샷. 텍스트 1줄 이하 |
| 04–07 | 착용씬 2컷 이상 (다른 상황/체형/스타일링), 소재 매크로 1컷 이상 |
| 06 | 소재/디테일 매크로 — 질감, 스티치, 부자재 클로즈업 |
| 08 | 컬러/사이즈 옵션 컷 — 실측 사이즈표 `svg_layer` 강제 |
| 11 | 세탁/관리/교환 안내 — `svg_layer` |

## Claim Rules

- 소재 혼용률은 판매자 문서 확인 후 표기 (`product_fact_source`)
- "명품급", "백화점 퀄리티" 등 비교 과장 금지
- 모델 착용 이미지 생성 시: 실제 인물 유사성 금지, 생성 착용씬은 `asset_truth_level: generated_concept` 명시

## Text Render Mode

무드/착용씬 = `in_image` 또는 텍스트 없음. 사이즈표·혼용률·관리안내 = `svg_layer`. 이 카테고리는 12컷 중 `svg_layer` 컷이 3개 이하인 것이 정상 — 텍스트를 늘리지 말 것.

## OpenCrab Smoke Query

```text
For a Korean fashion/accessory product detail page, return source-backed Wadiz section flow,
wearing-scene rhythm, material macro placement, low-density copy patterns, size/option
block layout, and objection handling for fit and returns.
Reject metadata-only or unrelated evidence.
```
