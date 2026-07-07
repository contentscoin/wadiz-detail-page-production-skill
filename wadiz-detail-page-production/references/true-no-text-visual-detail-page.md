# True No-Text Visual Detail Page Pattern

Use when the user explicitly asks for a detail-page image set with **no text overlay** after rejecting framed/overlay-heavy designs, e.g. `텍스트오버레이없는 상세페이지 이미지생성`, especially with `프레임테두리는 넣지마`.

## Decision rule

There are two different requests that sound similar:

1. **No text over photos**: keep sales copy, price, CTA, and notices inside separate editorial panels. Use `references/fmgs-logo-no-photo-overlay-layout.md`.
2. **True no-text visual image set**: final PNG/JPG cuts contain zero intentional copy/logos/price/CTA. Explanatory text lives only in external HTML/docs or the platform body. Use this reference.

If the user explicitly says `텍스트오버레이없는 상세페이지 이미지생성해` and has also objected to frames/borders, treat it as true no-text unless they later ask for sales copy inside the image.

## Output contract

For a true no-text visual detail page:

- Create real inspectable artifacts, not just a plan.
- Generate or assemble an exact 12/15-cut image sequence, usually 1080×1600 per cut.
- Also output a long stitched image, contact sheet, gallery/HTML, manifest, QA notes, and ZIP.
- Final cut images must have:
  - `overlay_text_count: 0`
  - `logo_count: 0` unless the user explicitly allows a logo-only brand mark
  - no price/CTA/legal notice inside images
  - no visible cut labels, source labels, debug labels, or contact-sheet labels
  - no frame/border treatment
- Put explanations, official site links, source facts, price/conditions, and CTA only in docs/HTML/body text outside the image files.

## Visual direction

Use scenes that communicate the service without words:

- CEO/VIP golf arrival and concierge handling
- executive schedule still life
- private lesson/coaching scene
- operations planning table with blank/no-writing materials
- business golf round preparation
- premium consultation in club lounge
- pro matching silhouettes
- hospitality/private dining scene
- abstract golf-network/data visual without letters or numbers
- final quiet luxury fairway/clubhouse path

Prompts must include negative constraints: `no text, no letters, no numbers, no logos, no signage, no watermark, no UI, no readable writing`.

## QA checklist

- Confirm exact cut count and dimensions.
- Inspect the contact sheet visually for accidental text, letters, numbers, logos, signage, watermarks, or frames.
- Confirm contact sheet itself does not add cut numbers or labels over thumbnails.
- Confirm long image is a pure image stack with no separators or captions.
- Mark as `pre-production / no-overlay visual mood test` unless final facts/assets are separately approved.
- State the limitation: no-overlay image sets look premium, but product name, offer, price, terms, and CTA must be handled outside the image or in a later approved editorial-panel version.

## FMGS case note

In the FMGS CEO Golf session, official site evidence from `fmgs.co.kr` supported external copy/fact docs: 58만 골퍼 DB, 2,400여 개 카카오 채널, 150+ 파트너 골프 코스, and 1,200+ 캠페인 수행. Those facts should not be baked into true no-text images; keep them in external body/docs unless the user switches back to panel-based copy images.
