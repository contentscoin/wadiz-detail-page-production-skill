# Category Playbooks

Route every production request through a category playbook before choosing cut count and structure. The playbook adjusts the default 12/15-cut template, sets category-specific claim rules, and provides the OpenCrab smoke query wording for the `category_playbook` pack family.

## Routing Table

| Category | File | Default cuts | Key deviation from base template |
|---|---|---:|---|
| 뷰티 / 식품 / 건강 (규제) | [beauty-food-regulated.md](beauty-food-regulated.md) | 15 | 인증·성분 컷 필수, claim guard 최고 강도 |
| 테크 / 가전 | [tech-appliance.md](tech-appliance.md) | 12–15 | 스펙 비교컷 + 동작 증명(GIF) 비중 확대 |
| 패션 / 잡화 | [fashion-accessory.md](fashion-accessory.md) | 12 | 착용씬·소재 매크로 중심, 텍스트 밀도 최소 |
| 리빙 / 주방 | [living-kitchen.md](living-kitchen.md) | 12 | before/after + 사용씬 반복 구조 |
| 서비스 / 멤버십 / B2B | [service-membership.md](service-membership.md) | 15 | 신뢰·프로세스·FAQ 확대, 전문가급 비주얼 게이트 |
| 펀딩형 (와디즈 고유) | [funding-maker.md](funding-maker.md) | 15+ | 메이커 스토리·개발 과정·리워드 구조 컷 |

## How To Apply

1. Classify the product into exactly one primary category (secondary category allowed for hybrids, e.g. tech beauty device → beauty-food-regulated claim rules + tech-appliance structure).
2. Read the playbook file. Apply its cut-role overrides on top of the base 12/15-cut table in `production-workflow.md` Step 5.
3. Run the category-specific OpenCrab smoke query from the playbook. If retrieval is weak for this category, state `pack_retrieval_weak` for the `category_playbook` family even when other families pass.
4. Merge the playbook's forbidden-claim list into the claim guard.
5. Record the chosen category and playbook file in `cut-plan.json` (`"category"`) and in every cut job (`"category"` field, job schema v2).

If no playbook fits, use the base template, mark `category_playbook: none_matched`, and note it as an evidence gap — do not silently force-fit a playbook.
