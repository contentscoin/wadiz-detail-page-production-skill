# Playbook: 서비스 / 멤버십 / B2B

Default: 15 cuts. 실물이 없는 상품 — 신뢰, 프로세스, 결과 증거가 전부다. production-workflow.md의 premium service 규칙(전문가급 비주얼 소스 없으면 `prompt_brief_only`)이 이 카테고리 전체에 적용된다.

## Cut-Role Overrides

| Cut | Override |
|---:|---|
| 03 | 서비스 실체 컷 — 무엇을 받는지 구체적 구성 요소로 분해 |
| 05–06 | 프로세스 컷 — 신청→진행→결과 단계 다이어그램 (`svg_layer` 다이어그램 허용) |
| 07 | 제공자/팀 신뢰 컷 — 실존 인물·이력은 asset_source 실물만, 생성 인물 사진으로 대체 금지 |
| 08 | 플랜/등급 비교표 — `svg_layer` 강제 |
| 10 | FAQ 확대 (2컷 허용) — 환불, 기간, 범위, 갱신 |
| 13 | 계약/이용 약관 요지 — `svg_layer` 강제 |

## Claim Rules

- 수익률, 성과 보장, 합격률 등 결과 약속 표현 전면 금지 (금융·법률 유사 표현 최고 위험)
- 고객 로고·후기·사례는 실물 자산과 사용 허락 확인 후에만
- 전문 자격(변호사, 회계사 등) 표기는 증빙 자산 필수

## Text Render Mode

이 카테고리는 정보 텍스트 비중이 높아 15컷 중 절반 이상이 `svg_layer`가 되는 것이 정상. 프로세스 다이어그램은 이미지 생성 대신 SVG로 직접 그리는 것을 우선한다.

## OpenCrab Smoke Query

```text
For a Korean service/membership/B2B detail page, return source-backed Wadiz section flow,
trust-building sequence, process explanation patterns, plan comparison layout, FAQ depth,
and objection handling for refund, scope, and contract anxiety.
Reject metadata-only or unrelated evidence.
```
