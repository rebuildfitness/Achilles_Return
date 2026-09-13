export const RULESET = "1.1.0";
export function metric(value) {
  return value === "" ||
    value === undefined ||
    value === null ||
    !Number.isFinite(Number(value)) ||
    Number(value) < 0
    ? null
    : Number(value);
}
export function symmetry(repaired, uninvolved) {
  const a = metric(repaired),
    b = metric(uninvolved);
  return a === null || b === null || b === 0
    ? null
    : Math.round((a / b) * 1000) / 10;
}
export function heelRiseMetrics(v) {
  const repsR = metric(v.heel_repaired_reps),
    repsU = metric(v.heel_uninvolved_reps),
    heightR = metric(v.heel_repaired_average),
    heightU = metric(v.heel_uninvolved_average);
  const workR =
    repsR !== null && heightR !== null && heightR > 0 ? repsR * heightR : null;
  const workU =
    repsU !== null && heightU !== null && heightU > 0 ? repsU * heightU : null;
  return {
    repLSI: symmetry(repsR, repsU),
    heightLSI: symmetry(v.heel_repaired_peak, v.heel_uninvolved_peak),
    workLSI: symmetry(workR, workU),
    repairedWork: workR,
    uninvolvedWork: workU,
    heightNotMeasured: heightR === null || heightU === null,
  };
}
export function runningCriteria(v) {
  return [
    {
      id: "daily-pain",
      label: "No pain in daily life",
      passed:
        v.noDailyPain === "yes" &&
        !(metric(v.restPain) > 0) &&
        !(metric(v.walkPain) > 0),
    },
    {
      id: "rehab-pain",
      label: "No pain during or after rehabilitation",
      passed: v.noRehabPain === "yes",
    },
    { id: "gait", label: "Walk without a limp", passed: v.gait === "normal" },
    {
      id: "tiptoes",
      label: "Walk on tiptoes",
      passed: v.function_5 === "normal",
    },
    {
      id: "heel-rise",
      label: "10 controlled single-leg heel rises",
      passed:
        (metric(v.heel_repaired_reps) ?? 0) >= 10 && v.heelQuality === "yes",
    },
    {
      id: "balance",
      label: "Good single-leg balance",
      passed: v.goodBalance === "yes",
    },
    {
      id: "confidence",
      label: "Psychologically ready to run",
      passed: v.psychReady === "yes",
    },
  ].map((c) => {
    const recorded = {
      "daily-pain": !!v.noDailyPain,
      "rehab-pain": !!v.noRehabPain,
      gait: !!v.gait,
      tiptoes: !!v.function_5,
      "heel-rise": metric(v.heel_repaired_reps) !== null && !!v.heelQuality,
      balance: !!v.goodBalance,
      confidence: !!v.psychReady,
    };
    const conflict =
      c.id === "daily-pain" &&
      v.noDailyPain === "yes" &&
      (metric(v.restPain) > 0 || metric(v.walkPain) > 0);
    return {
      ...c,
      status: conflict
        ? "Review conflicting answers"
        : c.passed
          ? "Met"
          : recorded[c.id]
            ? "Not yet met"
            : "Not recorded",
      detail: conflict
        ? "Pain-free was answered Yes, but resting or walking pain is above zero. Review these answers."
        : c.id === "rehab-pain"
          ? `Your answer: ${v.noRehabPain || "not recorded"}`
          : c.id === "daily-pain"
            ? `Your answer: ${v.noDailyPain || "not recorded"}`
            : "",
    };
  });
}
export function baselineResult(v) {
  const criteria = runningCriteria(v),
    metrics = heelRiseMetrics(v),
    red = (v.redFlags || []).length > 0;
  const restricted = v.clearance !== "yes" || v.noRestrictions !== "yes";
  const low =
    v.gait !== "normal" ||
    v.bilateralSafe !== "yes" ||
    v.bilateralTen !== "yes" ||
    v.bilateralHeight === "marked" ||
    v.bilateralSymmetry === "clear";
  const canRun = !red && !restricted && !low && criteria.every((c) => c.passed);
  const recent =
    canRun &&
    v.recentRunning === "yes" &&
    v.runSameDay === "yes" &&
    v.runNextDay === "yes" &&
    (metric(v.runMinutes) ?? 0) > 0;
  const phase = red
    ? "Safety Hold"
    : low || restricted
      ? "Foundational Strength"
      : recent
        ? "Running"
        : "Running Readiness";
  return {
    phase,
    canRun,
    criteria,
    metrics,
    limiters: red
      ? ["Resolve concerning acute symptoms"]
      : restricted
        ? ["Confirm current exercise restrictions before impact or running"]
        : criteria
            .filter((c) => !c.passed)
            .map((c) => c.label)
            .slice(0, 3),
    strengths: criteria.filter((c) => c.passed).map((c) => c.label),
    ruleId: "baseline.starting-focus.v1",
    rulesetVersion: RULESET,
    reason: red
      ? "Red flags override physical capacity."
      : restricted
        ? "Current exercise restrictions need review."
        : recent
          ? "Current criteria and recent tolerated running support this focus."
          : canRun
            ? "Controlled R1 run/walk is eligible; higher-speed and sport work remain gated."
            : "Build the capabilities still needed before running.",
  };
}
