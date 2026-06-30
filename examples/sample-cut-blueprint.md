# 샘플 상세페이지 컷 블루프린트

이 문서는 출력 형식 예시입니다. 실제 production에서는 OpenCrab pack smoke test를 통과한 프로젝트에서 검색된 근거와 상품별 공식 fact map을 함께 사용해야 합니다.

## 전제

- 상품: 커스텀 골프공 정기구독 서비스
- 목적: 스마트스토어 모바일 상세페이지
- 권장 컷 수: 12컷
- 이미지 방향: 기존 사진 직접 합성보다 제품 디테일을 분석한 original scene image 생성 우선

## Fact Boundary

| 구분 | 내용 | 처리 |
|---|---|---|
| 확인된 사실 | 일정 주기 골프공 정기 배송 | 사용 가능 |
| 확인된 사실 | 사용 주기별 옵션 | 가격표 확인 후 사용 |
| 확인된 사실 | 마킹 옵션 | 실제 제공 범위 확인 후 사용 |
| 추론 가능 benefit | 매번 골프공을 사러 가는 번거로움 감소 | 부드러운 표현으로 사용 |
| 금지 claim | 경기력 향상 보장 | 사용 금지 |
| 금지 claim | 국내 최초 / 업계 1위 | 증빙 없으면 사용 금지 |

## 12컷 구조 예시

| 컷 | 역할 | 카피 방향 | 이미지/GIF 방향 | QA 포인트 |
|---:|---|---|---|---|
| 1 | 첫 후킹 | 라운드 전 골프공 준비 스트레스 감소 | 골프장, 골프공 패키지, 프리미엄 hero scene | 보장/1위 표현 금지 |
| 2 | 문제 공감 | “라운드 잡자마자 골프공부터 챙기고 있나요?” | 비어 있는 골프공 파우치와 준비 체크리스트 | 공감형 질문, 과장 금지 |
| 3 | 해결 제안 | 매월 필요한 만큼 도착하는 골프공 구독 | 배송 박스 개봉 컷 | 배송 주기 fact 확인 |
| 4 | 사용 방식 | 옵션 선택 → 정기 배송 → 라운드 준비 | 3단계 인포그래픽 | 텍스트 밀도 낮게 |
| 5 | 제품 디테일 | 딤플, 마킹, 패키지 디테일 강조 | 골프공 macro render, 로고/마킹 영역 | 실제 마킹 가능 범위 확인 |
| 6 | 옵션 비교 | 라운드 빈도에 맞춘 구성 | 옵션 카드 3개 | 가격/구성 미확정 시 placeholder |
| 7 | 선물/B2B | 동호회, 회사 행사, 선물용 활용 | 패키지와 메시지 카드 scene | B2B 가능 여부 확인 |
| 8 | 구매불안 해소 | 구독 변경/취소 정책 안내 | 정책 안내 UI mock | 실제 정책 전까지 확정 표현 금지 |
| 9 | 사용 상황 | 다음 라운드를 가볍게 준비하는 서비스 | 골프백, 차량, 라운드 준비 scene | 후기처럼 보이는 연출 주의 |
| 10 | FAQ | 배송, 옵션 변경, 마킹, 교환 문의 | FAQ accordion 스타일 | 정책 fact 일치 |
| 11 | CTA | 첫 배송 구성과 선택 옵션 안내 | 패키지 full set + CTA zone | 가격 anchor 확인 |
| 12 | 마지막 리마인드 | “다음 라운드 준비를 더 가볍게” | 그린 위 제품 hero scene | 감성 카피, 과장 claim 없음 |

## 이미지 생성 프롬프트 예시

```text
Create a premium Korean ecommerce detail-page hero image for a golf ball subscription service. Show a clean white golf ball subscription package opened beside a golf bag and scorecard on a morning tee box. Emphasize realistic dimples, subtle custom initials on the ball, fresh packaging, and readiness before a round. Vertical mobile ecommerce composition, 1080x1600, product large and clear, natural light, premium but practical, no copied brand assets, leave clean space for Korean headline text.
```

## Claim QA

- “비거리 향상”, “스코어 보장”, “무조건 보상”처럼 결과를 보장하는 표현은 사용하지 않습니다.
- “국내 최초”, “업계 1위”, “최저가”는 공식 증빙 없이는 사용하지 않습니다.
- 구독 변경/취소/환불은 실제 정책 문구가 확인되기 전까지 확정형으로 쓰지 않습니다.
- 후기와 만족도는 실제 리뷰 데이터가 없으면 만들지 않습니다.

## 산출물 체크리스트

- fact map
- 12컷 blueprint
- 컷별 카피
- 컷별 이미지 프롬프트
- claim QA
- visual/OCR QA 계획
- OpenCrab evidence 출처 요약
