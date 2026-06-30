---
name: ecommerce-detail-page
description: Use when the user wants to make, plan, improve, or generate an ecommerce product detail page, including Korean phrases like "상세페이지 만들고 싶다", "상세페이지 제작", "상품 상세페이지", or "상세페이지 이미지". Produces mobile-first cut plans, Korean sales copy, image composition, ASCII wireframes, style-template choices, product-photo placement recommendations, compliance checks, and sales-ready Naver/Coupang-style image cuts. Ask one choice-based question at a time, check product photos first, analyze provided images for layout/composition opportunities, infer/research target customers after product name or category, mark recommendations with "(추천)", treat sales channel as optional, plan before image generation, and render approved Korean copy inside final images with the image-generation model.
---

# Ecommerce Detail Page

Upstream source for this cloned execution backbone:
https://github.com/aisyncclub/detail_page_codex_skill

OpenCrab platform source for Wadiz pack-backed retrieval:
https://opencrab.sh

## Overview

Use this skill to turn product information into an image-first ecommerce detail page plan. The output is not a long article; it is a production-ready cut plan for designers or image-generation tools.

## How To Start

Trigger this skill when the user says phrases like:

```text
상세페이지 만들고 싶어
상세페이지 제작해
[상품명] 상세페이지 만들어줘 추천으로
이 상품 사진으로 상세페이지 만들어줘
```

Recommended first-turn handling:

- If the user provides product photos, start with photo analysis and placement recommendations.
- If the user gives only a product name or category, infer recommended category, target customer, style, and cut count, then mark assumptions clearly.
- If the user says `추천으로`, use recommended defaults instead of asking every optional question.
- Do not make sales channel mandatory. Use generic mobile ecommerce unless the user mentions Coupang, Smart Store, brand mall, or ad landing.
- Always plan first, then ask whether to generate images or revise.

Default recommended settings when the user gives minimal input:

| Item | Default |
|---|---|
| Detail-page style | Category-fit recommendation from `style-templates.md` |
| Cut count | 12 cuts |
| Sales channel | Channel-neutral mobile ecommerce |
| Product facts | Use only provided facts; mark missing fields as `확인 필요` |
| Image production | One image per cut, maximum available parallel agents/jobs |

## Non-Negotiables

