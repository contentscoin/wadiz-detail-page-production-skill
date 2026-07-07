# Minimal Overlay Replanning Pattern

Use this when a Wadiz-style detail page starts to look like a design board, infographic, proposal slide, or generic landing page instead of a photo-led mobile story page.

## Trigger signals

- User says the output has too much text, looks like a design board, internal planning sheet, infographic, or generic landing page.
- User asks to redo both `내용 기획` and `디자인 기획` with minimal overlay.
- Prior output used repeated bottom boxes, cards, diagrams, heavy FAQ blocks, or deterministic overlay on most cuts.
- The service is premium/B2B and the value should be carried by mood, scene, evidence, and trust rather than explanatory paragraphs.

## Replanning move

1. Stop extending the current visual set. Do not patch the old long image by adding more cuts.
2. Re-separate the work into:
   - content plan: story spine, fact map, claim guard, cut roles
   - design plan: mood, scene direction, layout anatomy, overlay budget
3. Prefer a shorter, stronger cut count when overlay must be minimal. For premium service pages, 12 cuts is often safer than 15 because it reduces repeated information cards and internal-checklist drift.
4. Move explanations out of the image and into HTML/body copy/captions. Image overlays should only interpret the scene or lock exact facts.
5. Build an `overlay budget` per cut before generating visuals:
   - 0 = scene only
   - 1 = one short headline
   - 2 = short labels only
   - 3 = exact facts such as price, count, contact, FAQ/caution
6. Only high-accuracy information cuts should use level 3: reward/price, FAQ/caution, final CTA.
7. Before full production, make 3 sample cuts first: opening hook, product reveal, price/reward. Run mobile legibility and mood QA, then expand.

## Premium service example pattern

For FMG/FMGS CEO Golf-like B2B premium golf services:

- Positioning: not a cheap 출장레슨 or simple lesson ticket; frame as executive/VIP golf relationship operation.
- Public page center: premium golf field experience, VIP protocol, corporate relationship/contact point, operating trust.
- Keep confirmed facts explicit: `100회`, `1,500만원 VAT 포함`, official contact.
- Keep conditional facts out of confident overlays: pro assignment, venue/date availability, rounding/protocol/promotion scope.
- Block guarantee-style claims: tax treatment, ad performance, sales outcome, satisfaction, specific pro assignment.

## QA checks

- At 25% mobile-scale, the main headline and exact facts are readable; long explanations are not expected to be in-image.
- Most cuts are full-bleed or cinematic sequence scenes, not cards.
- No more than 0–2 text zones per cut except price/FAQ/CTA.
- Repeated bottom fact boxes do not appear across the whole page.
- Visuals communicate the cut role even if the overlay is removed.
- Fake Korean text, fake logos, random signage, and decorative UI are reject conditions.
