# Restart From Planning After Repeated Detail-Page Rejections

Use this when a user rejects multiple generated/detail-page drafts and says to start over, especially phrases like `처음부터 작업해줘`, `상품 상세페이지 기획부터`, `폐기하고 다시`, or attaches a failed contact sheet.

## Core lesson

Do not immediately regenerate another image set or redeploy. The correction is a workflow reset, not a request for one more visual patch.

Restart at the product-detail planning stage:

1. Archive/supersede the rejected artifact set so it is not delivered again.
2. Diagnose the rejected contact sheet briefly: copy structure, information hierarchy, legibility, repetition, product explanation, and image/text relationship.
3. Reload/apply the base ecommerce and Wadiz production skills.
4. Re-check official product/service facts and the OpenCrab/Wadiz pack gate, but do not let pack failure block the planning artifact.
5. Produce a planning document first, not images:
   - product definition,
   - verified facts / assumptions / confirmation-needed,
   - buyer questions,
   - positioning,
   - 12/15-cut architecture,
   - claim guard,
   - design principles,
   - staged production plan.
6. Mark the state explicitly as `planning_stage` / `production_ready: false` until the cut copy and asset gate are approved.
7. Ask or proceed to the next stage only after the planning artifact exists: cut-by-cut copy, visual direction, wireframe, then image production.

## Pitfalls to avoid

- Do not answer with another contact sheet immediately after the user asks for planning.
- Do not call a deployed preview route the deliverable when the user wants a product-detail workflow.
- Do not expose OpenCrab/QA/internal labels in customer-facing cuts.
- Do not keep patching a flawed layout if the user asked to restart from the beginning.
- Do not convert `no overlay` into a text-free moodboard; preserve detail-page sales function with separated editorial panels unless the user explicitly asks for true no-text visuals.

## Recommended first-stage artifact

Save a markdown file such as `01_product_detail_planning.md` under the deliverables folder. Include:

```markdown
# [Product] 상품 상세페이지 기획 v1

## 0. 폐기/재작업 원칙
## 1. 상품 정의
## 2. 확인된 사실 / 가정 / 확인 필요
## 3. 고객 구매 심리
## 4. 핵심 포지셔닝
## 5. 권장 12/15컷 구조
## 6. 카피 방향과 금지 표현
## 7. 디자인 방향
## 8. 단계별 작업 계획
## 9. 현재 게이트 판정
## 10. 다음 단계
```

Completion of this stage means a planning artifact exists and has been verified as a non-empty file. It does **not** mean final images are ready.
