# In-workout exercise swaps — 2026-09-14

## What changed

Every active workout card now has a visible **Swap exercise** control, outside the starting-weight disclosure. Choose a reason: equipment unavailable, not strong enough yet, discomfort/injury, or ready for another variation.

- **This session only** is the default. **This and future sessions** also saves a preference for subsequent dates. Future preferences continue through the usual equipment and readiness rules.
- Mark equipment unavailable today inside the swap control. The selection is saved when applying a swap or skip, blocks further logging on affected cards, and does not change the owned-equipment profile. Uncheck equipment when it becomes available again and apply the next change.
- Alternatives exclude equipment marked unavailable and exercises already in the workout. Not strong enough yet narrows the choices to configured easier options.
- Swapping keeps existing entries under their original exercise ID and allocates remaining set slots to the selected variation. No weights are copied. Older completed and partial entries remain in the saved session, including entries outside a subsequently reduced dose. Recorded entries can be corrected without marking new work complete.
- The replacement card uses its own title, illustration, demo and setup. Starting-load guidance uses that variation's own history.
- **Skip remaining sets today** saves the reason and keeps completed work. Restore the exercise to resume it. A skip never marks unperformed sets complete or counts as tolerance. At least one completed set is still required to save a workout.
- Progress → Overview → training history includes an Exercise changes disclosure.

## Alternatives and limits

Fifteen of the 21 prescribed exercise types have configured alternatives with the complete owned-equipment list. All 21 have the swap/skip control. Bilateral standing calf raises, loaded seated calf raises, step-ups, single-leg balance, weighted wagon backward drags and knee-to-wall mobility deliberately have no invented automatic replacement. Their control explains the limitation and supports a recorded skip.

Pull-ups now offer a **Lat pulldown** alternative, including a provider demo page, setup instructions, a 640 × 960 illustration and a 192 × 288 mobile thumbnail. Use the B52's manufacturer-approved seated setup and restraint. Cable load is not equivalent to bodyweight or another machine's stack.

Single-leg calf raises can use the existing bilateral calf-raise prescription as a regression. This reuses the existing catalog dose; no clinical clearance threshold or surgeon protocol changes.

The exercise libraries now contain 134 canonical illustrated entries. Existing images remain on-demand rather than part of the initial offline download. Demo playback still depends on the external provider and an internet connection.

## Persistence

Dated choices, unavailable equipment, retained exercise snapshots and change events use the existing IndexedDB settings store (`workout-changes-YYYY-MM-DD`). Finished sessions contain both exercise histories and change events. Future preferences use the existing profile exerciseChoices field with an effectiveFrom date. Existing backups include these records; no database migration or cloud service is introduced.

## Upload

Use the complete **Achilles_Return-workout-swaps-complete.zip** package. Extract it, copy its contents into your existing cloned repository, replace matching files, review changes in GitHub Desktop, commit and push. Keep the repository's .git folder. Do not upload the ZIP itself or node_modules. This package includes the previous illustration and training-companion updates; earlier packages are not prerequisites.

The package is prepared locally. It has not been pushed or deployed automatically.

## Validation

See artifacts/swap-tests.txt, artifacts/browser-qa-results.json, artifacts/illustration-browser-results.json and artifacts/illustration-audit-results.json. The browser checks use disposable test data, including swaps after completed sets, reload, offline finish, saved histories, future preferences and image loading. artifacts/workout-swap.png is the mobile preview.

The production build retains its existing advisory about a JavaScript chunk over 500 kB; this does not fail the build.

Final results: 99 unit/rule tests, 30 app browser checks and 20 illustration browser checks passed; zero failures. TypeScript and production build passed. All 134 canonical exercise images resolve. Initial offline precache is approximately 2.91 MB, with exercise artwork fetched on demand.
