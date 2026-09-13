import { MovementProgress } from "../components/MovementProgress";
import { SectionSwitch } from "../components/SectionSwitch";
import {
  TrainingOverview,
  StrengthHistory,
} from "../components/TrainingOverview";
import { useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { AssessmentProgress } from "../components/AssessmentProgress";
import { CATALOG, PROGRESSION_DOMAINS } from "../data/catalog.js";
import { CLINICAL_COPY } from "../data/evidence.js";
import {
  exposureDecision,
  supportingTargets,
  strengthDecision,
  exposureScheduling,
} from "../rules/progression.js";
import { exposureContent } from "../data/exposures.js";
import { dayKey } from "../data/provisionalWeek.js";
import type { Assessment, Session, Values } from "../types";
import { History } from "./History";

export function ProgressScreen({
  onMovement,
  assessment,
  assessments,
  checkpoints,
  sessions,
  readiness,
  onStart,
  onTests,
  isLoadingDay,
  retest,
}: {
  onMovement: (date: string) => void;
  assessment?: Assessment;
  assessments: Assessment[];
  checkpoints: Values;
  sessions: Session[];
  readiness: string;
  onStart: (domain: string) => void;
  onTests: () => void;
  isLoadingDay: boolean;
  retest: boolean;
}) {
  const [view, setView] = useState("overview");
  const values = assessment?.values || {},
    targets = supportingTargets(values, checkpoints);
  return (
    <>
      <div className="screen-heading">
        <h1>Progress</h1>
        <p>A structured path back to the game.</p>
      </div>
      <SectionSwitch
        label="Progress views"
        value={view}
        onChange={setView}
        options={[
          ["overview", "Overview"],
          ["strength", "Strength"],
          ["baseline", "Rehab"],
          ["sport", "Sport"],
          ["movement", "Movement"],
        ]}
      />
      {view === "overview" && (
        <TrainingOverview sessions={sessions} onView={setView} />
      )}
      {view === "movement" && <MovementProgress onOpen={onMovement} sessions={sessions} />}
      {view === "baseline" && <AssessmentProgress assessments={assessments} />}
      {!assessment && (
        <Card>
          <h2>Start with your baseline</h2>
          <p>Running, jumping and sport gates use your measured capacities.</p>
          <PrimaryButton onClick={onTests}>View Tests</PrimaryButton>
        </Card>
      )}
      {view === "sport" &&
        PROGRESSION_DOMAINS.filter(
          (d) => d.id !== "soccer" || values.soccerEnabled === "yes",
        ).map((domain) => {
          const decision = exposureDecision(
              domain.id,
              values,
              checkpoints,
              sessions,
              readiness,
            ),
            content = exposureContent(domain.id, decision.level),
            schedule = exposureScheduling(
              domain.id,
              sessions,
              dayKey(),
              isLoadingDay,
              retest,
              assessment?.completedAt,
            ),
            history = sessions.filter((s) => s.domain === domain.id);
          return (
            <Card key={domain.id}>
              <div className="section-heading">
                <h2>{domain.title}</h2>
                <span className="pill">{decision.level}</span>
              </div>
              <h3>
                {decision.level === "B8"
                  ? CLINICAL_COPY.candidate
                  : decision.title}
              </h3>
              <p>
                {decision.action === "LOCKED" ? "Still needed: " : ""}
                {decision.reason}
              </p>
              {decision.allowed && !schedule.allowed && (
                <p className="helper">{schedule.reason}</p>
              )}
              <p className="exercise-prescription">{decision.dose}</p>
              {content.missingDemos.length > 0 && (
                <p className="helper">
                  Demo verification needed: {content.missingDemos.join(", ")}.
                  This exposure remains locked.
                </p>
              )}
              <PrimaryButton
                disabled={
                  !assessment ||
                  !decision.allowed ||
                  !schedule.allowed ||
                  content.missingDemos.length > 0
                }
                onClick={() => onStart(domain.id)}
              >
                Open {decision.level} exposure
              </PrimaryButton>
              <details>
                <summary>Full ladder & requirements</summary>
                <ol className="ladder-list">
                  {domain.levels.map((level) => (
                    <li
                      key={level.id}
                      className={level.id === decision.level ? "current" : ""}
                    >
                      <strong>{level.id}</strong>
                      <span>{level.dose}</span>
                      <small>
                        {history.some(
                          (s) =>
                            s.exposureLevel === level.id &&
                            s.status === "TOLERATED",
                        )
                          ? "Tolerated exposure recorded"
                          : level.id === decision.level
                            ? "Current decision"
                            : "Criteria and prior exposure required"}
                      </small>
                    </li>
                  ))}
                </ol>
                <p>
                  {domain.id === "running"
                    ? CLINICAL_COPY.runningNote
                    : CLINICAL_COPY.targetNote}
                </p>
                <small>
                  Rule {decision.ruleId} · v{decision.rulesetVersion}
                </small>
              </details>
              {history.length > 0 && (
                <details>
                  <summary>{history.length} recorded exposures</summary>
                  <History sessions={history} />
                </details>
              )}
            </Card>
          );
        })}
      {view === "strength" && (
        <>
          <StrengthHistory sessions={sessions} />
          <Card>
            <h2>Strength progression</h2>
            <p>
              Small load increases are proposed only after completed targets,
              good quality and next-morning tolerance.
            </p>
            {Array.from(
              new Map(
                [
                  ...Object.values(CATALOG),
                  ...sessions.flatMap((s) => s.plannedItems || []),
                ].map((ex) => [ex.id, ex]),
              ).values(),
            )
              .filter((ex) => sessions.some((s) => s.exerciseLog?.[ex.id]))
              .map((ex) => {
                const latest = [...sessions]
                  .filter((s) => s.exerciseLog?.[ex.id])
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                const decision = strengthDecision(
                  latest.plannedItems?.find((e) => e.id === ex.id) || ex,
                  latest.exerciseLog[ex.id].sets,
                  latest.status,
                  readiness,
                );
                return (
                  <details key={ex.id}>
                    <summary>
                      {ex.name} ·{" "}
                      {decision.action === "HOLD"
                        ? "Hold"
                        : "Small increase eligible"}
                    </summary>
                    <p>{decision.reason}</p>
                    <small>{decision.ruleId}</small>
                  </details>
                );
              })}
          </Card>
        </>
      )}
      {view === "baseline" && (
        <Card>
          <details>
            <summary>Advanced metrics & evidence</summary>
            <dl className="metrics-grid">
              {Object.entries(targets).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>{value === null ? "Not measured" : `${value}%`}</dd>
                </div>
              ))}
            </dl>
            <p>{CLINICAL_COPY.targetNote}</p>
            <p>
              Compare strength loads only with matched setup, repetitions, range
              and effort. Heel-rise repetitions, height and work are separate
              measures.
            </p>
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11379499/"
              target="_blank"
              rel="noreferrer"
            >
              Rehabilitation and return-to-sport source ↗
            </a>
          </details>
        </Card>
      )}
    </>
  );
}
