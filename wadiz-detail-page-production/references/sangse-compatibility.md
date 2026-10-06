# sangse 기획·결과물 호환

sangse의 8가지 구매 질문은 빠진 구매 판단을 점검하는 기준이다. 새 페이지의 고정 순서가 아니다. 스타일은 `checkpoint`, `lookbook`, `offer-first`, `proof-first`, `spec-showcase`, `story-first`를 유지하되 실제 상품·주제와 근거에 맞춰 선택한다. `assets/sangse/`의 원본 규격과 출처는 루트 `THIRD_PARTY_NOTICES.md`에 귀속한다.

## 기존 프로젝트 가져오기

```sh
node scripts/import-sangse.mjs /path/to/sangse-project --out /path/to/new-project --category food --topic gift
```

입력은 `cuts.md`, `legal.md`, `raw-input.md`, `intake-checklist.md`이다. `cuts.md`는 필수이며 나머지가 없으면 호환 보고서에 기록한다. `--product-name`과 `--style`로 메타데이터를 명시할 수 있다. 카테고리·주제가 없으면 `unknown`으로 기록하므로 제작 전 확인해야 한다. `--ref`를 반복해 상품 기준 이미지를 전달한다. 기존 컷의 `image:`는 생성된 완성 컷일 수 있으므로 상품 기준 이미지로 자동 승계하지 않는다.

- `product-brief.json`: 상품 정보·미확인 사실·수치 출처 연결. 가져온 사실은 모두 `confirmation_needed`, `source.reviewed=false`이다. 원문 연결 통과가 사실 확인을 뜻하지 않는다.
- `page-plan.json`: 원래 컷 ID·순서·카피·시각 지시·법적 조건. 모든 기존 필드와 높이·템플릿은 `legacy`에 함께 보존한다.
- `media-jobs.json`: 컷마다 연결된 GPT Image 2.5 이미지 작업. 실물 상품에는 `requires_product_reference=true`를 기록하고, 기준 이미지를 전달하지 않으면 `blocked`, 전달하면 승인·모델 확인 전 `pending`이다. 서비스의 연출 이미지는 실물 상품 사진 없이 `pending`으로 준비할 수 있다.
- `legal.md`, `evidence-matrix.json`: 원래 거래 문구와 미확인 OpenCrab 근거 상태.
- `legacy-source-bundle.json`: 원본 문서 내용과 SHA-256. 입력 파일은 수정하지 않는다.
- `compatibility-report.json`: 누락 파일·미매핑 항목·역호환 한계·카피 슬롯·표현·정량 출처 검사.

새 출력 디렉터리만 허용한다. 원래 프로젝트 내부에 덮어쓰거나 기존 결과를 재사용하지 않는다. 원본의 가상·시연용 정보도 보존하되 실제 상품의 증거로 확인 처리하지 않는다.

상호 운용 시 기존 sangse 명령은 계속 원래 `cuts.md`·`legal.md`를 읽는다. 가변 섹션과 GIF를 추가한 JSON은 구형 결과물로 완전히 역변환되지 않는다. 이 한계는 호환 보고서에 기록한다.

## 구형 이미지 작업 변환

```sh
node scripts/convert-legacy-jobs.mjs old-imagegen-jobs.json --out new-imagegen-jobs.json --backend ima2 --model gpt-image-2.5-sunburst
```

`schema_version:1`이며 `engine:gpt_image`인 기존 작업만 변환한다. `nano_banana`와 다른 엔진은 명시적으로 거절한다. 새 경로는 `codex_native` 또는 `ima2`, 모델은 `gpt-image-2.5-sunburst` 또는 `gpt-image-2.5-flare`다. 완료·승인 상태는 재사용하지 않고 `pending`으로 초기화한다. 상품 참조가 없으면 `blocked`다. 서비스는 `--category service` 또는 원본의 명시적 `category:service`, 배경 작업은 원본의 `operation:background`로 상품 참조 조건을 해제한다. 변환은 모델 사용 가능 여부의 확인이나 생성 호출을 수행하지 않는다.

## 검사가 입증하는 범위

슬롯 검사는 원본 1000px 컷 템플릿의 글자 수·행 수 기준이다. 다른 폭의 렌더링 맞춤 여부는 별도로 확인한다. 표현 검사는 상류의 규칙을 보존한 기계 검사이며 법률 검토를 대신하지 않는다.

정량 출처 검사는 문장의 위치와 전체 문구, 실제 원문 인용의 존재를 확인한다. 다른 속성의 동일한 숫자, 문구 변경, 단위 변경을 기존 승인으로 재사용할 수 없다. 의미 검증과 계산 검증 상태는 항상 별도로 표시한다.
