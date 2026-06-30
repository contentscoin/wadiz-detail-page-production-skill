# 제작 과정

이 문서는 `wadiz-detail-page-production` Codex skill이 어떤 사고 과정과 검증 기준으로 만들어졌는지 설명합니다.

## 1. 목표 정의

목표는 와디즈 상세페이지를 그대로 복사하는 것이 아니라, 와디즈식 상세페이지가 설득을 조립하는 방식을 AI가 재사용할 수 있게 만드는 것이었습니다.

따라서 분석 대상은 원문 문장이나 이미지를 그대로 가져오는 것이 아니라 다음과 같은 제작 패턴입니다.

- 첫 화면에서 무엇을 먼저 약속하는가
- 문제 제기와 공감은 어디에 배치되는가
- 제품 등장은 어느 타이밍에 나오는가
- 기능 설명과 증거는 어떤 순서로 붙는가
- GIF나 시연 이미지는 장식인지, 증거인지
- 구매 불안은 FAQ, 비교, 후기, 고시정보 중 어디서 해소되는가
- claim이 과장되지 않도록 어떤 증거가 필요한가
- 모바일 상세페이지에서 문구 밀도와 이미지 리듬은 어떻게 조절되는가

## 2. 온톨로지 팩 구조화

처음에는 많은 노드와 엣지를 만드는 것보다, 제작 시점에 실제로 꺼내 쓸 수 있는 pack family가 중요하다고 판단했습니다.

필수 pack family는 다음처럼 정리했습니다.

- `source_reference`: 원본 레퍼런스와 페이지 단위 근거
- `normalized_page_unit`: 페이지, 섹션, 미디어, 옵션, 고시정보 분해
- `section_flow`: 상세페이지 섹션 순서와 전환 리듬
- `copy_pattern`: 한국어 모바일 카피 문법과 문구 밀도
- `visual_block`: 이미지 구성, 텍스트 배치, 컷 리듬
- `gif_motion_proof`: GIF/시연/움직임 증거의 역할
- `claim_evidence`: 주장별 증빙 필요성과 위험 신호
- `objection_resolution`: 구매 불안, FAQ, 반박 해소
- `offer_pricing`: 가격, 옵션, 혜택, CTA 구성
- `category_playbook`: 카테고리별 설득 순서
- `assembly_formula`: 컷 수, 컷 순서, 섹션 조립 공식
- `production_bridge`: 실제 이미지 상세페이지 산출 규격
- `product_fact_map`: 상품별 검증 사실과 미확인 정보
- `visual_ocr_qa`: 한글 가독성, 이미지 겹침, OCR QA
- `runtime_execution_bridge`: 실제 렌더링과 패키징 실행 규칙

## 3. OpenCrab 연동 기준

OpenCrab 프로젝트는 단순히 pack이 많다고 충분하지 않습니다. 제작 skill이 신뢰하려면 다음 조건이 필요합니다.

- 프로젝트에 필요한 pack family가 모두 연결되어 있어야 함
- 검색 결과가 pack metadata만 반환하지 않아야 함
- 실제 와디즈 상세페이지 패턴, 섹션, 카피, 시각 규칙이 검색되어야 함
- 무관한 asset chunk나 다른 상품군이 섞이면 production-ready로 보지 않아야 함
- smoke test가 실제 컷 블루프린트로 변환되어야 함

이 기준 때문에 public skill에는 `opencrab-public-install.md`를 별도로 넣었습니다. 다른 사용자는 maintainer의 private OpenCrab 프로젝트를 볼 수 없으므로, 자기 workspace에 pack을 설치하고 project smoke test를 통과해야 합니다.

## 4. Skill화

Codex skill은 아래 원칙으로 작성했습니다.

- private workspace ID, MCP URL, 토큰, 로컬 경로를 공개 배포본에서 제거
- OpenCrab pack 설치 전에는 pack-backed production이라고 말하지 않기
- 상품 fact와 와디즈 reference logic을 분리
- 기존 상품 이미지를 그대로 붙이는 방식보다 제품 디테일 분석 후 새 이미지 생성 프롬프트를 우선
- 최종 산출 전 claim QA, visual/OCR QA, 모바일 가독성 확인을 요구

## 5. 공개 배포 경계

GitHub에는 다음만 포함했습니다.

- Codex skill
- 한글 README
- OpenCrab 설치 게이트
- pack manifest 예시
- source/boundary 문서
- 제작 과정 문서
- 샘플 brief와 샘플 산출물

GitHub에는 다음을 포함하지 않았습니다.

- 와디즈 원본 HTML
- 와디즈 원본 이미지, GIF, 영상
- 크롤링 원본 데이터
- OpenCrab ontology pack ZIP
- private OpenCrab project ID
- MCP URL, 인증 토큰

## 6. 다음 고도화 과제

public 사용자가 완전히 같은 품질로 쓰려면 다음이 필요합니다.

1. 공개 설치 가능한 OpenCrab consolidated ontology pack 제작
2. pack family별 retrieval smoke test 통과
3. OpenCrab Marketplace 또는 team/company listing 배포
4. `pack-manifest.example.json`을 실제 listing/package manifest로 갱신
5. 새 workspace에서 install부터 project run까지 재현 검증
