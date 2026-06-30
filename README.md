# 와디즈 상세페이지 제작 Codex Skill

`wadiz-detail-page-production`은 와디즈 스타일의 한국어 이커머스 상세페이지를 기획, 제작, QA할 때 사용하는 Codex skill입니다. 핵심은 와디즈 원본 페이지를 복사하는 것이 아니라, OpenCrab에 설치된 와디즈 상세페이지 온톨로지 팩을 조회해 상품에 맞는 설득 구조, 컷 순서, 카피 밀도, 증거 배치, GIF/시연 위치, 구매 불안 해소, claim QA를 조립하는 것입니다.

## 중요한 전제

이 저장소만 설치하면 완전한 pack-backed 제작이 되지는 않습니다.

반드시 사용자의 OpenCrab 워크스페이스에 와디즈 상세페이지 온톨로지 팩이 설치되어 있고, 해당 팩들이 OpenCrab 프로젝트에 등록되어 있어야 합니다. 팩이 없으면 이 skill은 제작 프레임워크로만 동작하며, 실제 와디즈 레퍼런스 근거 기반 제작은 할 수 없습니다.

## 포함된 것

- Codex skill 본문: `wadiz-detail-page-production/SKILL.md`
- OpenCrab 팩 설치 및 프로젝트 등록 게이트
- 팩 manifest 예시
- 제작 과정 문서
- 샘플 상품 brief와 샘플 산출물
- smoke test 기준
- 출처와 사용 경계 문서

## 포함하지 않는 것

- 와디즈 원본 HTML
- 와디즈 원본 이미지, GIF, 영상
- 크롤링 원본 데이터
- OpenCrab ontology pack ZIP
- private OpenCrab project ID, MCP URL, 인증 토큰
- 특정 상품의 가격, 혜택, 인증, 약관 데이터

## 설치

1. 이 저장소를 clone합니다.

```powershell
git clone https://github.com/contentscoin/wadiz-detail-page-production-skill.git
```

2. skill 폴더를 Codex skill 경로로 복사합니다.

```powershell
$src = ".\wadiz-detail-page-production-skill\wadiz-detail-page-production"
$dst = "$env:USERPROFILE\.codex\skills\wadiz-detail-page-production"
Copy-Item -Recurse -Force $src $dst
```

3. Codex를 새 세션으로 열거나 skill 목록이 갱신되도록 재시작합니다.

4. 다음처럼 호출합니다.

```text
$wadiz-detail-page-production 을 사용해서 이 상품의 와디즈 스타일 상세페이지 컷 구조와 제작 계획을 만들어줘.
```

## OpenCrab 팩 준비

팩 기반 제작을 하려면 먼저 OpenCrab에서 와디즈 상세페이지 온톨로지 팩을 설치해야 합니다.

권장 흐름:

1. OpenCrab MCP 연결 확인
2. OpenCrab Marketplace 또는 team/company 배포 링크에서 와디즈 팩 설치
3. 설치된 package ID 확인
4. `wadiz_detail_page_full_fidelity_project` 프로젝트 생성
5. 프로젝트에 필수 pack family 등록
6. smoke test 실행
7. smoke test 통과 후 상세페이지 제작

필수 pack family:

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

자세한 절차는 [OpenCrab 설치 게이트](wadiz-detail-page-production/references/opencrab-public-install.md)를 참고하세요.

## 만들어진 과정

이 skill은 다음 순서로 만들어졌습니다.

1. 와디즈 상세페이지의 설득 구조를 원본 복제가 아닌 제작 패턴으로 분리
2. 섹션 흐름, 카피 패턴, 시각/GIF 사용, claim-evidence, 구매 불안 해소, offer/FAQ, production bridge로 pack family 정의
3. OpenCrab에서 pack-backed 제작에 필요한 project/workflow 구조 점검
4. private workspace 의존 정보를 제거하고 public install gate 추가
5. Codex skill 형식으로 정리한 뒤 validation 통과
6. GitHub 공개 배포용 README, 출처/경계 문서, pack manifest 예시 추가

