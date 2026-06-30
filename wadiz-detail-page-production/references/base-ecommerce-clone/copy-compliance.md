# Copy and Compliance Rules

## Copy Rules

| 카피 유형 | 좋은 방향 | 피해야 할 방향 |
|---|---|---|
| 헤드라인 | 고객이 얻는 구체적 이익을 말한다. | 감성적인 말만 하고 정보가 없다. |
| 서브카피 | 특징과 구매 이유를 연결한다. | 특징만 나열한다. |
| 신뢰 카피 | 제공된 인증, 리뷰, 수치를 근거로 쓴다. | 없는 수치를 만들어낸다. |
| CTA | 자연스럽게 구매 행동을 유도한다. | 과도하게 압박한다. |
| 주의 안내 | 배송, 보관, 옵션 차이를 명확히 말한다. | 불리한 정보를 숨긴다. |

## Risky Claim Filter

Remove or soften:

- Absolute claims: 100%, 무조건, 완벽, 보장, 평생, 반드시.
- Medical or disease claims without approval: 치료, 완치, 예방, 개선 효과 단정, 약효.
- Ranking claims without evidence: 국내 1위, 최고, 최저가, 유일한, 압도적.
- Safety claims without evidence: 부작용 없음, 누구나 안전, 독성 없음, 알레르기 없음.
- Review/stat claims without source: 만족도, 재구매율, 판매량, 누적 고객 수.

Use safer forms:

- "도움을 줄 수 있는", "편하게 사용할 수 있는", "확인된 정보 기준", "개인차가 있을 수 있음".
- "제공된 인증 기준", "사용자 제공 리뷰 기준", "상세 스펙 기준".

## Wadiz Fact-Map Claim Gate

When Wadiz reference packs are used, treat every persuasive claim as one of these states before it appears in final image copy:

- `source_confirmed`: claim is supported by provided/user-confirmed source or explicit product data.
- `reference_pattern_only`: Wadiz pack suggests the persuasion pattern, but the product-specific fact is not verified. Rewrite as a soft benefit, usage context, or confirmation-needed note.
- `blocked_claim`: claim needs certification, test data, review source, price proof, ranking proof, medical approval, or policy confirmation and none exists.

Rules:

- `fact-map.json` must list the claim, source tier, source path/file, used cuts, and QA status.
- `opencrab-runtime-context.md` can justify structure and tone, but it cannot be the only proof for product-specific facts.
- Do not turn a Wadiz source example into a new product claim.
- If the claim affects health, safety, legal/financial benefit, ranking, certification, price, scarcity, or refund/delivery promise, block or soften it unless source evidence exists.
- `qa/claim-alignment.json` must show pass/needs-edit/blocked before final delivery.

## Final Quality Checklist

| 점검 항목 | 기준 |
|---|---|
| 카테고리 확인 | 상품 카테고리를 먼저 물었는가? |
| 고객 관점 | 판매자가 하고 싶은 말보다 고객이 궁금한 정보를 먼저 다뤘는가? |
| 컷 흐름 | 첫인상, 문제, 해결, 근거, 구성, 사용법, 배송·주의, CTA 흐름이 있는가? |
| 이미지화 가능성 | 실제 이미지로 만들 수 있을 만큼 구체적인가? |
| 모바일 가독성 | 문장이 짧고 핵심 카피가 잘 보이는가? |
| 사실 구분 | 사실, 가정, 확인 필요가 분리되어 있는가? |
| 과장 제거 | 위험 표현을 제거했는가? |
| 플랫폼 적합성 | 판매 채널과 모바일 구매 환경에 맞는가? |
