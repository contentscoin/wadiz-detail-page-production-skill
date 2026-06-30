# 와디즈 상세페이지 프로덕션 스킬

`wadiz-detail-page-production`은 와디즈 스타일의 한국어 이커머스 상세페이지를 기획, 콘셉트 이미지 생성, QA, 패키징하기 위한 Codex 스킬입니다.

이 저장소는 스킬을 바로 설치할 수 있도록 `wadiz-detail-page-production/` 폴더를 기본 탑재합니다.

## 핵심 구조

| 레이어 | 역할 |
|---|---|
| `ecommerce-detail-page` 백본 | 상품 인테이크, 사진 분석, 컷 수 확정, 컷별 카피, 프롬프트/job 큐, 이미지 생성, HTML/ZIP, OCR QA, 재생성 |
| OpenCrab 와디즈 온톨로지팩 | 와디즈식 섹션 흐름, 후킹 방식, 카피 밀도, GIF/증거 위치, 구매불안 해소, 오퍼 구조, claim-evidence 규칙 |
| `detail-page-reference-analyzer` | 기존 상세페이지/URL/레퍼런스 역기획과 비공개 참고 분석 |
| `wadiz-detail-page-production` | 위 레이어를 조립하고 pack/fact/asset/concept/publication/QA 게이트를 관리 |

## 설치

```powershell
git clone https://github.com/contentscoin/wadiz-detail-page-production-skill.git
cd wadiz-detail-page-production-skill
Copy-Item -Recurse ".\wadiz-detail-page-production" "$env:USERPROFILE\.codex\skills\wadiz-detail-page-production" -Force
```

설치 후 Codex에서 다음처럼 호출합니다.

```text
Use $wadiz-detail-page-production to plan, generate concept cuts, QA, or package a Wadiz-style Korean ecommerce detail page.
```

한국어 요청 예시:

```text
와디즈 스타일로 이 상품 상세페이지 15컷 기획하고 콘셉트 이미지까지 만들어줘.
제품 사진은 참고만 하고, 누끼 합성하지 말고 전체 장면을 생성해줘.
```

## 중요한 전제

이 저장소만 설치한다고 완전한 pack-backed 제작이 되는 것은 아닙니다.

OpenCrab 기반 제작을 하려면 사용자의 OpenCrab 워크스페이스에 와디즈 상세페이지 온톨로지팩이 설치되어 있고, 해당 팩들이 프로젝트에 연결되어 있어야 합니다. 팩이 없거나 retrieval smoke test가 실패하면 이 스킬은 기획 프레임워크 또는 콘셉트 제작 프로토콜로만 작동합니다.

## 상태 게이트

| 상태 | 의미 | 허용되는 결과물 |
|---|---|---|
| `pack_not_verified` | OpenCrab 와디즈팩 설치/검색이 확인되지 않음 | 기획 골격, 필요팩 안내 |
| `pack_retrieval_weak` | 팩은 있으나 검색 결과가 메타데이터/핸드오프 수준 | 근거 보강 리포트, production brief |
| `asset_gate_conditional` | 기획은 가능하지만 최종 판매용 자산이 부족 | 컷블루프린트, 프롬프트 브리프 |
| `concept_generation_allowed` | 사용자가 명시적으로 콘셉트 생성을 원하고 제품 참조가 충분함 | 콘셉트 이미지, 갤러리, ZIP, QA 리포트 |
| `final_production_allowed` | pack/fact/asset/OCR/logo/policy/claim 게이트 통과 | 최종 판매 후보 상세페이지 패키지 |

## 콘셉트와 최종본 구분

콘셉트 이미지가 잘 나왔다고 곧바로 판매용 최종본은 아닙니다.

```json
{
  "concept_generation_status": "not_started | complete | failed",
  "production_asset_status": "missing | incomplete | ready",
  "publication_status": "blocked | review_required | ready"
}
```

최종 판매용으로 부르려면 OCR/text-match, 공식 로고/브랜드 에셋, asset truth level, 정책 문구, claim alignment 검증이 필요합니다.

## 포함 파일

- `wadiz-detail-page-production/SKILL.md`: 스킬 진입점과 운영 규칙
- `wadiz-detail-page-production/README.md`: 스킬 폴더 단위 설치/사용 안내
- `wadiz-detail-page-production/references/production-workflow.md`: 실제 제작 워크플로우
- `wadiz-detail-page-production/references/base-ecommerce-pipeline.md`: ecommerce 백본 실행 계약
- `wadiz-detail-page-production/references/base-ecommerce-clone/`: 기존 ecommerce-detail-page 핵심 레퍼런스/스크립트 복사본
- `wadiz-detail-page-production/references/luckyball-pilot-lessons.md`: 럭키볼 파일럿에서 나온 QA/생성 교훈
- `docs/creation-process.md`: 제작 과정과 설계 이유
- `examples/`: 샘플 입력/출력 문서
- `pack-manifest.example.json`: OpenCrab 팩 연결 예시 manifest

## 출처와 경계

이 스킬은 와디즈 상세페이지를 그대로 복사하기 위한 도구가 아닙니다. 와디즈식 설득 구조, 섹션 흐름, 소구점, 증거 배치, QA 규칙을 참고하여 새로운 상품 상세페이지를 설계하기 위한 제작 프로토콜입니다.

저장소에는 다음을 포함하지 않습니다.

- 와디즈 원본 HTML
- 와디즈 원본 이미지, GIF, 영상
- 크롤러 원본 데이터
- OpenCrab 온톨로지팩 ZIP
- private OpenCrab project ID, MCP URL, 인증 토큰
- 특정 상품의 가격, 혜택, 인증, 약관, 배송 정책

상품별 사실은 공식 URL, 판매자 제공 문서, 사용자 승인 자료로 별도 확인해야 합니다.

## 라이선스

이 저장소의 스킬 코드와 문서는 MIT License로 배포됩니다. 와디즈 원본 데이터, OpenCrab 온톨로지팩, 타사 상품 이미지나 원문 콘텐츠는 이 라이선스에 포함되지 않습니다.
