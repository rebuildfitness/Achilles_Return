# Workout experience and AI-coach export

## Program naming

The hybrid style is now **Rehab + Strength & Hypertrophy**. Its exercises, set/rep prescriptions, rehabilitation work and progression thresholds are unchanged. Specific prescribed 5×5 lifts remain five sets of five. The hybrid is not branded as StrongLifts; historical session titles are preserved. A faithful separate StrongLifts program is not introduced in this update.

## Workout timer

Open the workout, then choose **Start workout timer** when training begins. Merely previewing the session does not start it. The timer includes rest; Pause and Resume exclude interruptions. Timestamp-based elapsed time survives refresh and background/screen-lock throttling. Start/pause transitions persist in IndexedDB. Saving the workout stops the timer atomically with the session save and records duration, start and finish timestamps. Older sessions or sessions with no timer started say Not recorded rather than inventing a duration.

The timer is above the set-progress/rest dashboard to avoid taking away the logging space while scrolling. It follows the existing dated-workout model; it is not a cross-day scheduling feature. Changing the device clock can affect wall-clock elapsed measurements.

## First-set feedback

Enter the first set's RPE, quality and symptoms; blank feedback on the remaining unfinished sets fills automatically. The manual **Use first-set feedback for remaining sets** action remains available for older drafts. Only blank fields on unfinished sets of that exercise are filled. Loads, repetitions and completion are never copied. Existing individual responses and completed sets are preserved.

Copied fields are marked Carried feedback — unconfirmed. Edit any field independently. After the exercise, **Confirm carried feedback for completed sets** confirms only work already marked complete. Later sets still require confirmation after they are completed. The strength decision does not treat unconfirmed copied responses as observations supporting progression. Missing feedback remains optional for saving a session; it is disclosed in the report and cannot fabricate progression evidence.

Feedback is not copied between exercises, substitutions or days. These metadata are retained in drafts, sessions and the normal backup.

## AI coaching review

After saving, Today shows **Workout saved → AI coaching review**. Later, use **Progress → Overview → Your training history → AI coaching review** for the session. The report regenerates from saved data, so re-exporting after the next-morning response includes it.

Actions:

- Copy coaching report: paste into an existing AI conversation.
- Download Markdown: attach the .md file to your chosen tool.
- Share report: available when the browser supports native sharing. The operating system controls the available destinations. Cancel does not send anything.

The on-screen report remains available if copying or sharing is unsupported. Review it before sharing because it includes rehabilitation and workout information. No credentials, account login, server, automatic transfer or direct attachment to an AI thread is implemented. Provider-specific direct integration remains a separate future project, as agreed.

The report includes goals, captured equipment and assessment context, stage, readiness and check-in, original prescription, actual set entries, copied-feedback status, substitutions/skips, previous same-exercise sets, overall difficulty, immediate symptoms, notes, duration and next-morning response. Missing data are explicitly labeled. A reusable coaching prompt asks the AI to separate fitness feedback from medical clearance, respect existing restrictions, identify unknowns and avoid equating different equipment loads. The report does not instruct the app or apply AI-generated workout changes.

## Local-first compatibility

No database version change. Timer records use settings IDs of the form workout-timer-DATE-WORKOUT. Set metadata add inheritedFields and feedbackConfirmed. Sessions optionally add durationMs, startedAt, finishedAt, workoutTimer, coachingContext and originalPlan. Older records remain readable. Existing backup exports include these fields.

## Delivery

Use the complete Achilles_Return-workout-experience-complete.zip. Extract its contents into the existing cloned repository and replace matching files. Keep .git, review in GitHub Desktop, commit and push. Do not upload the ZIP itself or node_modules. This package includes all preceding illustration, swap and training-companion updates. No automatic push or deployment was performed.

Verification results and the changed-file inventory are included in this package. Mobile previews: artifacts/workout-duration.png, artifacts/workout-feedback.png, artifacts/coaching-review.png. The production build may retain the existing advisory for its JavaScript chunk exceeding 500 kB; that warning does not fail the build.

## Final verification

- 105 unit/rule tests passed; zero failures.
- 33 app browser checks passed; zero failures, including timer pause/resume and persistence, carried feedback and confirmation, offline save, report download and clipboard copy, and existing rehab/swap workflows. Windows clipboard newline normalization is accounted for.
- 20 illustration/offline browser checks passed.
- TypeScript and production build passed.
- All 134 canonical exercise illustrations remain present; initial offline caching remains below the 15 MB budget.
