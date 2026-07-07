# Real Profile Bio Evidence Rule

Use this reference when a detail page includes people/professional profiles (golf pros, instructors, doctors, experts, advisors, creators, etc.).

## Trigger

The user asks to include public profiles, 공개 프로필, 약력, credentials, roster size, or named professionals.

## Rule

Do **not** satisfy this with labels such as `공개 프로필`, `KLPGA 프로`, `USGTF 프로`, `약력 공개 가능`, or generic title cards. The rendered cut must contain actual profile/bio facts that are either:

1. user-provided source facts, or
2. verified from accessible public profile/search-result snippets, with the source recorded in docs/QA.

If the profile source is not verified, exclude that person from the public-facing profile card or mark them as `원본 제공 후 반영` outside the rendered sales promise. Do not invent credentials or infer from file names/images.

## Practical workflow

1. Build a roster table:
   - name
   - photo asset path
   - verified bio bullets
   - source URL/snippet/file
   - status: `verified`, `user_provided`, `unverified`, `do_not_publish`
2. For each profile card, render only verified/user-provided bullets.
3. If total roster count is user-provided but not all profiles are publishable, separate the claims:
   - `총 12명 확보` can be shown if user-provided.
   - `위 N명은 공개 약력 확인` should be shown for verified profile cards.
   - `나머지는 원본 제공 후 반영` belongs in notes or a cautious footer, not as a fake profile card.
4. Save a source note under `docs/` or `qa/`, e.g. `docs/pro-profile-source-notes.md`, listing the exact public snippets or files used.
5. QA the rendered cut visually to ensure bio bullets are legible and not clipped.

## Example correction pattern

Bad:

- `김태이 — KLPGA 프로 / 공개 프로필`
- `이아랑 — USGTF 프로 / 공개 프로필`
- `박지예 — USGTF 프로 / 공개 프로필`

Better:

- `이아랑 — KLPGA 점프투어 활동 / 최경주재단 출신 / USGTF 정회원 / AJGA 활동 이력 / 후원 이력`
- `박지예 — WGTOUR 프로 / USGTF 프로 / 現 KLPGA 투어 활동 / TPI Golf Level 1 / 생활체육지도자 2급`
- Footer/docs: `총 12명 확보 · 위 2명은 공개 검색 약력 확인 / 나머지는 원본 제공 후 반영`

## Pitfall

A user saying “공개프로필 약력을 넣어줘” often means “put the actual published bio contents in the page,” not “add text saying public profile.” Treat user frustration about this as a production QA failure and regenerate the affected cut before reporting completion.
