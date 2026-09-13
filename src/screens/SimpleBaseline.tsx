import { useRef, useState, type ComponentProps } from "react";
import { BaselineWizard as DetailedBaseline, DataField } from "./Baseline";
import { Card, PrimaryButton } from "../components/ui";
import {
  BASELINE_SECTIONS,
  BASELINE_DEMOS,
  sectionBlocked,
  validateSection,
} from "../data/baseline.js";
import {
  SIMPLE_SAFETY,
  SIMPLE_FUNCTION,
  SIMPLE_TESTS,
  SIMPLE_SCHEDULE,
  validateSimpleBaseline,
} from "../data/simpleBaseline.js";
import { freshBaseline, localDate } from "../data/assessmentHistory.js";
import { saveBaselineDraft } from "../persistence/repository";
import type { Values } from "../types";

type Props = ComponentProps<typeof DetailedBaseline>;
export function BaselineWizard(props: Props) {
  const [detailed, setDetailed] = useState(
    props.draft?.values.baselineMode === "detailed" ||
      (!!props.draft?.step && props.draft?.values.baselineMode !== "simple"),
  );
  const [values, setValues] = useState<Values>({
    ...freshBaseline(props.previous?.values),
    ...(props.draft?.values || {}),
  });
  const [step, setStep] = useState(
    Math.min(3, Math.max(0, Number(props.draft?.values.simpleStep) || 0)),
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const queue = useRef(Promise.resolve());
  const current = useRef(values);
  function persist(next: Values, index = step) {
    next = { ...next, baselineMode: "simple", simpleStep: String(index) };
    current.current = next;
    setValues(next);
    setSaved("Saving…");
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveBaselineDraft(next, 0))
      .then(() => {
        setSaved("Saved on this device");
      });
    void queue.current.catch((e) => setError(String(e)));
  }
  function change(id: string, value: string | string[]) {
    persist({ ...current.current, [id]: value });
  }
  async function leave() {
    try {
      await queue.current;
      props.onBack();
    } catch (e) {
      setError(String(e));
    }
  }
  async function next() {
    const errors =
      step === 0
        ? validateSection(SIMPLE_SAFETY, values)
        : step === 1
          ? validateSection(SIMPLE_FUNCTION, values)
          : step === 3
            ? validateSimpleBaseline(values)
            : SIMPLE_TESTS.flatMap((s) => validateSection(s, values));
    if (errors.length) {
      setError(`Please check: ${errors.join(", ")}`);
      return;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(String(values.assessmentDate)) ||
      String(values.assessmentDate) > localDate() ||
      !/^\d{4}-\d{2}$/.test(String(values.assessmentMonth)) ||
      !["start", "finish"].includes(String(values.assessmentSlot))
    ) {
      setStep(0);
      setError(
        "Check the assessment date and monthly starting/finishing choice.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await queue.current;
      if (step === 3)
        await props.onComplete({ ...values, baselineMode: "simple" });
      else {
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
  const fields = (list: typeof SIMPLE_SAFETY.fields) =>
    list.map((field) => (
      <DataField
        key={field.id}
        field={field}
        values={values}
        onChange={change}
      />
    ));
  const test = (section: typeof SIMPLE_SAFETY, compact = false) => {
    const source = BASELINE_SECTIONS.find((s) => s.id === section.id)!;
    const block = sectionBlocked(source, values);
    const testFields = compact ? source.fields : section.fields;
    const recorded = testFields.some(
      (f) => values[f.id] !== undefined && values[f.id] !== "",
    );
    const extra = source.fields.filter(
      (f) => !section.fields.some((x) => x.id === f.id),
    );
    const demos =
      section.id === "strength"
        ? BASELINE_DEMOS.strength.filter((d) => d.name === section.title)
        : BASELINE_DEMOS[section.id as keyof typeof BASELINE_DEMOS] || [];
    return (
      <details key={section.id + section.title} className="assessment-test">
        <summary>
          {section.title} · {recorded ? "Data entered" : "Not tested"}
        </summary>
        <p>{source.instructions}</p>
        {block && (
          <p className="notice">
            {block} Record only results already obtained safely, or leave this
            test blank.
          </p>
        )}
        {demos.map((demo) => (
          <a
            className="demo-link"
            key={demo.id}
            href={demo.videoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Short Demo · {demo.name} ↗
          </a>
        ))}
        {fields(section.fields.map((f) => ({ ...f, required: false })))}
        {compact && extra.length > 0 && (
          <details>
            <summary>More measurements (optional)</summary>
            {fields(extra)}
          </details>
        )}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            const nextValues = { ...current.current };
            testFields.forEach((f) => {
              delete nextValues[f.id];
            });
            persist(nextValues);
          }}
        >
          Mark not tested / clear this test
        </button>
      </details>
    );
  };
  if (detailed)
    return (
      <DetailedBaseline
        {...props}
        draft={{
          id: "draft",
          updatedAt: "",
          step:
            props.draft?.values.baselineMode === "simple"
              ? 0
              : props.draft?.step || 0,
          values: { ...values, baselineMode: "detailed" },
        }}
      />
    );
  return (
    <>
      <button className="text-button page-back" onClick={leave}>
        Save & exit
      </button>
      <div className="screen-heading">
        <h1>{props.previous ? "Monthly check-in" : "Your baseline"}</h1>
        <p>
          Step {step + 1} of 4 ·{" "}
          {
            ["Safety", "Daily movement", "Optional tests", "Save baseline"][
              step
            ]
          }
        </p>
      </div>
      <progress aria-label="Assessment progress" value={step + 1} max={4} />
      {step === 0 && (
        <>
          <Card>
            <h2>Monthly baseline</h2>
            <p>
              A short check-in and optional tests. Save a starting and finishing
              snapshot each month.
            </p>
            <DataField
              field={{
                id: "assessmentSlot",
                label: "Assessment point",
                type: "select",
                options: [
                  ["start", "Monthly starting data"],
                  ["finish", "Monthly finishing data"],
                ],
              }}
              values={values}
              onChange={change}
            />
            <details>
              <summary>Date & personal details</summary>
              <DataField
                field={{
                  id: "assessmentDate",
                  label: "Measurement date",
                  type: "date",
                }}
                values={values}
                onChange={change}
              />
              <DataField
                field={{
                  id: "assessmentMonth",
                  label: "Comparison month",
                  type: "month",
                }}
                values={values}
                onChange={change}
              />
              {fields(
                SIMPLE_SAFETY.fields.filter((f) =>
                  ["surgeryDate", "ptEndDate"].includes(f.id),
                ),
              )}
            </details>
          </Card>
          <Card>
            <h2>How is your Achilles today?</h2>
            <p>{SIMPLE_SAFETY.instructions}</p>
            {fields(
              SIMPLE_SAFETY.fields.filter(
                (f) =>
                  ![
                    "surgeryDate",
                    "ptEndDate",
                    "restrictions",
                    "complicationNotes",
                    "stiffnessMinutes",
                  ].includes(f.id),
              ),
            )}
            <details>
              <summary>Notes & stiffness duration (optional)</summary>
              {fields(
                SIMPLE_SAFETY.fields.filter((f) =>
                  [
                    "restrictions",
                    "complicationNotes",
                    "stiffnessMinutes",
                  ].includes(f.id),
                ),
              )}
            </details>
          </Card>
        </>
      )}
      {step === 1 && (
        <Card>
          <h2>Everyday movement</h2>
          <p>
            Answer from your current experience. You do not need to try a new
            activity.
          </p>
          {fields(SIMPLE_FUNCTION.fields)}
        </Card>
      )}
      {step === 2 && (
        <Card>
          <h2>Record only what you tested</h2>
          <p>
            Open a test to enter results. Leave the others as “Not tested.”
            Blank is different from a measured zero.
          </p>
          {SIMPLE_TESTS.map((s) => test(s, true))}
        </Card>
      )}
      {step === 3 && (
        <>
          <Card>
            <h2>Ready to save</h2>
            <p>
              Your results will appear in Progress. Missing tests stay
              unmeasured; they do not count as failed or passed.
            </p>
            {fields(SIMPLE_SCHEDULE.fields)}
            <ul>
              {SIMPLE_TESTS.map((s) => (
                <li key={s.id}>
                  {s.title}:{" "}
                  {s.fields.some(
                    (f) => values[f.id] !== undefined && values[f.id] !== "",
                  )
                    ? "Data entered"
                    : "Not tested"}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <details>
              <summary>Add other measurements (optional)</summary>
              <p>
                Only record tests you have performed safely. These are not
                required to save.
              </p>
              {BASELINE_SECTIONS.filter((s) =>
                ["mobility", "soleus", "straight"].includes(s.id),
              ).map((s) => test(s))}
              {BASELINE_SECTIONS.filter((s) => s.id === "strength").map((s) => (
                <div key={s.id}>
                  {["belt", "rdl", "step", "bridge"].map((prefix, index) =>
                    test({
                      ...s,
                      id: s.id,
                      title: BASELINE_DEMOS.strength[index].name,
                      fields: s.fields.filter((f) =>
                        f.id.startsWith(prefix + "_"),
                      ),
                    }),
                  )}
                </div>
              ))}
            </details>
          </Card>
        </>
      )}
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
            : step === 3
              ? "Save baseline"
              : step === 2
                ? "Continue with recorded tests"
                : "Continue"}
        </PrimaryButton>
      </div>
      <p className="helper" role="status">
        {saved || "Your progress saves automatically. Tests are optional."}
      </p>
      <button
        className="text-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await queue.current;
            await saveBaselineDraft({ ...values, baselineMode: "detailed" }, 0);
            setDetailed(true);
          } catch (e) {
            setError(String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Open detailed assessment
      </button>
    </>
  );
}