상세한 제작 과정은 [제작 과정 문서](docs/creation-process.md)를 참고하세요.

## 샘플

실제 상품을 넣기 전, 아래 샘플로 skill이 어떤 형태의 입력과 출력을 기대하는지 확인할 수 있습니다.

- [샘플 상품 brief](examples/sample-product-brief.md)
- [샘플 상세페이지 컷 블루프린트](examples/sample-cut-blueprint.md)

샘플은 형식과 품질 기준을 보여주기 위한 예시입니다. 실제 제작에서는 OpenCrab pack 설치와 smoke test를 통과한 뒤 상품별 공식 출처로 fact map을 다시 만들어야 합니다.

## Smoke Test

OpenCrab 프로젝트 등록 후 아래 질의가 실질적인 상세페이지 공식을 반환해야 합니다.

```text
Using the Wadiz detail-page project packs, return a practical cut blueprint formula for a functional product detail page. Include section order, hook type, proof/GIF positions, copy density, objection handling, and claim QA. If only pack metadata is retrievable, say so clearly.
```

통과 기준:

- 섹션 순서가 나온다.
- 첫 후킹 방식이 나온다.
- 증거/GIF/시연 위치가 나온다.
- 컷별 카피 밀도와 시각 규칙이 나온다.
- 구매 불안 해소와 claim QA 기준이 나온다.
- 근거가 실제 와디즈 상세페이지 패턴 또는 온톨로지 규칙에서 나온다.

실패 기준:

- package snapshot metadata만 반환된다.
- 문서/chunk 없이 node/edge 숫자만 보인다.
- 무관한 상품군, 사무가구, 이미지 asset chunk가 반환된다.
- 일반적인 상세페이지 조언만 나오고 컷 구조로 바뀌지 않는다.

## 사용 예시

상품 사진과 URL이 있을 때:

```text
$wadiz-detail-page-production 을 사용해서 이 상품의 fact map, 12컷 상세페이지 구조, 이미지 생성 프롬프트, claim QA를 만들어줘.
상품 URL: https://example.com/product
상품 사진: 첨부 이미지 참고
목표 채널: 스마트스토어
```

팩 설치 상태를 먼저 점검할 때:

```text
$wadiz-detail-page-production 으로 현재 OpenCrab에 와디즈 상세페이지 팩이 설치되어 있고 프로젝트 smoke test를 통과하는지 확인해줘.
```

## 출처와 사용 경계

이 skill의 제작 논리는 와디즈 상세페이지를 분석해 얻은 구조적 패턴을 기반으로 합니다. 분석 대상은 섹션 흐름, 카피 문법, 시각 리듬, GIF/시연 사용, 소구점, 증거 배치, 구매 불안 해소, claim 위험 신호 같은 제작 패턴입니다.

이 저장소에는 와디즈 원본 콘텐츠가 포함되어 있지 않습니다. 원본 상세페이지, 이미지, GIF, 영상, HTML, 크롤링 원문, OpenCrab pack ZIP은 배포하지 않습니다.

`Wadiz` 및 와디즈 관련 상표와 원본 콘텐츠 권리는 각 권리자에게 있습니다. 이 skill은 원본을 복제하기 위한 도구가 아니라, 공개 또는 권한 있는 데이터에서 추출한 상세페이지 설계 패턴을 새 상품 제작에 적용하기 위한 작업 프로토콜입니다.

상품별 가격, 인증, 혜택, 배송, 환불, 약관, 수상, 성능 claim은 반드시 해당 상품 소유자 또는 공식 출처에서 다시 확인해야 합니다.

## 라이선스

이 저장소의 skill 코드와 문서는 MIT License로 배포합니다. 단, 와디즈 원본 데이터, OpenCrab ontology pack, 제3자 상품 이미지와 원문 콘텐츠는 이 라이선스에 포함되지 않습니다.
