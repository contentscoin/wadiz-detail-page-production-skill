# GPT Image 2.5 이미지·GIF·납품 실행 규격

실행 위치는 `wadiz-detail-page-production/scripts`입니다. `npm ci`로 기존 의존성을 설치하고 GIF 변환에는 `ffmpeg`와 `ffprobe`를 PATH에 준비합니다. 이미지 준비·결과 연결은 생성 비용을 발생시키지 않습니다.

## 이미지 준비와 결과 연결

```text
node prepare-media-jobs.mjs PROJECT/media-jobs.json --out PROJECT/request-plan.json
node prepare-media-jobs.mjs PROJECT/media-jobs.json --out PROJECT/approved-request-plan.json --approval PROJECT/generation-approval.json
node import-media-result.mjs PROJECT/approved-request-plan.json --job media-01 --result PROJECT/tool-result.json --out PROJECT/media-results.json
```

준비기는 실제 ima2 버전·capabilities·모델 목록·명령 도움말을 읽습니다. 서버 시작, 설정 변경, 생성은 실행하지 않습니다. 백엔드는 `codex_native`와 `ima2`만 허용합니다. 모델은 공통 계약의 정확한 `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`와 확인된 `2026-09-08` 스냅샷입니다. `gpt-image-2`, 메인라인 추론 모델, 알 수 없는 별칭으로 대체하지 않습니다.

현재 native 이미지 도구 계약에는 모델 선택 항목이 없어 2.5 고정이 검증되지 않습니다. ima2는 `oauth`·`native`·`codex` 중 명시적으로 문서화된 lane과 정확한 이미지 모델 고정 플래그·provider 계약이 필요합니다. generic `--model`이 추론 모델을 고르는 옵션이라는 사실만으로 2.5 고정 지원을 추정하지 않습니다. API 전용, 외부 과금 또는 알 수 없는 lane은 차단합니다. 요청한 2.5 모델·해당 lane의 실행 계약을 확인하지 못하면 `blocked`입니다. `--capabilities`는 테스트 또는 문서화된 실행환경 계약을 주입하는 옵션이며, JSON에 모델 이름을 적는 것만으로 실제 지원이 입증되지는 않습니다. 편집은 별도의 정확한 2.5 `edit` 계약이 필요하며 `gen`으로 대체하지 않습니다.

`input_refs`는 `{file,role,truth_level?}`이며 준비 단계에서 로컬 정적 PNG/JPEG/WebP 파일과 SHA-256을 확인합니다. `prompt` 또는 `prompt_file`을 읽고 실행 요청을 내보냅니다. GIF의 `frame_jobs`는 부모의 백엔드·모델·참조를 상속한 별도 이미지 작업으로 펼칩니다. GIF 스토리보드 자체는 `awaiting_verified_frames_or_actual_footage` 상태입니다.

사용량 승인은 다음 형식입니다. 펼쳐진 프레임마다 실제 작업 ID를 승인해야 합니다.

```json
{"approved":true,"job_ids":["media-01","media-02-frame-1","media-02-frame-2"],"estimated_usage":"이미지 3장, 확인한 계정 사용량 범위"}
```

준비 결과의 `execution_allowed:true`는 사용자가 승인한 작업을 도구에 넘길 수 있다는 뜻이며 생성 완료를 의미하지 않습니다. 준비기가 명령을 실행하거나 외부 API를 호출하지 않습니다.

실제 생성 후 도구 응답 또는 내장 메타데이터에 **실제 모델과 참조 전달 정보가 있어야** 결과를 연결할 수 있습니다. 해당 정보가 없는 이미지는 2.5 성공으로 등록하지 않습니다. `tool-result.json`의 형식은 다음과 같습니다.

