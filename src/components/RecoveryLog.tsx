import { useEffect, useState } from "react";
import { Card, PrimaryButton } from "./ui";
import { get, put } from "../db.js";
import { CATALOG } from "../data/catalog.js";

const mobility = [
  CATALOG.mobility,
  {
    id: "seated-thoracic",
    name: "Seated thoracic mobility",
    videoUrl:
      "https://library.theprehabguys.com/vimeo-video/seated-mobility-drill-for-your-thoracic-spine/",
  },
  CATALOG.seatedCore,
  CATALOG.pallof,
];
export function RecoveryLog({
  date,
  blocked = false,
}: {
  date: string;
  blocked?: boolean;
}) {
  const [activity, setActivity] = useState("walk-5000");
  const [distance, setDistance] = useState("");
  const [unit, setUnit] = useState("miles");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    get("settings", "recovery-" + date)
      .then((r: any) => {
        if (active) setRows(r?.entries || []);
      })
      .catch(() => setMessage("Could not load recovery history."));
    return () => {
      active = false;
    };
  }, [date]);
  async function save() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (
        distance !== "" &&
        (!Number.isFinite(Number(distance)) || Number(distance) < 0)
      )
        throw new Error("Distance must be zero or positive.");
      if (activity === "mobility" && !selected.length)
        throw new Error("Select at least one mobility or core activity.");
      const stored: any = await get("settings", "recovery-" + date);
      const entries = [
        ...(stored?.entries || []),
        {
          id: crypto.randomUUID(),
          activity,
          distance: activity.startsWith("cycle-") ? distance : "",
          unit,
          mobility: activity === "mobility" ? selected : [],
          notes,
          createdAt: new Date().toISOString(),
        },
      ];
      await put("settings", { id: "recovery-" + date, date, entries });
      setRows(entries);
      setMessage("Recovery activity saved on this device.");
    } catch (e) {
      setMessage(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <h2>Recovery & mobility log</h2>
      <p className="helper">
        Record what you actually did. These are logging choices, not daily
        targets or permission to exercise through symptoms.
      </p>
      {blocked && (
        <p className="notice">
          Safety hold: record past activity only. Follow your current safety
          guidance.
        </p>
      )}
      <label className="form-field">
        Activity
        <select
          aria-label="Recovery activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        >
          {[5000, 8000, 10000].map((steps) => (
            <option key={steps} value={"walk-" + steps}>
              Walked {steps.toLocaleString()} steps
            </option>
          ))}
          {[10, 15, 20, 25, 30].map((minutes) => (
            <option key={minutes} value={"cycle-" + minutes}>
              Indoor cycled {minutes} minutes
            </option>
          ))}
          <option value="mobility">Mobility / core</option>
          <option value="other">Other recovery activity</option>
        </select>
      </label>
      {activity.startsWith("cycle") && (
        <>
          <label className="form-field">
            Cycling distance (optional)
            <input
              aria-label="Cycling distance"
              type="number"
              min="0"
              step="any"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </label>
          <label className="form-field">
            Distance unit
            <select
              aria-label="Distance unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option>miles</option>
              <option>km</option>
            </select>
          </label>
        </>
      )}
      <details open={activity === "mobility"}>
        <summary>Mobility and seated / standing core activities</summary>
        {mobility.map((ex) => (
          <div key={ex.id}>
            <label className="check-grid">
              <input
                type="checkbox"
                checked={selected.includes(ex.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, ex.id]
                      : selected.filter((id) => id !== ex.id),
                  )
                }
              />
              {ex.name}
            </label>
            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer">
              Short Demo ↗
            </a>
          </div>
        ))}
      </details>
      <label className="form-field">
        Activity details / symptoms
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <PrimaryButton disabled={busy} onClick={save}>
        Save recovery activity
      </PrimaryButton>
      <p role="status">{message}</p>
      {rows.length > 0 && (
        <details>
          <summary>Recorded activities ({rows.length})</summary>
          {rows.map((row) => (
            <p key={row.id}>
              {row.activity
                .replace("walk-", "Walked steps: ")
                .replace("cycle-", "Indoor cycling minutes: ")}{" "}
              {row.distance && `· ${row.distance} ${row.unit}`}{" "}
              {row.mobility
                ?.map((id: string) => mobility.find((ex) => ex.id === id)?.name)
                .join(", ")}{" "}
              {row.notes && `· ${row.notes}`}
            </p>
          ))}
        </details>
      )}
    </Card>
  );
}
