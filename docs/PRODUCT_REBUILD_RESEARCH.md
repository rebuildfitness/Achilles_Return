# One training system

September 12, 2026. This is an experience and implementation update, not a replacement clinical plan. Existing criteria, prescriptions, evidence, storage and backups remain authoritative.

## Research

Strong's useful model is a fast training notebook: previous results, straightforward set logging, rest timers and progress history. [Strong](https://www.strong.app/)

StrongLifts makes the next action obvious and puts rest timing alongside logging. Its automatic progression is inspiration for understandable guidance, not permission to replace this app's next-morning tolerance rules. [StrongLifts](https://stronglifts.com/app/), [timer documentation](https://support.stronglifts.com/article/39-timer)

ATHLEAN-X contributes exercise education and a structured workout experience. We retain short demos with deeper explanations available on demand; no paid programs or time-based rehab progression are copied. [AX-1](https://athleanx.com/ax1)

Reddit discussions repeatedly surface ease of logging, visible history, understandable progression and low friction. These are qualitative observations from selected threads, not a representative survey or popularity ranking:

- Strong/Hevy users discuss simplicity versus richer presentation. [Discussion](https://www.reddit.com/r/strongapp/comments/1t6o7yy/what_are_the_features_that_strong_has_over_hevy/)
- ATHLEAN-X users describe difficulty finding notes after a portal redesign and frustration with a marketing-oriented dashboard. This is perceived access friction, not proof of lost data. [Discussion](https://www.reddit.com/r/Athleanx/comments/1i2u7pz)
- StrongLifts users value long-term logs and the timer. [Discussion](https://www.reddit.com/r/Stronglifts5x5/comments/1th3n0h/how_do_you_guys_track_your_progress/)
- Hevy comments mention prominent timers, calendars and accessible personal records. [Discussion](https://www.reddit.com/r/Hevy/comments/1q6e2fx/2025_hevy_recap_update/)
- Rehab users want measurable progress and exercise accountability. ACL discussions inform usability only, never Achilles clinical criteria. Some rehab threads contain developer promotion, so product endorsements were not treated as independent evidence. [Accountability](https://www.reddit.com/r/ACL/comments/1r87cl9/accountability_of_exercises/), [rehab software](https://www.reddit.com/r/ACL/comments/1gf6mfb/do_you_guys_use_softwareapps_that_support_the/)

## Product architecture

The experience is one cycle: check in → perform the planned session → record the immediate response → record the next-morning response → review progress → adjust the next session through the existing deterministic rules.

| Destination | Responsibility |
| --- | --- |
| Today | Current readiness, today's session and the next useful action. Recovery has its own recording flow. |
| Plan | Weekly prescription, calendar/history, and moving unfinished workouts. |
| Workout | All exercises and sets, previous values, short demos, load/cadence guidance, reviewed swaps and rest timing. |
| Progress | Recorded training, strength trends, baseline trends and criteria-based return-to-sport decisions. |
| Tests | Monthly starting/finishing measurements, with detailed criteria and capacity reviews disclosed separately. |
| More | Equipment/preferences, library, backup and evidence; choosing a destination opens that destination. |

Keep the approved navy/white/cobalt/green design tokens and five navigation items. The hero remains the fresh-launch entrance. Never put photography behind exercise logging. Avoid invented readiness scores, streak pressure, social feeds, subscription prompts or automatic clinical clearance. An unfinished workout and a saved workout awaiting tolerance are different states.

## Data and compatibility

Keep IndexedDB database and record identifiers intact. Existing session, assessment, schedule, substitution and recovery records remain readable and exportable. Rest timing is a convenience, not a training decision. Graphs display observed values, identify the exercise and keep symptom response distinct from performance.
