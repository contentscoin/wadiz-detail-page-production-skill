# Playbook: 리빙 / 주방

Default: 12 cuts. before/after와 사용씬 반복이 설득의 중심. "내 집에서 쓰는 모습"이 그려져야 전환된다.

## Cut-Role Overrides

| Cut | Override |
|---:|---|
| 02 | Pain = 구체적 생활 장면 (지저분한 싱크대, 좁은 수납 등). 추상적 불편 서술 금지 |
| 05 | before/after 컷 필수 — 생성 이미지일 경우 양쪽 모두 생성하고 `asset_truth_level` 명시, 실사용 결과 가장 금지 |
| 07 | 사용씬 2컷까지 확장 가능 (아침/저녁, 주방/거실 등 다른 맥락) |
| 08 | 수납/공간 비교 또는 용량 비교 — 실측 수치는 `svg_layer` |
| 11 | 재질/식품 접촉 안전(주방), 설치/관리 안내 — `svg_layer` |

## Claim Rules

- 식품 접촉 제품: 재질 안전 표기(FDA, LFGB 등)는 실물 시험 자산 확인 후에만
- 내열/내구 온도·하중 수치는 `product_fact_source` 필수
- before/after를 실사용 리뷰처럼 보이게 연출 금지 — 연출 컷임이 시각적으로 명확해야 함

## Text Render Mode

사용씬/무드 = `in_image`~`hybrid`. 용량·실측·안전 표기 = `svg_layer`.

## OpenCrab Smoke Query

```text
For a Korean living/kitchen product detail page, return source-backed Wadiz section flow,
before/after proof placement, usage scene repetition patterns, capacity/size block layout,
and objection handling for durability, cleaning, and space fit.
Reject metadata-only or unrelated evidence.
```