```json
{
  "file":"media/media-01.png",
  "provenance":{
    "backend":"ima2",
    "model_actual":"gpt-image-2.5-sunburst",
    "request_id":"actual-tool-request-id",
    "input_refs":[{"sha256":"prepared-reference-sha256"}],
    "output_sha256":"actual-output-sha256",
    "model_evidence":{
      "source":"tool_response",
      "model_actual":"gpt-image-2.5-sunburst",
      "request_id":"actual-tool-request-id",
      "input_refs":[{"sha256":"prepared-reference-sha256"}]
    }
  },
  "qa":{"copy_reviewed":false,"visual_reviewed":false,"product_identity_reviewed":false}
}
```

`model_evidence.source`는 `tool_response` 또는 `embedded_metadata`입니다. 수동 추측을 도구 응답처럼 기록하지 않습니다. 연결기는 준비된 작업의 승인·모델·참조 해시와 실제 출력 해시·이미지 디코딩을 대조하고 기존 작업 ID를 덮어쓰지 않습니다. alias와 dated snapshot을 서로 바꿔 기록하지 않고 준비 시 선택한 정확한 ID를 유지합니다.

## 실제 GIF 제작

```text
node build-motion-cut.mjs PROJECT/motion-config.json PROJECT/motion
```

이미지 기반 설정:

```json
{
  "id":"options-gif",
  "source_type":"verified_images",
  "purpose":"options",
  "frames":["refs/option-a.png","refs/option-b.png"],
  "width":1080,
  "duration_seconds":3,
  "max_bytes":8000000
}
```

실사 설정은 `frames` 대신 `footage:"refs/actual-demo.mp4"`, `source_type:"actual_footage"`를 사용합니다. `purpose:"performance-proof"`는 실사 영상만 허용합니다. 파일이 실사라는 선언은 효능이나 성능 주장 자체의 검증을 대신하지 않습니다.

생성 이미지로 만든 설명 GIF는 `source_type:"generated_explainer"`를 사용하고 `frame_results`에 연결기가 확인한 프레임 결과 전체를 넣습니다. 각 결과의 `prepared_job`과 2.5 모델·참조·출력 해시를 검사합니다. 생성 프레임을 `verified_images`로 바꿔 적지 않습니다.

입력 프레임은 같은 크기여야 하며 실제 다른 화면이 최소 2개 필요합니다. 이미지 시퀀스는 정방향·역방향으로 반복해 끝과 시작을 연결합니다. 실사 영상은 첫·끝 연결에 대한 별도 눈 검수가 필요합니다. 최대 용량 안에서 색상 수와 실사 FPS를 조절하며, 제한을 맞추지 못하면 실패합니다.

결과는 `ID.gif`, `ID.poster.png`, `ID.preview.html`, `ID.motion-meta.json`입니다. GIF 디코딩으로 프레임 수·움직임·무한 반복·크기·용량을 측정합니다. `visual_reviewed`, `loop_reviewed`, `product_identity_reviewed`는 자동 승인하지 않습니다.

## 페이지 조립과 납품

```text
node build-delivery-package.mjs PROJECT --out PROJECT/delivery
node build-delivery-package.mjs PROJECT --review-snapshot
node build-delivery-package.mjs PROJECT --review-media-snapshots --media-results PROJECT/composed-results.json
node build-delivery-package.mjs PROJECT --out PROJECT/publication-delivery --publication
```

`PROJECT/page-plan.json`과 `media-results.json`의 `section.media_job_id` ↔ `result.job_id`가 정확히 연결되어야 합니다. 중복·누락·실패 결과나 깨진 이미지·정지 GIF는 납품을 중단합니다. 결과 예시는 다음과 같습니다.

```json
{
  "schema_version":1,
  "results":[{
    "job_id":"media-02",
    "status":"complete",
    "file":"motion/options-gif.gif",
    "poster":"motion/options-gif.poster.png",
    "kind":"gif",
    "truth_level":"verified_images",
    "qa":{"copy_reviewed":true,"visual_reviewed":true,"product_identity_reviewed":true,"loop_reviewed":true}
  }]
}
```

