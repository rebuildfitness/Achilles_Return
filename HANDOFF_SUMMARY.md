# Planning Complete — Codex Handoff Summary

## What is complete
- evidence review and evidence-labeling approach
- safety/readiness/tolerance rules
- baseline assessment design
- starting-phase algorithm
- phase and capability model
- strength templates
- run/jump/sprint/COD exposure ladders
- basketball return ladder
- optional soccer beginner ladder
- equipment whitelist
- exercise/demo requirements
- weekly Plan + workout-calendar UX
- Strong-style full-day workout logging UX
- local-first data architecture
- versioned/auditable rule-engine design
- 80-scenario QA plan
- Codex implementation order
- machine-readable rehab plan JSON
- frozen visual design system based on the approved hero
- screen-by-screen visual implementation spec
- machine-readable design tokens

## What is intentionally not predetermined
The user's actual starting phase and exact first individualized week are not assigned until the baseline assessment is completed. This is a safety feature, not unfinished planning.

## Codex's job
Implement the frozen plan faithfully. Do not invent new rehab criteria. When a source-of-truth ambiguity exists, leave a documented TODO for review rather than making an unreviewed medical/product decision.


## Visual source of truth
Codex must treat `assets/design/achilles-return-hero-reference.png` plus `docs/DESIGN_SYSTEM.md` / `docs/VISUAL_SCREEN_SPEC.md` as the approved UI direction. The clinical/product plan remains the source of truth for behavior; the hero is the source of truth for visual language.
