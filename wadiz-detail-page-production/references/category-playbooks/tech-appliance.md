# Playbook: 테크 / 가전

Default: 12 cuts (기능 3개 이하), 15 cuts (기능 4개+ 또는 신기술 설득 필요). 구매 결정이 스펙 비교와 동작 신뢰에서 나는 카테고리.

## Cut-Role Overrides

| Cut | Override |
|---:|---|
| 04–06 | 핵심 기능 1컷 = 기능 1개. "다기능" 뭉뚱그림 금지 |
| 05 | Motion/proof 비중 확대 — 동작·변형·자동화 데모. 실영상 없으면 모션 스토리보드로 대체하고 GIF 존재를 가장하지 않음 |
| 08 | 스펙 비교컷 필수 — 자사 구/신 모델 또는 "일반 제품 대비" (경쟁사 실명 비교는 근거 자산 없으면 금지). 표 형태, `svg_layer` 강제 |
| 11 | 규격/호환성/전원/A-S 정보 — `svg_layer` |

## Claim Rules

- 성능 수치(배터리 시간, 소음 dB, 흡입력 등)는 시험 근거 자산 없으면 `confirmation_needed`
- "업계 최초", "최고 사양" 금지 (base 규칙과 동일하되 이 카테고리에서 특히 빈발)
- KC 인증·전자파 적합성은 실물 자산 확인 후 표기

## Text Render Mode

스펙표·비교표·호환성 정보 = `svg_layer` 강제 (숫자 오렌더링 방지). 히어로/기능 데모 씬 = `hybrid`.

## OpenCrab Smoke Query

```text
For a Korean tech/appliance product detail page, return source-backed Wadiz section flow,
spec comparison table placement, motion/demo proof usage, objection handling for durability
and compatibility, and offer structure for early-bird tech funding.
Reject metadata-only or unrelated evidence.
```