생성 GIF는 `truth_level:"generated_concept"`와 `motion_meta` 경로를 추가합니다. 납품기는 GIF 출력 해시와 프레임의 2.5 출처를 다시 대조합니다. 정적 생성 이미지는 연결기가 반환한 출처 필드를 그대로 유지합니다. 참조 사례 이미지인 `reference_only`는 검수용으로만 배치하며 게시 준비 완료로 처리하지 않습니다.

게시 준비에는 모든 미디어의 카피·시각·상품 정체성 검수와 GIF 반복 검수가 필요합니다. `--review-media-snapshots`는 검수할 현재 파일의 해시를 출력하며 아무 검수도 승인하지 않습니다. 검토자는 실제 이미지·GIF·정지 이미지·카피·상품 기준 사진을 확인한 뒤 해당 결과의 `qa.review_binding`에 출력한 binding을 기록하고 검수 flags를 승인합니다.

binding은 `media_sha256`, `poster_sha256`(없으면 null), `copy_sha256`, `composition_sha256`(없으면 null), `references_sha256`입니다. 파일·poster·카피·합성 설정·기준 사진이 바뀌거나 binding이 없으면 기존 true flags는 게시 준비에 사용할 수 없습니다. 합성기는 기존 binding과 검수 flags를 초기화합니다. 납품기는 검수한 정확한 bytes를 패키지에 쓰고, 생성 결과가 계획의 기준 사진을 실제 출처에서 유지했는지도 검사합니다.

동시에 현재 상품 근거와 기획을 다시 검사하여 오류·누락·자료 필요 문구가 없어야 합니다. 거래 조건 `legal.md`도 비어 있거나 미해결 문구가 있으면 게시를 차단합니다. `plan.pack_status`는 `pack_verified`이거나 사용자가 승인한 대체 근거여야 합니다.

`--review-snapshot`은 기획·상품 설명·근거 매트릭스·실제 로컬 원문 해시를 묶은 현재 SHA-256을 출력합니다. 검토자는 검수한 해시를 `page-plan.json`의 `copy_approval:{"status":"approved","snapshot_sha256":"..."}`에 기록합니다. 대체 근거를 명시적으로 승인했다면 `alternate_source_approval:{"status":"approved","snapshot_sha256":"...","reason":"승인한 근거와 이유"}`를 함께 기록합니다. 원문 또는 카피가 바뀌면 승인은 무효가 됩니다.

기본 조립은 검수용 미리보기를 허용하고 `publication_status`를 `blocked`·`review_required`·`ready`로 표시합니다. `--publication`은 준비가 끝나지 않으면 산출하지 않습니다. 이 플래그가 실제 와디즈 업로드를 실행하지는 않습니다.

HTML은 섹션 순서대로 컷 이미지와 GIF를 연결하고 GIF bytes를 그대로 보존합니다. 기본 컷은 이미지 안에 카피가 들어간 합성본이므로 HTML에서 카피를 중복 출력하지 않습니다. 별도 텍스트 영역이 필요한 섹션만 `copy_render_mode:"separate"`를 명시합니다. 게시용 결과에는 검수 제목·QA 헤더가 표시되지 않습니다. `legal.md` 원문은 이스케이프한 실제 거래 조건 블록으로 페이지 하단에 배치합니다.

정지 대체 이미지와 모션 감소 환경 처리를 포함합니다. 결과는 `index.html`, `media/`, `page-plan.json`, 기획서, 원본 `product-brief.json`·`production-brief.md`·`legal.md`·`evidence-matrix.json`·선택적 호환 보고서, `qa-report.json`, `delivery-manifest.json`, `delivery.zip`입니다. 원본 문서는 byte를 보존해 복사합니다. ZIP은 명시한 납품 파일만 담고 `.env`·`.git`·의존성 폴더를 재귀 수집하지 않습니다. 기존 출력 폴더는 덮어쓰지 않습니다.
