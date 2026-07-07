# FMG CEO Golf / Premium Service Wadiz Design Planning Notes

Use these notes when a user asks for a Wadiz-style detail page for a premium service such as CEO Golf, VIP protocol, B2B membership, consulting, or hospitality.

## Lesson from session

The user corrected the workflow because the output drifted into a generic mobile landing page. For this task class, a phone-friendly HTML page with hero/CTA/FAQ is **not enough**. The expected artifact is a Wadiz-style long-form detail page: sequential cut storytelling, reward/offer cards, proof blocks, objection handling, caution notes, and a final CTA.

## Required sequence

1. Build or revise the **Wadiz story spine** before designing: problem → product reveal → reward/price → target/use scenes → proof → comparison/modules → trust facts → FAQ → caution → CTA.
2. Only after the story spine is accepted, create a **design plan**: visual concept, design tokens, typography, cut layout anatomy, components, image-generation policy, and QA rules.
3. Do not jump from copy/blueprint to a generic mobile landing page. If delivering HTML, it should present the cut sequence or long-image style, not just a normal service landing page.
4. For premium service pages, keep the design premium and restrained: deep green / champagne gold / ivory, private club / executive protocol mood, large Korean headlines, one main message per cut.
5. Use image generation for text-free background scenes only; overlay Korean headlines, prices, CTA, and caution text deterministically.

## Pitfall to avoid

Bad direction:
- Hero + metrics + generic FAQ + sticky CTA = mobile landing page, not Wadiz detail page.
- Design that looks like a corporate service page instead of a cut-by-cut funding/detail-page story.
- Treating `CTA links present` or SEO tags as evidence that the Wadiz task is complete.

Better direction:
- 12/15 individual 1080×1600 cuts.
- Optional 1080×19200 or 1080×24000 long image.
- Contact sheet for quick review.
- A design board showing palette, typography, component system, and 12/15-cut rhythm.
- Explicit asset gate: logo, real lesson/GIF footage, protocol/rounding photos, approved caution copy.

## Design planning deliverables

When the user says “디자인도 기획해” or similar after Wadiz planning:

- `Design_Plan.md`: concept, mood, tokens, typography, layout system, cut-by-cut design direction, image prompts, QA criteria.
- `Design_Board.png`: one-page board with color tokens, type scale, cut layout anatomy, components, story rhythm.
- `design-tokens.json`: palette, type roles, cut size, output status.
- ZIP package with the above and relevant references.

## Premium service default concept pattern

Concept example: **Private Fairway Protocol**

- Mood: private country club, executive lounge, VIP protocol, calm trust.
- Colors: deep green, fairway green, champagne gold, ivory, muted sage.
- Layout: large headline at top, visual/proof block in middle, fact/caution note at bottom.
- Components: reward card, pro profile card, scenario timeline, comparison table, optional modules, FAQ accordion, caution card, final consultation CTA.

## Implementation lesson: `fmgs.co.kr` source-backed page requests

When the user asks to make an FMG CEO Golf detail page from `fmgs.co.kr`, treat the official site as the product/source-fact authority and produce an inspectable artifact, not only a plan.

Recommended route:

1. Fetch `https://www.fmgs.co.kr/` and extract only source-backed facts first: FMGS identity, 58만 골퍼 DB, 2,400여 개 카카오 채널, FMG CEO Golf service wording, contact info.
2. Combine with existing approved FMG CEO Golf page facts only when already present in the project/session: golpro.kr 100회권, 1,500만원 VAT 포함, 담당 프로 배정.
3. If OpenCrab Wadiz pack retrieval is unavailable/weak, mark `pack_not_verified` but still produce the strongest allowed artifact: a `publication_review_required` HTML cut-sequence page plus fact map/brief. Do not block on the pack if the user asked for an actual page and enough source facts exist.
4. Implement as a cut-style route (example: `/detail`) with 12/15 sequential story cuts, not a normal service landing page. Include sitemap/metadata/JSON-LD when in a Next.js site.
5. Keep optional modules as 상담/검토/확인 필요: 라운딩, VIP 의전, 브랜드 홍보, 특정 프로 배정, 세무/회계/광고효과.
6. Verify with real commands before reporting: lint, build, local or live HTTP 200, live HTML markers, sitemap entry, metadata/H1/JSON-LD checks where possible.

## QA checks

- Does it read as a Wadiz-style detail page, not a generic website landing page?
- Can the viewer understand the product/reward by cuts 01–04?
- Does each cut carry one main message?
- Are price/count/contact facts deterministic and source-backed?
- Are tax/accounting/ad-effect claims softened or moved to caution blocks?
- Are optional modules clearly marked as consultation/협의 rather than included by default?
- If an actual web route was requested, did you deploy or otherwise provide a live/inspectable URL and verify live HTML?
- Is the design board/page free of text overlap at review size?
