import { displayDate } from "../data/displayDates.js";
import { useState } from "react";
import { Card } from "./ui";
import type { Assessment } from "../types";
import {
  TREND_METRICS,
  trendValue,
  monthlyPair,
  assessmentDate,
  assessmentMonth,
  localDate,
} from "../data/assessmentHistory.js";

export function AssessmentProgress({
  assessments,
}: {
  assessments: Assessment[];
}) {
  const [selected, setSelected] = useState("heelReps");
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const definition = TREND_METRICS.find((m) => m.id === selected)!;
  const records = [...assessments].sort(
    (a, b) =>
      assessmentDate(a).localeCompare(assessmentDate(b)) ||
      String(a.completedAt).localeCompare(String(b.completedAt)),
  );
  const months = [
    ...new Set([localDate().slice(0, 7), ...records.map(assessmentMonth)]),
  ]
    .sort()
    .reverse();
  const labels = definition.series || ["Repaired", "Uninvolved"];
  const pair = monthlyPair(assessments, month);
  const series = definition.keys.map((_, side) =>
    records.map((a) => trendValue(a, definition, side)),
  );
  const max = Math.max(
    1,
    ...series.flat().filter((n): n is number => n !== null),
  );
  const x = (i: number) =>
    45 +
    (records.length === 1 ? 140 : (i * 280) / Math.max(1, records.length - 1));
  const y = (n: number) => 160 - (n / max) * 125;
  const show = (n: number | null) =>
    n === null ? "Not recorded" : `${n} ${definition.unit}`;
  return (
    <Card className="assessment-progress">
      <h2>Baseline progress</h2>
      <p>
        Monthly starting and finishing measurements, with your full retest
        history.
      </p>
      <label htmlFor="trend-metric">Measurement</label>
      <select
        id="trend-metric"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {TREND_METRICS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <label htmlFor="trend-month">Comparison month</label>
      <select
        id="trend-month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      >
        {months.map((m) => (
          <option key={m} value={m}>{displayDate(m,true)}</option>
        ))}
      </select>
      <div className="assessment-table">
        <table>
          <caption>
            {definition.label} · {displayDate(month,true)}
          </caption>
          <thead>
            <tr>
              <th>Series</th>
              <th>Starting</th>
              <th>Finishing</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {definition.keys.map((_, side) => {
              const start = trendValue(pair.start, definition, side),
                end = trendValue(pair.finish, definition, side);
              return (
                <tr key={side}>
                  <th>{labels[side]}</th>
                  <td>{show(start)}</td>
                  <td>{show(end)}</td>
                  <td>
                    {start === null || end === null
                      ? "Not recorded"
                      : `${end - start > 0 ? "+" : ""}${Math.round((end - start) * 100) / 100} ${definition.unit}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!records.length ? (
        <p>No measurements yet. Save your starting baseline in Tests.</p>
      ) : (
        <>
          <div className="metric-summary">{definition.keys.map((_,side)=>{const values=records.map(a=>({value:trendValue(a,definition,side),date:assessmentDate(a)})).filter(x=>x.value!==null); const latest=values.at(-1); return <div key={side}><span>{labels[side]}</span><strong>{show(latest?.value ?? null)}</strong><small>{latest ? displayDate(latest.date) : 'No measurements yet'}</small></div>;})}</div>
          <svg
            className="assessment-chart"
            viewBox="0 0 360 210"
            role="img"
            aria-label={`${definition.label} across ${records.length} assessments. Exact values in the table below.`}
          >
            <line x1="45" y1="35" x2="45" y2="160" stroke="currentColor" />
            <line x1="45" y1="160" x2="330" y2="160" stroke="currentColor" />
            <text x="8" y="40">
              {Math.round(max * 10) / 10}
            </text>
            <text x="22" y="163">
              0
            </text>
            {series.map((points, side) => (
              <g
                key={side}
                className={side === 0 ? "trend-primary" : "trend-secondary"}
              >
                {points.map((value, i) =>
                  value === null ? null : (
                    <g key={i}>
                      {i > 0 && points[i - 1] !== null && (
                        <line
                          x1={x(i - 1)}
                          y1={y(points[i - 1]!)}
                          x2={x(i)}
                          y2={y(value)}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={side ? "5 3" : undefined}
                        />
                      )}
                      <circle cx={x(i)} cy={y(value)} r="4" fill="currentColor">
                        <title>
                          {assessmentDate(records[i])}: {labels[side]}{" "}
                          {show(value)}
                        </title>
                      </circle>
                    </g>
                  ),
                )}
              </g>
            ))}
            <text x="45" y="187">
              {assessmentDate(records[0])}
            </text>
            {records.length > 1 && (
              <text x="330" y="204" textAnchor="end">
                {assessmentDate(records.at(-1))}
              </text>
            )}
          </svg>
          <p className="helper">
            {labels.map((label, i) => (
              <span
                className={i === 0 ? "trend-primary" : "trend-secondary"}
                key={label}
              >
                {i ? " · Dashed: " : "Solid: "}
                {label}
              </span>
            ))}
          </p>
        </>
      )}
      <p className="helper">
        Missing values leave a gap; they are never plotted as zero. Compare
        strength loads alongside repetitions, symptoms and the same
        equipment/setup. A change is not automatic clearance.
      </p>
      <details>
        <summary>All recorded values</summary>
        <div className="assessment-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Point</th>
                {labels.map((l) => (
                  <th key={l}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((a) => (
                <tr key={a.id}>
                  <td>{displayDate(assessmentDate(a))}</td>
                  <td>{String(a.values.assessmentSlot || "Historical")}</td>
                  {definition.keys.map((_, side) => (
                    <td key={side}>{show(trendValue(a, definition, side))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
