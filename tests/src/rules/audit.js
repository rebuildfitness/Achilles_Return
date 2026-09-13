import { VERSIONS } from "../persistence/schema.js";
// Metadata describes the existing prototype branches, without changing thresholds.
export function readinessAudit(date, answers, decision, id) {
  const safety = decision.level === "RED";
  return {
    id,
    date,
    decisionType: "DAILY_READINESS",
    ruleId: `${safety ? "safety" : "readiness"}.${decision.level.toLowerCase()}`,
    rulesetVersion: VERSIONS.rulesetVersion,
    reasonCodes: [decision.level],
    supportingData: answers,
    decision: decision.level,
    userExplanation: decision.reason,
    action: decision.action,
    evidenceStrength: "Conservative implementation rule",
    evidenceType: "Product/engineering safeguard",
    sourceIds: ["MASTER_PLAN:safety-hierarchy"],
    ruleVersion: VERSIONS.rulesetVersion,
  };
}
