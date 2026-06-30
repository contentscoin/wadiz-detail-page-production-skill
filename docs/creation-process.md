# 제작 과정

이 문서는 `wadiz-detail-page-production` 스킬이 어떤 문제의식과 검증 기준으로 만들어졌는지 정리합니다.

## 1. 목표

목표는 와디즈 상세페이지를 복제하는 것이 아니라, 와디즈가 설득을 조립하는 방식을 AI가 재사용할 수 있는 제작 프로토콜로 만드는 것입니다.

분석 대상은 원문 문장이나 이미지를 그대로 가져오는 것이 아니라 다음과 같은 구조입니다.

- 첫 화면에서 무엇을 먼저 약속하는가
- 문제 제기와 공감은 어디에 배치되는가
- 제품 등장은 어떤 타이밍에 나오는가
- 기능 설명과 증거는 어떤 순서로 붙는가
- GIF/시연 이미지는 장식인지 증거인지
- FAQ, 비교, 조건, 고시정보는 어떤 구매불안을 해소하는가
- 과장 claim을 막기 위해 어떤 증거가 필요한가
- 모바일 상세페이지에서 텍스트 밀도와 이미지 리듬은 어떻게 조절되는가

## 2. 온톨로지팩 역할

[OpenCrab](https://opencrab.sh) 와디즈 온톨로지팩은 “원본 페이지 저장소”가 아니라 제작 판단을 돕는 레퍼런스 계층입니다.

필수 pack family는 다음과 같습니다.

- `source_reference`
- `normalized_page_unit`
- `section_flow`
- `copy_pattern`
- `visual_block`
- `gif_motion_proof`
- `claim_evidence`
- `objection_resolution`
- `offer_pricing`
- `category_playbook`
- `assembly_formula`
- `production_bridge`
- `product_fact_map`
- `visual_ocr_qa`
- `runtime_execution_bridge`

## 3. 출처 체계

이 스킬은 원본 콘텐츠를 재배포하지 않고, 제작 판단에 필요한 출처 범주만 명시합니다.

기준 외부 출처는 다음 두 곳입니다.

- Base detail-page skill: [aisyncclub/detail_page_codex_skill](https://github.com/aisyncclub/detail_page_codex_skill)
- OpenCrab platform: [opencrab.sh](https://opencrab.sh)

| 출처 범주 | 의미 | 사용 가능 범위 |
|---|---|---|
| `wadiz_pattern_source` | 와디즈 공개 상세페이지 크롤링 데이터를 [OpenCrab](https://opencrab.sh) 온톨로지팩으로 분석한 패턴 | 섹션 순서, 후킹 방식, 카피 밀도, GIF/증거 위치, 구매불안 해소, QA 규칙 |
| `product_fact_source` | 공식 URL, 판매자 문서, 사용자 승인 자료, 첨부 파일, 명시적 사용자 확인 | 상품명, 가격, 혜택, 약관, 인증, 배송, 보증, 연락처, 정책 문구 |
| `asset_source` | 제품 사진, 로고, 렌더, 스크린샷, 영상, 브랜드 에셋, 승인된 생성 방향 | 이미지 프롬프트, 콘셉트 이미지, 최종 자산 승인 여부 |
| `example_source` | FMG Luckyball 같은 파일럿 산출물과 QA 교훈 | 운영 방식, 게이트, 실패 방지 규칙 |
| `not_verified` | 확인되지 않은 추정, 누락된 자료, unsupported claim | 최종 문구/최종 이미지/판매용 CTA에 사용 금지 |

따라서 와디즈팩은 “이렇게 설득을 조립한다”는 구조 출처이고, 개별 상품의 사실을 보증하는 출처가 아닙니다. 최종 판매용 상세페이지는 상품별 공식 자료와 사용자 승인 자료를 별도로 요구합니다.

## 4. ecommerce 백본 결합

와디즈팩은 구조와 판단을 제공하지만, 실제 상세페이지 제작 파이프라인 전체를 대체하지 않습니다.

그래서 이 스킬은 [aisyncclub/detail_page_codex_skill](https://github.com/aisyncclub/detail_page_codex_skill)의 `ecommerce-detail-page` 계열 파이프라인을 백본으로 포함합니다.

- 상품 인테이크
- 사진 분석
- 컷 수 확정
- 컷별 카피
- 이미지 프롬프트/job 큐
- HTML 갤러리/ZIP
- OCR QA
- 실패 컷 재생성

OpenCrab 팩은 이 백본 위에서 와디즈식 섹션 흐름, 카피 밀도, 증거 배치, claim QA를 결정합니다.

## 5. 럭키볼 파일럿에서 얻은 교훈

FMG Luckyball 작업에서는 상품 사진을 그대로 누끼 합성하는 방식보다, 사진에서 제품 디테일을 분석하고 전체 장면을 생성하는 방식이 더 좋은 결과를 냈습니다.

반영된 규칙:

- 사용자 제공 사진은 제품 형태, 색상, 로고 위치, 재질, 인쇄 위치를 파악하는 참조로 사용합니다.
- 사용자가 명시하지 않으면 원본 상품 이미지를 단순 합성하지 않습니다.
- 자산이 부족한 상태에서 만든 이미지는 `concept`으로만 표시합니다.
- OCR, 로고, 패키지 진실성, 정책 문구가 통과되기 전에는 publication-ready로 부르지 않습니다.

## 6. 공개 배포 경계

GitHub에는 다음만 포함합니다.

- Codex skill
- 한글 README
- OpenCrab 설치 게이트
- production workflow
- source/boundary 문서
- 샘플 입력/출력
- pack manifest 예시

GitHub에는 다음을 포함하지 않습니다.

- 와디즈 원본 HTML
- 와디즈 원본 이미지, GIF, 영상
- 크롤러 원본 데이터
- OpenCrab ontology pack ZIP
- private OpenCrab project ID
- MCP URL, 인증 토큰

## 7. 다음 고도화 과제

완전한 public production 환경을 만들려면 다음이 필요합니다.

1. 공개 설치 가능한 OpenCrab consolidated ontology pack 제작
2. pack family별 retrieval smoke test 통과
3. OpenCrab Marketplace 또는 team/company listing 배포
4. 실제 listing/package manifest로 `pack-manifest.example.json` 갱신
5. 다른 워크스페이스에서 install부터 production QA까지 재현 검증
