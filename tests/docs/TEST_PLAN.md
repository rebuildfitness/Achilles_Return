# Rehabilitation Logic and Product Test Plan v1.0

## Safety tests
1. Sharp pain -> RED, no Achilles workout.
2. New bruising -> RED.
3. Major swelling -> RED.
4. Sudden strength loss -> RED.
5. New limp -> RED.
6. Good sleep/motivation cannot override RED.

## Readiness tests
7. All baseline -> GREEN.
8. Mild stiffness increase -> Yellow 1.
9. Mild swelling + prior soreness -> Yellow 1 or 2 per rule configuration.
10. Moderate pain -> Yellow 2.
11. Significant pain without red symptom -> Yellow 3.
12. Yellow 1 reduces Achilles volume and blocks progression.
13. Yellow 2 removes high-rate impact.
14. Yellow 3 uses recovery-focused session.

## Next-day tests
15. Completed workout remains pending until next check-in.
16. Normal next-morning response -> TOLERATED.
17. Meaningful increase -> BORDERLINE.
18. Large deterioration -> NOT_TOLERATED.
19. Red flag next morning -> MEDICAL_FLAG.
20. Progression cannot occur while status is pending/borderline/not tolerated.

## Equipment tests
21. Every active home exercise uses whitelist equipment.
22. No leg press exercise exists in active home library.
23. Weighted wagon is allowed as sled substitute.
24. Wagon loading is tracked by load/distance/RPE but not equated to sled friction.

## Video tests
25. Every active exercise has a nonempty demo URL.
26. Demo source metadata exists.
27. Demo is classified short/exercise-specific/governing-body.
28. No long general Achilles lecture is used for a `Short Demo` button.
29. Different calf exercises do not accidentally map to the same generic lecture.

## Baseline tests
30. Red flag halts dynamic testing.
31. Heel-rise LSI calculates correctly.
32. Missing heel height does not invent a value.
33. Work LSI only calculates if valid heights exist.
34. Failure of running-consensus criterion keeps running locked.
35. Passing all seven unlocks controlled running, not sprinting/basketball.
36. Starting phase is based on results, not months since surgery.

## Strength progression tests
37. Top of rep range + appropriate RPE + tolerated next day -> propose small load increase.
38. Reps achieved but heel height/quality worsens -> hold load.
39. Excessive RPE -> hold or reduce.
40. No load progression after yellow response.

## Running tests
41. First run cannot unlock until all seven consensus criteria pass.
42. Tolerated run advances only according to run ladder.
43. Borderline response repeats/holds dose.
44. Not tolerated response returns to prior tolerated exposure.
45. Progress only one primary variable at a time.

## Jump/plyometric tests
46. Low-level jump prep can be unlocked independently when prerequisites pass.
47. Single-leg high-rate work stays locked until strength/capacity support it.
48. Contact count cannot double in one progression.
49. Poor next-day response regresses jump dose only, not entire rehab.

## Sprint/COD tests
50. >90% sprint remains locked without late-stage criteria.
51. Three successful high-speed exposures rule can be configured and audited.
52. Planned COD precedes reactive COD.
53. Reactive basketball remains locked until reactive COD passes.

## Basketball tests
54. B1 stationary skills can be unlocked before full play.
55. B6/B7 controlled play records minutes/intensity.
56. Initial unrestricted play uses exposure cap.
57. Poor basketball response reduces court exposure, not unrelated strength capacity.
58. App says `Unrestricted Basketball Candidate`, not medical clearance.

## Soccer tests
59. Soccer path remains hidden until enabled.
60. Ball touches/passing unlock before high-speed soccer tasks.
61. COD-with-ball remains locked until corresponding physical COD capability passes.

## Calendar/history tests
62. Weekly plan shows all 7 days.
63. Future workouts can expand.
64. Completed sessions appear on calendar.
65. Tap date opens actual completed session, not template.
66. Month navigation works.
67. Data survives reload/installed-PWA restart.

## Missed-session tests
68. ≤3 days missed -> resume if readiness normal.
69. 4–10 days -> reduced re-entry.
70. >10 days -> relevant retest/re-entry.
71. No double session to make up missed workload.

## Offline/PWA tests
72. Today/check-in/workout logging work offline.
73. Plan/history work offline.
74. Tests and progress work offline.
75. Demo button handles offline state gracefully.
76. Service-worker cache version updates cleanly.

## Mobile usability tests
77. 320–375 px width usable without horizontal scrolling.
78. Large text does not hide critical buttons.
79. Full workout remains scannable with 5–8 exercises.
80. Set logging works with one hand.
