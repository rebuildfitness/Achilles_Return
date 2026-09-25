// Pure advisory projection. Existing policy evaluators retain their V1 meaning.
// No database, clock, random IDs, or mutation of the selected workout.
import { classifyReadiness } from "../../rules/readiness.js";
import { runningCriteria, RULESET } from "../../rules/baseline.js";
import {
  gate,
  levelGate,
  exposureDecision,
  exposureScheduling,
  exposureReentry,
  strengthDecision,
} from "../../rules/progression.js";
import { exercisePath, EXERCISE_PATHS } from "../../rules/exercisePaths.js";
import {
  progressRehabBlocks,
  REHAB_BLOCK_MATRIX,
} from "../../rules/rehabBlockProgression.js";
import { classifyTolerance } from "../../rules/response.js";
import { EVIDENCE } from "../../data/evidence.js";
import { CHECKPOINTS } from "../../data/checkpoints.js";
import { exposureQuality } from "../../data/exposures.js";
import { VERSIONS } from "../../persistence/schema.js";
import matrix from "../../../spec/progression-matrix-v1.json" with { type: "json" };
import researchSources from "../../../spec/exercise-additions-sources-v1.json" with { type: "json" };
import { clone } from "./composition.js";

export const GUIDANCE_VERSION = "1.1.0";
export const valueOf = (v) => (v?.state === "known" ? v.value : undefined);
const amount = (v) => valueOf(v?.amount);
export const subjectIntent = (s) => s.snapshot || s;
const rank = {
  STRONG_WARNING: 0,
  CAUTION: 1,
  RECOMMENDATION: 2,
  INFORMATION: 3,
};
// Canonical serialization, including absent-vs-blank distinctions. No hash collision
// can cause different clinical inputs to reuse an acknowledged finding.
export const fingerprint = (x) =>
  JSON.stringify(x, function (k, v) {
    if (v && typeof v === "object" && !Array.isArray(v))
      return Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, v[k]]),
      );
    return v;
  });
export const contextKey = (context) => fingerprint(context);
const digest = (text) => {
  let a = 2166136261,
    b = 2246822507;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 16777619);
    b = Math.imul(b ^ text.charCodeAt(i), 3266489909);
  }
  return (a >>> 0).toString(16) + (b >>> 0).toString(16);
};
export const isCurrentGuidance = (event, subject, context) =>
  event.subjectId === subject.id &&
  event.subjectRevision === subject.revision &&
  event.contextKey === contextKey(context) &&
  event.adapterVersion === GUIDANCE_VERSION;
