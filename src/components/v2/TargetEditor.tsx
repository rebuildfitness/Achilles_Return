import { useState } from "react";
import {
  known,
  blank,
  display,
  targetNumber,
  tempo,
  uid,
} from "../../domain/v2/composition.js";
const labels: Record<string, string> = {
  rpe: "RPE",
  reps: "Reps",
  load: "Load",
  duration: "Duration",
  distance: "Distance",
  rest: "Rest",
  steps: "Steps",
  contacts: "Contacts",
};
const units: Record<string, string[]> = {
  rpe: ["0–10"],
  reps: ["count"],
  load: ["lb", "kg"],
  duration: ["seconds", "minutes"],
  distance: ["m", "km", "yards", "miles"],
  rest: ["seconds", "minutes"],
  steps: ["count"],
  contacts: ["count"],
};
export function Tempo({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const [entry, setEntry] = useState(display(value)),
    [error, setError] = useState("");
  return (
    <label>
      Tempo
      <input
        aria-label="Tempo"
        placeholder="3-1-X-0"
        value={entry}
        onChange={(e) => {
          const v = e.target.value;
          setEntry(v);
          try {
            onChange(v ? tempo(v.split("-")) : blank());
            setError("");
          } catch {
            setError(
              "Use four values, e.g. 3-1-X-0. Incomplete tempo is not saved.",
            );
          }
        }}
      />
      <small>Lower · pause · lift · pause (seconds; X = explosive)</small>
      {error && <span role="alert">{error}</span>}
    </label>
  );
}
export function MetricsEditor({
  target,
  fields,
  onChange,
}: {
  target: any;
  fields: string[];
  onChange: (t: any) => void;
}) {
  return (
    <div className="builder-grid">
      {fields.map((key) => (
        <label key={key}>
          {labels[key]}
          <div className="builder-quantity">
            <input
              aria-label={labels[key]}
              type="number"
              max={key === "rpe" ? 10 : undefined}
              min="0"
              step="any"
              inputMode="decimal"
              value={display(target[key]?.amount)}
              onChange={(e) => {
                if (e.target.validity.valid)
                  onChange({
                    ...target,
                    [key]: targetNumber(
                      e.target.value,
                      display(target[key]?.unit) || units[key][0],
                    ),
                  });
              }}
            />
            <select
              aria-label={`${labels[key]} unit`}
              value={display(target[key]?.unit) || units[key][0]}
              onChange={(e) =>
                onChange({
                  ...target,
                  [key]: {
                    amount: target[key]?.amount || blank(),
                    unit: known(e.target.value),
                  },
                })
              }
            >
              {[
                ...new Set([
                  ...units[key],
                  ...(display(target[key]?.unit)
                    ? [display(target[key].unit)]
                    : []),
                ]),
              ].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </label>
      ))}
      {fields.includes("load") && (
        <label>
          Load convention
          <select
            aria-label="Load convention"
            value={display(target.loadConvention)}
            onChange={(e) =>
              onChange({
                ...target,
                loadConvention: e.target.value
                  ? known(e.target.value)
                  : blank(),
              })
            }
          >
            <option value="">Not specified</option>
            {[
              "per-hand",
              "total-external",
              "bar-included",
              "stack-reading",
              "assistance",
              "bodyweight",
              "device-specific",
              "other",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
export function SetEditor({
  set,
  index,
  count,
  fields,
  interval,
  onPatch,
  onMove,
  onRemove,
  canMove = true,
}: {
  set: any;
  index: number;
  count: number;
  fields: string[];
  interval: boolean;
  onPatch: (p: any) => void;
  onMove: (d: number) => void;
  onRemove: () => void;
  canMove?: boolean;
}) {
  return (
    <fieldset className="builder-set">
      <legend>Set {index + 1}</legend>
      <div className="builder-set-head">
        <label>
          Set type
          <select
            aria-label="Set type"
            value={display(set.type)}
            onChange={(e) =>
              onPatch({
                type: e.target.value ? known(e.target.value) : blank(),
              })
            }
          >
            <option value="">Unspecified</option>
            <option value="warm-up">Warm-up</option>
            <option value="working">Working</option>
            <option value="rehab">Rehab</option>
          </select>
        </label>
        <div className="builder-actions">
          <button
            aria-label={`Move set ${index + 1} up`}
            disabled={!canMove || !index}
            onClick={() => onMove(-1)}
          >
            ↑
          </button>
          <button
            aria-label={`Move set ${index + 1} down`}
            disabled={!canMove || index === count - 1}
            onClick={() => onMove(1)}
          >
            ↓
          </button>
          <button aria-label={`Remove set ${index + 1}`} onClick={onRemove}>
            Remove set
          </button>
        </div>
      </div>
      <MetricsEditor
        target={set.target}
        fields={fields}
        onChange={(target) => onPatch({ target })}
      />
      <details>
        <summary>Rest, side, tempo & notes</summary>
        <MetricsEditor
          target={set.target}
          fields={["rest"]}
          onChange={(target) => onPatch({ target })}
        />
        <div className="builder-grid">
          <label>
            Side
            <select
              aria-label="Side"
              value={display(set.target.side)}
              onChange={(e) =>
                onPatch({
                  target: {
                    ...set.target,
                    side: e.target.value ? known(e.target.value) : blank(),
                  },
                })
              }
            >
              <option value="">Unspecified</option>
              {["bilateral", "left", "right"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {fields.includes("reps") && (
            <Tempo
              value={set.target.tempo}
              onChange={(v) => onPatch({ target: { ...set.target, tempo: v } })}
            />
          )}
          <label>
            Set notes
            <input
              value={display(set.target.notes)}
              onChange={(e) =>
                onPatch({
                  target: { ...set.target, notes: known(e.target.value) },
                })
              }
            />
          </label>
        </div>
      </details>
      {interval && (
        <div className="builder-intervals">
          <label>
            Repeat sequence
            <input
              type="number"
              min="1"
              step="1"
              value={set.repeatCount || 1}
              onChange={(e) => {
                if (e.target.validity.valid && e.target.value)
                  onPatch({ repeatCount: Number(e.target.value) });
              }}
            />
          </label>
          {set.intervals.map((b: any, i: number) => (
            <fieldset key={b.id}>
              <legend>Bout {i + 1}</legend>
              <label>
                Bout type
                <select
                  value={b.kind}
                  onChange={(e) =>
                    onPatch({
                      intervals: set.intervals.map((v: any) =>
                        v.id === b.id ? { ...v, kind: e.target.value } : v,
                      ),
                    })
                  }
                >
                  <option value="work">Work</option>
                  <option value="recovery">Recovery</option>
                </select>
              </label>
              <MetricsEditor
                target={b.target}
                fields={["duration", "distance"]}
                onChange={(target) =>
                  onPatch({
                    intervals: set.intervals.map((v: any) =>
                      v.id === b.id ? { ...v, target } : v,
                    ),
                  })
                }
              />
              <div className="builder-actions">
                <button
                  disabled={!i}
                  aria-label={`Move bout ${i + 1} up`}
                  onClick={() => {
                    const bs = [...set.intervals];
                    [bs[i - 1], bs[i]] = [bs[i], bs[i - 1]];
                    onPatch({
                      intervals: bs.map((v: any, order: number) => ({
                        ...v,
                        order,
                      })),
                    });
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() =>
                    onPatch({
                      intervals: set.intervals
                        .filter((v: any) => v.id !== b.id)
                        .map((v: any, order: number) => ({ ...v, order })),
                    })
                  }
                >
                  Remove bout
                </button>
              </div>
            </fieldset>
          ))}
          <button
            onClick={() =>
              onPatch({
                intervals: [
                  ...set.intervals,
                  {
                    id: uid(),
                    order: set.intervals.length,
                    kind: set.intervals.length % 2 ? "recovery" : "work",
                    target: {},
                  },
                ],
              })
            }
          >
            Add work/recovery bout
          </button>
        </div>
      )}
    </fieldset>
  );
}
