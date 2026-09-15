import { baselineResult, metric, RULESET, symmetry } from "./baseline.js";
import { PROGRESSION_DOMAINS } from "../data/catalog.js";
export const PROGRESSION_CONFIG = Object.freeze({
  earlyRunToleratedExposures: 2,
  highSpeedToleratedExposures: 3,
});
export function checkpointAvailability(
  id,
  values,
  checkpoints = {},
  sessions = [],
) {
  if (baselineResult(values).phase === "Safety Hold" ||
      values.clearance !== "yes" || values.noRestrictions !== "yes") return false;
  const tolerated = (domain, minimum) =>
    sessions.some(
      (s) =>
        s.domain === domain &&
        Number(String(s.exposureLevel).replace(/\D/g, "")) >= minimum &&
        s.status === "TOLERATED",
    );
  const available = {
    calfCapacity: values.bilateralSafe === "yes",
    lowElastic: checkpoints.calfCapacity === "yes",
    stationarySkills: true,
    unilateral: tolerated("jumping", 1),
    reactiveJump: tolerated("jumping", 4),
    plyometric: tolerated("jumping", 1),
    lateStage: tolerated("running", 1),
    deceleration: tolerated("running", 1),
    plannedCut: tolerated("cod", 2),
    reactiveCod: tolerated("cod", 5),
    highSpeedReview: tolerated("speed", 3),
    basketballReview: tolerated("basketball", 7),
  };
  return !!available[id];
}
const passed = (checkpoints, key) =>
  checkpoints?.[key] === "yes" &&
  !!checkpoints[`${key}_evidence`] &&
  !!checkpoints[`${key}_date`];
