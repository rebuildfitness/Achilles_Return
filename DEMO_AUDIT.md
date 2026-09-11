# Demonstration audit — 2026-09-11

This implementation addendum records demo curation without changing the frozen rehabilitation criteria or prescriptions.

## Changes

- Added baseline demo buttons for mobility, soleus capacity, straight-knee capacity and all four general-strength movements. Existing heel-rise buttons now share the workout catalog.
- Replaced missing-demo placeholders at J5 and SC2–SC6. Individual-dose and readiness gates remain unchanged.
- Demo validation now requires full catalog metadata, not only a non-empty URL.
- No generated GIFs were needed. External clips remain external and require internet.

## Sources

| Demo | Link | Original source |
|---|---|---|
| Single-leg diagonal line hops | [Open demo](https://www.youtube.com/watch?v=uU6XsRX8zO4) | [Gold Crown Foundation / Children's Hospital sports medicine program](https://www.goldcrownfoundation.com/at-home-strength-and-power-program/) |
| Single-leg hop with perturbations | [Open demo](https://www.youtube.com/watch?v=BCWtyHuTLJg) | [Peak Physio](https://www.peak-physio.com.au/exercise/single-leg-hop-with-perturbations/) |
| Passing and receiving | [Open demo](https://www.youtube.com/watch?v=Mm_1RxZDKYs) | [The Albion Foundation / West Bromwich Albion](https://www.wba.co.uk/albion-foundation/about-us/active-lifestyles/home-skills-videos/passing-and-receiving) |
| Controlled dribbling | [Open demo](https://www.youtube.com/watch?v=qKYm7XJDGRE) | [The Albion Foundation / West Bromwich Albion](https://www.wba.co.uk/albion-foundation/about-us/active-lifestyles/home-skills-videos/dribbling) |
| Instep shooting technique | [Open demo](https://www.youtube.com/watch?v=tQGzk82eGxs) | [Sporthood — Nikhil Menon, technical head](https://www.sporthood.in/blog/how-to-play-football-instep-shooting/) |
| Controlled turns with the ball | [Open demo](https://www.youtube.com/watch?v=07qqqHTRLwE) | [The Albion Foundation / West Bromwich Albion](https://www.wba.co.uk/albion-foundation/about-us/active-lifestyles/home-skills-videos/turning) |
| Reactive dribbling game | [Open demo](https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/mastering-ball-control.php#mod_35_1751615) | [FIFA Training Centre](https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/mastering-ball-control.php) |
| Small-sided soccer — 3v3 demonstration | [Open demo](https://www.fifatrainingcentre.com/en/practice/training-perspectives/designing-games-for-development/3v3-funino-developing-game-intelligence-and-decision-making.php) | [FIFA Training Centre](https://www.fifatrainingcentre.com/en/practice/training-perspectives/designing-games-for-development/3v3-funino-developing-game-intelligence-and-decision-making.php) |

## Verification scope

Original provider pages and embedded video identities checked. All six new YouTube IDs returned HTTP 200 with matching titles and publishers through YouTube oEmbed. Published durations: dribbling 5:40; passing/receiving 5:41; turning 2:42; instep shooting 1:22; diagonal line hops 0:25; reactive hop 0:17. The longer clips teach the named skill rather than a general rehabilitation lecture, consistent with the catalog exception for exercise-specific tutorials. FIFA links open governing-body drills; SC5 targets the Part 3 player anchor. Playback, captions and regional availability have not been exhaustively verified.

Technique demonstrations do not supply the athlete’s dose or clearance. Added contextual notes preserve walking-only SC2, submaximal SC3 shooting, and prescribed J5/reactive exposure.

## Changed files

- src/data/baseline.js
- src/data/exposures.js
- src/screens/Baseline.tsx
- src/screens/Program.tsx
- tests/demos.test.mjs
- tests/program.test.mjs
- scripts/browser-qa.mjs
- IMPLEMENTATION_B_G.md
- DEMO_AUDIT.md

## Validation

51 Node tests passed; production TypeScript/Vite/PWA build passed. Browser suite result is reported in artifacts/browser-qa-results.json.
