import { PrimaryButton } from "./ui";
import { exposureContent } from "../data/exposures.js";
export function PlannedExposure({ exposure, onStart }: { exposure: any; onStart: (domain: string) => void }) {
  if (!exposure) return null;
  return <section className="planned-exposure" aria-label="Automatically adjusted exposure">
    <span className="pill">{exposure.action === "PROGRESS" ? "Plan advanced" : exposure.action === "REGRESS" ? "Plan reduced" : "Planned progression work"}</span>
    <h3>{exposure.domainTitle} · {exposure.level}</h3>
    <p>{exposure.dose}</p>
    {((exposure.domain === "running") || exposure.level === "D5") && <details><summary>{exposure.domain === "running" ? "Forward jogging · demo & instructions" : "Crossovers & backward jogging · demo & instructions"}</summary><p>{exposureContent(exposure.domain,exposure.level).note}</p>{exposureContent(exposure.domain,exposure.level).demos.map((d: {name:string;videoUrl:string})=><p key={d.name}><a href={d.videoUrl} target="_blank" rel="noreferrer">Short Demo · {d.name} ↗</a></p>)}</details>}
    {exposure.conditional && <p className="helper">Provisional until that day's check-in and required responses. Future sessions do not count as completed evidence.</p>}
    <details><summary>Why this dose?</summary><p>{exposure.reason}</p><p className="helper">Research-informed criteria and an approved dose ladder; this is not medical clearance. Your strength and rehab work remain in the plan.</p></details>
    {exposure.canStart && <PrimaryButton onClick={()=>onStart(exposure.domain)}>Open {exposure.domainTitle} session</PrimaryButton>}
  </section>;
}