export function supportingTargets(values, checkpoints = {}) {
  const metrics = baselineResult(values).metrics;
  return {
    plantarflexionLSI: symmetry(
      values.straight_repaired_load,
      values.straight_uninvolved_load,
    ),
    soleusLSI: symmetry(
      values.soleus_repaired_load,
      values.soleus_uninvolved_load,
    ),
    heelRepLSI: metrics.repLSI,
    heelHeightLSI: metrics.heightLSI,
    heelWorkLSI: metrics.workLSI,
    hopAsymmetry: metric(checkpoints.hopAsymmetry),
  };
}
export function gate(
  domain,
  values,
  checkpoints = {},
  sessions = [],
  readiness = "GREEN",
) {
  const result = baselineResult(values),
    need = [];
  const require = (condition, label) => {
    if (!condition) need.push(label);
  };
  require(result.phase !==
    "Safety Hold", "Resolve safety concerns and current restrictions");
  require(readiness !== "RED", "No current red flags");
  require(values.clearance === "yes" && values.noRestrictions === "yes",
    "Confirm exercise clearance and applicable restrictions before sport or impact exposure");
  const tolerated = (d) =>
    sessions.some((s) => s.domain === d && s.status === "TOLERATED");
  if (domain === "running")
    require(result.canRun, "Complete all seven running consensus criteria");
  if (domain === "jumping") {
    require(result.phase !==
      "Foundational Strength", "Stable readiness and basic calf capacity");
    require(passed(
      checkpoints,
      "calfCapacity",
    ), "Adequate calf capacity documented");
    require(passed(
      checkpoints,
      "lowElastic",
    ), "Low elastic preparation demonstrated safely");
  }
  if (domain === "speed") {
    require(result.canRun &&
      tolerated("running"), "Stable tolerated running exposure");
    require(tolerated("jumping") &&
      passed(checkpoints, "plyometric"), "Successful plyometric capacity");
    require(passed(
      checkpoints,
      "lateStage",
    ), "Late-stage strength and heel-rise metrics reviewed");
  }
  if (domain === "cod") {
    require(result.canRun && tolerated("running"), "Tolerated running");
    require(passed(
      checkpoints,
      "deceleration",
    ), "Controlled braking mechanics demonstrated");
  }
  if (domain === "basketball") {
    require(passed(
      checkpoints,
      "stationarySkills",
    ), "Stationary skills capacity demonstrated without symptoms");
  }
  if (domain === "soccer") {
    require(values.soccerEnabled === "yes", "Enable the soccer track");
    require(result.canRun &&
      tolerated("running"), "Adequate tolerated running capacity");
    require(values.soccerBall === "yes" &&
      values.soccerField === "yes", "Ball and safe field / yard access");
  }
  return {
    allowed: need.length === 0,
    needed: need,
    ruleId: `${domain}.entry.v1`,
    rulesetVersion: RULESET,
  };
}
export function levelGate(
  domain,
  level,
  values,
  checkpoints = {},
  sessions = [],
  readiness = "GREEN",
) {
  const base = gate(domain, values, checkpoints, sessions, readiness);
  const need = [...base.needed];
  const n = Number(level.replace(/\D/g, ""));
  const require = (condition, label) => {
    if (!condition) need.push(label);
  };
  const tolerated = (d, min) =>
    sessions.some(
      (s) =>
        s.domain === d &&
        Number(String(s.exposureLevel).replace(/\D/g, "")) >= min &&
        s.status === "TOLERATED",
    );
  if (domain === "jumping" && n >= 3)
    require(passed(
      checkpoints,
      "unilateral",
    ), "Unilateral strength, landing quality and capacity reviewed");
  if (domain === "jumping" && n >= 5)
    require(passed(
      checkpoints,
      "reactiveJump",
    ), "Repeated/reactive hopping capacity demonstrated");
  if (domain === "speed" && n >= 5) {
    require(passed(
      checkpoints,
      "highSpeedReview",
    ), "High-demand strength, heel-rise, jump and confidence review");
    require(sessions.filter(
      (s) =>
        s.domain === "speed" &&
        ["S3", "S4"].includes(s.exposureLevel) &&
        s.status === "TOLERATED",
    ).length >=
      PROGRESSION_CONFIG.highSpeedToleratedExposures, "Three tolerated 80–90% speed exposures");
  }
  if (domain === "cod" && n >= 3)
    require(passed(
      checkpoints,
      "plannedCut",
    ), "Planned cut mechanics demonstrated");
  if (domain === "cod" && n >= 6)
    require(tolerated("cod", 5) &&
      passed(
        checkpoints,
        "reactiveCod",
      ), "Planned COD tolerated and reactive capacity documented");
  if (domain === "basketball" && n >= 2)
    require(tolerated(
      "running",
      1,
    ), "Controlled movement supported by running tolerance");
  if (domain === "basketball" && n >= 3)
    require(tolerated("cod", 3) &&
      tolerated("jumping", 1), "Planned cutting and jumping tolerated");
  if (domain === "basketball" && n >= 4)
    require(tolerated("speed", 3) &&
      tolerated(
        "cod",
        4,
      ), "Higher-speed acceleration and deceleration tolerated");
  if (domain === "basketball" && n >= 5)
    require(tolerated("cod", 6), "Reactive COD tolerated");
  if (domain === "basketball" && n >= 8) {
    require(passed(
      checkpoints,
      "basketballReview",
    ), "Multi-domain sport readiness and confidence review");
    require(tolerated("speed", 4) &&
      tolerated("cod", 6), "High-speed running and reactive COD tolerated");
    require(sessions.filter(
      (s) =>
        s.domain === "basketball" &&
        ["B6", "B7"].includes(s.exposureLevel) &&
        s.status === "TOLERATED",
    ).length >= 2, "Repeated tolerated controlled basketball");
  }
  if (domain === "soccer" && n >= 4)
    require(tolerated(
      "cod",
      n >= 5 ? 6 : 3,
    ), "Corresponding physical change-of-direction capacity tolerated");
  return {
    ...base,
    allowed: !need.length,
    needed: need,
    ruleId: `${domain}.${level}.prerequisites.v1`,
  };
}
export function exposureDecision(
  domain,
  values,
  checkpoints = {},
  sessions = [],
  readiness = "GREEN",
) {
  const definition = PROGRESSION_DOMAINS.find((d) => d.id === domain),
    levels = definition.levels;
  const history = sessions
    .filter((s) => s.domain === domain)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const latest = history.at(-1);
  let index = 0;
  let action = "START";
  let reason = "Start with the first controlled exposure.";
  if (latest) {
    index = Math.max(
      0,
      levels.findIndex((l) => l.id === latest.exposureLevel),
    );
    if (latest.status === "PENDING_NEXT_DAY_RESPONSE") {
      action = "WAIT";
      reason = "Record the next-morning response before another exposure.";
    } else if (latest.status === "MEDICAL_FLAG") {
      if (
        checkpoints.safetyReviewedAt &&
        checkpoints.safetyReviewedAt > latest.createdAt &&
        baselineResult(values).phase !== "Safety Hold"
      ) {
        index = 0;
        action = "START";
        reason =
          "A new safety assessment and current exercise clearance are recorded. Re-enter at the first exposure.";
      } else {
        action = "STOP";
        reason = "Medical flag: resolve safety concerns before resuming.";
      }
    } else if (latest.status === "NOT_TOLERATED") {
      const previous = history
        .filter(
          (s) =>
            s.status === "TOLERATED" &&
            levels.findIndex((l) => l.id === s.exposureLevel) < index,
        )
        .at(-1);
      index = previous
        ? levels.findIndex((l) => l.id === previous.exposureLevel)
        : 0;
      action = "REGRESS";
      reason =
        "Return to the prior tolerated exposure; unrelated capacities are retained.";
      if (!previous) {
        action = "WAIT";
        reason =
          "No lower tolerated exposure is recorded. Return to comfortable low-impact activity and reassess before re-entry.";
      }
      if (
        checkpoints.safetyReviewedAt &&
        checkpoints.safetyReviewedAt > latest.createdAt
      ) {
        index = 0;
        action = "START";
        reason =
          "Updated assessment recorded after the poor response. Restart from the first controlled exposure.";
      }
    } else if (latest.status === "BORDERLINE") {
      action = "HOLD";
      reason = "Repeat/hold this dose until it is tolerated.";
    } else if (latest.status === "TOLERATED" && readiness === "GREEN") {
      const recent = history.slice(
        history
          .map(
            (s) =>
              s.exposureLevel === latest.exposureLevel &&
              (s.status !== "TOLERATED" ||
                s.movementQuality !== "good" ||
                s.progressionEligible === false),
          )
          .lastIndexOf(true) + 1,
      );
      const count = recent.filter(
        (s) =>
          s.exposureLevel === latest.exposureLevel &&
          s.status === "TOLERATED" &&
          s.movementQuality === "good" &&
          s.progressionEligible !== false,
      ).length;
      const minimum =
        domain === "running"
          ? PROGRESSION_CONFIG.earlyRunToleratedExposures
          : 1;
      if (count >= minimum && index < levels.length - 1) {
        index++;
        action = "PROGRESS";
        reason =
          "Capacity prerequisites and tolerated exposure support the next approved ladder dose.";
      } else {
        action = "HOLD";
        reason =
          "Repeat this dose with good movement quality and next-morning tolerance.";
      }
    }
  }
  let current = levels[index],
    eligibility = levelGate(
      domain,
      current.id,
      values,
      checkpoints,
      sessions,
      readiness,
    );
  const nextContacts = { J0: 27, J1: 60, J2: 115, J3: 72, J4: 111 };
  if (
    domain === "jumping" &&
    action === "PROGRESS" &&
    Number(latest?.contacts) > 0 &&
    nextContacts[current.id] >= Number(latest.contacts) * 2
  ) {
    index--;
    current = levels[index];
    action = "HOLD";
    reason =
      "The next ladder dose would at least double recorded landing contacts. Hold and review the intermediate dose with your clinician; the app will not invent a new prescription.";
    eligibility = levelGate(
      domain,
      current.id,
      values,
      checkpoints,
      sessions,
      readiness,
    );
  }
  if (action === "PROGRESS" && !eligibility.allowed && index > 0) {
    const nextRequirements = eligibility.needed.join(" · ");
    index--;
    current = levels[index];
    eligibility = levelGate(
      domain,
      current.id,
      values,
      checkpoints,
      sessions,
      readiness,
    );
    action = "HOLD";
    reason = `Repeat the current dose. Next level still needs: ${nextRequirements}`;
  }
  if (!eligibility.allowed) {
    action = "LOCKED";
    reason = eligibility.needed.join(" · ");
  }
  if (readiness !== "GREEN" && action !== "STOP" && action !== "LOCKED") {
    action = "WAIT";
    reason = "Daily readiness is modified; hold impact/sport progression.";
  }
  if (
    sessions.some(
      (s) =>
        (s.domain === domain || !s.domain) &&
        s.status === "PENDING_NEXT_DAY_RESPONSE",
    ) &&
    action !== "STOP" &&
    action !== "LOCKED"
  ) {
    action = "WAIT";
    reason =
      "A relevant Achilles-loading session is still waiting for its next-morning response.";
  }
  return {
    domain,
    level: current.id,
    dose: current.dose,
    title: current.title,
    action,
    reason,
    allowed: ["START", "HOLD", "PROGRESS", "REGRESS"].includes(action),
    ruleId: `${domain}.ladder.v1`,
    rulesetVersion: RULESET,
    config: PROGRESSION_CONFIG,
    needed: eligibility.needed,
  };
}
export function exposureScheduling(
  domain,
  sessions,
  today,
  isLoadingDay,
  retest = false,
  assessmentDate = "",
) {
  const reentry = exposureReentry(domain, sessions, today, assessmentDate);
  if (reentry.retest)
    return {
      allowed: false,
      reason:
        "This exposure has been paused for more than 10 days. Reassess the relevant capacity before reduced re-entry.",
    };
  if (retest)
    return {
      allowed: false,
      reason: "Reassessment is due after the training break.",
    };
  if (!isLoadingDay)
    return {
      allowed: false,
      reason: "Use a planned loading day to preserve recovery days.",
    };
  const exposures = sessions.filter((s) => s.domain && s.date);
  if (exposures.some((s) => s.date === today))
    return {
      allowed: false,
      reason:
        "One impact/sport exposure per day. Do not double up to catch up.",
    };
  const date = new Date(`${today}T12:00:00`),
    monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const week = exposures.filter(
    (s) => new Date(s.date + "T12:00:00") >= monday && s.date <= today,
  );
  if (week.length >= 2)
    return {
      allowed: false,
      reason:
        "The initial plan allows two high-rate exposures per week. Keep the remaining days lower-impact.",
    };
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    exposures.some(
      (s) => new Date(s.date + "T12:00:00").getTime() === yesterday.getTime(),
    )
  )
    return {
      allowed: false,
      reason: "Preserve a recovery day between high-rate exposures.",
    };
  return {
    allowed: true,
    reason: "Scheduled within the initial high/low exposure limits.",
    ruleId: "schedule.high-low.v1",
  };
}
export function exposureReentry(domain, sessions, today, assessmentDate = "") {
  const prior = [...sessions]
    .filter((s) => s.domain === domain && s.date && s.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const days = prior
    ? Math.max(
        0,
        Math.floor(
          (new Date(today + "T12:00:00") - new Date(prior.date + "T12:00:00")) /
            86400000,
        ) - 1,
      )
    : 0;
  return {
    days,
    reduction: days > 10 ? 0.3 : days > 3 ? 0.2 : 0,
    retest: days > 10 && assessmentDate.slice(0, 10) < today,
    ruleId: "exposure.missed-session-reentry.v1",
  };
}
export function strengthDecision(exercise, sets, status, readiness = "GREEN") {
  const top = Number(
    String(exercise.reps).match(/\d+[–-](\d+)/)?.[1] ||
      String(exercise.reps).match(/\d+/)?.[0] ||
      0,
  );
  const complete =
    sets.length >= exercise.sets &&
    sets
      .slice(0, exercise.sets)
      .every(
        (s) =>
          s?.complete &&
          (!s.inheritedFields?.length || s.feedbackConfirmed === true) &&
          Number(s.reps) >= top &&
          Number(s.rpe) > 0 &&
          Number(s.rpe) <= 8 &&
          s.quality === "good" &&
          s.symptoms === "none",
      );
  const progress = status === "TOLERATED" && readiness === "GREEN" && complete;
  return {
    action: progress ? "PROPOSE_SMALL_INCREMENT" : "HOLD",
    reason: progress
      ? "All prescribed sets reached the upper target with controlled quality, suitable RPE and next-day tolerance. Use the smallest practical load increment."
      : "Keep the load until reps, heel height, quality and next-day tolerance support progression.",
    ruleId: "strength.double-progression.v1",
    rulesetVersion: RULESET,
  };
}
