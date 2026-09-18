# Automatic rehab block progression — v1.8.0

The dedicated rehab session now updates selected blocks from saved workout evidence. This is the user-authorized implementation of automatic progression, not a change to clinical clearance thresholds or personal assessment records.

## Implemented path

| Block | Automatic path | Additional condition |
| --- | --- | --- |
| Calf | Single-leg calf raise to dumbbell-loaded single-leg calf raise | Current template already permits single-leg work; required equipment and reviewed demo available |
| Balance | Stable-floor single-leg balance to foam balance-pad single-leg balance | Current assessment records good single-leg balance; pad available |
| Bike | 10 to 15 to 20 to 25 minutes | Same comfortable effort; no automatic resistance or pace increase |

Only one block advances per session. When a block changes, other automatic load increases wait. Otherwise the existing strength rule can propose one working-load increase in this rehab session. Other strength sessions retain their existing behavior.

## Evidence required

The previous dedicated rehab session must match the current prescription, complete all prescribed sets at the upper target, record good quality and no increased symptoms, confirm effort feedback, and have a tolerated next-morning response. The existing strength rule checks recorded RPE above zero and no higher than eight; this is an eligibility check, not an instruction to train at RPE eight. Current readiness must be green, clearance and absence of restrictions recorded, and re-entry/retest rules must permit progression. Pending responses and medical flags prevent advancement.

These exact exercise mappings, timed-work checks, five-minute steps, and one-block budget are operational product rules in `spec/rehab-block-progression-v1.json`, version 1.0.0. They are not independently validated medical clearance thresholds. Existing clinical criteria and running/sport ladders are unchanged.

## Persistence and boundaries

- Only saved dedicated rehab sessions establish block stages. Other strength workouts do not reset them.
- Future previews use observed history; they do not assume future successful sessions.
- Started variation logs retain the selected exercise after refresh and do not trigger a second block change.
- Manual exercise choices take precedence. Equipment ownership alone does not clear progression.
- Loaded calf work starts with its own working load, stable support and reviewed floor-level range. Loads are not copied from another variation.
- Foam balance-pad work does not authorize BOSU or inflatable-cushion progressions.
- Borderline or not-tolerated dedicated sessions move affected tracked blocks back a step; current readiness modifiers still apply.
- Scheduled or recorded running/sport exposure replaces bike conditioning through the existing coordination rule.
- The bike stops at 25 minutes. No automatic speed/resistance escalation or blanket addition of jogging, carioca, pistol squats or other therapy exercises is introduced.
- Completed history is not rewritten. Saved sessions, decision audit and immediate coaching report retain the selected prescription and its explanation.

Open “Rehab progression — what changed?” in Today, Plan or the workout to see the decision. The read-only template preview is a template; the actual dated workout applies recorded evidence.

## Evidence context

The existing master plan and strength rules remain authoritative. The clinical commentary at https://ijspt.scholasticahq.com/article/122643-rehabilitation-and-return-to-sports-after-achilles-tendon-repair supports criterion-based progressive rehabilitation, but does not validate these exact app mappings or dose steps.

## Verification

155 unit tests pass. Production build and TypeScript validation pass. Browser regression covers automatic selection after next-morning response, one-block progression, refresh persistence, offline finish, history preservation and exported decision metadata, alongside existing workflow suites.
