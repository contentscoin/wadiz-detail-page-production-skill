# Luxury Layout Production Preview Lessons

Use when a user rejects a service/detail-page image set as still looking like a concept image, wireframe, moodboard, icon-card deck, or too repetitive/panel-like.

## Trigger phrases

- `아직 컨셉 이미지 아니야?`
- `레이아웃 디자인 수정을 해주면 좋겠어`
- `다른 형태로 고급스럽게 고민해봐`
- `상세페이지 스킬 로드해서 다시 고민해봐`
- Any complaint that the result is too much like cards, icons, a mood board, or a structural concept instead of a polished detail page.

## Core correction

Do not defend the previous artifact. Reclassify it honestly:

- `concept-only` if it uses placeholders, diagrams, icons, synthetic scenes, or incomplete rights/facts.
- `production preview` if it uses photoreal scenes and accurate deterministic copy but still lacks final real assets/terms/rights.
- `publication-ready` only after real assets, logo fidelity, terms, rights, text QA, and claim alignment pass.

## Redesign approach

When moving from concept/card output to a stronger production preview:

1. Keep exact cut count and 1080×1600 contract.
2. Generate or source **text-free photoreal scene blocks**; never ask the image model to render Korean, prices, logos, or contact info.
3. Compose Korean text, prices, phone/email, and logo deterministically with PIL/HTML/SVG.
4. Keep customer-facing copy in separate editorial information panels, not over the photo scene.
5. Replace repeated rounded-card layouts with a varied layout system:
   - hero editorial
   - editorial split
   - offer arch / package stack
   - premium timeline
   - scene focus
   - magazine profile grid
   - price ticket
   - checklist split
   - final CTA
6. Use large whitespace, thin champagne-gold rules, asymmetry, and fewer cards to increase premium feel.
7. Keep docs/QA labels out of rendered sales cuts.

## QA pitfalls found

Run visual QA on contact sheet plus key cuts before delivery. Specifically check:

- Is the result still a concept/card/moodboard rather than a real-looking detail page?
- Did brand/product strings split badly, e.g. `CEO Golf 100` into `10` + `0`?
- Did Korean words split awkwardly at character level, e.g. `좋 은`?
- Are photo zones and text zones separated?
- Are cut numbers, `QA`, `OpenCrab`, `publication`, `wireframe`, or source/debug labels visible in customer cuts?
- Are official profile images/names legible and not overclaimed?
- Are price, VAT caveat, phone, and email legible?

If any key text wraps poorly, patch with manual line breaks or cut-specific font sizing and regenerate only the affected output set, then repackage the ZIP.

## Reporting language

Be precise:

- Say `포토리얼 production preview` when backgrounds are AI-generated and real assets/terms still need approval.
- Say `publication_review_required` or `review_required` until real photos, logo originals, VAT/terms, and rights are confirmed.
- Do not call a polished preview `publication-ready` unless the publication gate is actually satisfied.
