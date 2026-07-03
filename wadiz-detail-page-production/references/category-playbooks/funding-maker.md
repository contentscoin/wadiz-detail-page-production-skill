# Playbook: 펀딩형 (와디즈 고유 구조)

Default: 15+ cuts. 완제품 판매가 아니라 "만드는 사람과 과정에 대한 지지"를 설득하는 구조. 와디즈 온톨로지팩 증거가 가장 직접적으로 적용되는 카테고리.

## Cut-Role Overrides (base 15-cut 대비 추가/변형)

| Cut | Override |
|---:|---|
| 02–03 | 문제 제기 → 메이커 스토리 컷 삽입: 왜 우리가 이걸 만들게 됐는가 |
| 06 | 개발 과정 컷 — 시제품, 개선 이력, 실패와 수정. 실물 개발 사진 자산 우선, 생성 시 `asset_truth_level` 명시 |
| 09 | 리워드 구조 컷 — 얼리버드/일반/세트 구성과 회차별 혜택. `svg_layer` 강제 |
| 10 | 펀딩 일정 컷 — 결제일, 발송 예정일, 진행 단계. `svg_layer` 강제 |
| 12 | 메이커 약속/커뮤니티 컷 — 새소식 업데이트, 소통 계획 |
| 14 | 펀딩 유의사항 — 단순 변심 환불 규정, 발송 지연 가능성 고지. `svg_layer` 강제 |

## Claim Rules

- "펀딩 성공 보장", "무조건 발송" 금지 — 펀딩은 예약 구매가 아님을 왜곡하는 표현 금지
- 달성률·서포터 수는 실시간 데이터이므로 상세페이지에 고정 수치로 박지 않음 (박아야 하면 `confirmation_needed`)
- 시제품 사진을 양산품 품질로 오인시키는 연출 금지 — 시제품임을 명시

## Text Render Mode

리워드 구성, 일정, 유의사항 = `svg_layer` 강제. 특히 발송 예정일과 환불 규정은 오탈자가 분쟁으로 직결된다. 메이커 스토리·개발 과정 = `in_image`/`hybrid`.

## OpenCrab Smoke Query

```text
For a Wadiz funding project detail page, return source-backed section flow for maker story,
development process proof, reward tier structure, funding schedule blocks, supporter
communication patterns, and mandatory funding caution notices.
Reject metadata-only or unrelated evidence.
```
