# Layered Text Production for Premium Detail Pages

Use when a user says rendered copy feels like an overlay, asks for separate text layers, or wants typography to feel more designed than plain font rendering.

## Core lesson

For high-end detail pages, do not treat text as a single flat overlay baked into the background. Build a layered package:

```text
/background-layers/
  cut-01-background.png
/text-layers-png/
  cut-01-text-designed.png   # transparent RGBA, raster delivery
/text-layers-svg/
  cut-01-text-editable.svg   # editable text/design layer
/final-composites/
  cut-01.png / cut-01.jpg
/html-layer-preview/
  index.html                 # previews stacked background + text layer
```

This lets later edits change terms, price, CTA, or photos without regenerating the whole cut.

## Recommended workflow

1. Classify each cut: emotional background, information card, profile, price, terms, CTA.
2. Generate or select the **background layer without text**: photo, color fields, blank panels, lines, cards, and shadows only.
3. Create a **designed transparent text layer**, not plain labels:
   - large typography hierarchy
   - gold separator lines and ornaments
   - badges/pills for short terms
   - check icons or numbered medallions
   - list rows and footer ribbons where useful
4. Also output an **editable SVG text layer** with the same visual structure whenever future copy edits are likely.
5. Composite background + text layer to final PNG/JPG.
6. QA both layers and the composite:
   - text layer alpha has real transparency
   - no accidental opaque background in PNG
   - exact Korean, prices, phone, email, and terms are correct
   - no text sits directly over important photo subjects unless intentionally designed
   - final contact sheet still has varied rhythm, not repeated card templates

## Image-generated typography

Image generation can be used to create typography *style references* or exploratory graphic layers, but do not trust it as final exact Korean copy.

Common failures:

- Korean terms subtly misspelled or malformed
- random emblems/letters/logos appear
- generated marks conflict with the approved brand logo
- small terms become unreadable after compositing
- white-background removal leaves halos or layout collisions

Safer pattern:

1. Prompt image generation for visual mood, typography hierarchy, ornaments, badge shapes, and premium spacing.
2. Visually QA and extract only the design ideas.
3. Rebuild the final layer with controlled SVG/PIL/HTML text for exact Korean and legal/price terms.
4. If an image-generated layer is still used, label it as a POC until character-level QA passes.

## FMGS/CEO Golf example signals

For FMGS CEO Golf price/terms cuts, the user preferred:

- background image/card separated from text
- transparent designed text layers
- exact terms controlled: `1,500만원`, `VAT 포함`, `세금계산서`, `사용기간 1년`, `양도 가능`, `환불 불가`, `옵션 별도 협의`
- image-generated typography only as inspiration unless every Korean character is verified

## Delivery checklist

- `background_only.png`
- `text_layer_designed_transparent.png`
- `text_layer_editable.svg`
- `composite.png` and/or `composite.jpg`
- `index.html` layer preview
- `manifest.json` with alpha/size checks
- ZIP with all layer assets
