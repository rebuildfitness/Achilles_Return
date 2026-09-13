import type { FormEvent } from "react";
import { PrimaryButton } from "../components/ui";
import type { Answers } from "../types";
export function Choice({
  name,
  title,
  options,
  value,
}: {
  name: string;
  title: string;
  options: string[][];
  value?: string;
}) {
  return (
    <fieldset className="question">
      <legend>{title}</legend>
      <div className="options">
        {options.map(([id, label]) => (
          <label key={id}>
            <input
              type="radio"
              name={name}
              value={id}
              defaultChecked={value === id}
              required
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function CheckInScreen({
  initial,
  busy,
  onSubmit,
  onBack,
}: {
  initial?: Answers;
  busy: boolean;
  onSubmit: (answers: Answers) => void;
  onBack: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      pain: String(data.get("pain")),
      stiffness: String(data.get("stiffness")),
      swelling: String(data.get("swelling")),
      previousResponse: String(data.get("previousResponse")),
      recovery: String(data.get("recovery")),
      unusualSymptoms: data.getAll("unusual").map(String),
    });
  }
  return (
    <>
      <button className="text-button page-back" onClick={onBack}>
        ← Today
      </button>
      <div className="screen-heading">
        <h1>Daily Check-In</h1>
        <p>How is your Achilles today?</p>
      </div>
      <form onSubmit={submit}>
        <Choice
          name="pain"
          title="Achilles pain right now?"
          value={initial?.pain}
          options={[
            ["none", "None"],
            ["mild", "Mild"],
            ["moderate", "Moderate"],
            ["significant", "Significant"],
          ]}
        />
        <Choice
          name="stiffness"
          title="Morning stiffness compared with usual?"
          value={initial?.stiffness}
          options={[
            ["normal", "Normal"],
            ["slightly-more", "A little more"],
            ["much-more", "Much more"],
          ]}
        />
        <Choice
          name="swelling"
          title="Extra swelling today?"
          value={initial?.swelling}
          options={[
            ["normal", "No"],
            ["a-little", "A little"],
            ["a-lot", "A lot"],
          ]}
        />
        <Choice
          name="previousResponse"
          title="Response to your last workout?"
          value={initial?.previousResponse}
          options={[
            ["good", "Good"],
            ["somewhat-sore", "A little sore"],
            ["poor", "Poor"],
          ]}
        />
        <Choice
          name="recovery"
          title="How recovered do you feel?"
          value={initial?.recovery}
          options={[
            ["good", "Good"],
            ["okay", "Okay"],
            ["poor", "Poor"],
          ]}
        />
        <fieldset className="question">
          <legend>Anything unusual?</legend>
          {[
            ["sharp-pain", "Sharp pain"],
            ["new-bruising", "New bruising"],
            ["major-swelling", "Major swelling"],
            ["sudden-weakness", "Sudden weakness"],
            ["new-limp", "New limp"],
            [
              "other-concerning",
              "Other concerning symptoms (including a suspected gap or sudden loss of heel raise)",
            ],
          ].map(([value, label]) => (
            <label className="unusual-option" key={value}>
              <input
                type="checkbox"
                name="unusual"
                value={value}
                defaultChecked={initial?.unusualSymptoms.includes(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <PrimaryButton disabled={busy} type="submit">
          {busy ? "Saving…" : "See Today’s Plan"}
        </PrimaryButton>
      </form>
    </>
  );
}
