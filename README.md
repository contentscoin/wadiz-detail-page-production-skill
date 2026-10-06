# 와디즈 상세페이지 프로덕션 스킬

상품 사실과 OpenCrab 와디즈 근거를 바탕으로 **카테고리 × 주제 × 상품별 기획, 카피 검증, GPT Image 2.5 이미지 작업, 실제 GIF, 납품 패키지**를 만드는 스킬입니다. [sangse](https://github.com/contentscoin/sangse)의 구매 질문·인터뷰·스타일·카피 슬롯·수치 출처 검사를 이 저장소의 공통 제작 규격에 통합합니다.

기본 기획은 상품에 필요한 섹션을 구성합니다. 12·15컷은 명시적으로 선택하는 호환 프리셋이며, 모든 상품에 같은 순서를 강제하지 않습니다.

## 설치

Node.js 20.9.0 이상이 필요합니다. GIF 변환에는 PATH에 있는 FFmpeg/FFprobe가 필요하며, 실제 지원 여부는 제작 환경에서 확인합니다.

### 릴리스 ZIP 설치

[Releases](https://github.com/contentscoin/wadiz-detail-page-production-skill/releases)에서 공개된 `wadiz-detail-page-production-v0.3.0.zip`과 `.zip.sha256`를 내려받은 뒤 설치합니다. 릴리스 게시 전에는 아래 소스 설치 또는 로컬 패키지 제작을 사용합니다.

```powershell
$wadizZip = '.\wadiz-detail-page-production-v0.3.0.zip'
$wadizExpectedHash = (Get-Content -LiteralPath "$wadizZip.sha256").Split(' ')[0]
if ((Get-FileHash -LiteralPath $wadizZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $wadizExpectedHash) { throw '릴리스 체크섬 불일치' }
Expand-Archive -LiteralPath $wadizZip -DestinationPath '.\wadiz-release-v0.3.0'
$wadizSkillDir = Join-Path $env:USERPROFILE '.codex\skills\wadiz-detail-page-production'
if (Test-Path -LiteralPath $wadizSkillDir) { throw '기존 스킬을 별도 백업한 뒤 새 설치 폴더를 준비해 주세요.' }
New-Item -ItemType Directory -Path $wadizSkillDir | Out-Null
Copy-Item -Recurse '.\wadiz-release-v0.3.0\wadiz-detail-page-production\*' $wadizSkillDir
Push-Location (Join-Path $wadizSkillDir 'scripts')
npm ci
Pop-Location
```

ZIP 안에 설치용 폴더, 라이선스 고지, 리소스별 SHA-256 manifest가 포함됩니다. 의존성·인증·실행 산출물은 포함하지 않습니다. 자세한 변경 내용은 [v0.3.0 릴리스 노트](docs/releases/v0.3.0.md)를 참고하세요.

### 소스 설치

```powershell
git clone https://github.com/contentscoin/wadiz-detail-page-production-skill.git
cd wadiz-detail-page-production-skill
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

다른 에이전트에서는 동일한 `wadiz-detail-page-production/` 폴더와 라이선스 고지를 해당 환경의 스킬 폴더에 등록합니다. Codex/Hermes의 개인 설정·OpenCrab 인증·메시지 채널은 포함하지 않습니다.

로컬 설치 ZIP은 추가 의존성 설치 없이 만들고 검사할 수 있습니다.

```powershell
node wadiz-detail-page-production/scripts/package-skill.mjs --out output/wadiz-detail-page-production-v0.3.0.zip
node wadiz-detail-page-production/scripts/package-skill.mjs --verify output/wadiz-detail-page-production-v0.3.0.zip
```

호출 예시:

```text
Use $wadiz-detail-page-production to plan a gift-focused detail page for this product,
validate its facts and OpenCrab evidence, and prepare GPT Image 2.5 image/GIF jobs.
```

```text
이 상품의 문제 해결형 상세페이지를 기획해줘. 제공한 사진·상품 사실을 기준으로
카피와 GIF 목적을 먼저 정하고, 승인 후 이미지와 GIF를 제작해줘.
```

## 제작 흐름

| 단계 | 결과 |
|---|---|
| 상품 인터뷰 | ProductBrief: 카테고리·주제·SKU·옵션·사실·자산·미확인 사항 |
| OpenCrab 조회 검증 | 실제 원문 관련성·출처를 검사한 근거표 |
| 가변 기획 | PagePlan: 고객 질문·카피·근거·시각 구성·미디어·배치 이유 |
| 카피 검수·승인 | 구매 질문 누락, 카피 슬롯, 수치 출처와 실제 사실/계산 검사 |
| 이미지 작업 준비 | MediaJob: 확인된 GPT Image 2.5 도구로 전달할 승인 작업 |
| 이미지·GIF 제작 | 실제 결과 출처, GIF·정지 대체 이미지·변환 검수 |
| 납품 | 순서대로 조립된 미리보기·파일·manifest·QA·ZIP |

카테고리는 식품·뷰티·테크/가전·패션·리빙·서비스, 주제는 선물·문제 해결·신제품·프리미엄·비교·재출시를 지원합니다. 펀딩/메이커 조건과 복합 상품의 정보 요구를 함께 반영합니다. sangse의 8가지 구매 질문은 누락 검사이며 섹션 순서가 아닙니다.

명령과 작업 예시는 [실행 계약](wadiz-detail-page-production/references/base-ecommerce-pipeline.md), 인터페이스·호환은 [통합 안내](docs/integration.md), 제작 판단은 [워크플로](wadiz-detail-page-production/references/production-workflow.md)를 참고하세요.

## 이미지·GIF 실행 조건

이미지 생성은 자체 도구(`codex_native`) 또는 `ima2`만 사용합니다. GPT Image 2.5와 참조 이미지 전달, 필요한 편집 기능을 실제 실행 환경에서 확인해야 합니다. 모델 확인이 없는 자체 도구나 연결되지 않은 ima2 서버는 작업을 보류합니다. 준비된 요청 파일은 생성 완료가 아니며, 실제 결과의 모델·참조·출력 출처를 별도로 기록합니다. 별도 API 과금 경로와 구형 모델 자동 대체는 제공하지 않습니다.

유료 생성 전 예상 사용량/비용과 범위를 확인받습니다. GIF는 검증된 이미지/생성 설명 이미지의 프레임 시퀀스 또는 제공된 실사 영상을 변환합니다. AI 영상 모델 호출은 포함하지 않습니다. 실사 자료가 없는 성능 증명은 생성 장면으로 대체하지 않습니다.

자동 QA는 파일·치수·재생·수치 연결 등을 검사합니다. 상품 외형·글자·사실·움직임·배치의 실제 검수와 판매용 승인도 필요합니다. 미리보기 패키지와 publication-ready 상태는 구분됩니다.

## OpenCrab·출처·호환

OpenCrab 팩은 사용자의 워크스페이스에서 조회합니다. 이 저장소에 원문 페이지, 와디즈 원본 이미지/GIF, 팩 ZIP, private ID나 인증을 포함하지 않습니다. 검색이 원문 없는 메타데이터·다른 상품군을 반환하면 해당 근거를 채택하지 않습니다. 오픈크랩의 설득 구조는 현재 상품의 가격·효능·인증·후기를 증명하지 않습니다.

`sangse`의 기존 `cuts.md`, `legal.md`, 레거시 이미지 작업을 새 폴더로 가져오는 변환기를 제공합니다. 원본과 거래 조건을 보존하며 변환 보고서에 새 규격의 역호환 제한을 기록합니다. 기존 명령과 기능은 [sangse 저장소](https://github.com/contentscoin/sangse)에서 유지합니다.

## 라이선스

이 저장소의 코드·문서는 [MIT](LICENSE)입니다. sangse에서 이식한 자료의 `Copyright (c) 2026 fivetaku`와 MIT 조건은 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)에 보존합니다. 기존 ecommerce 백본의 출처는 [aisyncclub/detail_page_codex_skill](https://github.com/aisyncclub/detail_page_codex_skill)입니다. 와디즈 원본 콘텐츠, OpenCrab 팩, 타사 상품 자료는 이 라이선스에 포함되지 않습니다.
