# Wadiz Detail Page Production

이 폴더가 설치되는 공통 스킬입니다. 카테고리·주제·상품별 기획부터 카피 검증, OpenCrab 근거, GPT Image 2.5 작업 준비, 실제 GIF, 미리보기/ZIP 납품을 연결합니다.

배포 메타데이터는 `release.json`의 v0.3.0입니다. 설치 ZIP에는 이 폴더와 `LICENSE`, `THIRD_PARTY_NOTICES.md`, `PACKAGE-MANIFEST.json`, `SHA256SUMS`가 함께 있습니다. ZIP을 풀어 해당 폴더를 비어 있는 새 스킬 경로에 복사한 뒤 `scripts/`에서 `npm ci`를 실행합니다. 기존 설치 폴더는 먼저 별도 백업해 새 버전과 파일을 섞지 않습니다. 전체 ZIP 체크섬은 배포된 `.zip.sha256`와 대조합니다.

## 사용

```text
Use $wadiz-detail-page-production to plan, validate, and produce a product-specific
Korean detail page with image/GIF delivery and source-bound copy.
```

`SKILL.md`에서 시작하고 요청 단계에 필요한 레퍼런스만 읽습니다. 기본 기획은 가변 섹션이고 12/15컷은 호환 프리셋입니다. sangse의 8가지 구매 질문은 고객 판단의 누락을 검사하며 한 가지 순서를 강제하지 않습니다.

## 설치

Node.js 22.0.0 이상에서 저장소 루트에서 설치합니다. 스킬 실행에 필요한 스키마·자산·스크립트와 저작권 고지를 함께 복사합니다.

```powershell
$wadizSkillDir = Join-Path $env:USERPROFILE '.codex\skills\wadiz-detail-page-production'
if (Test-Path -LiteralPath $wadizSkillDir) { throw '기존 스킬을 별도 백업한 뒤 새 설치 폴더를 준비해 주세요.' }
New-Item -ItemType Directory -Path $wadizSkillDir | Out-Null
Copy-Item -Recurse '.\wadiz-detail-page-production\*' $wadizSkillDir
Copy-Item '.\LICENSE' $wadizSkillDir
Copy-Item '.\THIRD_PARTY_NOTICES.md' $wadizSkillDir
Push-Location (Join-Path $wadizSkillDir 'scripts')
npm ci
Pop-Location
```

다른 에이전트는 동일 폴더를 해당 환경의 스킬 경로에 등록합니다. 런타임·개인 프로필·토큰은 별도 설정이며 [platform-and-runtime-adapters.md](references/platform-and-runtime-adapters.md)를 따릅니다.

## 레퍼런스

| 요청 | 읽을 파일 |
|---|---|
| 기획·카피·이미지/GIF·납품 판단 | [production-workflow.md](references/production-workflow.md) |
| 실행 명령·인터페이스·레거시 import | [base-ecommerce-pipeline.md](references/base-ecommerce-pipeline.md) |
| 상품군별 필수 정보·주제별 구조 | [category-playbooks/README.md](references/category-playbooks/README.md) |
| 이미지 handoff·결과 출처·GIF 설정 | [media-production.md](references/media-production.md) |
| 팩 설치와 검색 가능 여부 | [opencrab-public-install.md](references/opencrab-public-install.md) |
| 한글·가격·규격·정책의 정확한 텍스트 | [layered-production.md](references/layered-production.md) |
| 기존 사례의 조건부 QA·디자인 개선 | [case-history-routing.md](references/case-history-routing.md) |

## 실행과 완료

이미지 생성은 `codex_native`/`ima2`로 실제 GPT Image 2.5와 참조 전달 지원이 확인된 경우만 진행합니다. 준비된 요청을 실제 도구로 실행하고 반환 결과의 모델·참조·파일 출처를 기록해야 합니다. 별도 API 경로와 구형 모델 자동 대체는 없습니다. 유료 생성 전 예상 사용량/비용과 범위 승인이 필요합니다.

GIF는 이미지 프레임 또는 제공된 실사 영상으로 제작하며 FFmpeg/FFprobe가 필요합니다. 성능 증명에는 실사 근거를 사용합니다. 이미지/GIF 실물 검수, 상품/카피/정책 일치, 순서·미리보기·ZIP 검사 결과를 남기고, concept/자산 완성/publication 상태를 따로 기록합니다.

팩 조회나 자산이 부족하면 기획·프롬프트·조건부 콘셉트 상태를 표시합니다. OpenCrab 사례와 생성 장면은 상품 사실·실제 리뷰·인증을 대신하지 않습니다.

## 출처

공통 구매 질문·스타일·카피 검증은 [contentscoin/sangse](https://github.com/contentscoin/sangse), 기존 ecommerce 백본은 [aisyncclub/detail_page_codex_skill](https://github.com/aisyncclub/detail_page_codex_skill)을 참고합니다. 설치 시 `LICENSE`와 `THIRD_PARTY_NOTICES.md`를 함께 유지합니다. 원문 와디즈 미디어와 private OpenCrab 인증은 배포하지 않습니다.
