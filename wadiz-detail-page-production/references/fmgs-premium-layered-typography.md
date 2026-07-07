# FMGS Premium Layered Typography Pattern

Use for premium golf/VIP/detail-page packages when the user rejects plain font-rendered text or says the text feels like an overlay.

## Core lesson

Do not solve “make the text more designed” by asking an image model to generate final Korean copy directly. Image-generated typography can look premium, but Korean text, logos, and small terms are not reliable enough for publication.

Best workflow:

1. Use image-generated typography only as a **style reference**: price scale, gold rules, badges, certificate/voucher mood, spacing, icon rhythm.
2. Rebuild final customer-facing copy as deterministic design layers: SVG/PNG/PIL/HTML/PPTX text that the agent controls exactly.
3. Match the background to the typography style. If the generated text is dark green/gold certificate typography, use an ivory certificate/voucher background, not a dark green card.
4. Export both final composites and source-ish layers when useful: `backgrounds/`, `text-layers/`, `final-composites/`, `contact_sheet`, `long_preview`.

## FMGS-specific layout direction

- Price/terms cuts: ivory certificate or premium voucher, dark green price typography, champagne-gold rules, numbered rows, check icons.
- Brand/promotion cuts: concrete touchpoint map, not abstract circles. Prefer labels like `VIP 초청`, `현장 브랜딩`, `콘텐츠 활용`, `관계 관리`, `후속 제안`.
- Profile cuts: do not leave only photos/names. Add short matching criteria or consultation use cases, e.g. `대표 일정에 맞춘 1:1 코칭 상담`, `초청 톤에 맞춘 진행 상담`, `목적·일정 기준 맞춤 배정`.
- CTA cuts: include a consultation checklist, not only phone/email. Example: `목적 확인 · 일정 상담 · 운영 범위 · 견적 안내`.

## QA rules that matter

Run visual QA on at least:

- Contact sheet
- Price/terms cut
- Brand/touchpoint map cut
- Profile lineup cut
- Final CTA cut

Specifically inspect:

- Korean line breaks: no awkward syllable splits like `기 준`.
- English line breaks: avoid `Touchpoin / t`; shorten or translate labels if needed.
- Circle/diagram geometry: no bottom circles clipped by footer/CTA boxes.
- Connector lines: redraw center nodes on top so lines do not cross label text.
- CTA footer: all checklist items visible; if vertical bullets crop, use a single horizontal pill.
- Terms accuracy: verify `1,500만원`, `VAT 포함`, `세금계산서`, `사용기간 1년`, `양도 가능`, `환불 불가`, `옵션 별도 협의`.

## Objective scoring target

For a high-price package, do not stop at a merely clean visual. Evaluate whether the page explains why the price makes sense:

- 100-session value
- schedule/operation support
- VIP/customer invitation use
- brand touchpoint planning
- pro matching criteria
- clear terms and consultation next step

If these are weak, upgrade the copy and information structure before final delivery.