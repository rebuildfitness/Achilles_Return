import { useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { DataField } from "./Baseline";
import { ExerciseLibrary } from "../components/ExerciseLibrary";
import { EQUIPMENT, EQUIPMENT_LABELS } from "../data/catalog.js";
import { EVIDENCE, CLINICAL_COPY } from "../data/evidence.js";
import { STRENGTH_STYLES } from "../rules/planner.js";
import { getAll, put, restoreBackup } from "../db.js";
import { migrateBackup, STORE_NAMES, VERSIONS } from "../persistence/schema.js";
import type { Profile, Values, Exercise } from "../types";

export function MoreScreen({
  profile,
  onExport,
  onReload,
  initialSection = "",
}: {
  profile?: Profile;
  onExport: () => void;
  onReload: () => Promise<void>;
  initialSection?: string;
}) {
  const [section, setSection] = useState(initialSection),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [backup, setBackup] = useState<ReturnType<typeof migrateBackup>>(),
    [busy, setBusy] = useState(false),
    [audit, setAudit] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Values>({
    availableDays: profile?.availableDays || ["1", "3", "5"],
    equipment: profile?.equipment || EQUIPMENT,
    strengthStyle: profile?.strengthStyle || "hybrid",
  });
  async function settings() {
    setBusy(true);
    try {
      await put("profile", { ...profile, id: "athlete", ...values });
      await onReload();
      setMessage("Preferences saved on this device.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="screen-heading">
        <h1>More</h1>
        <p>Your plan, your data, your device.</p>
      </div>
      {section && (
        <button
          className="text-button page-back"
          onClick={() => {
            setSection("");
            setMessage("");
          }}
        >
          ← All settings
        </button>
      )}
      {!section && (
        <Card>
          <div className="menu-list">
            {[
              ["profile", "Profile & schedule"],
              ["library", "Exercise library"],
              ["evidence", "Evidence & rules"],
              ["backup", "Backup & restore"],
              ["about", "About & install"],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-expanded={section === key}
                onClick={() => {
                  setSection(section === key ? "" : key);
                  setMessage("");
                }}
              >
                {label}
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      {section === "profile" && (
        <Card>
          <h2>Profile & schedule</h2>
          <p>
            Basketball is the primary goal. Surgery and clinical details are
            recorded in Tests.
          </p>
          <DataField
            field={{
              id: "availableDays",
              label: "Training days",
              type: "checks",
              options: [
                ["1", "Monday"],
                ["2", "Tuesday"],
                ["3", "Wednesday"],
                ["4", "Thursday"],
                ["5", "Friday"],
                ["6", "Saturday"],
                ["0", "Sunday"],
              ],
            }}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
          <DataField
            field={{
              id: "strengthStyle",
              label: "Strength training style",
              type: "select",
              options: STRENGTH_STYLES,
            }}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
          <p className="helper">
            5×5 adds an incline dumbbell press on Strength A and a supported row
            on Strength B. Strength C adds higher-rep shoulder, back and arm
            work. Rehab stays first. Use lighter warm-up sets, keep 2–4 reps in
            reserve, and let the next-morning response guide progression.
          </p>
          <DataField
            field={{
              id: "equipment",
              label: "Available owned equipment",
              type: "checks",
              options: EQUIPMENT.map((e) => [
                e,
                EQUIPMENT_LABELS[e as keyof typeof EQUIPMENT_LABELS] ||
                  e.replaceAll("-", " "),
              ]),
            }}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
          <p className="helper">
            Only whitelisted equipment can appear. Unavailable exercises are
            omitted and explained. Your Olympic barbell weighs 45 lb; include
            the bar and plates when recording total barbell load. Your photos
            identify a half ball, inflatable balance cushion, stability ball and
            vibration plate. These are equipment options; owning them does not
            unlock impact or unstable-surface work.
          </p>
          <PrimaryButton disabled={busy} onClick={settings}>
            Save preferences
          </PrimaryButton>
        </Card>
      )}
      {section === "library" && <ExerciseLibrary />}
      {section === "evidence" && (
        <>
          <Card>
            <h2>How decisions work</h2>
            <p>
              Safety → next-day response → capacity prerequisites → daily
              readiness → session modification → progression.
            </p>
            <p>{CLINICAL_COPY.targetNote}</p>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  setAudit(
                    (await getAll("decisions")) as Record<string, unknown>[],
                  );
                } catch (e) {
                  setMessage(String(e));
                }
              }}
            >
              Show my decision history
            </button>
            {audit
              .slice()
              .reverse()
              .map((row) => (
                <details key={String(row.id)}>
                  <summary>
                    {String(row.ruleId || "Historical decision")} ·{" "}
                    {String(row.createdAt || row.date || "")}
                  </summary>
                  <pre>{JSON.stringify(row, null, 2)}</pre>
                </details>
              ))}
          </Card>
          {EVIDENCE.map((source) => (
            <Card key={source.id}>
              <h2>{source.title}</h2>
              <p>{source.summary}</p>
              <p className="helper">
                {source.strength} · {source.type}
              </p>
              {source.url && (
                <a href={source.url} target="_blank" rel="noreferrer">
                  Read source ↗
                </a>
              )}
            </Card>
          ))}
        </>
      )}
      {section === "backup" && (
        <Card>
          <h2>Backup & restore</h2>
          <p>
            Export regularly. Clearing browser/site data removes this device’s
            records. V1 has no account or cloud sync.
          </p>
          <PrimaryButton onClick={onExport}>Export JSON backup</PrimaryButton>
          <label className="form-field">
            Choose a backup to validate
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                setMessage("");
                setBackup(undefined);
                try {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 25000000)
                    throw new Error("Backup exceeds 25 MB.");
                  setBackup(migrateBackup(JSON.parse(await file.text())));
                } catch (error) {
                  setMessage(String(error));
                }
              }}
            />
          </label>
          {backup && (
            <>
              <p>
                Validated schema {backup.schemaVersion}:{" "}
                {STORE_NAMES.map((s) => `${backup[s].length} ${s}`).join(", ")}.
              </p>
              <p>
                Restore merges records by ID. Matching IDs are replaced; other
                local records remain. Export first if you want to retain a
                separate copy.
              </p>
              <PrimaryButton
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await restoreBackup(backup);
                    await onReload();
                    setBackup(undefined);
                    setMessage("Backup restored successfully.");
                  } catch (e) {
                    setMessage(String(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Restore validated backup
              </PrimaryButton>
            </>
          )}
        </Card>
      )}
      {section === "about" && (
        <Card>
          <h2>Achilles Return</h2>
          <p>
            App {VERSIONS.appVersion} · Clinical plan {VERSIONS.rulesetVersion}
          </p>
          <p>
            Install from your browser’s app menu. On iPhone, use Safari → Share
            → Add to Home Screen. Load the app online once to prepare its
            offline cache.
          </p>
          <p>
            Core screens and saved records work offline. External demonstration
            videos and research links need internet access.
          </p>
          <p>
            Designed around your approved criteria-based plan. Candidate status
            does not provide medical clearance.
          </p>
        </Card>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
