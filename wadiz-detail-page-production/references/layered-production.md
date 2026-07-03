# Layered Cut Production (SVG Text Layer Pipeline)

Use this reference whenever a cut contains informational Korean text (price, offer, spec, FAQ, delivery, caution) or when OCR/text-match QA has failed more than once on in-image rendering. This pipeline replaces "regenerate the whole cut until the Korean text is legible" with "generate the scene once, render the text deterministically."

This is a **sanctioned production route**, distinct from the forbidden pattern of ad-hoc text overlay used to fake a finished page during planning. The difference is: this route is declared in the job schema, produces a layer manifest, and passes through the same gates as any other final artifact.

## Text Render Modes

Every cut job declares one of three modes in `imagegen-jobs.json`:

| Mode | Meaning | When to use |
|---|---|---|
| `in_image` | The image model renders Korean text inside the pixel output (legacy default) | Emotional/branded typography where text is part of the art: hero calligraphy, mood copy baked into the scene |
| `svg_layer` | The image model generates a text-free scene; all Korean text is rendered as SVG layers and composited | Informational text: offer/option, price, spec tables, FAQ, delivery/caution, comparison labels, badges |
| `hybrid` | Scene + short display copy rendered in-image; data/price/legal text as SVG layers | Hero cuts that need both a stylized headline and an accurate badge/price element |

Default routing by cut role (12-cut structure):

| Cut role | Default mode |
|---|---|
| 01 Hero hook | `hybrid` |
| 02 Pain/problem | `in_image` or `hybrid` |
| 03 Product reveal | `hybrid` |
| 04 Core benefit | `hybrid` |
| 05 Motion/proof | `svg_layer` (labels over scene) |
| 06 Detail proof | `svg_layer` |
| 07 Use scene | `in_image` or `hybrid` |
| 08 Comparison | `svg_layer` |
| 09 Offer/option | `svg_layer` (mandatory — price/offer text must be deterministic) |
| 10 Objection/FAQ | `svg_layer` |
| 11 Delivery/caution | `svg_layer` (mandatory — policy text must be deterministic) |
| 12 Final CTA | `hybrid` |

Hard rule: cuts 09 and 11 (and any cut carrying price, discount, policy, legal, or warranty copy) must use `svg_layer` or `hybrid` with that copy in the SVG layer. Money and policy text may never depend on image-model text rendering.

## Cut Directory Layout

```
cuts/
├── cut-09/
│   ├── layers.json             # layer manifest (SSOT for this cut)
│   ├── layer-0-bg.png          # generated scene, NO text (gpt_image or nano_banana)
│   ├── layer-2-text.svg        # Korean copy: headline/subcopy/info blocks
│   ├── layer-3-badge.svg       # price/discount/badge — fact-locked elements
│   └── cut-09.composite.png    # final composed output
└── cut-09.composite.png        # (optional copy at cuts/ root for gallery/ZIP tools)
```

Cuts using `in_image` mode keep the flat `cuts/cut-XX.png` layout; only layered cuts get a subdirectory.

## layers.json Schema

```json
{
  "schema_version": 2,
  "cut_id": "cut-09",
  "canvas": { "width": 1080, "height": 1600 },
  "text_render_mode": "svg_layer",
  "layers": [
    {
      "z": 0,
      "type": "image",
      "path": "layer-0-bg.png",
      "role": "background_scene",
      "engine": "gpt_image",
      "prompt_file": "../../prompts/cut-09.md",
      "asset_truth_level": "generated_concept"
    },
    {
      "z": 2,
      "type": "svg",
      "path": "layer-2-text.svg",
      "role": "korean_copy",
      "font": "Pretendard",
      "text": ["지금 시작하는 얼리버드 혜택", "옵션 구성 한눈에 보기"],
      "text_source": "cut-plan.json#cut-09",
      "editable": true
    },
    {
      "z": 3,
      "type": "svg",
      "path": "layer-3-badge.svg",
      "role": "offer_badge",
      "text": ["39,900원", "26% 할인"],
      "fact_source": "product_fact_source",
      "fact_status": "confirmed",
      "editable": true
    }
  ],
  "text_safe_area": { "x": 0, "y": 1080, "width": 1080, "height": 520 },
  "output": "cut-09.composite.png"
}
```

Rules:

