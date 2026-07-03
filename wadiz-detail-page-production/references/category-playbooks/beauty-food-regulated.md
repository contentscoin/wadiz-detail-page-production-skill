# Playbook: 뷰티 / 식품 / 건강 (규제 카테고리)

Default: 15 cuts. Claim guard at maximum strictness. This category is where invented claims become legal problems, not just quality problems.

## Cut-Role Overrides (vs base 15-cut)

| Cut | Override |
|---:|---|
| 05 | 성분/원료 컷 — 전성분 또는 핵심 성분 표기, `product_fact_source` 필수 |
| 06 | 인증/시험 컷 — 인증서·시험성적서가 실물 자산으로 존재할 때만 생성. 없으면 컷 삭제, 절대 생성으로 대체 금지 |
| 11 | 섭취/사용법 컷 — 용법·용량·보관 |
| 13 | 주의사항/법적 고지 컷 — `svg_layer` 모드 필수 |

## Claim Rules (base 금지어에 추가)

- 효능·효과 표현: 의약품 오인 표현 전면 금지 (치료, 개선 단정, 항염, 미백/주름개선은 기능성 인증 있을 때만)
- 식품: 질병 예방·치료 암시 금지, "다이어트 보장" 금지
- 화장품: 기능성 문구는 식약처 보고 자산 확인 후에만
- 리뷰·체험 사례는 실자산 없으면 사용 금지 (생성 금지 대상)
- 인증마크·시험기관 로고는 asset_source 실물만; 이미지 생성 절대 금지

## Text Render Mode

성분표, 용법, 주의사항, 법적 고지 = `svg_layer` 강제. 오탈자 하나가 법적 리스크가 되는 텍스트를 이미지 모델에 맡기지 않는다.

## OpenCrab Smoke Query

```text
For a Korean beauty/food/health-functional product detail page, return source-backed
Wadiz section flow, ingredient/certification proof placement, regulated claim cautions,
FAQ patterns for safety anxiety, and copy density for regulated categories.
Reject metadata-only or unrelated evidence.
```

## Asset Gate Additions

`ready` requires: 전성분/원료 리스트(판매자 문서), 인증·시험 실물 스캔(해당 시), 식약처 관련 표기 확인. 이 중 하나라도 없으면 해당 컷은 `blocked`, 나머지는 진행 가능.
