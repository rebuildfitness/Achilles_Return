import { PrimaryButton } from "./ui";
export function PlannedExposure({ exposure, onStart }: { exposure: any; onStart: (domain: string) => void }) {
  if (!exposure) return null;
  return <section className="planned-exposure" aria-label="Automatically adjusted exposure">
    <span className="pill">{exposure.action === "PROGRESS" ? "Plan advanced" : exposure.action === "REGRESS" ? "Plan reduced" : "Planned progression work"}</span>
    <h3>{exposure.domainTitle} · {exposure.level}</h3>
    <p>{exposure.dose}</p>
    {exposure.conditional && <p className="helper">Provisional until that day's check-in and required responses. Future sessions do not count as completed evidence.</p>}
    <details><summary>Why this dose?</summary><p>{exposure.reason}</p><p className="helper">Research-informed criteria and an approved dose ladder; this is not medical clearance. Your strength and rehab work remain in the plan.</p></details>
    {exposure.canStart && <PrimaryButton onClick={()=>onStart(exposure.domain)}>Open {exposure.domainTitle} session</PrimaryButton>}
  </section>;
}
