# Advanced rehab activities — 1.10.0

## What changes

The dedicated Achilles Rehab & Conditioning session now has an explicit advanced path:

- **Balance pad:** the existing floor single-leg balance progression selects foam-pad balance when its recorded performance and next-morning tolerance requirements pass.
- **BOSU:** Circuit C floor squats can now automatically become supported BOSU squats. This replaces the two squat sets rather than adding volume. It requires the existing squat performance rule, recorded good balance, available BOSU equipment and a qualified, tolerated foam-pad session. Use fixed support and the manufacturer's permitted device orientation. Equipment ownership alone is insufficient.
- **Forward jog:** remains the automatically selected Running ladder dose. Its demo is now easier to find in the planned exposure and rehab preview.
- **Crossovers/carioca:** have a dedicated demo in D5 planned multidirectional work.
- **Backward jog:** is a selectable, previously reviewed overground variation within D5. It replaces a planned bout within the existing 4–6 total bouts. It is not a new automatic backward-jog prescription, not a treadmill activity, and not an extra circuit.

The preview now includes an Advanced rehab activities card with all three locomotion demos and a route to readiness. Open **Today → View dedicated rehab workout** to see it. Open **Progress → Sport** for your current Running and Change of Direction levels and their available loggers. A scheduled impact exposure also appears on Today, Plan and the workout, replacing the bike finisher.

## Recording actual work

D5 includes movement selection checkboxes and a field for the actual bouts, time/distance and rest for each movement. These autosave locally, survive reload and save offline. Backward jogging requires actual bout details before saving. History displays those details and the coaching export includes selected movements and the recorded dose. Old sessions remain unchanged.

## Scope and assumptions

This implements the user's request for advanced rehab options while retaining existing running and COD gates. It does not assert that this device's athlete has met those gates; the developer did not read or alter the user's live IndexedDB. New images were unnecessary: the BOSU and pad illustrations already exist, and the nine monochrome corrections remain in this cumulative package.

The new BOSU mapping is a versioned product progression using existing performance/tolerance rules, not a validated medical clearance threshold. One block can advance per session. Current logged exercise identity, manual choices, equipment, readiness, re-entry and pending responses still govern selection.

Backward jogging is not used to bypass D1–D4 or justify advancing a running level. The existing D5 total remains unchanged; the app does not invent a distance, speed or duration for an individual's backward-jog bout. Review the setup and use the already-established dose. The demonstration includes sprinting; only the reviewed easy jogging technique applies here.

## Sources

- General Achilles postoperative progression context: https://ijspt.scholasticahq.com/article/122643-rehabilitation-and-return-to-sports-after-achilles-tendon-repair
- Carioca exercise demonstration page: https://us.physitrack.com/home-exercise-video/carioca
- Backward jogging demonstration is linked by Dr. Brian Fischer's exercise library: https://fischer-health.com/physical-therapy-exercise-library/ — https://www.youtube.com/watch?v=Bs70oaxCMTs

The provider pages and exact link identity were checked on 2026-09-18. External video playback was not verified. Demonstration sources support technique identification, not Achilles clearance or the new product mapping.

## Validation

165 unit tests and 69 browser checks passed. TypeScript, production build and service-worker generation passed. The existing large-bundle Vite warning remains nonblocking.

## Upload

Use **Achilles_Return-advanced-rehab-1.10.0-complete.zip** instead of the earlier packages. Extract and copy its contents into the cloned repository, retaining `.git`, then commit and push with GitHub Desktop. Wait for the deployment workflow to pass and reload the app. This task prepared the package; it did not deploy or modify live personal records.

Changed areas: rehab progression matrix/engine, exercise demo metadata, rehab preview and planned-exposure presentation, D5 logging and validation, history/coaching export, version metadata, regression tests and this release note.
