# Concept Image Composition And QA Notes

Use these notes when a user asks to continue from a Wadiz-style production brief into concept cut images before publication assets are fully confirmed.

## When concept generation is allowed

Proceed only when:

- the user explicitly says to continue or generate drafts/concepts;
- the cut plan and claim guard already exist;
- output is labeled `CONCEPT ONLY` / `publication_blocked`;
- official facts/assets that are missing are kept out of final claims or marked as confirmation-needed.

Do not call the result publication-ready until official price/terms/logo/photos/profiles/contact details and OCR/layout QA pass.

## Recommended production pattern

1. Generate **text-free** premium background scenes first. Prompt for no text, no logo, no signage, no readable letters.
2. Compose the final 1080×1600 cut image deterministically with PIL/HTML/canvas:
   - brand strip;
   - photo/background zone;
   - separate typography panel;
   - headline, subcopy, cards, caution, and CTA text inserted by code;
   - `CONCEPT ONLY` footer when facts/assets are incomplete.
3. Keep Korean copy out of the image model. Use deterministic text rendering with a Korean font such as Noto Sans CJK KR.
4. Preserve the exact cut count. For serious Wadiz output, create one PNG per cut, not only a long image.
5. Build derived review artifacts:
   - contact sheet;
   - optional 1080×N long image;
   - gallery HTML;
   - ZIP package;
   - manifest and QA report.

## English/Korean wrapping pitfall

When rendering mixed Korean/English headlines, do **not** use naive character wrapping only. It can create visible defects such as `CEO G olf` or `CEO G\nolf`.

Use a wrapper that:

- preserves ASCII word tokens where possible;
- allows manual headline overrides for `CEO Golf`, product names, prices, and brand names;
- breaks Korean by character only after trying space/word wrapping;
- runs visual QA on the contact sheet before delivery.

## Contact sheet QA

Before sending the package, inspect the contact sheet for:

- exact cut count;
- all cuts at expected dimensions;
- no broken English brand/product words;
- Korean headline readability at thumbnail and full size;
- consistent premium tone/palette;
- no text over photographic scenes when the user requested no photo-overlay;
- `concept/publication_blocked` label still present if assets/facts are incomplete.

If QA finds a visible typography error, regenerate the deterministic composition and rebuild the ZIP before reporting completion.
