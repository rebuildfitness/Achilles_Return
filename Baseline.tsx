import { useRef, useState } from "react";
import {
  BASELINE_SECTIONS,
  BASELINE_DEMOS,
  sectionBlocked,
  validateSection,
} from "../data/baseline.js";
import { baselineResult } from "../rules/baseline.js";
import { saveBaselineDraft } from "../persistence/repository";
import { Card, PrimaryButton, StatusCard } from "../components/ui";
import type { Assessment, Values } from "../types";

type Field = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[][];
};
export function DataField({
  field,
  values,
  onChange,
}: {
  field: Field;
  values: Values;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const id = `field-${field.id}`,
    value = values[field.id] || "";
  if (field.type === "checks")
    return (
      <fieldset className="question">
        <legend>
          {field.label}
          {field.required ? " *" : ""}
        </legend>
        <div className="check-grid">
          {field.options?.map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(key)}
                onChange={(e) =>
                  onChange(
                    field.id,
                    e.target.checked
                      ? [...(Array.isArray(value) ? value : []), key]
                      : (Array.isArray(value) ? value : []).filter(
                          (v) => v !== key,
                        ),
                  )
                }
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.type === "select" ? (
        <select
          id={id}
          value={String(value)}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">Choose…</option>
          {field.options?.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          min={field.min}
          max={field.max}
          step={field.type === "number" ? "any" : undefined}
          value={String(value)}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}
    </div>
  );
}
export function BaselineWizard({
  draft,
  previous,
  onComplete,
  onBack,
}: {
  draft?: Assessment;
  previous?: Assessment;
  onComplete: (values: Values) => Promise<void>;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Values>(
    Object.keys(draft?.values || {}).length
      ? draft!.values
      : {
          ...previous?.values,
          clearance: "",
          noRestrictions: "",
          surgeryDate: previous?.values.surgeryDate || "2026-01-07",
          ptEndDate: previous?.values.ptEndDate || "2026-06",
        },
  );
  const [step, setStep] = useState(draft?.step || 0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState("");
  const queue = useRef(Promise.resolve()),
    section = BASELINE_SECTIONS[step],
    blocked = sectionBlocked(section, values);
  function persist(next: Values, index: number) {
    setSaved("Saving…");
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        await saveBaselineDraft(next, index);
        setSaved("Draft saved on this device");
      })
      .catch((e) => {
        setError(String(e));
        throw e;
      });
    void queue.current.catch(() => {});
  }
  function change(id: string, value: string | string[]) {
    const next = { ...values, [id]: value };
    setValues(next);
    persist(next, step);
  }
  async function next() {
    const errors = validateSection(section, values);
    if (errors.length) {
      setError(`Complete or correct: ${errors.join(", ")}`);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await queue.current;
      if (step === BASELINE_SECTIONS.length - 1) {
        const invalid = BASELINE_SECTIONS.findIndex(
          (s) => validateSection(s, values).length > 0,
        );
        if (invalid >= 0) {
          setStep(invalid);
          setError("Complete the required answers in this section.");
          return;
        }
        await onComplete(values);
      } else {
        setStep(step + 1);
        persist(values, step + 1);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="text-button page-back"
        onClick={async () => {
          try {
            await queue.current;
            onBack();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        Save & exit
      </button>
      <div className="screen-heading">
        <h1>{previous ? "Reassessment" : "Your Baseline"}</h1>
        <p>
          Step {step + 1} of {BASELINE_SECTIONS.length} · {section.title}
        </p>
      </div>
      <progress
        aria-label="Assessment progress"
        value={step + 1}
        max={BASELINE_SECTIONS.length}
      />
      <Card>
        <h2>{section.title}</h2>
        <p>{section.instructions}</p>
        {(BASELINE_DEMOS[section.id as keyof typeof BASELINE_DEMOS] || []).map(
          (demo) => (
            <a
              key={demo.id}
              className="demo-link"
              href={demo.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Short Demo · {demo.name} ↗
            </a>
          ),
        )}
        {BASELINE_DEMOS[section.id as keyof typeof BASELINE_DEMOS] && (
          <p className="muted">
            Technique reference only. Follow the assessment instructions above
            for load, cadence and stopping criteria.
          </p>
        )}
        {blocked ? (
          <p className="notice" role="status">
            {blocked} This section is skipped; missing results will not be
            treated as passed.
          </p>
        ) : (
          <div className="assessment-fields">
            {section.fields.map((field) => (
              <DataField
                key={field.id}
                field={field as Field}
                values={values}
                onChange={change}
              />
            ))}
          </div>
        )}
      </Card>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="button-row">
        {step > 0 && (
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => {
              setStep(step - 1);
              persist(values, step - 1);
              setError("");
              window.scrollTo(0, 0);
            }}
          >
            Back
          </button>
        )}
        <PrimaryButton disabled={busy} onClick={next}>
          {busy
            ? "Saving…"
            : step === BASELINE_SECTIONS.length - 1
              ? "Finish assessment"
              : "Continue"}
        </PrimaryButton>
      </div>
      <p className="helper" role="status">
        {saved ||
          "Required answers marked *. Unperformed measurements stay blank."}
      </p>
    </>
  );
}
export function AssessmentResult({ assessment }: { assessment: Assessment }) {
  const result = baselineResult(assessment.values);
  return (
    <>
      <StatusCard
        tone={result.phase === "Safety Hold" ? "stop" : "neutral"}
        title={result.phase}
      >
        {result.reason}
      </StatusCard>
      <Card>
        <h2>Running Readiness</h2>
        <p>
          {result.criteria.filter((c) => c.passed).length} / 7 entry criteria
          met
        </p>
        <ul className="criteria-list">
          {result.criteria.map((c) => (
            <li key={c.id}>
              <span className={c.passed ? "success-text" : "muted"}>
                {c.passed ? "✓" : "○"}
              </span>
              {c.label}
            </li>
          ))}
        </ul>
        <p className="helper">
          Expert consensus criteria; not a prospectively validated clearance
          rule.
        </p>
      </Card>
      <Card>
        <h2>What to build next</h2>
        {result.limiters.length ? (
          <ul>
            {result.limiters.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : (
          <p>
            Build repeatable tolerance at the first eligible exposure. Other
            domains retain their own gates.
          </p>
        )}
        <details>
          <summary>Measured strengths & calculations</summary>
          <ul>
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p>
            Heel-rise reps: {result.metrics.repLSI ?? "Not measured"}
            {result.metrics.repLSI !== null ? "% LSI" : ""}
          </p>
          <p>
            Heel-rise height: {result.metrics.heightLSI ?? "Not measured"}
            {result.metrics.heightLSI !== null ? "% LSI" : ""}
          </p>
          <p>
            Heel-rise work: {result.metrics.workLSI ?? "Not measured"}
            {result.metrics.workLSI !== null ? "% LSI" : ""}
          </p>
          <p className="helper">
            Work proxy = repetitions × average heel height. A missing height
            never becomes a made-up work score.
          </p>
        </details>
      </Card>
    </>
  );
}
