# Expanded rehabilitation circuit — 1.9.0

This release expands the dedicated Achilles Rehab & Conditioning B session into a warm-up, three circuits and a conditioning finisher. It preserves the existing clinical rules, impact exposure doses, completed history and local-first storage.

## What appears in the workout

| Section | Contents |
| --- | --- |
| Warm-up | Equipment-appropriate walking or cycling, heel-to-toe rocks, mini squats, bodyweight step-ups and bilateral calf raises |
| Circuit A — three rounds | Bilateral calf strength, step-ups, bridge or selected single-leg bench squat variation, and tip-toe walking when its recorded function condition is met |
| Circuit B — three rounds | Current calf variation, bent-knee calf work, hamstring and trunk-control alternatives, and balance reach when the recorded balance condition is met |
| Circuit C — two rounds | Stable-floor squat or selected BOSU variation, balance, side/diagonal reach when eligible, lateral step-ups and eligible tip-toe walking |
| Finisher | Existing cycling prescription, or the existing assigned impact exposure in its place |

Nine new library entries have exercise-specific demonstration pages and illustrations: heel-to-toe rocks, bodyweight mini squat, tip-toe walk, modified single-leg squat to bench, wall squat with heel raises, forward/backward balance reach, side/diagonal balance reach, lateral step-up and BOSU squat.

The bench squat, wall calf raise and BOSU squat are selectable alternatives, not automatic defaults. Cards explain the requested therapy movement and the currently selected alternative. Jogging and crossover work remain governed by the existing running/change-of-direction exposure system; backward jogging is not newly programmed. This is not an exact reproduction of the original 40-minute therapy prescription.

## Logging and progression

- Warm-up and repeated circuit exercises have distinct logging identities.
- Existing per-set logging, first-set feedback propagation, rounds, rest timers, demos, illustrations, offline saving and coaching export remain available.
- Existing coaching exports remain available for saved session results.
- An already-started older rehab draft keeps its original template. A newly started expanded session retains the new template after reload.
- First exposure to the expanded template does not simultaneously receive an additional automatic progression. Subsequent progression uses the existing recorded performance and next-morning tolerance rules.
- Ownership alone does not unlock balance, running or sport work. No clinical entry threshold was changed.

## How to find it

Open Today and the Achilles Rehab & Conditioning preview. If needed, choose **Use dedicated rehab schedule**; this replaces the next B slot from tomorrow onward rather than adding another workout today. Open Plan to find that scheduled session. On its scheduled day, complete the check-in and open the rehab logger.

The full series is substantially longer than 40 minutes with the displayed rests. The preview estimates duration from the prescription; it does not promise the original example's duration.

## Verification and upload

- 161 unit tests passed, zero failed.
- 67 browser checks passed across seven suites; these cover logging, history, offline behavior, progression and expanded circuit presentation.
- TypeScript, Vite production build and service-worker generation passed.
- Vite still reports the existing large JavaScript bundle warning; this does not fail deployment.

Use the cumulative **Achilles_Return-rehab-circuits-1.9.0-complete.zip**. Extract it and copy its contents into the cloned repository, retaining its existing `.git` folder. Commit and push with GitHub Desktop. This package contains source files for the existing GitHub Actions build; it has not been deployed by this task.

## Sources and limits

The arrangement is a product implementation of the requested circuit structure, not a newly validated clinical protocol. Existing evidence metadata is preserved. General postoperative progression reference: https://ijspt.scholasticahq.com/article/122643-rehabilitation-and-return-to-sports-after-achilles-tendon-repair

Exact demonstration page URLs and verification notes are stored in `src/data/rehabSeriesExercises.js`. Page verification does not establish successful video playback on every device. Illustrations supplement those demonstrations and do not establish clearance or prescribe a load.
