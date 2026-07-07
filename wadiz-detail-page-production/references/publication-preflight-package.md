# Publication Preflight for Premium Detail Pages

Use when a premium ecommerce/detail-page project reaches a strong preview state but still lacks real-world source assets or final business terms.

## Status naming

Do not call the work `publication_ready` when any of these are missing:

- Real service/site photos or explicitly approved final scene assets.
- VAT/payment/refund/transfer/option terms.
- Rights approval for logos, profile images, or brand assets.

Use a staged label instead:

- `production_preview_review_required`: design is visible but rights/terms are not settled.
- `publication_review_required`: close to upload, but at least one real-photo/terms blocker remains.
- `publication_review_required_logo_profile_approved`: logo/profile rights are approved, but real photos or final terms remain.
- `publication_ready_candidate`: all blockers are supplied and final QA is pending.

## Preflight package contents

Create a package folder and ZIP containing:

- `current-preview/` or `current-preview-v31-*`: current cuts, contact sheet, long preview.
- `publication-readiness-report.md`: explicit pass/fail blockers.
- `asset-slot-map.json`: cut-by-cut real-photo replacement slots with priority.
- `final-terms-checklist.md`: VAT, payment, refund, transfer, options, usage period, per-session definition.
- `copy-risk-review.md`: claims/guarantees/overpromise review.
- `upload-gate-checklist.md`: final image, copy, and file gates.
- `source-and-rights-note.md` plus any `logo-profile-approval-note.md`.
- `manifest.json`: counts, image sizes, checksums, and ZIP verification outcome.

## Cut replacement slot mapping

For premium service pages, prioritize real/approved images for:

1. Hero consulting/lounge or representative service scene.
2. Networking/rounding relationship scene.
3. Real coaching/lesson scene.
4. Field/tee or round scene.
5. VIP reception/clubhouse scene.
6. Final consultation/CTA scene.

Price and policy cuts can remain design-led modules; for those, terms accuracy is more important than photo replacement.

## Rights approval handling

When the user approves logo or profile image use mid-session:

1. Update the readiness report so those are no longer blockers.
2. Add an approval note that quotes the approved asset class, not the entire chat.
3. Keep remaining blockers visible; do not upgrade to `publication_ready` if real photos or terms are still missing.
4. Regenerate the package/ZIP after documentation changes so the delivered archive reflects the updated state.

## Verification before delivery

- Verify every PNG cut is 1080×1600.
- Verify 15 PNG and 15 JPG cuts when both formats are promised.
- Verify contact sheet and long preview exist.
- Verify ZIP integrity with `ZipFile.testzip()`.
- Deliver the ZIP and key previews using the active runtime's supported attachment/file convention. In Hermes messaging contexts this may be `MEDIA:/absolute/path`; in CLI/Codex contexts use plain file paths or artifact links.