- Ask intake questions one at a time, and always show explicit choices for the current question.
- Prefer Codex's internal choice UI when available. If it is unavailable in the current mode or client, fall back to visible text choices such as A/B/C.
- At the beginning, check whether the user has product photos. If photos are provided, use those photos as the product appearance source of truth for planning and image production.
- When product photos are provided, analyze the images before planning. Identify product angle, visible package/label, color, texture, background quality, usable crop areas, text-safe spaces, strengths, defects, and which cuts each image should be used for. Then recommend image placement and composition per cut.
- If provided product photos are low quality for final sales use, do not silently use them as-is. Mark the photo status as `재생성 권장`, explain the specific issue, and ask whether to regenerate cleaner detail-page visuals using the photo as a reference before final image production.
- For true sales-ready final images, request enough product photos: front/package, actual product or contents, detail/texture, options/colors, components, size reference, usage scene, and shipping package when relevant. For cosmetics, food, health supplements, baby, and pet products, label/ingredients/cautions photos are especially important.
- If product photos or verified sale facts are missing, final image output can only be a sales draft/concept, not a fully production-ready marketplace page. Say this plainly before image production.
- The user may provide only a product name or category. In that case, infer a recommended category if needed, research or infer likely target customers, cut count, and selling angle, then clearly mark them as assumptions or confirmation-needed items.
- Do not make sales channel a required intake question. Ask it only when channel-specific constraints matter, such as Coupang compliance, Smart Store search/detail norms, Instagram creative direction, image size rules, ad placement, or if the user explicitly mentions a channel.
- Ask the user to choose a detail-page style template before cut planning. Use [style-templates.md](style-templates.md), mark recommended styles with `(추천)`, and adapt copy density, layout, and image prompts to the chosen style.
- Do not create or request actual images first. First create the detail-page strategy and cut plan from the basic product information, show cut-by-cut copy, image composition, and ASCII layout wireframes, then ask whether to generate images or revise.
- Do not include final image-generation prompts in the planning output. Use ASCII wireframes to show text position, image area, product placement, and key visual structure.
- Planning-stage ASCII wireframes are only for approval. Final image production must render the approved Korean headline, subcopy, labels, option/guide text, CTA, and required notices directly inside the image like a real Naver Smart Store or Coupang product detail page.
- Do not generate blank text-safe images, placeholder bars, unlabeled mockups, or pure product photos when the user asks for final detail-page images. Those are draft assets, not sellable detail pages.
- If essential sellable facts are missing, either ask for them before final production or mark only legally safe fields as `확인 필요` in the image. Do not invent brand names, certifications, ingredients, reviews, prices, rankings, delivery promises, or measurable performance claims.
- Final image production must use the image-generation model as the production tool, including the Korean text inside the image. Do not switch to deterministic text overlay, SVG/Sharp, Photoshop-style compositing, or manual post-processing unless the user explicitly asks for that separate workflow.
- If Korean text inside final images is missing, broken, unreadable, replaced with English, or materially different from the approved copy, treat the image as failed and regenerate it with a stricter image-generation prompt. Do not patch the text afterward unless the user explicitly asks for post-processing.
- If image generation starts, generate exactly the planned cut count. Never collapse a 12-cut plan into fewer images or one combined image unless the user explicitly asks for a combined mockup.
- Image production must use maximum available parallel agents/jobs by default to reduce generation time. This is a hard scheduling rule, not an optional optimization. The coordinating agent should split the approved plan into independent `cut-01` through `cut-N` jobs, launch as many cut workers at the same time as the environment allows, then wait only after all possible workers are running. Never generate cut 1, wait, then generate cut 2 sequentially unless the environment truly cannot run parallel work.
- If the environment exposes subagents or parallel job execution, use them for final cut generation by default. Assign one cut per worker, keep each worker's output path disjoint, and do not begin QA, gallery assembly, or regeneration until the initial maximum parallel batch has been launched.
- After all cut images are complete, build an HTML review/download page that shows images sequentially and provides a `전체 다운로드` button. Use `scripts/build-image-gallery.mjs` when local image files are available.
- After generation, run a text QA pass for every cut. Check that approved Korean copy is present, readable, not broken, not translated, not replaced, and not missing. Failed cuts must be regenerated with stricter prompts.
- Confirm the product category through user selection, or explicitly mark the recommended category as an assumption when proceeding from product name only.
- Ask only for missing information; do not re-ask what the user already gave.
- Keep copy mobile-first: short headlines, concrete benefits, and readable text blocks.
- Separate facts, assumptions, and "confirmation needed".
- Never invent certifications, numeric claims, reviews, rankings, awards, test results, origin, ingredients, sales data, or medical/functional effects.
- Avoid hard-to-prove or risky claims such as "100%", "guaranteed", "cure", "treats", "best", "No.1", "no side effects", or equivalent Korean claims.
- For food, health supplements, cosmetics, medical devices, baby products, and pet products, include a compliance/policy review note before publishing.

## Intake Flow

When the user asks for a detail page, collect missing inputs one question at a time. Never show the whole intake questionnaire at once. Every intake question must display choices, and the assistant should wait for the user's answer before asking the next question.

Use this intake channel priority:

1. If an internal Codex choice UI is available, ask the current single question through that UI.
2. If internal choice UI is not available, ask the same single question as visible text choices.
3. Do not block the workflow only because the internal choice UI is unavailable.

If the user has already provided an item, fill it in and skip that question. If the user provides multiple answers at once, record them and ask the next unresolved question only.

### Question 1: Product Photos

Always start by checking whether product photos exist unless photos are already attached.

```text
상품 사진이 있나요?

A. 있음, 첨부한 사진을 기준으로 제작
B. 있음, 곧 첨부할 예정
C. 없음, 상품명/카테고리 기준으로 제작
```

If product photos are attached, use them as the visual reference for product shape, package, color, texture, and details. Do not replace the actual product appearance with a generic generated product.

If the user chooses B, wait for the photo unless they also says to proceed without it.

For a real sellable page, prefer these photo types:

- Required: front/package photo, actual product or contents, detail/texture photo, option/color or component photo if applicable.
- Recommended: size comparison, usage scene, shipping package, label/ingredients/cautions for regulated or safety-sensitive categories.
- If none are available, clearly label outputs as `판매용 초안` or `컨셉 기획` until actual photos and facts are provided.

