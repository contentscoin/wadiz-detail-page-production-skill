# Hybrid Film + Information Layout for Premium Detail Pages

Use when a user rejects a cut set as too template-like, too boxed, or asks whether every image must be split into a photo frame plus a text frame.

## Core lesson

Do **not** make every cut a repeated `photo frame + text card` composition. It is safe and legible, but it quickly reads as a brochure/template instead of a premium detail page.

The better default for high-end services is **Hybrid Film + Information Inserts**:

- emotional/service cuts: dominant or full-bleed photographic scene, cinematic crop, minimal solid text band or side field
- information cuts: precise cream/ivory modules for price, process, conditions, policies, and CTA
- professional/roster cuts: magazine-style asymmetric profile layouts instead of identical cards
- brand/promotion cuts: map/network/touchpoint visuals instead of repeated three-card lists

## Design rules

1. Start by classifying each cut:
   - `FILM_FULL_BLEED` — hero, service moment, field/rounding, VIP/concierge, final CTA
   - `EDITORIAL_SIDE_FIELD` — relationship/problem framing, high-value narrative
   - `PRECISION_INFO_MODULE` — price, schedule, process, terms, conditions
   - `BRAND_TOUCHPOINT_MAP` — corporate promotion, distribution, exposure logic
   - `MAGAZINE_PROFILE_ASYMMETRY` — named professionals/rosters
2. Use large scenes for feeling, not thumbnail photos trapped in boxes.
3. Keep customer-facing Korean text deterministic, but place it in solid bands/side fields/cream information zones rather than directly over photo subjects.
4. Reserve cards/rounded modules for information that genuinely needs structure. Do not use the same card motif on every cut.
5. Avoid repeated top logo bars if they make the set feel like slides. Use brand marks selectively, or make them subtle.
6. For CTA cuts, use one strong contact block and a small set of visible next-step bullets; verify no bullet is cropped.
7. For price/ticket cuts, verify every row remains inside the module; long rows like `옵션 별도` often get pushed outside after font/spacing changes.

## QA checklist

- Contact sheet shows clear layout rhythm: film cuts, information cuts, profile cuts, CTA cut are visually distinct.
- The photo is not always framed as a small box; some cuts let the scene dominate 60–85% of the canvas.
- Text is not placed over important photo subjects.
- No internal/debug labels appear in rendered customer-facing cuts.
- Manual visual QA is run on at least: contact sheet, hero, roster/profile, price, CTA.
- After fixing QA notes, regenerate ZIP/package so the latest QA report is included.

## Common failure pattern

If the user asks “do we really need to split the image frame every time?” or says the layout still feels like cards, treat that as a structural design correction, not a minor styling request. Load this reference, create a new layout system, regenerate the cut set, and QA the contact sheet before reporting completion.

If multiple refinements still feel like PPT/templates or the user asks to discard the design and start over, escalate beyond `Hybrid Film + Information Inserts`: use `references/design-reset-private-club.md` for a full art-direction reset pattern (new metaphor, palette, typography posture, section rhythm, and package lineage) rather than polishing the same design language.
