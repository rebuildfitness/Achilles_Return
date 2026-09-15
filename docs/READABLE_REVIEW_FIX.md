# Readable session reviews

The next-morning review now uses plain-language labels instead of raw enum values or JSON. For the reported example:

- **Next-morning review:** Session tolerated
- **Symptoms compared with usual:** Back to usual baseline
- **Walking or daily function worse?** No
- **Repeated worsening across sessions?** No
- **Your notes:** My Achilles feels better than usual.

Notes are preserved exactly as entered. Missing answers say Not recorded. Medical flags and poor responses retain their distinct meanings; this is presentation only.

The shared formatter is used by calendar history and the AI coaching report. Check-in and assessment context in the report also use labeled lines instead of JSON. Opaque session/exercise IDs and ruleset metadata are omitted from the coaching text; they remain in the local records and full backup.

The correction applies to existing saved sessions automatically after the updated app loads. It requires no data reset, migration or re-entry. Previously downloaded reports are unchanged; export them again for the new formatting.

## Main files

- src/data/responsePresentation.js: shared field, answer, readiness and status labels.
- src/data/coachingReport.js: readable report sections and removal of opaque metadata.
- src/screens/History.tsx: readable next-morning details.
- tests/response-presentation.test.mjs: reported example, preserved notes, unknown values and non-reassuring status cases.
- tests/workout-experience.test.mjs and scripts/browser-qa.mjs: updated report assertions and browser checks for saved responses.

## Upload

Use Achilles_Return-readable-reviews-complete.zip as a complete replacement upload through the existing GitHub Desktop process. It includes all preceding updates. Keep your repository's .git folder. No automatic deployment was performed.

Verification: 107 unit/rule tests passed. TypeScript and production build passed. Browser results and readable-review screenshots are included in artifacts. The existing large-JavaScript-chunk advisory remains nonfatal.

All 34 app browser checks passed, including the provided response example displayed in history and the coaching report.
