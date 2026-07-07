# Live Route Is Preview, Not the Detail-Page Deliverable

## Session lesson

The user asked to use the Wadiz skill and make a 상세페이지. A previous implementation replaced the target route with a responsive Next.js landing/service page and reported it as a detail page. The user corrected: “이건 상세페이지가 아니라 랜딩페이지인데?” and then “처음부터 다시작업해봐 와디즈스킬사용해서 상세페이지만들어”.

This correction applies to any marketplace/Wadiz/product-detail task even when the final asset is deployed to a web route.

## Durable rule

A `/detail`, `/detail2`, preview URL, or deployed Next.js route is **not** the deliverable by itself. It is only a wrapper or preview unless the page body is built from the cut-based detail-page assets.

The deliverable must first exist as product-detail assets:

- exact cut count, usually 12 or 15 cuts
- individual image cuts, default `1080×1600`
- optional long detail image, e.g. `1080×19200` or `1080×24000`
- contact sheet for review
- ZIP package with cuts, long image, gallery/manifest, fact map, cut plan, QA report
- web route only as a preview wrapper that renders the cut assets sequentially

## Correct recovery workflow after landing-page drift

1. Admit the route is a landing page if it has navbar/sections/FAQ/CTA service-page structure and lacks cut images.
2. Reclassify the task as product/service detail-page production.
3. Create the cut assets first (`cuts/cut-01.jpg` … exact count).
4. Create the long image by stacking cuts.
5. Create a contact sheet and ZIP.
6. Replace the web route with a sequential cut-image preview wrapper, not another generic page.
7. Verify:
   - `CUT_COUNT` equals the promised count
   - all cut dimensions are `1080×1600`
   - long image dimensions equal `1080×(1600*count)`
   - ZIP `testzip` returns `None`
   - live HTML references each cut image
   - sitemap/HTTP checks pass if deployed

## Useful implementation pattern

For a Next.js preview route, import `next/image`, define a cut array, and render each image in order. The route can include a short internal review note, but customer-facing content should be inside the cut images rather than in surrounding landing-page sections.

Do not call the work complete because SEO metadata, JSON-LD, FAQ, or CTA exists. Those are website-quality signals, not marketplace detail-page completion signals.