If photos are provided, read [photo-analysis.md](photo-analysis.md) and produce a short `상품 사진 분석 및 배치 추천` section before the cut plan.

If any provided photo is too blurry, dark, cluttered, low-resolution, cropped, distorted, or visually weak for a marketplace detail page, ask this before final image generation:

```text
제공된 사진 중 일부가 판매용 상세페이지에 바로 쓰기에는 품질이 낮습니다. 어떻게 진행할까요?

A. 사진을 참고 이미지로만 사용하고 깨끗한 상품 이미지로 재생성 (추천)
B. 더 좋은 원본 사진을 추가한 뒤 다시 기획
C. 현재 사진을 그대로 사용하되 판매용 초안으로 표시
```

If the user chooses A, final image prompts must preserve the real product shape, color, packaging structure, and readable facts from the photo while improving lighting, background, crop, and ecommerce presentation. Do not invent unreadable labels, certifications, ingredients, claims, or brand details.

### Question 2: Progress Mode

Ask this after product photo status is known, unless the user already gave enough information to infer the mode.

```text
상세페이지 제작 방식부터 고르겠습니다.

A. 상품명만 입력하고 추천 가정으로 기획안 만들기
B. 항목을 하나씩 선택해서 정확하게 만들기

답변 예시: A / 상품명: 제주 감귤
```

If the user chooses A and gives a product name, use the Product-Name-Only Fast Path after product photo status is known. If the user chooses A but does not give a product name, ask only this:

```text
상품명을 알려주세요.

A. 상품명 입력
B. 아직 상품명이 정해지지 않음
```

If the user chooses B in Progress Mode, ask the following questions one by one.

### Question 3: Product Category

```text
상품 카테고리를 골라주세요.

A. 과일/농산물
B. 식품
C. 뷰티/화장품
D. 패션
E. 생활용품
F. 디지털/가전
G. 반려동물
H. 유아동
I. 건강기능식품
J. 기타/직접 입력
```

### Question 4: Product Name and Core Feature

```text
상품명과 핵심 특징을 알려주세요.

A. 상품명만 입력
B. 상품명 + 핵심 특징 1~3개 입력
C. 아직 미정, 추천 가정으로 진행
```

After a category or product name is known, pause to infer or research likely target/customer segments before asking the customer question.

Use this target recommendation rule:

- For common products, use category knowledge and product context to infer likely customer segments.
- For niche, trend-sensitive, expensive, regulated, or unfamiliar products, browse or use available research tools when current market context would materially improve the target choice.
- Put `(추천)` next to the best 1-2 customer choices and add a short reason in parentheses when useful.
- Never present target assumptions as verified demographic facts unless a source was actually checked.

### Question 5: Main Customer

```text
주요 고객을 골라주세요.

A. [상품/카테고리 기준 추천 고객군 1] (추천: 이유)
B. [상품/카테고리 기준 추천 고객군 2] (추천: 이유)
C. 가성비를 보는 고객
D. 프리미엄/품질을 보는 고객
E. 선물용 구매 고객
F. 빠른 문제 해결을 원하는 고객
G. 재구매/생활 루틴 고객
H. 기타/직접 입력
I. 추천 가정으로 진행
```

### Optional Question: Sales Channel

Ask this only when channel-specific constraints are needed or when the user mentions that the output is for a specific marketplace. Otherwise, skip it and assume a generic mobile ecommerce detail page.

```text
판매 채널까지 맞춰서 구성할까요?

A. 쿠팡 기준으로 맞춤
B. 스마트스토어 기준으로 맞춤
C. 자사몰/브랜드몰 기준으로 맞춤
D. 인스타그램/광고 랜딩 기준으로 맞춤
E. 채널 무관 모바일 상세페이지로 진행 (추천)
F. 기타/직접 입력
```

### Question 6: Detail Page Style

Ask after product/category and target are known. Mark 1-2 recommended styles with `(추천)` based on category, target, and sales intent.

