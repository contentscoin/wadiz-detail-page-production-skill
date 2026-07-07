# Codex Image Integration (pumasi)

상세페이지 **이미지 생산 단계**는 pumasi `image-generator` 스킬과 동일한 Codex 이미지 경로를 사용합니다.
기획·카피·준법은 이 스킬(`ecommerce-detail-page`)이 담당하고, **픽셀 생성은 Codex `$imagegen` / MCP 위임**만 담당합니다.

## sangsea Codex MCP 설정

연결·점검: `{repo_root}/docs/pumasi-codex-mcp-setup.md`
검증 스크립트: `powershell -File {repo_root}/scripts/verify-codex-mcp.ps1`

Cursor/Claude 재시작 후 MCP `codex` Connected 확인.

## Environment Detection

| 환경 | 생성 경로 | 호출 방법 |
|------|----------|-----------|
| **Codex** | Codex 내장 `$imagegen` | `generation_skill: "$imagegen"` |
| **Claude Code / Cursor** | Codex 서브에이전트 | `mcp__codex__codex` (또는 프로젝트에 설정된 codex MCP) |
| **Cursor Agent (로컬)** | GenerateImage 또는 codex MCP | codex MCP 사용 가능 시 위와 동일, 없으면 사용자에게 Codex 환경 안내 |

> Claude Code / Cursor에는 픽셀 생성기가 없을 수 있습니다. **기획안 승인 후** codex MCP로 컷별 job을 위임하고 출력 경로만 회수합니다.

## Engine Selection (상세페이지 기본값)

한국어 카피가 **이미지 안에** 들어가야 하므로 기본 엔진은 **`gpt_image` (GPT Image 2)** 입니다.

| 엔진 | 상세페이지 적합도 | 비고 |
|------|------------------|------|
| `gpt_image` | **기본 (추천)** | 한글 텍스트 렌더링 상대적 강점. model-adapter `notion-gpt-image-2.md` 준수 |
| `nano_banana` | 보조 | 제품 질감·배경. **한글 in-image는 약함** — 텍스트 없는 히어로/디테일 컷만 |
| 혼합 | 선택 | 텍스트 컷=gpt_image, 무텍스트 제품컷=nano_banana (manifest에 engine별 기록) |

엔진별 프롬프트 변환은 **`model-adapter`** 에 위임합니다. 이 스킬은 컷별 **의도·카피·레이아웃**만 확정합니다.

## Project Layout

```
{project_root}/
├── brief.md                    # 승인된 기획안 (컷별 카피·ASCII·구성)
├── imagegen-jobs.json          # Codex 병렬 job 정의
├── prompts/
│   ├── cut-01.md               # model-adapter가 채운 최종 생성 프롬프트
│   └── cut-N.md
├── refs/                       # 상품 사진 (reference-binder 역할)
│   └── product-front.png
├── cuts/                       # 생성 결과
│   ├── cut-01.png
│   └── cut-N.png
├── index.html                  # build-image-gallery.mjs 출력
├── detail-page-manifest.json   # image-generator 호환 manifest
├── qa-report.md
└── {project_id}-cuts.zip
```

## imagegen-jobs.json Schema

`pet-runs/signal/imagegen-jobs.json` 패턴을 상세페이지 컷에 맞게 단순화합니다.

```json
{
  "schema_version": 1,
  "project_id": "toothbrush-recommended",
  "output_root": "projects/toothbrush-recommended",
  "primary_generation_skill": "$imagegen",
  "default_engine": "gpt_image",
  "jobs": [
    {
      "id": "cut-01",
      "kind": "detail-page-cut",
      "status": "pending",
      "prompt_file": "prompts/cut-01.md",
      "input_images": [
        {
          "path": "refs/product-front.png",
          "role": "product reference; preserve shape, color, label readability"
        }
      ],
      "output_path": "cuts/cut-01.png",
      "depends_on": [],
      "generation_skill": "$imagegen",
      "engine": "gpt_image",
      "parallelizable_after": [],
      "korean_text_required": [
        "매일 쓰는 칫솔, 더 꼼꼼하게 고르세요",
        "칫솔모 · 헤드 · 그립감 확인"
      ],
      "aspect_ratio": "9:16",
      "recording_owner": "parent"
    }
  ]
}
```

규칙:

- `id`는 반드시 `cut-01` … `cut-N` (zero-padded 2자리).
- 컷 job은 **서로 `depends_on` 없음** — 전부 병렬 (`parallelizable_after: []`).
- `korean_text_required`는 QA 기준문. 프롬프트에도 verbatim 반복.
- 상품 사진 없으면 `input_images: []`, brief에 `판매용 초안` 표기.

## Codex MCP Prompt Template (Claude Code / Cursor)

각 컷 job마다 codex MCP `prompt` 문자열에 아래 블록을 **자기완결**로 넣습니다.

```text
TASK: Generate one mobile ecommerce detail-page section image (detail-page cut).

ENGINE: gpt_image (GPT Image 2). Korean text MUST appear inside the image.

PROMPT (use verbatim after model-adapter adaptation):
<prompts/cut-XX.md 내용 전체>

REFERENCE INPUTS:
- product: {path} (weight 0.85) — preserve visible product only; do not invent labels

KOREAN TEXT (render exactly, bold sans-serif Korean font, mobile-readable size):
- "<헤드라인>"
- "<서브카피 또는 라벨>"

LAYOUT:
- Style: {쿠팡 실용 정보형 | 네이버 브랜드 스토리형 | ...}
- Aspect ratio: 9:16 vertical mobile detail section
- Naver/Coupang-style: headline top, product center, info blocks below

OUTPUT:
- save to: {project_root}/cuts/cut-XX.png
- return absolute output path and engine used

CONSTRAINTS:
- Do NOT omit Korean text, translate to English, or use placeholder bars
- Do NOT invent certifications, reviews, prices, or medical claims
- If reference missing, stop and report
```

