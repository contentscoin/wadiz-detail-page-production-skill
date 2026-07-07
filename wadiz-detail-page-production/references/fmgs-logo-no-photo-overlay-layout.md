# FMGS Logo + No Photo-Overlay Layout Pattern

Use when producing FMGS/CEO Golf Wadiz-style detail pages and the user provides an FMGS logo image while saying not to add text as an overlay.

## User correction captured

- `텍스트를 포함해서 이미지 생성해야지` means the delivered PNG/JPG should contain the copy inside the final image asset, not just in surrounding HTML or a separate caption.
- `오버레이로 텍스트 넣지마` means do not place Korean copy directly over the photographic scene. It does **not** mean remove all text from the detail-page image.
- Correct interpretation: build the final cut image as a designed editorial unit where photo zones and text panels are separate.

## Recommended composition

For each 1080×1600 cut:

1. Top brand strip with the FMGS logo.
2. Photo block with no text on top of it.
3. Separate typography panel below/above/beside the photo for headline, product definition, price, FAQ, or CTA.
4. Consistent deep green / ivory / champagne gold palette.
5. Keep price, count, phone, email, caution copy in deterministic typography inside the final image asset.

## Hybrid Film + Information layout pattern

When a user objects that the page still looks like repeated `photo frame + text frame` cards, do **not** keep making every cut a boxed split panel. Switch to a hybrid pattern:

- Emotional/service cuts: dominant film-like photography, usually 70–85% of the canvas, with copy in a quiet solid band/negative-space field rather than a separate card.
- Price/process/policy cuts: precise information modules are acceptable and should look intentional, like a premium ticket, contract sheet, or process board.
- Profile lineup cuts: avoid three identical cards; use magazine asymmetry with one featured profile and supporting profiles.
- Corporate-promotion cuts: use a refined touchpoint/network map rather than fake ad screenshots or repeated chips.
- Limit obvious boxed photo frames to the minority of cuts; the frame should not become the visual subject.

This preserves the “no text directly over photos” rule while avoiding a templated brochure feel.

## Logo handling

If the user provides a JPG logo on a colored background:

- Treat it as a reference/source asset, not final brand artwork.
- Extract a temporary white transparent logo only for preview packages if needed.
- Record in QA that final upload should replace it with a transparent PNG, SVG, or vector original.
- Do not ask the image model to recreate the logo; use the supplied pixels or a cleaned derivative.

If the user explicitly approves use of the FMGS logo original and says it may be modified to fit the page:

- Preserve the supplied logo geometry/alpha and create page-tone derivatives rather than redrawing the logo.
- Test at least three tones on the actual page palette: original white, warm ivory, and champagne gold.
- For deep green / champagne golf pages, prefer `warm ivory` when it reduces the harshness of pure white without competing with gold rules and accents.
- Record the approval in a `logo-profile-approval-note.md` or equivalent rights note, and update preflight/readiness docs so logo approval is no longer listed as a blocker.
- Keep the unmodified source logo and the adjusted derivative in the package so the designer/client can switch if needed.

## QA checks

- Does every final PNG include the intended text inside the image file?
- Is text kept off the photographic scene and placed in separate editorial panels?
- Is the supplied FMGS logo visible in the brand strip?
- Are `100회`, `1,500만원`, `VAT 포함`, phone, and email correct where used?
- Are legal/risk notes softened: no tax effect guarantee, no ad/sales performance guarantee, pro/schedule/place after consultation?
- Is the result labeled `pre-production preview` until real logo originals, real photos/video, and approved notices are supplied?

## Pitfalls

- Do not respond to `오버레이로 텍스트 넣지마` with a no-text mood board; that under-explains the offer.
- Do not put large headlines on top of fairway/people photos if the user objected to overlays.
- Do not present a JPG-derived logo extraction as final logo fidelity.
- Do not call concept/pre-production cut images publication-ready before logo, real evidence assets, and notices are approved.
