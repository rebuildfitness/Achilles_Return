# V2 Phase 5 advisory intelligence

Phase 5 is additive over application 1.13.0 and IndexedDB schema 3. V1 remains unchanged. It does not implement final planning, navigation, dashboard, Rehab Guide, or external integrations.

## Boundaries

`domain/v2/guidance.js` evaluates a persisted subject and an explicit context/timestamp. It returns findings without changing either input. Existing readiness, baseline, progression, exposure, response, exercise-path and rehab-block evaluators supply the clinical/programming interpretation. Their permission results are interpreted as advice only in V2.

`persistence/guidance.js` captures local observations, evaluates, saves immutable versioned events, and records decisions. `GuidancePanel` is shared by composition and execution. A failed or unavailable analysis does not disable factual workout logging.

## Severity and uncertainty

| Level | Meaning | Interaction |
| --- | --- | --- |
| INFORMATION | Context, unknown classification or missing measurements | No acknowledgment needed |
| RECOMMENDATION | Existing rule suggests reviewing progression/setup | Modify or dismiss |
| CAUTION | Readiness, response, spacing or dose concern | Modify, view guidance, continue |
| STRONG_WARNING | Existing red-flag/stop concern | Explicit stop/evaluation advice; modify, view why, continue anyway |

Continuing never changes clearance, benchmark status or a raw answer. No finding is also not medical clearance. Unknown check-ins do not default to GREEN. Untested assessments are not failed tests. Completed workouts are not automatically tolerated.

Distinct user-selected running, jumping, plyometric, acceleration, sprinting, deceleration, change-of-direction, basketball and soccer categories retain their labels. Where V1 uses a shared parent-domain rule, the adapter reuses that rule rather than inventing an independent threshold. Broad phase association alone does not classify a movement as running or impact.

## Provenance and freshness

Each event includes subject ID/revision, adapter/rule/source versions, time, rule ID, severity, explanation, source/evidence references, missing inputs, and copied subject/context inputs. Occurrence-specific findings retain occurrence IDs. Compact deterministic identities are checked against full persisted inputs before reuse.

Identical evaluations reuse existing events and decisions. Changed subject/context invalidates them. UI edits mark findings stale; refresh, opening the view, finish-review transitions and explicit proposal application are meaningful evaluation points. Returning window focus also invalidates displayed guidance. A decision transaction additionally verifies captured inputs, protecting against cross-tab changes even if the displayed card has not refreshed.

Raw observations are never overwritten by derived guidance. All versioned Phase 5 events and decisions are immutable records; legacy Phase 2 records retain their existing compatibility behavior.

## Explicit application

1. Show the finding and optional proposed modification.
2. User chooses Modify Workout.
3. Preview a replacement, select an upcoming set and explicit load, or open the normal editor for review-only proposals.
4. Apply uses composition/session commands, preserving completed old-exercise work and original session intent.
5. Commit the changed subject and accepted decision atomically, with revision/context guards and an audit entry.
6. Reevaluate the changed subject.

No arbitrary numeric load increment or new clinical dose is generated. Keep Workout/decline changes no workout data. Review-only exposure/block proposals deliberately use the regular editor where exact safe machine-applicable targets are not established.

## Persistence API

- `evaluateGuidance(subject, context, at)`: pure findings.
- `isCurrentGuidance(event, subject, context)`: revision/context/version binding.
- `guidanceContext(subject, date)`: coherent read snapshot plus transaction guards.
- `analyzeGuidance(subject, date, at?)`: guarded immutable event persistence.
- `proposalEdit(subject, event, choice, at?)`: command-layer edit and audit, without persistence.
- `decideGuidance(subject, event, action, captured, choice?, at?)`: atomic decision/application.

Existing `v2GuidanceEvents` and `v2GuidanceDecisions` stores and backup coverage are reused. No stores, indexes or database version change. Available-today and preferred equipment remain unknown unless explicitly supplied; ownership is not silently relabeled as availability. Wagon and sled identities remain separate.

## Deliberate limits

- Sparse historical data is not backfilled from today's catalog. V2 history supplies only established actuals, explicit units/setup and recorded response observations to legacy evaluators. Missing comparable prescription/readiness data can suppress progression proposals.
- Nonuniform explicit rep targets do not fall back to an old source prescription.
- Grouped/interval contact totals are reported as requiring review rather than pretending an unnormalized count is a comparable dose.
- Ambiguous repeated rehab occurrences do not receive an arbitrary block replacement proposal; a unique occurrence or block match is needed.
- Custom movements remain clinically unclassified. Static catalog metadata is not rewritten or enriched with guesses.
- Complete captured inputs improve reconstructability but increase local storage use. A future retention/deduplicated-input design must preserve auditability.
- Guidance is available before start and during finish review without a mandatory interruption. After composition changes, stale findings must be refreshed to review current advice.

## Next-phase integration points, not implementation

Future planning and history surfaces can reuse the same evaluator, context capture and decision repository. Future delayed-response UI should persist raw observations first, then refresh guidance. A future guidance-history view can explain prior decisions without promoting acknowledgment to clearance. Any storage optimization requires preservation tests and a separate reviewed migration.
