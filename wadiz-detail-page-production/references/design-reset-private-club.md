# Design Reset Pattern: Private Club / Membership Pass

Use when a premium detail-page cut set has been iterated several times but the user still says the design is fundamentally not good enough, template-like, or asks to discard the design and start over.

## Trigger signals

- “디자인 전면 폐기” / “아예 다른 디자인을 처음부터”
- Repeated rejection after v2/v3 refinements where the issue is art direction, not copy
- Feedback that the set still looks like PPT, proposal pages, cards, templates, or repeated sections
- The user wants a high-ticket/VIP/CEO/service product to feel more exclusive and less like a standard ecommerce page

## Rule

Do not keep polishing the same palette, card system, typography, or layout rhythm. Treat it as an art-direction failure and create a new design language from first principles.

## Reset workflow

1. Explicitly declare the current direction discarded.
2. Choose a radically different metaphor, not just a color variation.
   - Example: from green/ivory editorial cards → black private club / membership pass / concierge document.
3. Rebuild the visual system:
   - palette
   - typography posture
   - section rhythm
   - photo treatment
   - information module metaphor
   - CTA metaphor
4. Keep business facts and legally sensitive terms stable, but redesign their presentation.
5. Generate a complete contact sheet, not just one hero sample, because rhythm across all cuts is the failure mode.
6. Run visual QA specifically for:
   - word-level line breaks in Korean/English
   - small text legibility on mobile
   - whether the new direction is genuinely different from the discarded one
   - whether information cuts still persuade, not just look minimal
7. Package the new direction separately so it is not confused with the old version lineage.

## Escalation: when private-club is still too shallow

If the user says the issue is **not color** after a private-club/black-gold reset, stop iterating on the private-club metaphor. Load `references/complete-layout-reset-after-color-rejection.md` and rebuild the section mechanics themselves.

A structural reset should replace the cut vocabulary, not just the palette:

- from cards/passes/certificates → ad poster, conversation, operation route, touchpoint map, check-in flow, calendar, collage, invitation, protocol split, casting roster, checklist folder, purchase screen, condition list, content pipeline, CTA form
- from repeated headers and panels → varied mobile scroll scenes
- from theme polish → upload-readiness QA after the new structure is accepted

## Private Club / Membership Pass vocabulary

Good for VIP/CEO/high-ticket service pages:

- black, charcoal, platinum/soft gold
- monochrome or dark film photography
- membership certificate / private pass / invitation / concierge card
- ticket notches, thin gold strokes, barcode-like accents used sparingly
- fewer ivory cards; more black panels and controlled contrast
- price as a membership certificate, not a generic pricing table
- professional roster as a private directory
- CTA as a private consultation request

## Pitfalls

- A black/gold palette alone is not a reset; the layout metaphor must change too.
- Too much darkness can reduce mobile legibility. Increase auxiliary text size by 5–10% if needed.
- Minimal touchpoint pages can become under-persuasive. Add texture, photo fragments, or a stronger information hierarchy if they feel empty.
- Long English headlines in narrow panels often break at the character level; manually set short line breaks such as `PRIVATE CEO\nROUNDING`, `NEXT\nMEETING`, or `BRAND\nTOUCHPOINTS`.
- Always regenerate the ZIP after QA/report files are written so the delivered package includes the latest notes.
