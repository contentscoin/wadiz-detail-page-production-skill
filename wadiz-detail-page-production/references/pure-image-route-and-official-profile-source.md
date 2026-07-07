# Pure Image Route + Official Profile Source Lessons

Use when a Wadiz/product-detail task is rendered on a web route and includes named pros/instructors/experts.

## Lessons captured

1. **Official product/service page first**
   - Before using external search snippets for profiles, check the client/service official page and sitemap routes.
   - For FMGS CEO Golf, the roster was on `https://www.fmgs.co.kr/business/ceo-golf`, not just the homepage.
   - If a user says “it is on the site,” immediately inspect the relevant sub-route before concluding a profile is unverified.

2. **Route wrapper must be invisible unless asked**
   - If the route is only a preview/deployment wrapper for a detail page, do not add visible top copy such as title, subtitle, badges, review notes, or QA memo.
   - The route should start with the first 1080px-wide cut image and continue with the cut sequence.
   - Keep metadata/alt text for SEO/accessibility, but visible wrapper content should not appear unless the user asked for an explanatory page.

3. **No production overlays on final cut images**
   - Remove editor/debug labels such as `CUT 01`, `CUT 02`, `publication review required`, or internal status text from rendered sales cuts.
   - Cut numbers may exist in filenames, docs, prompts, contact sheets for internal QA, or screen-reader-only captions, but not as visible marks on the final image sequence.

4. **Profile cut standard**
   - A professional-profile cut must include actual verified/user-provided bio bullets, not labels like “공개 프로필.”
   - Record the official source in docs/source notes.
   - If the official page conflicts with earlier external-search findings, official page wins.

## Verification checklist

- Live `/detail*` HTML contains 15 image refs and none of the visible wrapper phrases the user asked to remove.
- Fetch live `cut-01.jpg`, `cut-02.jpg`, and one profile cut; verify sizes and hashes changed after regeneration.
- Vision/contact-sheet QA confirms no visible `CUT 01/02/03` overlay remains.
- ZIP contains source notes for profile facts.
