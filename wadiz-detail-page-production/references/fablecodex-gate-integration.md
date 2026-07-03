# FableCodex Gate Integration (Optional)

[FableCodex](https://github.com/baskduf/FableCodex)는 이미지 생성 도구가 아니라 Codex용 워크플로우 플러그인이다 (Goal Ledger + Findings Gate, AGPL-3.0). 이 스킬의 게이트 시스템을 문서 규약이 아닌 기계적 상태로 강제하는 데 사용한다. 미설치 환경에서는 이 문서를 건너뛰고 기존 문서 규약대로 운영한다.

## Mapping

프로젝트 시작 시 Goal Ledger(`.codex-fable5/goals.json`)에 게이트별 체크포인트를 생성한다:

| Goal checkpoint | 이 스킬의 게이트 | 통과 증거 |
|---|---|---|
| `pack-gate` | pack install + retrieval smoke test | evidence matrix, smoke query 결과 |
| `fact-map` | Step 4 fact map 완성 | fact-map.json, confirmation_needed 목록 |
| `asset-gate` | Step 9 asset gate 판정 | asset 분류표, gate status |
| `concept-generation` | concept_generation_allowed 산출물 | cuts/, layers.json, mechanical-qa.json |
| `qa-pass` | OCR/text/layout/claim QA | qa/ 아티팩트, regen queue 소진 |
| `publication` | final_production_allowed + 발행 라벨 | 소스 귀속표, 정책 문구 승인 기록 |

## Findings Gate 규칙

- QA 실패 항목(OCR 실패 컷, 미확정 가격, claim 위반)은 `findings add`로 기록한다.
- 미해결 finding이 남아 있으면 `publication` 체크포인트를 통과시키지 않는다 — `publication_status: ready` 선언이 기계적으로 차단된다.
- SVG 레이어 수정으로 해결된 finding은 해결 근거에 `svg_revision` 번호를 남긴다.

## 세션 복원

`.codex-fable5/goals.json`이 게이트 상태의 SSOT다. 세션이 끊긴 뒤 재개할 때는 문서를 다시 읽어 상태를 추정하지 말고 ledger의 체크포인트/finding 상태에서 시작한다.

## 라이선스 주의

AGPL-3.0-or-later — 내부 워크플로우 도구로 사용은 문제없으나, 이 스킬과 함께 재배포·번들하지 않는다. 스킬은 FableCodex 없이도 완전히 동작해야 한다(soft dependency).
