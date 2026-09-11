# Achilles Return — Design System v1.0

## Status
**Frozen visual direction for Codex implementation.**

The approved hero image at `assets/design/achilles-return-hero-reference.png` is the visual source of truth. The production app should look like the mobile screens shown in that hero: premium sports-performance software, not clinical/medical enterprise software.

## Product personality
- Athletic
- Premium
- Calm
- Confident
- Modern
- Trustworthy
- Performance-oriented
- Easy to scan with one hand

Avoid: hospital aesthetics, dense dashboards, neon-gamer styling, excessive gradients, glassmorphism, clutter, tiny clinical charts, or decorative UI that competes with the workout.

## Core color tokens

| Token | Hex | Use |
|---|---|---|
| `navy-950` | `#151B24` | darkest hero/background accents |
| `navy-900` | `#1E2633` | primary app header/top bars |
| `navy-800` | `#273241` | secondary dark surfaces |
| `blue-600` | `#3165FC` | primary CTA, active nav, links |
| `blue-500` | `#4A78FF` | hover/secondary blue accent |
| `blue-050` | `#EEF3FF` | selected/soft blue surfaces |
| `green-600` | `#38A971` | Ready / completed / tolerated |
| `green-050` | `#ECF8F1` | readiness success card background |
| `amber-500` | `#F5B73A` | modified/caution state |
| `amber-050` | `#FFF8E8` | caution card background |
| `red-500` | `#E45B5B` | stop / red flag only |
| `red-050` | `#FFF0F0` | red-flag card background |
| `ink-900` | `#18202C` | primary body text |
| `ink-700` | `#3D4755` | secondary text |
| `ink-500` | `#6B7480` | muted labels |
| `line-200` | `#E5E8EE` | borders/dividers |
| `surface-100` | `#F6F7F9` | app background |
| `surface-000` | `#FFFFFF` | cards/input surfaces |

### Semantic rule
Green = safe/ready/completed. Amber = caution/modified. Red = stop/safety. Blue = product interaction/progress. Never use red merely for decoration.

## Typography
Target visual character: the clean iOS/SF-style typography seen in the hero.

Production stack:
```css
font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```
Bundle the primary font with the app/build if practical; do not depend on a runtime CDN for core typography.

| Style | Size | Weight | Line-height |
|---|---:|---:|---:|
| Display / onboarding | 36px | 700 | 1.08 |
| Screen title | 28px | 700 | 1.15 |
| Section title | 18px | 700 | 1.25 |
| Card title | 16px | 650–700 | 1.3 |
| Body | 15px | 400–500 | 1.45 |
| Small | 13px | 400–500 | 1.35 |
| Eyebrow/meta | 11–12px | 600 | 1.2 |
| Workout numbers | 16–18px | 650 | 1.2 |

Use tabular numerals for loads, reps, timers, distances, and test metrics where supported.

## Spacing system
Base unit: 4px.

Preferred spacing tokens: 4, 8, 12, 16, 20, 24, 32, 40.

Mobile page gutters: **16px**.
Tablet/desktop content max width: **720px** for app screens; marketing/onboarding can be wider.

## Radius
- Small control: 10px
- Input/set row: 12px
- Standard card: **16px**
- Hero/readiness card: 18px
- Pill/badge: 999px
- Primary button: 14px

## Shadows and borders
Cards use a subtle 1px border plus soft elevation, not heavy drop shadows.

```css
border: 1px solid #E5E8EE;
box-shadow: 0 6px 20px rgba(21, 27, 36, 0.06);
```

Pressed/selected elements should primarily change tint/border rather than add more shadow.

## App shell
### Header
- Height: 56–60px plus safe-area inset
- Background: `navy-900`
- White logo/name
- Optional profile/settings icon right
- No large decorative imagery on daily utility screens

### Content
- Background: `surface-100`
- White cards
- 16px horizontal gutters
- 20–24px between major sections

### Bottom navigation
Five fixed items:
`Today | Plan | Progress | Tests | More`

- Background: white
- Top border: `line-200`
- Height: 64–72px plus safe area
- Active icon/label: `blue-600`
- Inactive: `ink-500`
- Icons: clean line icons, consistent 20–22px
- Labels: 11px medium weight

## Primary button
- Height: 48–52px
- Radius: 14px
- Background: `blue-600`
- Text: white, 15–16px, 600–700
- Full-width on primary mobile actions
- Disabled: lower contrast, never ambiguous

## Status cards
### Green / Ready
- Background `green-050`
- Icon/check `green-600`
- Heading `ink-900`
- Secondary text `ink-700`

### Amber / Modified
- Background `amber-050`
- Icon `amber-500`

### Red / Stop
- Background `red-050`
- Icon/text accent `red-500`

Status cards should explain the action in one sentence. Avoid exposing internal scores.

## Standard card anatomy
- 16px radius
- 16px internal padding
- Title at top-left
- Optional trailing action/chevron at top-right
- Supporting text below title
- Dividers only when helpful

## Workout card — Strong-style
Entire day's workout is visible in one scroll.

Exercise card must show without opening another screen:
1. Exercise name
2. Set × rep/time/distance target
3. RPE/effort target
4. Rest
5. `Short Demo` action
6. Set rows with previous value, current weight/load, reps, completion

Recommended set-row columns on phone:
`SET | PREVIOUS | WEIGHT | REPS | ✓`

Rows: 44–48px tall. Numeric inputs should use numeric keyboard. The current/next set may receive a faint blue tint; completed sets get a subtle green confirmation, not a saturated block.

## Calendar
Month calendar should resemble the approved hero:
- White card
- Month header with left/right chevrons
- Current selected date uses blue filled circle
- Small dots for status: green completed, amber modified, red missed/problem when appropriate
- Legend below calendar
- Tapping a completed date opens session detail

## Progress visualization
Prefer vertical stage lists and simple ring/gauge visuals over dense charts.

Example stage row:
- Completed: green check
- Current: blue numbered/active circle
- Future: muted gray circle

Do **not** use postoperative week number as the core phase label. Use capability language such as `Running Readiness`, `Run Level R2`, or `4 of 7 criteria complete`.

## Hero / onboarding photography
Use `assets/design/achilles-return-hero-reference.png` as the approved marketing/onboarding visual reference.

Photography direction:
- Black male athlete
- basketball action / follow-through
- premium indoor gym/court
- dark charcoal/navy environment
- authentic athletic movement
- no visible injury dramatization

Use photography selectively on:
- onboarding / first-run
- optional landing page
- major basketball milestone celebration

Do not place full-bleed athlete photography behind workout logging, testing forms, or safety screens.

## Motion
Subtle only:
- 150–220ms transitions
- card expand/collapse
- progress check transitions
- no unnecessary parallax or bouncing
- respect `prefers-reduced-motion`

## Accessibility
- WCAG AA text contrast minimum
- color never carries meaning alone
- minimum tap target 44×44px
- body text normally >=15px
- visible keyboard focus
- form labels remain visible
- accessible icon labels
- support text scaling without clipping

## Design QA rule
If a production screen does not visually feel like it belongs inside one of the phone mockups in the approved hero, it should be treated as a design regression.
