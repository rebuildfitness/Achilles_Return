import { displayDate } from "../data/displayDates.js";
import { useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { DataField } from "./Baseline";
import type { Session, Values } from "../types";

export function ResponseScreen({
  session,
  continueToCheckIn = false,
  onCheckInFirst,
  onSave,
  onBack,
}: {
  session: Session;
  continueToCheckIn?: boolean;
  onCheckInFirst?: () => void;
  onSave: (v: Values) => Promise<void>;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Values>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <button className="text-button page-back" onClick={onBack}>
        ← Today
      </button>
      <div className="screen-heading">
        {continueToCheckIn && <p className="eyebrow">Step 1 of 2 · Previous workout</p>}
        <h1>Next-morning response</h1>
        <p>
          {session.workoutTitle || session.workoutId} · {displayDate(session.date)}
        </p>
      </div>
      {continueToCheckIn && onCheckInFirst && <button className="text-button" onClick={onCheckInFirst}>Check today’s symptoms first</button>}
      <Card>
        <p>
          Compare with your usual baseline. This response determines tolerance
          of this specific session. {continueToCheckIn && "Next, confirm how you feel today. These are saved separately; answers are not copied automatically."}
        </p>
        {[
          {
            id: "change",
            label: "Pain, stiffness, swelling or soreness change",
            type: "select",
            options: [
              ["baseline", "Back to usual baseline"],
              ["meaningful", "Meaningful increase"],
              ["substantial", "Large deterioration"],
              ["medical", "Concerning acute symptoms"],
            ],
          },
          {
            id: "functionChange",
            label: "Walking or daily function worse?",
            type: "select",
            options: [
              ["no", "No"],
              ["yes", "Yes"],
            ],
          },
          {
            id: "repeatedWorsening",
            label: "Repeated worsening over multiple sessions?",
            type: "select",
            options: [
              ["no", "No"],
              ["yes", "Yes"],
            ],
          },
          {
            id: "redFlags",
            label: "Any red flags?",
            type: "checks",
            options: [
              ["sharp-pain", "Sharp pain"],
              ["new-bruising", "New bruising"],
              ["major-swelling", "Major swelling"],
              ["sudden-weakness", "Sudden weakness"],
              ["new-limp", "New limp"],
            ],
          },
          { id: "notes", label: "Notes", type: "text" },
        ].map((f) => (
          <DataField
            key={f.id}
            field={f}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
        ))}
        {error && <p role="alert">{error}</p>}
        <PrimaryButton
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(values);
            } catch (e) {
              setError(String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save next-morning response"}
        </PrimaryButton>
      </Card>
    </>
  );
}