멀티턴 수정: `mcp__codex__codex-reply`로 "한글 깨짐 → 텍스트 2블록만, 글자 크기 2배" 등 **regen_cycle** 지시.

## Coordinator / Worker Pattern

1. **Coordinator** (메인 에이전트): brief 승인 → `imagegen-jobs.json` 작성 → model-adapter로 `prompts/cut-*.md` 생성 → **모든 cut job 동시 launch** → manifest 수집 → QA → gallery/ZIP.
2. **Worker** (컷당 1): 할당된 `cut-XX`만 생성. 다른 컷 수정 금지.
3. 병렬 상한 시: 최대 batch launch 후 slot 비면 다음 batch. **순차 1→2→3 기본 금지**.

### Windows: Codex MCP 파일 복사 실패 (1326)

Codex MCP `sandbox: workspace-write`에서 Codex가 PowerShell/Node로 출력 경로에 복사할 때 `CreateProcessWithLogonW failed: 1326`이 발생할 수 있습니다. **이미지 생성 자체는 성공**하고 `%USERPROFILE%\.codex\generated_images\{session-id}\`에 PNG가 남습니다.

**Coordinator 회수 패턴 (권장):**

1. Codex MCP 호출 시 `output_path`는 job 정의에만 기록 (Codex 복사 실패를 가정).
2. 병렬 job 완료 후 coordinator가 최신 session 폴더(`019ec52f-*` 등)를 시간순 매핑.
3. Shell로 `Copy-Item` → `{project_root}/cuts/cut-XX.png`.
4. gallery/ZIP/manifest 갱신.

**완화 시도 (선택):** `sandbox: danger-full-access` — 환경에 따라 1326이 계속되면 coordinator 회수가 SSOT.

**CLI (Cursor 로컬):** task 파일을 stdin으로 전달하면 인자 파싱 오류를 피할 수 있습니다.

```powershell
Get-Content projects/{id}/tasks/cut-07.task.txt -Raw |
  codex exec -s danger-full-access --dangerously-bypass-approvals-and-sandbox -C {repo_root} -
```

회수 스크립트: `{repo_root}/scripts/recover-codex-cuts.ps1`

**컷 번호 매핑:** 병렬 완료 순서 ≠ cut-01…06. 회수 후 한글 헤드라인으로 `prompts/cut-*.md`의 `korean_text_required`와 대조해 파일명 재배치.

## model-adapter Hooks (한글 in-image)

GPT Image 2용 프롬프트 끝에 반드시 포함:

```text
Render the following Korean text exactly inside the image using bold sans-serif Korean typography (Pretendard or Apple SD Gothic Neo style), high contrast, mobile-readable size:
- "<line 1>"
- "<line 2>"
Do not translate, omit, or replace with English. No placeholder text bars.
```

`model-adapter/guides/notion-gpt-image-2.md` §텍스트 렌더링 팁 3 준수.

## detail-page-manifest.json

`image-generator` 스킬 출력과 호환:

```json
{
  "skill_version": "ecommerce-detail-page v1.0-pumasi",
  "project_id": "...",
  "environment": "claude_code",
  "engine_default": "gpt_image",
  "image_asset_manifest": [
    {
      "asset_id": "cut-01",
      "type": "detail_page_cut",
      "subtype": "hero",
      "prompt_used": "...",
      "reference_inputs": [{ "role": "product", "path": "refs/...", "weight": 0.85 }],
      "engine": "gpt_image",
      "output_path": "cuts/cut-01.png",
      "korean_text_required": ["..."],
      "status": "done",
      "qa_flag": "pass",
      "regen_cycle": 0
    }
  ]
}
```

| qa_flag | 처리 |
|---------|------|
| `pass` | manifest `done` |
| `regen` | 동일 reference, 프롬프트에 한글 verbatim 강화 후 codex 재호출 (`regen_cycle++`) |
| `blocked` | guardrail-check (허위 인증·의료 표현 등) |
| `escalate` | 3-cycle 초과 → 사람 검수 |

## QA → Regen Loop

[image-production-workflow.md](image-production-workflow.md)의 Korean Text QA와 동일. 실패 컷만 codex regen.

Regen 프롬프트 추가 지시:

1. 승인된 한글 문구 verbatim 재삽입
2. 텍스트 블록 수 축소 (최대 3~4줄)
3. 글자 크기 확대
4. 레이아웃 단순화 (히어로 + 제품 + 2 라벨)

## Gallery & Delivery

```bash
node scripts/build-image-gallery.mjs \
  projects/{project_id}/cuts \
  projects/{project_id}/index.html
```

ZIP: `cuts/` 전체 + `brief.md` + `qa-report.md` + `detail-page-manifest.json`.

## Upstream / Downstream Skills

| 단계 | 스킬 |
|------|------|
| 라우팅 (선택) | `intake-router` — "상세페이지" → pumasi, `format: detail_page` |
| 기획 | **ecommerce-detail-page** (this) |
| 프롬프트 적응 | `model-adapter` — gpt_image/nano_banana |
| 실행 | `image-generator` 패턴 / codex `$imagegen` |
| QA | `qa-review` (선택) 또는 내장 Korean text QA |
| 준법 | `copy-compliance.md`, `guardrail-check` (과장·허위 주장) |

## What NOT To Do

- 기획 단계에서 SVG/Sharp/Photoshop 텍스트 오버레이로 한글 합성 (사용자 명시 요청 시만)
- nano_banana 단독으로 한글 heavy 컷 생성 후 "완료" 처리
- 12컷 계획을 1장 세로 합본으로 축소
- codex 없이 "이미지 생성됐다"고 가정