```text
상세페이지 스타일을 골라주세요.

A. 쿠팡 실용 정보형
B. 네이버 브랜드 스토리형
C. 프리미엄 뷰티/감성형
D. 문제해결 인포그래픽형
E. 라이프스타일 사용장면형
F. 선물/패키지 강조형
G. 리뷰·신뢰 근거형
H. 추천 스타일로 진행
```

Read [style-templates.md](style-templates.md) before planning, and apply the selected style to the cut flow, copy tone, visual composition, and final image prompts.

### Question 7: Cut Count

```text
상세페이지 컷 수를 골라주세요.

A. 6컷 간단형
B. 12컷 기본형
C. 15컷 설득형
D. 추천 가정으로 진행 (기본 12컷)
```

If the user selects a cut count, output exactly that many cuts in the plan. If the user chooses 12컷, the plan must contain 컷 1 through 컷 12. If they choose 15컷, the plan must contain 컷 1 through 컷 15.

### Question 8: Required Facts

```text
반드시 넣어야 할 사실 정보가 있나요?

A. 원산지/중량/구성 정보 있음
B. 인증/성분/시험자료 있음
C. 배송/보관/교환 안내 있음
D. 리뷰/가격 혜택 정보 있음
E. 없음, 확인 필요로 표시
F. 직접 입력
```

If the user wants a production-ready sales page, collect or confirm the minimum sale facts needed for text-in-image output:

- brand/product name to display, or approval to use a generic product name
- option/color names, volume, size, package composition, quantity, and price/promotion only if true
- origin, material/ingredients, use method, storage method, and cautions when category-relevant
- product photo/package photo if actual appearance matters
- delivery, return/exchange, and storage/use cautions if those sections are included
- category-specific compliance facts such as ingredients, certifications, or cautions only when provided
- certification, test, review, sales number, ranking, or performance evidence only when source evidence exists

If the user chooses A in Question 1, says "알아서 해줘", or selects "추천 가정으로 진행", proceed with recommended defaults, but label inferred items as assumptions or confirmation needed.

## Product-Name-Only Fast Path

When only a product name is available:

1. Infer the most likely category from the product name.
2. Research or infer likely primary audiences and purchase motivations, then mark the best options with `(추천)`.
3. Do not ask for sales channel by default. Use `채널 무관 모바일 상세페이지` unless channel-specific context is provided or needed.
4. Recommend a style template from [style-templates.md](style-templates.md) and mark it as an assumption if not confirmed.
5. Choose exactly 12 cuts by default unless the user selected another exact cut count. Use exactly 6 cuts only for explicitly simple/short plans, and exactly 15 cuts for high-consideration or explanation-heavy products.
6. State the assumptions at the top of the plan and include confirmation-needed fields inside relevant cuts.
7. Do not invent factual claims. Use placeholders such as `확인 필요: 원산지`, `확인 필요: 중량`, `확인 필요: 인증 여부`.

## Wadiz OpenCrab Reference Layer

When the user asks for a Wadiz-style detail page, or when a Wadiz reference would improve the plan, use the user's installed OpenCrab Wadiz detail-page project before final cut planning if OpenCrab tools are available. Do not rely on a maintainer's private project ID in public installs.

Runtime order:

1. Query Wadiz packs for category route, assembly formula, section flow, copy shape, visual/GIF proof, objection handling, offer structure, fact-map requirements, OCR QA, and production profile.
2. Save selected package IDs, evidence snippets, assumptions, and skipped lookups to `opencrab-runtime-context.md`.
3. Build `fact-map.json` before writing final image prompts. Product-specific facts, prices, claims, certifications, reviews, and benefits must come from provided/user-confirmed sources or be marked confirmation-needed.
4. Build `cut-plan.json`, freeze `brief.md`, create `prompts/cut-XX.md`, then create `imagegen-jobs.json` with one job per cut.
5. Run structured QA artifacts after generation: `qa/asset-inventory.json`, `qa/ocr-results.json`, text-match, readability, layout-overlap, product-consistency, claim-alignment, frame-sampling when motion proof matters, and QA rollup.
6. Put only failed cuts in `regen-queue.json`; preserve approved facts and route, add the exact prompt delta, and stop after three failed cycles unless the user approves another path.
7. After any accepted or regenerated cut, rebuild `detail-page-manifest.json`, `qa-report.md`, `index.html`, ZIP, and the delivery report.

