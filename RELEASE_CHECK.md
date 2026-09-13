# Release check — 2026-09-11

The restriction regression introduced during the safety-hold relaxation is corrected:

- Acute red flags remain a Safety Hold.
- Explicit no-clearance or active-restriction answers prevent generic strength generation, with a separate restriction-review explanation.
- All sport/impact gates and capacity reviews require affirmative exercise clearance and no current restrictions, including stationary basketball.
- Incomplete running criteria do not prevent cleared foundational strength work.
- Unconfirmed answers retain the previously requested foundational planning behavior; they do not constitute sport clearance. Free-text restrictions are not interpreted automatically or mapped to individual permitted exercises.

Changed: src/rules/baseline.js, src/rules/progression.js, src/rules/planner.js, tests/restrictions.test.mjs. Baseline/progression ruleset version: 1.0.1.

Validation: 54 Node tests passed, production TypeScript/Vite/PWA build passed. Full browser results are in artifacts/browser-qa-results.json.

GitHub Pages workflow exists and uses relative asset paths. Publication has not occurred: the workspace has no initialized Git repository or remote, and GitHub CLI is unavailable on PATH. The destination repository and authenticated GitHub access are still needed.
