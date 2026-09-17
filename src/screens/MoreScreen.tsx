import { DataHealth } from "../components/DataHealth";
import { useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import { DataField } from "./Baseline";
import { ExerciseLibrary } from "../components/ExerciseLibrary";
import { EQUIPMENT, DEFAULT_EQUIPMENT, EQUIPMENT_OPTIONS, EQUIPMENT_LABELS } from "../data/catalog.js";
import { EVIDENCE, CLINICAL_COPY } from "../data/evidence.js";
import { addDays } from "../rules/trainingFlexibility.js";
import { dayKey } from "../data/provisionalWeek.js";
import { STRENGTH_STYLES } from "../rules/planner.js";
import { OWNED_LOADS } from "../data/ownedLoads.js";
import { getAll, put, restoreBackup } from "../db.js";
import { migrateBackup, STORE_NAMES, VERSIONS } from "../persistence/schema.js";
import type { Profile, Values, Exercise } from "../types";

export function MoreScreen({
  onMovement,
  profile,
  onExport,
  onReload,
  initialSection = "",
  prescribedIds = [],
  onWelcome,
}: {
  onMovement: () => void;
  profile?: Profile;
  onExport: () => void;
  onReload: () => Promise<void>;
  initialSection?: string;
  prescribedIds?: string[];
  onWelcome?: () => void;
}) {
  const [section, setSection] = useState(initialSection),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [backup, setBackup] = useState<ReturnType<typeof migrateBackup>>(),
    [busy, setBusy] = useState(false),
    [audit, setAudit] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Values>({
    availableDays: profile?.availableDays || ["1", "3", "5"],
    equipment: profile?.equipment || DEFAULT_EQUIPMENT,
    strengthStyle: profile?.strengthStyle || "hybrid",
  });
  async function settings() {
    setBusy(true);
    try {
      await put("profile", { ...profile, id: "athlete", ...values, ...(values.strengthStyle === "conditioning" && profile?.strengthStyle !== "conditioning" ? {conditioningFrom: addDays(dayKey(), 1), previousStrengthStyle: profile?.strengthStyle || "hybrid"} : {}), equipmentUpdate20260915: true });
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
        <h1>{({library:"Exercise library",profile:"Profile & schedule",evidence:"Evidence & rules",backup:"Backup & restore",about:"About & install"} as Record<string,string>)[section] || "More"}</h1>
        {onWelcome && !section && <button className="text-button" onClick={onWelcome}>Replay welcome hero</button>}
        <p>{section === "library" ? "Find demos, setup guidance and exercises for your equipment." : "Your plan, your data, your device."}</p>
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
      {!section && <DataHealth onExport={onExport} />}
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
          <p>Your goal: return to basketball while rebuilding strength.</p>
          <details>
            <summary>Your equipment & squat goal</summary>
            <p>Your landmine station and Major Fitness rack-mounted leg extension are included. The rack attachment supports cable leg extensions, chest-supported rows and seated pulldowns. Counterweight the rack as specified by Major Fitness.</p>
            <ul>
              <li>Belt squat: {OWNED_LOADS.beltSquatModel}.</li>
              <li>Olympic weight plates: {OWNED_LOADS.olympicPlatesLb} lb total.</li>
              <li>Olympic barbell: {OWNED_LOADS.olympicBarLb} lb, separate from the plates.</li>
            </ul>
            <p>
              Your squat goal: belt squats → Smith-machine squats → barbell back squats.
            </p>
            <p>
              When you can belt squat {OWNED_LOADS.beltSquatReviewLb} lb with controlled
              form and a tolerated next-morning Achilles response, consider trying
              Smith-machine squats. The app will remind you; it will not switch
              exercises automatically.
            </p>
            <p>
              Start each new squat variation with a light load and build up again.
              A 225 lb belt squat does not mean using 225 lb on the Smith machine
              or barbell.
            </p>
          </details>
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
          {values.strengthStyle === "conditioning" && <p className="notice">Dedicated Achilles Rehab &amp; Conditioning replaces the B session from tomorrow. A and C retain strength work; recovery days stay low-load. Existing sessions and today's workout are preserved. Impact activities still require their recorded progression criteria.</p>}
          <p className="helper">
            The hybrid program uses 5×5 for an incline dumbbell press on Strength A and a supported row
            on Strength B. This is not the StrongLifts program. Strength C adds higher-rep shoulder, back and arm
            work. Rehab stays first. Use lighter warm-up sets, keep 2–4 reps in
            reserve, and let the next-morning response guide progression.
          </p>
          <DataField
            field={{
              id: "equipment",
              label: "Available owned equipment",
              type: "checks",
              options: [...EQUIPMENT_OPTIONS, ...(profile?.equipment?.includes("weighted-wagon") ? ["weighted-wagon"] : [])].map((e) => [
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
          <p className="helper">Recorded treadmill: ProForm Performance 300i · PFTL39715.1. Backward walking remains deferred pending device-use verification.</p>
          {profile?.equipment?.includes("weighted-wagon") && <p className="helper">Your utility wagon is a personal substitute, not a training sled. It does not unlock sled exercises; cargo ratings are not exercise loads.</p>}
          <PrimaryButton disabled={busy} onClick={settings}>
            Save preferences
          </PrimaryButton>
        </Card>
      )}
      {section === "library" && (
        <ExerciseLibrary
          prescribedIds={prescribedIds}
          onMovement={onMovement}
          equipment={profile?.equipment}
        />
      )}
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
