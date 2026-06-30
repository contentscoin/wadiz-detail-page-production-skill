# Output Template

Use this exact structure for final plans.

```markdown
# [상품명] 상세페이지 이미지 기획안

## 1. 카테고리 및 판매 맥락 요약

| 항목 | 내용 |
|---|---|
| 카테고리 |  |
| 판매 채널 |  |
| 주요 고객 |  |
| 핵심 구매 이유 |  |
| 예상 구매 불안 |  |
| 권장 컷 수 |  |
| 상품 사진 | 있음/없음/확인 필요 |
| 상세페이지 스타일 |  |

## 2. 상세페이지 핵심 전략

고객이 왜 이 상품을 사야 하는지, 어떤 불안을 먼저 해소해야 하는지, 어떤 이미지 흐름으로 설득할지 설명한다.

## 3. 상품 사진 분석 및 배치 추천

상품 사진이 제공된 경우에만 작성한다.

| 이미지 | 파악한 내용 | 품질 상태 | 강점 | 주의점 | 추천 컷/용도 | 배치/재생성 추천 |
|---|---|---|---|---|---|---|
| 이미지 1 |  |  |  |  |  |  |

## 4. 이미지 컷별 제작안

## 컷 1. [컷 이름]

**목적:** 이 컷이 구매 설득에서 맡는 역할을 쓴다.

**헤드라인:** 이미지에 크게 들어갈 짧은 문장을 쓴다.

**서브카피:** 헤드라인을 보완하는 1~2문장을 쓴다.

**이미지 내 삽입 문구:** 최종 이미지 안에 실제로 들어갈 한국어 텍스트만 분리해서 쓴다.

**이미지 구성:** 배경, 상품 배치, 인물/소품, 텍스트 위치, 인포그래픽 요소를 설명한다.

**사진 배치 추천:** 제공된 이미지 중 어떤 사진을 어디에 배치할지, 어떤 crop/구도로 쓸지 쓴다.

**사진 품질 판단:** 이 컷에 사용할 사진이 `그대로 사용 가능`, `보정 후 사용`, `참고용만 사용`, `재생성 권장` 중 어디에 해당하는지 쓴다. 품질이 낮으면 사진을 참고로 더 깨끗한 상품 이미지를 재생성할지 표시한다.

**ASCII 레이아웃:** 텍스트 위치, 상품 이미지 위치, 배경/소품 영역이 보이도록 간단한 문자 와이어프레임을 작성한다.

**상품 사실 정보:** 이 컷에 사용하는 검증된 상품 정보와 확인 필요 정보를 구분한다.

**사용 사진:** 이 컷에 필요한 원본 사진 유형을 쓴다. 예: 제품 정면, 패키지, 제형, 사용 장면, 구성품, 배송 포장.

**디자인 메모:** 모바일 가독성, 컬러, 폰트 느낌, 여백, 금지 요소를 적는다.

**최종 이미지 QA:** 텍스트 포함, 모바일 가독성, 상품 일치, 판매 가능성, 준법 표현을 점검한다.

**확인 필요:** 사용자가 제공하지 않아 검증이 필요한 정보를 적는다.

## 5. 전체 디자인 톤앤매너

| 항목 | 권장 방향 |
|---|---|
| 무드 |  |
| 컬러 |  |
| 폰트 느낌 |  |
| 이미지 스타일 |  |
| 피해야 할 요소 |  |

## 6. 준법·품질 체크

게시 전 확인해야 할 표현, 수치, 인증, 배송·교환 안내, 플랫폼 정책 이슈를 정리한다.

## 7. 다음 단계 선택

다음 단계로 어떻게 진행할까요?

A. 이 기획안 그대로 이미지 생성
B. 컷별 카피/구성 수정
C. 상품 사진 또는 사실 정보 추가 후 다시 기획
```

## ASCII Layout Pattern

ASCII is only a planning blueprint. Do not output ASCII boxes, placeholder labels, or empty text-safe zones as final images. Final images must be real sales-page sections with product visuals, information blocks, and approved Korean copy rendered inside the image.

```text
┌────────────────────┐
│ [헤드라인 영역]     │
│ [서브카피 1~2줄]    │
├────────────────────┤
│                    │
│   [상품/모델 이미지] │
│                    │
├────────────────────┤
│ [아이콘/정보 3개]   │
└────────────────────┘
```

## Image Production Rule

When the user chooses image generation, convert the approved cut plan into production prompts internally. Generate one separate image per cut, exactly matching the approved cut count. Use the product photo as the visual source if one was provided.

Generate cut images through simultaneous parallel agents whenever possible. Start one independent cut-generation agent/job for every planned cut before waiting for any result. After all cuts are complete, build a sequential HTML review/download page with `scripts/build-image-gallery.mjs`. The HTML must show every cut in order, include per-cut download links, and include a `전체 다운로드` action.

Final images must be sellable marketplace detail-page cuts:

- Render the approved Korean headline, subcopy, labels, guide text, and CTA inside the image.
- Do not leave blank text-safe areas, placeholder bars, or unlabeled mockup blocks in final images.
- Use mobile-readable type, strong contrast, and Naver/Coupang-style ecommerce hierarchy.
- Use the image-generation model itself to render the Korean text in the final image. Do not default to external text overlay or post-processing.
- If the image generator cannot render Korean text accurately, regenerate with a stricter prompt: exact text repeated, fewer text blocks, larger type, simpler layout, and explicit instruction that Korean text must not be changed.
- If product photos or verified sale facts are missing, label the output as a sales draft and avoid fabricated claims.
- If Korean text is missing, broken, unreadable, translated to English, or different from the approved copy, regenerate the image before delivery unless the user explicitly asks for post-processing.
- Required sale facts for production-ready output: product name, brand/seller name, options/colors, composition/quantity, volume/size, origin/material/ingredients when relevant, use/storage/caution guidance, delivery/return/exchange policy, and evidence for any certification, review, ranking, or numeric claim.

## Wadiz/OpenCrab Runtime Artifacts

When Wadiz reference packs are used, the delivery must include or explicitly mark skipped:

- `opencrab-runtime-context.md`: selected package IDs, evidence snippets, selected formula/category route, skipped lookups, and confirmation-needed fields.
- `fact-map.json`: product facts, source tier, source path/file, status, used cuts, blocked claims, and QA notes.
- `cut-plan.json`: final cut order, role, section purpose, required Korean text, visual/GIF proof role, source facts, and QA risk.
- `imagegen-jobs.json`: one `cut-XX` job per final cut with output path, required Korean text, input images, and engine.
- `qa/*.json`: OCR/manual review, text match, readability, layout overlap, product consistency, claim alignment, frame sampling when relevant, and QA rollup.
- `regen-queue.json`: failed cuts only, exact failure reason, prompt delta, fixed facts, and regeneration cycle.
- `detail-page-manifest.json`, `qa-report.md`, `index.html`, and ZIP rebuilt after the last accepted cut.
