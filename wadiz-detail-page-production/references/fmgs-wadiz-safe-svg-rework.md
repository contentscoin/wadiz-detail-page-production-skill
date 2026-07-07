# FMGS/Wadiz Rework: Official Source + Safe SVG Rendering

Use when working on FMGS/CEO Golf or similar premium service Wadiz-style detail pages after the user rejects low-fidelity, overlay-heavy, or text-colliding drafts.

## Session-derived lessons

- When the user points to an official site such as `fmgs.co.kr`, inspect the relevant official route first. Official page facts win over external search snippets and generic assumptions.
- Do not interpret “텍스트 오버레이하지 마” as “make a text-free moodboard.” For detail pages, the image assets still need persuasive copy; place it in separate editorial panels, not on top of photos.
- Low-fidelity placeholder visuals, stick figures, generic bars, wireframes, or moodboards must be treated as failed drafts, not customer-facing detail-page output.
- Visible wrapper/header text, QA badges, `15 cuts`, `publication review required`, source labels, and `CUT 01` style debug overlays must not appear on the deployed detail route or final cut images.
- If text repeatedly overlaps when using PIL/manual drawing, switch to a layout-engine style workflow: SVG/CSS or HTML/CSS cut templates rendered to 1080×1600 images. Use fixed panels, bounded copy, and visual QA on original-size cuts.
- Create a channel-safe slim ZIP when the full package contains SVG/PNG sources and becomes too large; include JPG cuts, long image/contact sheet, docs, and QA.
- If OpenCrab/Wadiz pack retrieval times out or is unreachable, do not claim pack-backed production. Mark `publication_review_required` / `pack_retrieval_unavailable`, proceed only with loaded skill references and official facts, and report the blocker honestly.

## Recommended rebuild sequence

1. Archive the rejected version before regenerating.
2. Load `ecommerce-detail-page` and `wadiz-detail-page-production` plus production/base references.
3. Verify official service facts from the client site:
   - offer/price/count,
   - included vs optional items,
   - refund/transfer terms supplied by the user,
   - professional profiles and contact info.
4. Attempt OpenCrab/Wadiz pack retrieval once with narrow queries; if it fails repeatedly, stop retrying and label the evidence gate honestly.
5. Build a 12/15-cut Wadiz-style sequence: hook → pain → product reveal → benefit/proof → offer/options → profiles/trust → objection/notice → CTA.
6. Render final review cuts with separated photo and text zones. Avoid text directly on photo blocks.
7. QA at three levels:
   - contact sheet for overall rhythm,
   - original 1080×1600 hero/profile/CTA cuts for readability,
   - live route HTML for wrapper/debug text and exact image count.
8. Deploy only after lint/build pass and live HTTP/image checks pass.

## Reject conditions

- Text collisions, clipped Korean, or unreadable tiny text.
- Text over photographic scenes when the user asked for no overlay.
- Cut-number/source/QA/debug overlays in customer-facing images.
- A web landing page substituted for sequential detail-page image cuts.
- Claiming OpenCrab pack use when retrieval actually failed.
