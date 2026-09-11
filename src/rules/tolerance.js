// Extracted from prototype flow. RED overrides a good response per the frozen plan.
export function nextDayStatus(previousResponse, readinessLevel) {
  if (readinessLevel === "RED") return "MEDICAL_FLAG";
  return (
    { good: "TOLERATED", "somewhat-sore": "BORDERLINE", poor: "NOT_TOLERATED" }[
      previousResponse
    ] || "PENDING_NEXT_DAY_RESPONSE"
  );
}
