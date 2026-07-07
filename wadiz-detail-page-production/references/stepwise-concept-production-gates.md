# Stepwise Detail-Page Production Gates: Planning → Wireframe → Concept

Use this when the user asks to restart a Wadiz/ecommerce/detail-page project “from the beginning” or complains that previous outputs jumped too quickly to images.

## Lesson captured

A polished detail-page output should not jump straight from rough copy to final images. For service/intangible offers, the reliable sequence is:

1. **Product planning first**
   - Define offer, buyer, promise, exclusions, risk claims, and confirmation-needed facts.
   - Preserve unverified items as internal notes only.
2. **Cut-by-cut copy draft**
   - Write 10–20 cuts with headline, subcopy, info cards, CTA, and claim-risk notes.
   - Keep customer-facing copy separate from internal production instructions.
3. **Humanize / marketing refinement**
   - Apply Korean humanization rules: reduce stiff nouns, vary repeated verbs, shorten image text.
   - If using OpenCrab/marketing packs, state truthfully whether retrieval actually succeeded; never imply pack evidence was used when only pack installation was verified.
4. **Visual wireframe brief**
   - Define 1080×1600 layout type per cut, image/text zones, safe margins, no-photo-overlay rules, asset needs, and QA gates.
5. **Production prompt set**
   - Generate reusable artifacts: `fact-map.json`, `cut-plan.json`, `imagegen-jobs.json`, `prompts/cut-XX.md`, `qa/*`, `regen-queue.json`, and a manifest.
6. **Wireframe image set**
   - Produce actual 1080×1600 wireframe PNG/JPG cuts, contact sheet, long preview, HTML preview, QA report, and ZIP.
7. **Concept-only image set**
   - Until official logo/photos/policies/rights are confirmed, produce concept-only visuals and label publication readiness as blocked.
   - Use deterministic composition/overlay for Korean text, prices, phone numbers, and emails.
8. **Publication-ready production**
   - Only after official logo, photos, profile rights, VAT/payment/refund/transfer terms, and offer scope are confirmed.

## Text-safe production pattern

- Do not ask an image model to render Korean pricing, phone numbers, CTA, legal notes, or brand text when exactness matters.
- Generate or draw the visual scene separately, then render approved Korean copy with a known Korean font such as Noto Sans CJK KR.
- The final image should contain the copy, but the copy must live in designed typography panels, not directly on the photo/scene area.

## Concept-only vs publication-ready

Use explicit gates:

| State | Meaning |
|---|---|
| `wireframe` | Layout and text safety check only. Internal labels are allowed. |
| `concept-only` | Customer-facing style mockup. No internal labels, but official rights/assets may still be missing. |
| `publication-ready` | Official assets and claims are verified; no placeholder/provisional content remains. |

## QA checks

- 15 cuts exist and are all 1080×1600.
- Contact sheet and long preview exist.
- Customer copy appears inside final image assets, but not over photo/scene areas.
- No internal text appears in customer-facing concept/final images: `QA`, `OpenCrab`, `publication blocked`, `WIREFRAME`, `CUT`, `출처`.
- Price, count, phone, email, VAT/condition wording are legible and exact.
- Manual visual QA catches awkward Korean line breaks (e.g. words split mid-ending) and fixes them before delivery.
- ZIP includes QA report and passes `zipfile.testzip()`.

## Pitfalls

- Do not treat a concept-only output as upload-ready.
- Do not say a marketing/OpenCrab pack informed the copy unless retrieval returned usable evidence.
- Do not preserve wireframe footer/internal labels in concept-only or final customer-facing images.
- Do not over-explain instead of proceeding when the user says “다음 진행해”; advance the next gated step and deliver files.
