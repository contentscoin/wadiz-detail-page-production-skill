# Final Upload Stabilization and Mobile QA for Cut-Based Detail Pages

Use when a cut-based detail-page set has already passed structural/design review and the user says to continue, proceed, or prepare the final upload version. This is a polishing and packaging gate, not another art-direction reset.

## Trigger signals

- The user accepts the current design direction but says `진행해`, `다음 진행`, or asks for upload/finalization.
- A previous version fixed the major structure, but small text, dark cuts, mobile readability, or package delivery still need final QA.
- The final deliverable is a sequence of 1080×1600 JPG/PNG cuts, a long preview, contact sheet, and ZIP package.

## Do not over-redesign

At this stage, do **not** change palette, section metaphor, or entire layout language unless the user explicitly rejects the structure again. Preserve the last accepted structure and apply only upload-readiness corrections:

- enlarge small support copy by roughly 3–8%
- lighten overly dark cuts without flattening the brand tone
- improve contrast for CTA, price, terms, profile descriptions, and condition lists
- check that line breaks, cards, bubbles, tabs, chips, and list rows do not overlap or clip
- keep price/terms and legal-risk text exact

## Practical QA flow

1. Clone the previous generator/output into a new versioned script and output folder so the accepted version remains preserved.
2. Identify weak cuts from contact sheet review: usually small supporting copy, dark sections, CTA chips, terms/price rows, and profile captions.
3. Patch only those cuts and regenerate all assets.
4. Verify with real file outputs:
   - 15 PNG cuts
   - 15 JPG cuts
   - every PNG exactly 1080×1600
   - contact sheet dimensions
   - long preview dimensions
   - ZIP test via `zipfile.testzip()`
   - SHA256 and byte sizes
5. If browser/mobile preview is unavailable due local setup, do not hard-code that failure into skill behavior. Instead generate mobile-viewport crops from the actual long image:
   - For a 390×844 phone ratio at 1080px width, crop about `int(1080*844/390)` px high windows from the long image.
   - Save several viewport crops and a strip/contact image for visual QA.
   - Report that this is a mobile-ratio crop QA, not a live browser run.
6. Run visual QA on at least:
   - contact sheet
   - long/mobile viewport strip
   - changed cuts
   - price/terms cut
   - CTA cut
7. Add a short QA report and selection note into the output folder before final packaging.
8. Create two packages when messaging delivery or file-size limits are likely:
   - **Full ZIP**: PNG, JPG, docs, preview assets
   - **Lite/upload ZIP**: JPG cuts, contact sheet, long preview, QA docs, mobile QA images; omit PNG to keep file size small
9. Verify both ZIPs after final docs are included. If duplicate names are warned during ZIP creation, rebuild without duplicates.

## Reporting pattern

Final response should include actual deliverables in the format supported by the active runtime. Use `MEDIA:` lines only in Hermes messaging contexts that explicitly intercept them; otherwise provide plain file paths, download links, or repo artifact paths:

- contact sheet
- long preview
- lite/upload ZIP first if file size matters
- full ZIP second when useful

Keep the report concise: list what changed, verification results, and which package is recommended for actual upload.

## Pitfalls from session learning

- A user saying the design issue is “not color” requires a structural reset, but once a reset version is accepted, later `진행해` means stabilize and package, not redesign again.
- Do not call work final after creating images only; add QA docs, regenerate ZIPs, verify file counts/sizes, and include deliverable attachments.
- Avoid sending only a large full package if the active channel may drop it. Provide a lite JPG-centered package under a safer size threshold.
- If a tool setup issue blocks browser QA, capture the workaround (mobile-ratio crop QA) rather than a negative rule about the browser tool.
