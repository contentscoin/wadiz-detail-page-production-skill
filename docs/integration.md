# sangse와 와디즈 제작 스킬 통합

공통 제작 규격과 실행 파이프라인은 `wadiz-detail-page-production/`에서 관리합니다. [contentscoin/sangse](https://github.com/contentscoin/sangse)는 기존 명령·문서·작업을 보존하면서 새 규격으로 연결하는 계층입니다. 두 저장소는 같은 작업 폴더로 간주하지 않습니다.

## 통합하는 판단

sangse의 8가지 구매 질문, 불확실성 중심 인터뷰, 오퍼 점검, 스타일 팩, 카피 슬롯 검사, 수치 출처 연결을 와디즈 기획에 결합합니다. 질문은 누락 검사이며, 상품마다 질문을 설명하는 순서와 섹션 수가 달라집니다. 스타일은 story-first, proof-first, lookbook, spec-showcase, offer-first, checkpoint입니다.

카테고리(food/beauty/tech/fashion/living/service), 주제(gift/problem_solution/new_product/premium/comparison/relaunch), 실제 SKU·옵션·사실·타깃·반론을 함께 사용합니다. 종전 12/15컷과 funding/combined category 이름은 명시적 호환 경로로 남습니다. 산출물의 내용과 검증 결과가 기획의 품질 근거이며 특정 에이전트 모델/병렬 리뷰어를 강제하지 않습니다. 이미지 생성의 GPT Image 2.5 조건은 별도 필수입니다.

## 공통 계약

| 계약 | 핵심 필드 |
|---|---|
| ProductBrief | `schema_version`, `product`, source-backed `facts`, `assets`, `unknowns`, `source_links` |
| PagePlan | 섹션 `id/role/questions/copy/fact_ids/evidence_ids/media_job_id/visual_direction/placement_reason` |
| MediaJob | 이미지/GIF 의도, 참조, 모델, 실행 상태, 승인 및 결과 출처 |
| DeliveryManifest | 섹션 순서, 미디어·poster 파일, QA 및 publication 상태 |

실제 JSON 필드와 제약은 스킬 폴더의 스키마가 정본입니다. `compile-page-plan.mjs`는 새 폴더에 계획·카피·작업을 만들고, `validate-page-plan.mjs`는 슬롯/질문/수치 연결 등을 검사합니다. 근거 연결을 실제 사실·계산 검증으로 표시하지 않습니다. 사용자가 실제 카피를 승인한 뒤 이미지 단계로 진행합니다.

## OpenCrab·미디어 연결

원문·패키지·페이지·섹션·미디어 연결과 현재 질의 관련성을 검사합니다. 패키지 제목, 검색 점수, 노드 수만으로 통과시키지 않습니다. 무관한 상품군, 잘린 텍스트와 메타데이터는 거절하며, 원격 팩/워크플로 변경은 별도 유지보수입니다.

자체 이미지 도구/ima2가 실제 GPT Image 2.5를 확인하고 참조·편집 요구를 만족해야 이미지 요청을 실행할 수 있습니다. `prepare-media-jobs.mjs`는 계획만 내보내며 `import-media-result.mjs`가 실제 결과의 모델·참조·출력 출처를 확인합니다. 기능 확인이나 실제 도구 결과 없이 생성 완료로 기록하지 않습니다. 별도 API 과금 경로는 없습니다.

GIF는 이미지 프레임 또는 실제 영상으로 변환합니다. 실사 성능 증명과 생성 설명을 구분하고 GIF/poster/미리보기/manifest를 함께 납품합니다. 자동 구조 검사와 수동 상품·글자·동작 검수는 별개 상태입니다. 실행 명령은 [base-ecommerce-pipeline.md](../wadiz-detail-page-production/references/base-ecommerce-pipeline.md), 미디어 형식은 [media-production.md](../wadiz-detail-page-production/references/media-production.md)를 참고합니다.

## 기존 프로젝트 가져오기

```powershell
node wadiz-detail-page-production/scripts/import-sangse.mjs legacy-project --out imported-project
```

기존 `cuts.md`, `legal.md`, 레거시 이미지 작업은 원본 그대로 보존합니다. 변환 폴더에서 섹션 카피, 거래 조건, 근거와 source 파일을 대조하고 호환 보고서를 검토합니다. 구형 모델/백엔드 기록은 과거 이력이며 새 생성의 capability 증거가 아닙니다.

새 가변 섹션, GIF, 모델/참조 출처 데이터는 구형 작업 형식으로 돌아갈 때 손실될 수 있습니다. 변환기는 지원하지 않는 방향을 보고하고 임의로 제거하지 않습니다. 기존 sangse 기능은 통합 검증 전에 제거하지 않습니다.

## 검증 기준과 출처

구현 범위·기준 커밋·회귀 테스트·실제 생성 제한은 [구현 및 검증 기록](implementation-verification.md)에 정리했습니다.

회귀 검증은 동일 상품의 선물형/문제 해결형 차이, 카테고리 필수 정보, 무관한 OpenCrab 결과, 수치 출처 유실, 2.5/참조 확인 실패, GIF 재생·납품 배치, 레거시 카피/거래 조건 보존을 다룹니다. 코드 테스트가 외부 모델 실제 생성이나 판매용 사실 검증을 입증하지는 않습니다.

sangse에서 이식한 자료의 `Copyright (c) 2026 fivetaku`와 MIT 전문은 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)에 보존합니다. 설치된 스킬에도 고지를 복사합니다. 기존 개별 상품 사례는 조건부 레퍼런스로 유지하며 새 상품의 사실이나 필수 디자인으로 승격하지 않습니다.