- Layer `z: 0` is the base scene. Its generation prompt must explicitly forbid text: append `No text, no letters, no typography, no watermarks anywhere in the image.` to the scene prompt.
- Every SVG layer carrying a fact (price, discount, delivery, policy) must declare `fact_source` and `fact_status`. `fact_status` must be `confirmed` before the composite can be labeled anything above concept.
- `text` arrays in SVG layers are the QA reference: `qa-detail-page.mjs` verifies the strings exist verbatim inside the SVG file. This replaces OCR for `svg_layer` cuts — OCR remains required for `in_image` and for the in-image portion of `hybrid` cuts.
- `text_safe_area` comes from the prompt brief's text-safe area and is where SVG text layers should be positioned. The scene prompt should keep this region visually calm (negative space, low detail).

## SVG Authoring Rules

- Fonts: Pretendard or Apple SD Gothic Neo style; declare `font-family` in the SVG and rely on `@resvg/resvg-js` system font loading. Bundle the font file in `refs/fonts/` if the runtime lacks it.
- Mobile readability floors on the 1080-wide canvas: body ≥ 34px, subcopy ≥ 42px, headline ≥ 64px, line-height ≥ 1.35.
- Contrast: text must sit on a scrim, card, or calm scene region. If the scene fights the text, add a semi-transparent card `<rect>` in the SVG rather than regenerating the scene.
- One SVG layer per concern: copy layer vs fact/badge layer. A price change must only touch `layer-3-badge.svg`.
- Do not embed raster images inside SVG layers.

## Composition and Packaging

```bash
node skills/wadiz-detail-page-production/scripts/compose-layers.mjs cuts/cut-09
node skills/wadiz-detail-page-production/scripts/qa-detail-page.mjs projects/{id}
node skills/wadiz-detail-page-production/scripts/build-long-image.mjs projects/{id}/cuts
```

- `compose-layers.mjs` renders SVGs at canvas width and stacks layers by `z`.
- Gallery/ZIP tools pick up `cut-XX.composite.png` automatically (they prefer `.composite.png` over `cut-XX.png`).
- The ZIP for layered projects should include `layers.json` and the SVG sources — they are the editable master, and re-delivery after a price change is a recomposite, not a regeneration.

## Layer-Aware Regen Loop

When QA fails on a layered cut, classify the failure before regenerating:

| Failure | Action | Cost |
|---|---|---|
| Korean text wrong/missing/ugly | Edit the SVG layer, recomposite | seconds, no image-model call |
| Price/offer/policy changed | Edit `layer-3-badge.svg` (or the fact layer), recomposite | seconds |
| Text unreadable against scene | Add/adjust scrim card in SVG, recomposite; only regenerate the scene if the safe area itself is unusable | seconds to one regen |
| Scene wrong (product shape, mood, layout) | Regenerate `layer-0-bg.png` only, keep all SVG layers | one image-model call |
| In-image display copy broken (`hybrid`) | Follow the legacy regen loop for the scene, or demote that copy to the SVG layer | one image-model call |

Update `regen_cycle` in the manifest only when an image-model call was made. SVG edits increment `svg_revision` instead. The 3-cycle escalation limit applies to image-model regens only.

## Job Schema v2 Fields

Cut jobs in `imagegen-jobs.json` gain these fields (see `base-ecommerce-clone/codex-image-integration.md` for the full schema):

```json
{
  "id": "cut-09",
  "text_render_mode": "svg_layer",
  "category": "tech_appliance",
  "style_template": "coupang_practical",
  "layer_outputs": ["layer-0-bg.png"],
  "svg_layers": ["layer-2-text.svg", "layer-3-badge.svg"],
  "scene_prompt_no_text": true
}
```

For `svg_layer` jobs, the Codex `$imagegen` task generates only `layer-0-bg.png` (text-free scene). SVG layers are authored by the coordinator directly from `cut-plan.json` copy and the fact map — never by the image model.

## Gate Interaction

- Layered production does not bypass any gate. `concept_generation_allowed` still governs whether scenes may be generated; `final_production_allowed` still governs publication labels.
- A composite whose fact layers have `fact_status: confirmed` and whose scene is concept-only is still **concept-only**. The publication label follows the weakest layer.
- Advantage at the publication gate: when facts are later confirmed, only the badge/fact SVG layers change — the scene does not need to be regenerated, and prior scene QA remains valid. Record this as `scene_qa_carried_forward: true` in the QA report.
