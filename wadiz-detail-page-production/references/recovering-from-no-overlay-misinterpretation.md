# Recovering From No-Overlay Misinterpretation

Use this when a user rejects a Wadiz/detail-page image set after asking for no text overlays, image-only output, no source labels, or no cut-number overlays.

## Session lesson

A request like `텍스트오버레이하지말고 이미지 단독생성해`, `출처 표기할필요없어`, or `Cut 1 2 3 번호도 없애줘` can mean:

- remove **debug/meta overlays** (`CUT 01`, source labels, review badges, top HTML explanation), and
- avoid placing text **on top of photos**, but
- still produce a real sales/detail-page asset with product explanation in separate editorial text panels.

It does **not** automatically mean: remove every word from the final image, replace copy with abstract cards, use stick figures, or deliver a moodboard/contact-sheet visual test.

## Correct restart pattern after rejection

If the user says the output is wrong/errored and asks to discard/restart:

1. Treat the rejected set as failed, not as a minor patch target.
2. Archive or supersede the rejected artifact directory/ZIP so it is not delivered again.
3. State the corrected interpretation briefly: no cut numbers/source/top wrapper, no text over photos, but product-detail copy remains inside dedicated text panels.
4. Regenerate from the last good detail-page structure, not from the failed abstract/no-text generator.
5. Verify the new contact sheet visually before deployment.
6. Deploy only after confirming:
   - route wrapper starts directly with images,
   - no visible top explainer/badges/QA notes,
   - no `CUT 01`/debug/source labels in the rendered cuts,
   - the page still reads like a product/service detail page, not a moodboard.

## QA reject conditions

Reject and restart if the contact sheet shows any of the following:

- stick figures, placeholder icons, fake UI bars, or abstract cards replacing sales content;
- no meaningful product/service copy when the deliverable is a Wadiz/product-detail page;
- source labels, review-status labels, or cut numbers on customer-facing cuts;
- top route copy like `15 cuts`, `publication review required`, or internal QA notes;
- a contact sheet passed off as the final long detail page.

## Better language to use with the user

- Good: `사진 위 오버레이는 제거하고, 설명 문구는 별도 정보 패널로 넣겠습니다.`
- Good: `컷 번호/출처/검수 배지는 제거하되 상세페이지 설명력은 유지하겠습니다.`
- Bad: `텍스트를 모두 제거한 이미지 단독형으로 만들었습니다.` unless the user explicitly asks for a no-text mood test.
