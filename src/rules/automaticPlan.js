import { PROGRESSION_DOMAINS } from "../data/catalog.js";
import { exposureContent } from "../data/exposures.js";
import { exposureDecision, exposureScheduling, exposureReentry, strengthDecision } from "./progression.js";
import { OWNED_LOADS } from "../data/ownedLoads.js";
import matrix from "../../spec/progression-matrix-v1.json" with { type: "json" };
export const PROGRESSION_MATRIX = matrix;

// A projection of observed evidence, never a simulated future training history.
export function automaticStrengthTarget(exercise, sessions, readiness, date, progressionAllowed = true) {
  const history = sessions.filter(s => s.date < date && s.exerciseLog?.[exercise.id])
    .sort((a,b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const latest = history.at(-1);
  if (!latest || !progressionAllowed || readiness !== "GREEN" ||
      sessions.some(s => s.status === "PENDING_NEXT_DAY_RESPONSE")) return exercise;
  const prior = latest.plannedItems?.find(e => e.id === exercise.id);
  // Do not evaluate a different prescription, a shortened/swapped dose, or a time/distance exercise as a rep test.
  if (!prior || prior.sets !== exercise.sets || prior.reps !== exercise.reps ||
      prior.skipReason || prior.adjustment || (exercise.unit && exercise.unit !== "reps") ||
      (latest.readiness && latest.readiness.level !== "GREEN")) return exercise;
  const sets = latest.exerciseLog[exercise.id].sets || [];
  if (strengthDecision(prior, sets, latest.status, readiness).action !== "PROPOSE_SMALL_INCREMENT") return exercise;
  const loads = sets.slice(0, prior.sets).map(s => s.load === "" || s.load == null ? NaN : Number(s.load));
  // Bodyweight, bands, mixed loads and missing load conventions require their existing guidance.
  if (!loads.length || loads.some(n => !Number.isFinite(n) || n <= 0 || n !== loads[0]) ||
      !(exercise.equipment || []).some(e => ["dumbbells", "cable-station", "smith-machine", "belt-squat", "olympic-barbell", "trap-hex-bar"].includes(e))) return exercise;
  const limit = exercise.equipment?.includes("dumbbells") ? 50 : exercise.id === "belt-squat" ? OWNED_LOADS.olympicPlatesLb : null;
  const atLimit = limit !== null && loads[0] >= limit;
  return { ...exercise, progressionTarget: {
    action: atLimit ? "REVIEW_VARIATION" : "INCREASE_LOAD",
    text: atLimit ? `Maintain ${loads[0]} lb; review a suitable variation before adding load.` :
      `Next working load: the smallest practical increase above ${loads[0]} lb. Keep ${exercise.sets} × ${exercise.reps} and the prescribed effort; repeat the prior load if the available increment is too large.`,
    previousLoad: loads[0], sourceSessionId: latest.id,
    reason: "Prescribed sets, upper repetition target, recorded effort, quality and next-morning tolerance met the existing progression rule.",
    ruleId: "strength.double-progression.v1", matrixVersion: matrix.version,
    sourceIds: ["general-strength", "product-v1"],
  }};
}

/** @template T
 * @param {T[]} days
 * @param {any} context
 * @returns {(T & { exposure: any, progressionReviews: any[] })[]}
 */
export function applyAutomaticPlan(days, { assessment, checkpoints = {}, sessions = [], readiness = "UNCHECKED", today }) {
  if (!assessment?.completedAt) return days.map(d => ({ ...d, exposure: null, progressionReviews: [] }));
  const observed = sessions.filter(s => s.date <= today);
  const pending = observed.some(s => s.status === "PENDING_NEXT_DAY_RESPONSE");
  const unresolvedMedical = observed.some(s => s.status === "MEDICAL_FLAG" && s.createdAt > assessment.completedAt);
  const effective = unresolvedMedical ? "RED" : readiness;
  const decisions = PROGRESSION_DOMAINS.filter(d => d.id !== "soccer" || assessment.values.soccerEnabled === "yes")
    .map(d => ({ ...exposureDecision(d.id, assessment.values, checkpoints, observed, effective === "UNCHECKED" ? "GREEN" : effective), domainTitle: d.title }));
  const reserved = [];
  const lastUsed = Object.fromEntries(decisions.map(d => [d.domain, observed.filter(s => s.domain === d.domain).map(s=>s.date).sort().at(-1) || ""]));
  return days.map(day => {
    if (day.date < today) return { ...day, exposure: null, progressionReviews: [] };
    const workout = day.workout ? { ...day.workout, items: day.workout.items.map(ex => automaticStrengthTarget(ex, observed, effective, day.date, day.workout.progressionAllowed && !day.retest)) } : null;
    let exposure = null;
    const reviews = [];
    if (day.high && !day.retest && !pending && !["RED", "YELLOW_1", "YELLOW_2", "YELLOW_3"].includes(effective)) {
      const eligible = decisions.filter(d => d.allowed).sort((a,b) => lastUsed[a.domain].localeCompare(lastUsed[b.domain]) || matrix.domainOrder.indexOf(a.domain)-matrix.domainOrder.indexOf(b.domain));
      for (const decision of eligible) {
        const schedule = exposureScheduling(decision.domain, [...observed, ...reserved], day.date, day.high, day.retest, assessment.completedAt, today);
        if (!schedule.allowed) continue;
        const content = exposureContent(decision.domain, decision.level);
        const reentry = exposureReentry(decision.domain, observed, today, assessment.completedAt);
        if (content.needsIndividualDose || reentry.reduction || content.missingDemos.length) {
          reviews.push({ domain: decision.domain, level: decision.level, reason: content.missingDemos.length ? "A verified demonstration is required." : "An individualized or reduced re-entry dose needs review before automatic scheduling." });
          continue;
        }
        exposure = { ...decision, fromLevel: observed.filter(s=>s.domain === decision.domain).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt))).at(-1)?.exposureLevel || null,
          matrixVersion: matrix.version, sourceIds: matrix.rows.find(r=>r.domain === decision.domain).sourceIds,
          conditional: day.date !== today || effective !== "GREEN", canStart: day.date === today && effective === "GREEN", date: day.date };
        reserved.push({ domain: decision.domain, date: day.date });
        lastUsed[decision.domain] = day.date;
        break;
      }
    }
    return { ...day, workout, exposure, progressionReviews: reviews };
  });
}

export function automaticPlanSnapshot(days, assessment, checkpoints, sessions, readiness, today) {
  return { decisionType: "AUTOMATIC_PLAN", matrixVersion: matrix.version, date: today,
    assessmentId: assessment?.id || null, assessmentUpdatedAt: assessment?.updatedAt || assessment?.completedAt || null,
    checkpoints, readiness,
    sessionEvidence: sessions.map(s=>({id:s.id,revision:s.revision || 0,status:s.status,closedAt:s.closedAt || null})).sort((a,b)=>a.id.localeCompare(b.id)),
    plan: days.filter(d=>d.date >= today).map(d=>({date:d.date, exposure:d.exposure,
      strength:d.workout?.items.map(e=>({id:e.id,sets:e.sets,reps:e.reps,target:e.progressionTarget || null})) || [], reviews:d.progressionReviews})),
  };
}