export function prioritize(findings) {
  const unique = new Map();
  for (const f of findings)
    if (
      !unique.has(f.dedupKey) ||
      rank[f.level] < rank[unique.get(f.dedupKey).level]
    )
      unique.set(f.dedupKey, f);
  return [...unique.values()].sort(
    (a, b) =>
      rank[a.level] - rank[b.level] || a.dedupKey.localeCompare(b.dedupKey),
  );
}
// Category associations use the existing ladders; subdomains stay distinct even
// when the existing evidence shares a parent evaluator. Never infer from names.
const domains = {
  Running: "running",
  "Jumping & Landing": "jumping",
  Plyometrics: "jumping",
  Acceleration: "speed",
  Sprinting: "speed",
  Deceleration: "cod",
  "Change of Direction / Agility": "cod",
  "Basketball Conditioning": "basketball",
  "Basketball Skill Exposure": "basketball",
  Soccer: "soccer",
};
export function occurrenceDomains(o) {
  const d = o.definitionSnapshot;
  if (d.provenance.origin === "custom") return [];
  const raw = d.sourceMetadata || {};
  const entries = [...new Set(d.categories)]
    .filter((k) => domains[k])
    .map((label) => ({ label, domain: domains[label] }));
  if (
    ["running", "jumping", "speed", "cod", "basketball", "soccer"].includes(
      raw.domain,
    )
  )
    entries.push({
      label: raw.domain,
      domain: raw.domain,
      level: raw.exposureLevel,
    });
  return [...new Map(entries.map((e) => [e.label, e])).values()];
}
export function benchmarkStatuses(values = {}, checkpoints = {}) {
  return [
    ...runningCriteria(values).map((c) => ({
      ...c,
      status:
        c.status === "Met"
          ? "met"
          : c.status === "Not yet met"
            ? "not-yet-met"
            : c.status === "Not recorded"
              ? "not-tested"
              : "unknown",
    })),
    ...CHECKPOINTS.map((c) => ({
      id: c.id,
      label: c.label,
      status:
        checkpoints[c.id] == null || checkpoints[c.id] === ""
          ? "not-tested"
          : checkpoints[c.id] === "yes" &&
              checkpoints[c.id + "_date"] &&
              checkpoints[c.id + "_evidence"]
            ? "met"
            : checkpoints[c.id] === "no"
              ? "not-yet-met"
              : "unknown",
    })),
    {
      id: "clearance",
      label: "User-entered clinician clearance",
      status:
        values.clearance === "yes"
          ? "met"
          : values.clearance === "no"
            ? "clinician-clearance-required"
            : "unknown",
    },
  ];
}
// Only explicit V2 facts are translated into legacy input vocabulary. Repeated
// occurrences become separate evidence rows, never an exercise-ID overwrite.
export function legacyEvidence(sessions = [], observations = []) {
  return sessions.flatMap((s) => {
    if (!s.schemaVersion) return [clone(s)];
    if (s.legacy?.raw && !s.correctionLineage?.some(c=>c.version===1)) return [clone(s.legacy.raw)];
    if (!["completed", "partial"].includes(s.lifecycle)) return [];
    const response = observations
      .filter((o) => o.sessionId === s.id && o.kind === "response")
      .sort((a, b) =>
        String(valueOf(a.recordedAt)).localeCompare(
          String(valueOf(b.recordedAt)),
        ),
      )
      .at(-1);
    const status = classifyTolerance(response?.observations || {});
    const base = {
      id: s.id,
      date: valueOf(s.date),
      createdAt: valueOf(s.startedAt),
      status,
    };
    const rows = s.occurrences.map((o) => {
      const reps = o.sets.map((t) => amount(t.target.reps));
      const ex = {
        ...clone(o.definitionSnapshot.sourceMetadata),
        id: o.exerciseDefinitionId,
        sets: o.sets.length,
        reps: reps.every((r) => r !== undefined && r === reps[0])
          ? String(reps[0])
          : undefined,
        unit: "reps",
      };
      return {
        ...base,
        id: s.id + ":" + o.id,
        sourceSessionId: s.id,
        plannedItems: [ex],
        exerciseLog: {
          [ex.id]: {
            sets: o.sets.map((t) => ({
              complete: t.disposition === "completed",
              reps: amount(t.actual.reps),
              load:
                valueOf(t.actual.load?.unit) === "lb" &&
                valueOf(t.actual.loadConvention) !== undefined
                  ? amount(t.actual.load)
                  : undefined,
              rpe: amount(t.actual.rpe),
              quality: valueOf(t.actual.quality),
              symptoms: valueOf(t.actual.symptoms),
            })),
          },
        },
      };
    });
    // Only explicitly classified exposure observations are used, not inferred doses.
    for (const o of observations.filter(
      (o) => o.sessionId === s.id && o.kind === "exposure",
    )) {
      const raw = o.observations;
      if (
        ["running", "jumping", "speed", "cod", "basketball", "soccer"].includes(
          raw.domain,
        )
      )
        rows.push({ ...base, ...clone(raw), id: o.id, status });
    }
    return rows.length ? rows : [base];
  });
}
export function legacyPrescription(o) {
  const raw = o.definitionSnapshot.sourceMetadata || {};
  const values = o.sets.map((s) => amount(s.target.reps));
  const reps =
    values.length && values.every((n) => n !== undefined && n === values[0])
      ? String(values[0])
      : values.some((n) => n !== undefined)
        ? undefined
        : valueOf(o.targetDescription);
  return {
    ...clone(raw),
    id: o.exerciseDefinitionId,
    sets: o.sets.length,
    reps,
    unit: values.every((n) => n !== undefined) ? "reps" : raw.unit,
  };
}
/** Explicit timestamp is supplied by caller; deterministic for identical inputs. */
export function evaluateGuidance(subject, context = {}, at) {
  if (!subject?.id || !Number.isInteger(subject.revision) || !at)
    throw Error(
      "Guidance requires persisted subject identity, revision and evaluation timestamp",
    );
  const intent = subjectIntent(subject),
    findings = [],
    values = context.assessment?.values || {},
    checkpoints = context.checkpoints?.values || context.checkpoints || {};
  const history = legacyEvidence(
    context.previousSessions || [],
    context.observations || [],
  ).sort((a, b) =>
    String(a.createdAt || a.date).localeCompare(String(b.createdAt || b.date)),
  );
  const answers = context.checkIn?.answers;
  const classified = answers ? classifyReadiness(answers) : null;
  const completeCheckIn =
    answers &&
    Object.entries({
      pain: ["none", "mild", "moderate", "significant"],
      stiffness: ["normal", "slightly-more", "much-more"],
      swelling: ["normal", "a-little", "a-lot"],
      previousResponse: ["good", "somewhat-sore", "poor"],
      recovery: ["good", "okay", "poor"],
    }).every(([k, allowed]) => allowed.includes(answers[k])) &&
    Array.isArray(answers.unusualSymptoms);
  const ready =
    classified && (classified.level !== "GREEN" || completeCheckIn)
      ? classified
      : null;
  // Missing check-in never defaults to GREEN for progression proposals.
  const readiness = ready?.level || "UNCHECKED";
  const key = contextKey(context);
  const emit = (ruleId, level, finding, explanation, options = {}) => {
    const sources = options.sourceIds || ["product-v1"];
    const dedupKey =
      options.dedupKey || ruleId + ":" + (options.occurrenceId || "workout");
    const identity = fingerprint([
      subject.id,
      subject.revision,
      GUIDANCE_VERSION,
      key,
      dedupKey,
    ]);
    findings.push({
      id: "guidance:" + digest(identity),
      recordVersion: 1,
      revision: 1,
      subjectId: subject.id,
      subjectRevision: subject.revision,
      adapterVersion: GUIDANCE_VERSION,
      contextKey: key,
      at,
      ruleId,
      ruleVersion: RULESET,
      evidenceVersion: VERSIONS.evidenceCatalogVersion,
      sourceVersions: {
        rules: RULESET,
        evidence: VERSIONS.evidenceCatalogVersion,
        progressionMatrix: matrix.version,
        exercisePaths: EXERCISE_PATHS.version,
        rehabBlocks: REHAB_BLOCK_MATRIX.version,
        exerciseResearch: researchSources.version,
      },
      level,
      finding,
      explanation,
      dedupKey,
      inputs: { subject: clone(subject), context: clone(context) },
      inputIds: [subject.id, ...(context.inputIds || [])],
      sourceIds: sources,
      evidence: sources.map((id) =>
        clone(
          EVIDENCE.find((e) => e.id === id) ||
            researchSources.sources.find((e) => e.id === id) || {
              id,
              title: id,
              summary: "See preserved exercise source metadata.",
            },
        ),
      ),
      missingInputs: [],
      ...options,
    });
  };
  if (ready?.level === "RED" || values.redFlags?.length)
    emit(
      "readiness.red.v1",
      "STRONG_WARNING",
      "Stop Achilles loading and seek evaluation",
      "A concerning symptom was reported. Stop Achilles loading and seek appropriate medical evaluation. Recording activity or continuing anyway is not medical clearance.",
      {
        dedupKey: "red-flags",
        sourceIds: ["rehab-guidance", "product-v1"],
        interpretation: ready,
      },
    );
  else if (ready && ready.level !== "GREEN")
    emit("readiness.modified.v1", "CAUTION", ready.reason, ready.action, {
      interpretation: ready,
    });
  if (!context.assessment && intent.occurrences.length)
    emit(
      "baseline.context.v1",
      "INFORMATION",
      "Assessment information is unavailable",
      "Benchmarks are unknown or not tested. You can still select and record exercises.",
      { missingInputs: ["assessment"], benchmarks: benchmarkStatuses() },
    );
  if (!ready && intent.occurrences.length)
    emit(
      "readiness.context.v1",
      "INFORMATION",
      "Current symptom check-in is unavailable",
      "No stable-readiness conclusion or progression recommendation is inferred.",
      { missingInputs: ["current check-in"] },
    );
  const pending = history.filter(
    (s) => s.status === "PENDING_NEXT_DAY_RESPONSE",
  );
  const medical = history.filter(
    (s) =>
      s.status === "MEDICAL_FLAG" &&
      (!context.assessment?.completedAt ||
        !s.createdAt ||
        s.createdAt > context.assessment.completedAt),
  );
  if (medical.length)
    emit(
      "response.medical-review.v1",
      "STRONG_WARNING",
      "A recorded medical flag needs review",
      "Stop Achilles loading and seek appropriate medical evaluation. No subsequent assessment review is recorded for this flag.",
      {
        dedupKey: "red-flags",
        supportingSessionIds: medical.map((s) => s.sourceSessionId || s.id),
        sourceIds: ["rehab-guidance", "product-v1"],
      },
    );
  if (
    pending.length ||
    (["completed", "partial"].includes(subject.lifecycle) &&
      !(context.observations || []).some(
        (o) =>
          o.sessionId === subject.id &&
          o.kind === "response" &&
          classifyTolerance(o.observations) !== "PENDING_NEXT_DAY_RESPONSE",
      ))
  )
    emit(
      "response.pending.v1",
      "CAUTION",
      "Delayed tendon response has not yet been recorded",
      "Workout completion and next-day tolerance are separate. Tolerance remains unknown until the response is recorded.",
      {
        missingInputs: ["delayed tendon response"],
        supportingSessionIds: pending.map((s) => s.sourceSessionId || s.id),
      },
    );
  for (const observation of (context.observations || []).filter(
    (o) => o.kind === "response",
  )) {
    const result = classifyTolerance(observation.observations);
    if (["MEDICAL_FLAG", "NOT_TOLERATED", "BORDERLINE"].includes(result))
      emit(
        "response.classification.v1",
        result === "MEDICAL_FLAG" ? "STRONG_WARNING" : "CAUTION",
        "Recorded tendon response needs attention",
        result === "MEDICAL_FLAG"
          ? "Stop Achilles loading and seek appropriate medical evaluation."
          : "Consider reducing Achilles loading and reviewing recovery before progressing.",
        {
          dedupKey: "response:" + observation.id,
          supportingObservationIds: [observation.id],
          interpretation: result,
        },
      );
  }
  const evaluated = new Set();
  for (const o of intent.occurrences) {
    const d = o.definitionSnapshot,
      raw = d.sourceMetadata || {},
      common = {
        occurrenceId: o.id,
        sourceIds: d.provenance.sourceIds.length
          ? d.provenance.sourceIds
          : ["product-v1"],
      };
    const feedback = o.sets.filter(
      (s) => valueOf(s.actual?.symptoms) || valueOf(s.actual?.quality),
    );
    for (const s of feedback) {
      const symptoms = valueOf(s.actual.symptoms),
        quality = valueOf(s.actual.quality);
      const red =
        classifyReadiness({ unusualSymptoms: [symptoms] }).level === "RED";
      if (
        red ||
        symptoms === "increased" ||
        quality === "reduced" ||
        quality === "poor"
      )
        emit(
          "strength.feedback-review.v1",
          red ? "STRONG_WARNING" : "CAUTION",
          red
            ? "Stop Achilles loading and seek evaluation"
            : "Review recorded set feedback",
          red
            ? "A concerning symptom was recorded during this workout. Stop Achilles loading and seek appropriate medical evaluation."
            : `Recorded symptoms: ${symptoms || "unknown"}; movement quality: ${quality || "unknown"}. The existing progression rule requires controlled quality and no increased symptoms. Review before progressing.`,
          {
            ...common,
            dedupKey: "feedback:" + o.id,
            supportingSetIds: feedback.map((s) => s.id),
          },
        );
    }
    if (d.provenance.origin === "custom")
      emit(
        "exercise.custom-context.v1",
        "INFORMATION",
        "Clinical loading classification is unknown",
        `${valueOf(d.name) || "Custom exercise"} is user-created. No Achilles demand, impact level, phase or evidence is inferred.`,
        { ...common, missingInputs: ["reviewed clinical classification"] },
      );
    else if (valueOf(d.achillesPurpose))
      emit(
        "exercise.purpose.v1",
        "INFORMATION",
        valueOf(d.name),
        valueOf(d.achillesPurpose),
        common,
      );
    const phase = context.rehabPhase || context.assessment?.result?.phase;
    if (
      phase &&
      d.phaseAssociations.length &&
      !d.phaseAssociations.includes(phase)
    )
      emit(
        "exercise.phase-context.v1",
        "CAUTION",
        "Exercise phase association differs from your current focus",
        `${valueOf(d.name)} is associated with ${d.phaseAssociations.join(", ")}. Your recorded focus is ${phase}. Review its prerequisites; it remains selectable and loggable.`,
        {
          ...common,
          missingInputs: ["individual readiness for this phase association"],
        },
      );
    if (
      valueOf(d.demandLevel) === undefined &&
      d.provenance.origin !== "custom"
    )
      emit(
        "exercise.demand-unknown.v1",
        "INFORMATION",
        "Exercise demand is not classified",
        `${valueOf(d.name)} has no recorded clinical demand classification.`,
        { ...common, missingInputs: ["exercise demand"] },
      );
    const available = context.equipment?.availableToday;
    if (
      Array.isArray(available) &&
      d.equipment.some((e) => !available.includes(e))
    )
      emit(
        "equipment.available.v1",
        "RECOMMENDATION",
        "Review today’s equipment setup",
        "Required equipment is not listed as available today. Consider a substitution or update the setup; factual logging remains available.",
        {
          ...common,
          missingEquipment: d.equipment.filter((e) => !available.includes(e)),
        },
      );
    if (d.equipment.some((e) => /wagon/.test(e)))
      emit(
        "equipment.wagon.v1",
        "CAUTION",
        "Wagon setup needs individual review",
        "A utility wagon is not a purpose-built training sled. Preserve its actual equipment identity and setup; cargo capacity does not establish exercise suitability.",
        common,
      );
    const ds = [
      ...occurrenceDomains(o),
      ...(o.order === 0
        ? (intent.categories || [])
            .filter((k) => domains[k])
            .map((label) => ({
              label,
              domain: domains[label],
              workoutLevel: true,
            }))
        : []),
    ];
    for (const domain of ds) {
      const g = domain.level
        ? levelGate(
            domain.domain,
            domain.level,
            values,
            checkpoints,
            history,
            readiness,
          )
        : gate(domain.domain, values, checkpoints, history, readiness);
      if (!g.allowed)
        emit(
          g.ruleId,
          "CAUTION",
          `${domain.label}: readiness evidence needs review`,
          g.needed.join(" · "),
          {
            ...common,
            ...(domain.workoutLevel ? { occurrenceId: undefined } : {}),
            sourceIds: [
              "rehab-guidance",
              domain.domain === "running" ? "running-consensus" : "rts-review",
              "product-v1",
            ],
            domain: domain.label,
            benchmarkStatus: "unknown-or-not-demonstrated",
            benchmarks: benchmarkStatuses(values, checkpoints),
            missingInputs: g.needed,
            interpretation: g,
          },
        );
      if (evaluated.has(domain.domain)) continue;
      evaluated.add(domain.domain);
      if (domain.domain === "jumping") {
        const sets = intent.occurrences
          .filter(
            (row) =>
              domain.workoutLevel ||
              occurrenceDomains(row).some((d) => d.domain === "jumping"),
          )
          .flatMap((row) => row.sets);
        const counts = sets.flatMap((s) =>
          s.intervals?.length
            ? s.intervals.map((b) => b.target.contacts)
            : [s.target.contacts],
        );
        const knownCounts =
          !intent.groups?.length &&
          !sets.some((s) => s.intervals?.length) &&
          counts.length &&
          counts.every(
            (q) =>
              amount(q) !== undefined &&
              ["count", "contacts"].includes(valueOf(q.unit)),
          );
        if (knownCounts) {
          const quality = exposureQuality(
            "jumping",
            "",
            { contacts: counts.reduce((n, q) => n + amount(q), 0) },
            history,
          );
          const concerns = quality.reviewReasons.filter((r) =>
            r.startsWith("Landing contacts"),
          );
          if (concerns.length)
            emit(
              "exposure.contact-increase.v1",
              "CAUTION",
              "Review planned landing contacts",
              concerns.join(" "),
              {
                domain: domain.label,
                interpretation: { reviewReasons: concerns },
                missingInputs: ["individual dose review"],
                sourceIds: ["product-v1", "rehab-guidance"],
              },
            );
        } else
          emit(
            "exposure.contacts-unknown.v1",
            "INFORMATION",
            "Planned landing contacts are not fully recorded",
            "A contact comparison needs explicit comparable counts. Grouped or interval totals require review; unknown is not zero.",
            {
              domain: domain.label,
              missingInputs: ["explicit landing contacts"],
            },
          );
      }
      const date = context.date;
      if (date) {
        const spacing = exposureScheduling(
          domain.domain,
          history,
          date,
          true,
          false,
          context.assessment?.completedAt || "",
        );
        if (!spacing.allowed)
          emit(
            "schedule.high-low.v1",
            "CAUTION",
            "Review impact exposure spacing",
            spacing.reason,
            { domain: domain.label, interpretation: spacing },
          );
        const reentry = exposureReentry(
          domain.domain,
          history,
          date,
          context.assessment?.completedAt || "",
        );
        if (reentry.reduction)
          emit(
            reentry.ruleId,
            "CAUTION",
            `${domain.label}: review re-entry after a break`,
            "The existing re-entry rule suggests reassessment or a reduced re-entry dose. No dose has been changed.",
            { domain: domain.label, interpretation: reentry },
          );
      }
      const decision = exposureDecision(
        domain.domain,
        values,
        checkpoints,
        history,
        readiness,
      );
      if (!["LOCKED", "START"].includes(decision.action))
        emit(
          decision.ruleId,
          decision.action === "STOP"
            ? "STRONG_WARNING"
            : ["PROGRESS", "HOLD"].includes(decision.action)
              ? "RECOMMENDATION"
              : "CAUTION",
          `${domain.label}: ${decision.action === "PROGRESS" ? "consider the next exposure" : "review the current exposure"}`,
          decision.reason,
          {
            domain: domain.label,
            interpretation: decision,
            proposal: {
              description: `Review ${decision.level}: ${decision.dose}. ${decision.reason}`,
              targetId: o.id,
              kind: "review",
            },
          },
        );
    }
    const exercise = legacyPrescription(o);
    const prior = history
      .filter((s) => s.date < context.date && s.exerciseLog?.[exercise.id])
      .at(-1);
    const prescribed = prior?.plannedItems?.find((e) => e.id === exercise.id);
    if (
      prescribed &&
      prescribed.reps === exercise.reps &&
      prescribed.sets === exercise.sets &&
      exercise.unit === "reps"
    ) {
      const result = strengthDecision(
        exercise,
        prior.exerciseLog[exercise.id].sets || [],
        prior.status,
        readiness,
      );
      if (result.action === "PROPOSE_SMALL_INCREMENT")
        emit(
          result.ruleId,
          "RECOMMENDATION",
          "Consider reviewing the working load",
          result.reason,
          {
            ...common,
            sourceIds: ["general-strength", "product-v1"],
            supportingSessionIds: [prior.sourceSessionId || prior.id],
            interpretation: result,
            proposal: {
              description:
                "Choose the smallest practical increase only after reviewing the current setup. No numeric increment is invented.",
              targetId: o.id,
              kind: "edit-target",
              metric: "load",
            },
          },
        );
    }
    const path = exercisePath(
      exercise,
      history,
      readiness,
      context.equipment?.availableToday || context.equipment?.owned || [],
      context.date || "",
      true,
    );
    if (path.ready && path.next)
      emit(
        "exercise-path.review.v1",
        "RECOMMENDATION",
        "Consider reviewing the next exercise variation",
        path.reason,
        {
          ...common,
          sourceIds: path.sourceIds,
          interpretation: path,
          proposal: {
            description: `Review ${path.next.name}. Establish its own working load; previous loads do not transfer.`,
            targetId: o.id,
            kind: "replace",
            definitionId: path.next.id,
          },
        },
      );
  }
  // Run the existing block evaluator only on explicitly provided curated provenance.
  // Its returned changed workout is inspected, never adopted as the user's workout.
  if (context.rehabWorkout) {
    const result = progressRehabBlocks(clone(context.rehabWorkout), {
      sessions: history,
      readiness,
      assessment: context.assessment,
      date: context.date,
      today: context.date,
    });
    for (const decision of result.blockProgression || [])
      if (["ADVANCE", "REGRESS"].includes(decision.action)) {
        const candidates = intent.occurrences.filter(
          (o) => o.exerciseDefinitionId === decision.fromId,
        );
        const matched = candidates.filter(
          (o) => valueOf(o.block) === decision.block,
        );
        const o =
          matched.length === 1
            ? matched[0]
            : candidates.length === 1
              ? candidates[0]
              : null;
        if (o)
          emit(
            "rehab-block.review.v1",
            "RECOMMENDATION",
            "Consider reviewing this rehab block",
            decision.reason,
            {
              occurrenceId: o.id,
              sourceIds: decision.sourceIds,
              interpretation: decision,
              proposal: {
                description: decision.prescription,
                targetId: o.id,
                kind: decision.toId !== decision.fromId ? "replace" : "review",
                ...(decision.toId !== decision.fromId
                  ? { definitionId: decision.toId }
                  : {}),
              },
            },
          );
      }
  }
  if (subject.planning) {
    const planned = (context.plannedWorkouts || []).filter(p=>p.date <= subject.date).flatMap(p=>{
      const domain = p.snapshot.categories.map(c=>domains[c]).find(Boolean) || p.snapshot.occurrences.flatMap(occurrenceDomains)[0]?.domain;
      return domain ? [{id:p.id,date:p.date,domain}] : [];
    });
    const selected = intent.categories.map(c=>domains[c]).find(Boolean) || intent.occurrences.flatMap(occurrenceDomains)[0]?.domain;
    if(selected && planned.length) {
      const decision = exposureScheduling(selected,planned,subject.date,true,false,'',subject.date);
      if(!decision.allowed) emit('schedule.high-low.planned.v1','CAUTION','Review planned impact spacing', 'Planned work only, not completed exposure: '+decision.reason,{sourceIds:['product-v1'],interpretation:decision,relatedPlanIds:planned.map(p=>p.id)});
    }
  }
  return prioritize(findings);
}