Boundary: Wadiz packs guide structure, rhythm, copy patterns, proof placement, and QA gates. They do not replace product-specific source verification and do not authorize risky claims.

## Planning Before Image Production

If the user asks to make actual images, do not start image generation immediately.

### Planning stage

1. First produce the detail-page planning output: category/context summary, core strategy, cut-by-cut copy, image composition, ASCII layout wireframe, tone and manner, compliance checklist.
2. Planning output must not include final image-generation prompts. It should show what each image should look like through copy, composition, and ASCII layout.
3. ASCII wireframes are design blueprints only. They are not final image outputs, and final images must not show ASCII boxes or placeholder labels.
4. After showing cut-by-cut copy and image composition, ask one follow-up question:

```text
다음 단계로 어떻게 진행할까요?

A. 이 기획안 그대로 이미지 생성
B. 컷별 카피/구성 수정
C. 상품 사진 또는 사실 정보 추가 후 다시 기획
```

### Production stage

5. Treat the approved or latest plan as the source of truth for image generation.
6. Generate sales-ready images cut by cut using the image-generation model, each cut's approved copy, image composition, ASCII wireframe, design notes, and product photo reference if provided.
7. The generated image must include the approved Korean text inside the image: headline, subcopy, labels, key benefit text, guide text, and CTA when present. Preserve mobile readability with large type, strong hierarchy, and enough contrast.
8. If the approved photo-analysis status is `재생성 권장`, use the photo as a reference image instead of a direct final asset: regenerate a cleaner ecommerce-ready version with improved lighting, background, crop, and composition while preserving only visible product facts.
9. Final images must be actual backgrounds, product photos/visuals, information blocks, and Korean copy composed together. They must not be blank text-safe images, placeholder-only layouts, or decorative concept art.
10. If the image-generation model does not render Korean text accurately, regenerate the cut with a clearer prompt that repeats the exact Korean text, reduces text volume, increases text size, and simplifies the layout. The default recovery path is regeneration with the image model, not text overlay.
11. Generate exactly the planned number of images, one image per cut. If a plan has 12 cuts, produce 12 separate cut images.
12. Start all cut image jobs with maximum parallelism whenever the environment allows it. This must happen before waiting on individual cut results. Preferred pattern:
    - the main agent acts only as coordinator, QA reviewer, and final assembler
    - create one parallel image-generation worker per cut by default
    - assign disjoint ownership such as `cut-01`, `cut-02`, ..., `cut-N`
    - give each worker only its approved cut copy, layout, style, product photo reference, and output filename
    - launch all available workers first; do not wait for any worker result until every possible worker has started
    - for very large plans or tool limits, launch the largest supported batch, then immediately launch the next batch as slots free up
    - if any accidental sequential generation starts, stop, preserve any completed cut, update the remaining work into parallel cut jobs, and continue from the missing cuts only
    - collect all outputs before final delivery and regenerate only failed cuts
13. Do not merge all cuts into one tall image unless explicitly requested.
14. When all images are complete, create an HTML review page using [image-production-workflow.md](image-production-workflow.md). The page must show cuts in order and include download links plus a `전체 다운로드` button.
15. Run the Korean text QA checklist before final delivery. If any cut fails, regenerate only the failed cut with a stricter prompt.
16. Even if the user asks to move fast, show the planning output first and ask the generate-or-revise choice before starting image production.

## Final Image Standard

Final detail-page images must look like real marketplace detail-page sections, not concept art:

- Use actual approved text in the image, not placeholder bars or empty copy zones.
- Compose each cut as a completed mobile section with headline, subcopy, product/usage visual, labels, and guide blocks where relevant.
- Match Naver/Coupang-style ecommerce conventions: clear top headline, product-centered visual, short benefit labels, clean info blocks, and readable mobile typography.
- Use the image-generation model to render both the visual design and the Korean text in the same final image.
- Keep each cut self-contained and uploadable as a marketplace detail image.
- If product photos are absent, the result is a `판매용 초안` using a generic product visual. For true production use, clearly request real product/package photos and verified facts.
- Text must remain compliant. Missing facts may be shown as neutral labels such as `상세 정보 확인 필요`, but claims must not be fabricated.
- Every final cut must pass text QA: approved Korean copy is present, readable on mobile, spelled correctly, not replaced with English/filler text, and aligned with the product facts.
- Final delivery should include an HTML gallery when image files exist locally. The gallery must display the cuts in numerical order and make all images downloadable together or through visible per-cut links.

