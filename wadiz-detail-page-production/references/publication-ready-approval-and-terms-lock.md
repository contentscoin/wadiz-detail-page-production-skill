# Publication-ready approval and terms lock

Use this reference when a cut-based service/detail-page project moves from `publication_review_required` to `publication_ready` through explicit user approvals.

## Trigger

Apply when the user confirms one or more of:

- full visual-set approval, including generated/AI photoreal backgrounds;
- logo/profile/asset usage approval;
- final commercial terms such as VAT, refund, transferability, options, usage period, payment/evidence method;
- a previously missing publication blocker is now approved by the user.

## Procedure

1. Treat the user's approval as a state transition, not just a chat note.
2. Update rendered cuts when the approval changes customer-facing content. Typical examples:
   - price/VAT line;
   - payment or evidence method such as `세금계산서`;
   - refund/transfer/usage-period/option conditions;
   - status-sensitive terms that would otherwise remain `확인 필요`.
3. Remove or revise any customer-facing wording that conflicts with the confirmed terms. Example: if `양도 가능` is confirmed, do not leave a line implying transferability is still subject to confirmation; scope consultation language only to option range or operational details.
4. Update package documents in parallel:
   - readiness report;
   - upload gate checklist;
   - final terms checklist;
   - source/right note or approval note;
   - manifest/status file.
5. Regenerate the final image sequence/package and verify:
   - all cut counts are intact;
   - all images remain the target dimensions;
   - ZIP integrity passes;
   - the terms-bearing cuts have no text clipping/overlap;
   - internal labels such as `review_required`, `확인 필요`, or debug cut labels do not appear in customer-facing images.
6. Only mark `publication_ready` after both are true:
   - all previously blocking assets/visuals are approved or replaced;
   - final customer-facing terms are reflected in both images and docs.

## Status labels

Use status labels consistently:

- `publication_review_required`: real blockers remain.
- `publication_review_required_logo_profile_approved`: asset rights improved but publication blockers remain.
- `publication_review_required_terms_confirmed_logo_profile_approved`: core terms and logo/profile are approved, but visual-source approval or operational details still block publication.
- `publication_ready`: user has explicitly approved the full visual set and final terms needed for customer-facing publication.

## Customer-facing copy guard

Confirmed terms should be clear and short inside image cuts. Keep operational caveats in docs unless they are material to the customer decision. Good image-level examples:

- `VAT 포함`
- `세금계산서 발행`
- `사용기간 1년`
- `양도 가능`
- `환불 불가`
- `옵션 별도 협의`

Avoid vague or contradictory phrases once a term is confirmed, such as:

- `양도 가능 조건은 상담 시 확인합니다` when transferability is already approved.

Safer alternative:

- `옵션 범위와 세부 진행 조건은 상담 시 확인합니다.`

## Delivery pattern

For delivery, send or report the primary final artifacts using the active runtime's supported attachment/file convention:

- contact sheet;
- long preview;
- final ZIP package.

Mention verification briefly: cut counts, dimensions, ZIP integrity, and final status.