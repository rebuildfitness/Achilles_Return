# Rehab workout access — v1.7.1

The deployed site was confirmed as v1.7.0. The workout existed but was hidden behind schedule activation and its B-day slot.

Today now has **View dedicated rehab workout**. It opens the complete template preview with exercise prescriptions, demos and illustrations before activation, on non-training days, and after a workout has been saved. It does not start timers, write logs, unlock exercises or schedule additional loading.

Inside the preview, **Use dedicated rehab schedule** enables the B replacement from the following day. **Find rehab day in Plan** opens the weekly plan. On an eligible scheduled rehab day, **Open scheduled rehab workout** opens the actual logger. Preview doses are clearly distinguished from the dated plan, which applies swaps, re-entry modifications and assigned impact exposures.

No clinical rules, exercise doses, existing schedules or completed records were changed by the access fix. App version 1.7.1; database version unchanged.

Files changed: src/App.tsx, src/screens/Today.tsx, src/screens/RehabPreview.tsx, src/persistence/schema.js, package.json, scripts/rehab-conditioning-browser-qa.mjs, and this document. Preview image: artifacts/rehab-preview-mobile.png.
