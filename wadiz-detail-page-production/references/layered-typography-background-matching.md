# Layered Typography + Background Matching for Premium Detail Pages

Use when a user asks to avoid plain text overlays, asks for image-generated typography, or complains that text/background do not match.

## Core lesson

Do not treat “text layer” as just font-rendered copy pasted over an existing image. For premium detail pages, the text layer and background must be designed as one visual system.

The safest production approach is hybrid:

1. Use image-generated typography only as a **style reference** for mood, spacing, ornament, badges, linework, and overall composition.
2. Render final customer-facing Korean text deterministically as controlled PNG/SVG/HTML/PPT text layers.
3. Match the background to the text style before compositing.
4. QA every rendered cut for broken line breaks, text collisions, clipped rows, and accidental model text.

## Why not final image-model text

Image-generated typography can look more premium than plain font rendering, but it is risky for final Korean sales pages:

- Korean characters may be misspelled or malformed.
- The model may invent logos, crests, badges, or extra letters.
- Small labels may become unreadable.
- Exact terms like price, VAT, transfer/refund conditions, phone, and email become hard to edit.

Use model output as a design reference, not as the final source of truth for required copy.

## Background matching rule

Before compositing a typography layer, decide which background family fits the typography.

- Dark green / photo background: only works when text is warm ivory/gold and high contrast.
- Ivory certificate / voucher background: best for dark green + champagne-gold price or policy typography.
- Existing photo-card background: often clashes with generated editorial typography and makes the text feel pasted on.

If the user says “배경도 텍스트와 맞춰야지”, redesign the background, not only the text.

## Recommended workflow

1. Classify each cut:
   - emotional film cut
   - editorial side-field cut
   - price/terms certificate cut
   - process/information cut
   - profile/magazine cut
   - CTA cut
2. For price/terms cuts, consider an ivory certificate/voucher system:
   - deep-green outer mat
   - warm ivory paper texture
   - champagne-gold frame/rules/ornaments
   - large dark-green price type
   - numbered rows
   - check icons
   - exact deterministic labels
3. Keep model-generated typography samples in POC/reference folders only.
4. Rebuild the final text layer with deterministic text rendering.
5. Generate final composites and a contact sheet.
6. Visually inspect at least:
   - full contact sheet
   - price/terms cut
   - policy/conditions cut
   - network/map labels
   - CTA contact block

## QA checklist

- No text directly over important photo subjects unless explicitly desired.
- No debug/cut labels in customer-facing cuts.
- No accidental model text, invented crest, or fake logo.
- Exact terms are correct: price, VAT, tax invoice, validity, transfer, refund, options, phone, email.
- Korean rows do not collide with icons, rules, or card borders.
- English labels do not break awkwardly (`Touchpoin / t` type failures).
- Long Korean labels are manually line-broken, not left to automatic wrap inside small circles.
- All final cut PNGs are the required resolution.
- ZIP/package is regenerated after QA fixes.

## Common repairs

- If dark background makes generated dark-green typography disappear, switch to light ivory certificate background.
- If circular map labels wrap awkwardly, shorten labels or force intended two-line breaks.
- If English center labels break, shorten the phrase (`Golf Brand Point` instead of `Golf Brand Touchpoint`).
- If policy copy reads ambiguously, shorten supporting copy and keep the confirmed terms as separate rows.
