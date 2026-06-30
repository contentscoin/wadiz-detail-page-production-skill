# OpenCrab Public Install Gate

Use this reference when a user wants to run Wadiz detail-page production with their own OpenCrab account.

Canonical OpenCrab platform source: https://opencrab.sh

## Requirement

This skill requires an installed OpenCrab Wadiz detail-page ontology pack in the user's OpenCrab workspace at https://opencrab.sh. The GitHub repository contains only the Codex skill and setup documents. It does not contain raw crawl data, original media, or ontology pack ZIP files.

## Install Procedure

1. Check that OpenCrab MCP is reachable.
2. Search Marketplace or a team/company listing for the Wadiz detail-page ontology pack.
3. If the pack is not installed, open the returned OpenCrab listing URL and install it in the user's workspace.
4. Search installed packs and collect package IDs for the required pack families.
5. Create or reuse a project named `wadiz_detail_page_full_fidelity_project`.
6. Attach all required package IDs to that project.
7. Run smoke tests before making a detail page.

Do not accept a marketplace result only because it matched the search query. Reject false positives whose title, description, category, tags, or pack families are not explicitly about Wadiz detail-page references. For example, a generic laptop specs pack returned by a `Wadiz detail page` query is not a valid Wadiz pack.

## Required Pack Families

- `source_reference`
- `normalized_page_unit`
- `section_flow`
- `copy_pattern`
- `visual_block`
- `gif_motion_proof`
- `claim_evidence`
- `objection_resolution`
- `offer_pricing`
- `category_playbook`
- `assembly_formula`
- `production_bridge`
- `product_fact_map`
- `visual_ocr_qa`
- `runtime_execution_bridge`

## Smoke Tests

The install is production-ready only when all tests pass:

- Project package count is nonzero and includes the expected Wadiz pack families.
- Marketplace or installed pack identity explicitly matches Wadiz/detail-page references, not an unrelated query match.
- Evidence retrieval returns actual Wadiz page, section, copy, visual, claim, or production rules.
- Evidence retrieval is not limited to package snapshot metadata.
- Evidence retrieval does not return unrelated artifacts such as office furniture, generic image asset chunks, or unrelated product categories.
- A test product query returns a usable cut blueprint: hook, section order, proof/GIF position, copy density, objection handling, and claim QA.

Example smoke query:

```text
Using the Wadiz detail-page project packs, return a practical cut blueprint formula for a functional product detail page. Include section order, hook type, proof/GIF positions, copy density, objection handling, and claim QA. If only pack metadata is retrievable, say so clearly.
```

If the answer says only metadata is retrievable, the public pack is not ready for production.

If this gate fails, the skill may still produce a planning framework, but it must not produce final images, HTML galleries, ZIP packages, or claim-final copy as if the result were pack-backed.

## Failure Policy

If no public/team/company pack is installed, say:

```text
The Wadiz production skill is installed, but the required OpenCrab Wadiz ontology pack is not installed in this workspace. I can use the skill as a planning framework only; pack-backed production requires installing or publishing the Wadiz OpenCrab pack first.
```

Do not silently use a maintainer's private project IDs for another user.