## Workflow

1. Confirm or infer category and product context.
2. Ask only one unresolved intake question at a time, with explicit choices.
3. Check whether product photos exist. If provided, use them as the visual source of truth.
4. If photos are provided, analyze them with [photo-analysis.md](photo-analysis.md) and recommend which image or crop should be used in each cut.
5. If photo quality is weak, ask whether to regenerate clean ecommerce visuals using the photo as a reference before final image production.
6. Once category or product name is known, research or infer likely target/customer segments and show recommended options with `(추천)`.
7. Treat sales channel as optional; ask only when channel-specific constraints are important.
8. If only a product name is provided, build recommended assumptions instead of blocking.
9. Read [category-checks.md](category-checks.md) for the selected or inferred category's required facts, image emphasis, and risky claims.
10. Read [style-templates.md](style-templates.md), recommend or confirm a style, and apply it consistently.
11. Choose cut count:
   - Simple product: 6 cuts.
   - Default mobile detail page: exactly 12 cuts.
   - High-consideration or explanation-heavy product: exactly 15 cuts.
12. Use [cut-structure.md](cut-structure.md) to build the persuasion flow: hero, problem, solution, differentiator, detail, usage, proof, options, delivery/care, CTA.
13. Write every cut using the format in [output-template.md](output-template.md).
14. Include ASCII layout wireframes in the planning output, not final image-generation prompts.
15. Run the final compliance and quality pass in [copy-compliance.md](copy-compliance.md).
16. Ask whether to generate images or revise before image production.
17. During final image production, render the approved Korean text directly inside each image and verify no cut is textless or placeholder-only.
18. Generate all approved cut images through simultaneous parallel agents when possible, then build the sequential HTML gallery/download page and run Korean text QA.

## Output Contract

Final answers must be in Korean and follow this structure:

1. `# [상품명] 상세페이지 이미지 기획안`
2. `## 1. 카테고리 및 판매 맥락 요약`
3. `## 2. 상품 사진 분석 및 배치 추천` if photos were provided
4. `## 3. 상세페이지 핵심 전략`
5. `## 4. 이미지 컷별 제작안`
6. `## 5. 전체 디자인 톤앤매너`
7. `## 6. 준법·품질 체크`

Each cut must include:

- 목적
- 헤드라인
- 서브카피
- 이미지 내 삽입 문구
- 이미지 구성
- 사진 배치 추천
- 사진 품질 판단
- ASCII 레이아웃
- 상품 사실 정보
- 사용 사진
- 디자인 메모
- 최종 이미지 QA
- 확인 필요

## Completion Check

Before answering, verify:

- Category was confirmed or explicitly marked as assumed.
- Customer questions and purchase anxiety are addressed before seller bragging points.
- The cut flow moves from first impression to problem, solution, proof, options, delivery/caution, and CTA.
- The number of cuts exactly matches the selected cut count.
- The selected style template is visible in the plan and consistently reflected in copy, layout, and image direction.
- If product photos were provided, the plan includes image analysis and per-cut placement recommendations.
- If product photos were weak, the plan states whether each weak photo should be used as-is, replaced, or used only as a reference for cleaner regenerated visuals.
- Each cut is specific enough to create an actual image.
- Planning output uses ASCII wireframes instead of image-generation prompts.
- Final generated images include the approved Korean text inside the image.
- No final image is a blank-placeholder layout unless the user explicitly requested a wireframe or background-only asset.
- Final generated images pass Korean text QA: no missing text, broken Hangul, unreadable small type, English substitution, or unapproved wording.
- Generated image files are collected into a sequential HTML gallery with per-cut downloads and a `전체 다운로드` action when local files are available.
- Product visuals and text do not conflict with provided photos or verified facts.
- Unverified information is not inserted as a definite claim.
- The result contains enough buying information to resemble a Naver/Coupang marketplace detail page.
- Copy is short enough for mobile.
- Facts, assumptions, and confirmation-needed items are separated.
- Risky exaggerated claims were removed.
- The plan fits the named sales channel.
