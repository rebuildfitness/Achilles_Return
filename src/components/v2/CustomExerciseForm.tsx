import { useState } from "react";
import { Card } from "../ui";
import {
  CATEGORY_OPTIONS,
  customDefinition,
} from "../../domain/v2/composition.js";
export const trackingLabels: Record<string, string> = {
  "weighted-reps": "Weighted reps",
  reps: "Reps",
  time: "Time",
  "distance-time": "Distance + time",
  "reps-time": "Reps + time",
  intervals: "Intervals",
  "free-form": "Free-form activity",
};
export function CustomForm({
  onSave,
  onCancel,
}: {
  onSave: (d: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
      name: "",
      categories: [] as string[],
      equipment: "",
      trackingType: "reps",
      notes: "",
      tags: "",
      demoUrl: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Card>
      <h2>Create custom exercise</h2>
      <p>
        User-created. Clinical demand and readiness are unknown; media is
        unverified.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onSave(
              customDefinition({
                ...form,
                equipment: form.equipment
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                tags: form.tags
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }),
            );
          } catch (e) {
            setError(String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Exercise name
          <input
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <fieldset>
          <legend>Categories (choose any)</legend>
          <div className="builder-checks">
            {CATEGORY_OPTIONS.map((c) => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(c)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categories: e.target.checked
                        ? [...form.categories, c]
                        : form.categories.filter((x) => x !== c),
                    })
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="builder-grid">
          <label>
            Equipment (comma separated)
            <input
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            />
          </label>
          <label>
            Tracking type
            <select
              aria-label="Tracking type"
              value={form.trackingType}
              onChange={(e) =>
                setForm({ ...form, trackingType: e.target.value })
              }
            >
              {Object.entries(trackingLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tags (comma separated)
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </label>
          <label>
            Demo URL (optional)
            <input
              type="url"
              value={form.demoUrl}
              onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
            />
          </label>
        </div>
        <label>
          Exercise notes
          <textarea
            aria-label="Exercise notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="builder-actions">
          <button type="submit" className="primary-button" disabled={busy}>
            Save custom exercise
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
