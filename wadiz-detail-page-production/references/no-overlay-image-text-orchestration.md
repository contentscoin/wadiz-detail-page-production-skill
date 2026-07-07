# No-Overlay / Image × Text Orchestration Pattern

Use when the user pushes back on overlay-heavy or text-minimizing approaches for a Wadiz-style detail page, especially with comments like “이미지와 텍스트를 잘 써야지” or “오버레이 텍스트를 아예 없게”.

## Core lesson

Do not treat `minimal overlay` as the goal. The goal is the right division of labor:

- **Image job:** prove the scene, emotion, premium feel, context, and evidence.
- **Text job:** name the buyer insight, product meaning, verified number, risk note, or next action.
- **Pairing logic:** every cut must explain how image and text amplify each other instead of duplicating or competing.

## Two distinct modes

| Mode | Use when | Image files | Text handling | Risk |
|---|---|---|---|---|
| Image × Text orchestration | User wants fewer overlays but still a persuasive detail page | Text-free generated scenes + deterministic Korean overlay | 0–1 strong message per cut; price/CTA deterministic | Best balance for Wadiz persuasion |
| No-overlay visual mood test | User explicitly says no overlay text at all | Final cut images contain **0 overlay text** | Product definition, price, CTA move outside images into page text/info sections | Looks premium but under-explains what is sold |

## Required cut matrix fields

For each cut, include:

1. `Cut role`
2. `Image Job`
3. `Text Job`
4. `Pairing Logic`
5. `Text placement` or `No-overlay external text location`
6. `Evidence/fact status`
7. `QA risk`

## Workflow

1. Reframe the task as image/text role division, not “less text”.
2. Build a 12-cut plan, but produce only 3 sample cuts first: usually CUT 01 hero, CUT 03 product reveal, CUT 06 offer/fact.
3. Generate scene images with a strict no-text prompt: no text, labels, signage, logos, watermarks, random letters, UI, or fake Korean.
4. For orchestration mode, add Korean/price/CTA deterministically after generation.
5. For true no-overlay mode, do **not** add any text to the final image files or contact sheet thumbnails. Put explanatory text only in the HTML/review document outside the images.
6. QA both versions separately:
   - Orchestration QA: Korean legibility, price accuracy, overlap, image-text amplification.
   - No-overlay QA: confirm overlay count is 0; flag that product definition/price/CTA are not conveyed inside the image.
7. Deliver as `pre-production preview` unless official assets/facts are ready.

## QA statements to include

- “오버레이 0개 버전은 무드 검토에는 좋지만, 상품명·가격·구성·CTA는 이미지 밖 본문이나 별도 정보 섹션이 필요합니다.”
- “이미지와 텍스트가 같은 말을 반복하면 실패입니다.”
- “텍스트를 줄여서 설명력이 사라지면 실패입니다.”
- “가격, 횟수, 연락처, 고지문은 이미지 모델에 맡기지 말고 deterministic overlay 또는 외부 본문으로 처리합니다.”

## Pitfalls

- Do not answer with another planning document if the user says “진행해”; create a real preview artifact and verify it.
- Do not call a no-overlay image `final upload-ready` when price/CTA/legal notices are absent.
- Do not put labels into a no-overlay contact sheet if the user is evaluating image-only mood.
- Do not preserve a broken Korean font render; locate a real Korean font and regenerate deterministic overlays.
- If the user says `텍스트를 포함해서 이미지 생성해야지`, the final PNG/JPG itself must contain the text. HTML captions or external page text are not enough.
- If the user says `오버레이로 텍스트 넣지마`, interpret it as “do not place text on top of the photo area” unless they explicitly request a no-text mood test. Use separate editorial text panels inside the final detail-page image.
- When the user supplies a brand logo image, use it as a source asset/brand strip; do not ask the image model to hallucinate the logo. If only a JPG is supplied, extract a temporary preview logo and mark final vector/transparent logo as a blocker.

See also: `references/fmgs-logo-no-photo-overlay-layout.md` for the FMGS-specific logo + separated text-panel pattern.
