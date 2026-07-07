# FMGS / premium service detail-page restart workflow

Use this reference when a user rejects a generated/detail-page draft and asks to start again from the beginning, especially for FMGS/CEO Golf, Wadiz-style service pages, or premium B2B intangible offers.

## Durable lesson

Do **not** jump straight back into image generation after a rejected detail-page draft. Restart from planning and move through gated artifacts:

1. Product/service detail-page planning
2. Cut-by-cut copy draft
3. Korean humanization + marketing copy refinement
4. Visual concept / wireframe brief
5. 1080×1600 production prompt set and runtime JSON artifacts
6. Wireframe or concept-only image generation
7. QA, regeneration queue, packaging, and only then publication review

The user’s correction was effectively: “처음부터 작업해줘. 단계별로 상품 상세페이지 기획부터.” Treat that as a workflow requirement for this class of task.

## Copy refinement pattern

When the user says the copy is awkward (`표현이 어색해`, `윤문 스킬로 윤문해줘`):

- Load/apply the Korean humanization workflow before rewriting.
- Remove planning/internal language from customer-facing copy: `설계합니다` repeated, `접점`, `확장`, `운영`, defensive `포함되지 않습니다`, exposed `확인 필요`.
- Rewrite into concrete buyer language: `대표님의 골프 일정이 기업을 알리는 시간이 됩니다`, `좋은 라운딩은 좋은 관계를 남깁니다`, `고객 초청 라운딩도 상담 가능합니다`.
- Keep legal/offer boundaries but make them sound like consultation guidance, not defensive disclaimers.
- Preserve facts, numbers, phone, email, program names, and confirmed source claims exactly.

## OpenCrab / marketing pack handling

If the user asks to load OpenCrab marketing packs:

- Search/confirm installed or purchased public marketing packs when available.
- Use retrieved content only if retrieval succeeds.
- If retrieval times out/unreachable, record `installed/purchased pack confirmed; content retrieval not reflected` and continue with skills/local principles. Do not claim pack content influenced the copy if only pack metadata was seen.

## Required step-6 runtime artifacts

Before image generation, create at least:

- `05_production_prompt_brief_v1.md`
- `fact-map.json`
- `cut-plan.json`
- `imagegen-jobs.json`
- `detail-page-manifest.json`
- `regen-queue.json`
- `prompts/cut-01.md` … `prompts/cut-15.md`
- `qa/asset-inventory.json`
- `qa/readability-rules.json`
- `qa/claim-alignment-rules.json`

Validate JSON parses, exactly 15 prompt files exist, and every prompt contains:

- 1080×1600 output size
- separate text panel requirement
- no Korean copy directly on photographs
- no CUT number/source/QA/OpenCrab/internal-status text in the final image
- publication status blocked until logo/photos/policy/rights are verified

## FMGS-specific guardrails

- Public copy must be customer-facing, not internal instructions.
- Do not use `출장레슨` or tax/accounting framing in public page copy.
- Do not imply VIP protocol or customer-invitation rounding is included by default; present as separate consultation/program where facts are not confirmed.
- Do not generate or recreate official logos or real pro faces when rights/assets are missing; use placeholders/name cards for concept-only work.
- Concept images are not publication-ready until official logo, photos/video, VAT/payment terms, refund/transfer policy, and pro profile rights are confirmed.
