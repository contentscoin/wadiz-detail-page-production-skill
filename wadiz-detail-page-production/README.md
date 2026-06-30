# 와디즈 상세페이지 프로덕션 스킬

`wadiz-detail-page-production`은 와디즈 스타일의 한국어 이커머스 상세페이지를 기획, 콘셉트 이미지 생성, QA, 패키징하기 위한 Codex 스킬입니다.

이 스킬은 단순 카피 작성 스킬이 아니라, 기존 상세페이지 제작 파이프라인 위에 OpenCrab 와디즈 온톨로지팩을 얹은 제작 프로토콜입니다.

## 핵심 구조

| 레이어 | 역할 |
|---|---|
| `ecommerce-detail-page` 백본 | 상품 인테이크, 사진 분석, 컷 수 확정, 컷별 카피, 프롬프트/job 큐, 이미지 생성, HTML/ZIP, OCR QA, 재생성 |
| OpenCrab 와디즈 온톨로지팩 | 와디즈식 섹션 흐름, 후킹 방식, 카피 밀도, GIF/증거 위치, 구매불안 해소, 오퍼 구조, claim-evidence 규칙 |
| `detail-page-reference-analyzer` | 기존 상세페이지/URL/레퍼런스 역기획과 비공개 참고 분석 |
| `wadiz-detail-page-production` | 위 레이어들을 조립하고 pack/fact/asset/concept/publication/QA 게이트를 관리 |

## 설치

Codex 로컬 스킬 폴더에 복사합니다.

```powershell
# 저장소 루트에서 실행
Copy-Item -Recurse ".\wadiz-detail-page-production" "$env:USERPROFILE\.codex\skills\wadiz-detail-page-production" -Force
```

설치 후 다음처럼 호출합니다.

```text
Use $wadiz-detail-page-production to plan, generate concept cuts, QA, or package a Wadiz-style Korean ecommerce detail page.
```

한국어 요청 예시:

```text
와디즈 스타일로 이 상품 상세페이지 15컷 기획하고 콘셉트 이미지까지 만들어줘.
```

## 필수 게이트

| 상태 | 의미 | 허용되는 결과물 |
|---|---|---|
| `pack_not_verified` | OpenCrab 와디즈팩 설치/검색이 확인되지 않음 | 기획 골격, 필요팩 안내 |
| `pack_retrieval_weak` | 팩은 있으나 검색 결과가 메타데이터/핸드오프 수준 | 근거 보강 리포트, production brief |
| `asset_gate_conditional` | 기획은 가능하지만 최종 판매용 자산이 부족 | 컷블루프린트, 프롬프트 브리프 |
| `concept_generation_allowed` | 사용자가 명시적으로 콘셉트 생성을 원하고 제품 참조가 충분함 | 콘셉트 이미지, 갤러리, ZIP, QA 리포트 |
| `final_production_allowed` | pack/fact/asset/OCR/logo/policy/claim 게이트 통과 | 최종 판매 후보 상세페이지 패키지 |

## 콘셉트와 최종본 구분

콘셉트 이미지가 잘 나왔다고 곧바로 판매용 최종본은 아닙니다.

스킬은 결과 상태를 반드시 나눕니다.

```json
{
  "concept_generation_status": "not_started | complete | failed",
  "production_asset_status": "missing | incomplete | ready",
  "publication_status": "blocked | review_required | ready"
}
```

최종 판매용으로 부르려면 다음 검증이 필요합니다.

- OCR/text-match 통과 또는 수동 승인
- 공식 로고/브랜드 에셋 확인
- 생성된 패키지/박스/증거 이미지의 truth level 확인
- 가격, 할인, 보상, 배송, 취소, 약관 문구의 정책 승인
- claim alignment와 법적 위험 표현 제거

## 럭키볼 파일럿에서 반영된 교훈

FMG Luckyball 작업에서는 상품 사진을 그대로 누끼 합성하는 방식보다, 사진에서 제품 디테일을 분석한 뒤 전체 장면을 생성하는 방식이 더 좋은 결과를 냈습니다.

따라서 이 스킬은 다음 규칙을 가집니다.

- 사용자 제공 사진은 제품 형태, 색상, 로고 위치, 재질, 인쇄 위치를 파악하는 참조로 우선 사용합니다.
- 사용자가 명시하지 않으면 원본 상품 이미지를 단순 합성하지 않습니다.
- 자산이 부족한 상태에서 생성한 이미지는 `concept`으로만 표시합니다.
- OCR, 로고, 패키지 진실성, 정책 문구가 통과되기 전에는 publication-ready로 부르지 않습니다.

## 출처와 경계

- 기본 상세페이지 제작 파이프라인은 기존 `ecommerce-detail-page` 스킬을 백본으로 사용합니다.
- 와디즈식 흐름과 설득 구조는 사용자의 OpenCrab 와디즈 온톨로지팩을 조회하여 적용합니다.
- 와디즈 원본 페이지의 이미지, GIF, 문구를 복제하는 목적이 아닙니다.
- OpenCrab 팩은 구조, 리듬, 소구점, 증거 배치, QA 규칙을 참고하는 용도이며, 특정 상품의 가격/혜택/약관/인증 사실을 대신 증명하지 않습니다.
- 상품별 사실은 공식 URL, 판매자 제공 문서, 사용자 승인 자료로 별도 확인해야 합니다.

## 출처 표기 규칙

상세페이지 기획서, 컷 블루프린트, 이미지 프롬프트, QA 리포트, 패키지 manifest에는 다음 출처 범주를 분리해 적습니다.

| 출처 범주 | 의미 | 사용 한계 |
|---|---|---|
| `wadiz_pattern_source` | OpenCrab 와디즈팩에서 조회한 섹션 흐름, 카피/비주얼 패턴, GIF/증거 배치, QA 규칙 | 상품별 사실을 증명하지 않음 |
| `product_fact_source` | 공식 URL, 판매자 자료, 사용자 승인 문서, 첨부 파일, 명시적 확인 | 와디즈 스타일 패턴을 대신하지 않음 |
| `asset_source` | 제품 사진, 로고, 렌더, 스크린샷, 영상, 승인된 생성 방향 | 사실/성능/혜택 주장을 대신 증명하지 않음 |
| `example_source` | 럭키볼 파일럿 같은 운영 사례와 QA 교훈 | 다른 상품의 사실 출처로 쓰지 않음 |
| `not_verified` | 확인되지 않은 추정, 누락 자료, unsupported claim | 최종 문구/판매용 이미지에 사용 금지 |

출처 표가 비어 있거나 상품 사실 출처가 부족하면 결과물은 `planning_only`, `blueprint_only`, `prompt_brief_only`, 또는 `concept/publication_blocked`로 표시해야 합니다.

## 포함 파일

- `SKILL.md`: 스킬 진입점과 운영 규칙
- `agents/openai.yaml`: Codex 표시명과 기본 호출문
- `references/production-workflow.md`: 실제 제작 워크플로우
- `references/base-ecommerce-pipeline.md`: ecommerce 백본 실행 계약
- `references/base-ecommerce-clone/`: 기존 ecommerce-detail-page 핵심 레퍼런스/스크립트 복사본
- `references/luckyball-pilot-lessons.md`: 럭키볼 파일럿에서 나온 QA/생성 교훈
- `references/opencrab-public-install.md`: OpenCrab 공개팩 설치 안내
- `references/source-and-boundary.md`: 출처와 사용 경계
