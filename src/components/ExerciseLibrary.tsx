import { CALF_PATHWAY } from "../data/calfPathway.js";
import { get, put } from "../db.js";
import { MovementLibrary } from "./MovementLibrary";
import { ExerciseIllustration } from "./ExerciseIllustration";
import { useEffect, useState } from "react";
import { Card } from "./ui";
import { EQUIPMENT } from "../data/catalog.js";
import {
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  equipmentLabel,
  filterLibrary,
} from "../data/exerciseLibrary.js";

export function ExerciseLibrary({
  onMovement,
  equipment: ownedEquipment = EQUIPMENT,
  prescribedIds = [],
}: {
  onMovement?: () => void;
  equipment?: string[];
  prescribedIds?: string[];
}) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collection, setCollection] = useState("plan");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { get("settings", "exercise-favorites").then((r: any) => setFavorites(r?.ids || [])).catch(() => setSaveError("Favorites could not be loaded.")); }, []);
  async function favorite(id: string) {
    setSaving(true);
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    try { await put("settings", { id: "exercise-favorites", ids: next }); setFavorites(next); setSaveError(""); }
    catch { setSaveError("Favorite could not be saved. Try again."); }
    finally { setSaving(false); }
  }
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState("");
  const [muscle, setMuscle] = useState("");
  const [limit, setLimit] = useState(20);
  const matches = filterLibrary({ search, equipment, muscle }).filter(ex =>
    (category !== "Achilles" || ex.muscle === "Calf & ankle") &&
    (search || category === "Achilles" || collection === "all" || (collection === "favorites" ? favorites.includes(ex.id) : prescribedIds.includes(ex.id))));
  function reset() {
    setSearch("");
    setEquipment("");
    setMuscle("");
    setLimit(20);
  }
  return (
    <>
      <details className="library-category-menu"><summary>Browse categories · {category}</summary>      <div
        className="movement-chips"
        role="group"
        aria-label="Library categories"
      >
        {["All", "Strength", "Achilles", "Mobility", "Core", "Balance"].map(
          (x) => (
            <button
              key={x}
              aria-pressed={category === x}
              onClick={() => setCategory(x)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      </details>
      {!["All", "Strength", "Achilles"].includes(category) ? (
        <MovementLibrary
          key={category}
          category={category}
          onMovement={onMovement}
          equipment={ownedEquipment}
        />
      ) : (
        <>
          <Card className="exercise-library-card">
            <h2 className="sr-only">Your exercise library</h2>
            <div className="movement-chips" aria-label="Your library collections">
              {[["plan", "In your plan"], ["favorites", "Favorites"], ["all", "All exercises"]].map(([id, label]) => <button key={id} aria-pressed={collection === id} onClick={() => {setCollection(id); setLimit(20);}}>{label}</button>)}
            </div>
            {saveError && <p role="alert">{saveError}</p>}
            <label className="form-field">
              Find an exercise
              <input
                type="search"
                placeholder="Hamstring, cable, chest…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLimit(20);
                }}
              />
            </label>
            <details className="library-filters"><summary>Filters{equipment || muscle ? ' · Active' : ''}</summary>            <div
              className="library-shortcuts"
              aria-label="Common strength movements"
            >
              {[
                ["Chest presses", "Chest", "press"],
                ["Shoulder presses", "Shoulders", "press"],
                ["Back rows", "Back", "row"],
              ].map(([label, group, term]) => (
                <button
                  key={label}
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setSearch(term);
                    setMuscle(group);
                    setEquipment("");
                    setLimit(20);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="form-field">
              Equipment
              <select
                aria-label="Equipment"
                value={equipment}
                onChange={(e) => {
                  setEquipment(e.target.value);
                  setLimit(20);
                }}
              >
                <option value="">All equipment</option>
                <option value="bodyweight">Bodyweight</option>
                {EQUIPMENT.map((id) => (
                  <option key={id} value={id}>
                    {equipmentLabel(id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Muscle group
              <select
                aria-label="Muscle group"
                value={muscle}
                onChange={(e) => {
                  setMuscle(e.target.value);
                  setLimit(20);
                }}
              >
                <option value="">All muscle groups</option>
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
            </label>
            </details>
            {(equipment || muscle) && <p className="active-filters">{[equipment && equipmentLabel(equipment),muscle].filter(Boolean).join(' · ')}</p>}
            <p role="status">{matches.length} exercises found</p>
            {(search || equipment || muscle) && (
              <button
                className="secondary-button"
                type="button"
                onClick={reset}
              >
                Clear filters
              </button>
            )}

          </Card>
          {!matches.length && (
            <Card className="exercise-library-card">
              <h3>No matching exercises yet</h3>
              <p>
                Try another filter. Some equipment is still awaiting a suitable
                exercise-specific demo.
              </p>
              <button
                className="secondary-button"
                type="button"
                onClick={() => { reset(); setCollection("all"); }}
              >
                Show all exercises
              </button>
            </Card>
          )}
          {matches.slice(0, limit).map((ex) => (
            <Card key={ex.id} className="exercise-library-card">
              <ExerciseIllustration exerciseId={ex.id} name={ex.name}>
              <h3>{ex.name}</h3>
              <button className="text-button" disabled={saving} aria-pressed={favorites.includes(ex.id)} aria-label={`Favorite: ${ex.name}`} onClick={() => favorite(ex.id)}>{favorites.includes(ex.id) ? "Saved favorite" : "Add favorite"}</button>
              <p className="helper">
                {ex.muscle} ·{" "}
                {ex.equipment.map(equipmentLabel).join(" + ") || "Bodyweight"}
              </p>
              <a
                className="demo-link"
                href={ex.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Short Demo: ${ex.name}`}
              >
                Short Demo ↗
              </a>
              <details>
                <summary>Setup & guidance</summary>
                <p>{ex.setup}</p>
                {CALF_PATHWAY.find(c => c.id === ex.id) && <p className="helper">Easier: {CALF_PATHWAY.find(c => c.id === ex.id)!.easier}. Next review: {CALF_PATHWAY.find(c => c.id === ex.id)!.harder}.</p>}
                <p className="helper">{ex.review}</p>
                <p className="helper">
                  {ex.libraryOnly
                    ? "Library option — not automatically added to your workout."
                    : "Included in the rehab exercise catalog."}
                </p>
                <p className="helper">
                  {ex.videoSource} · Checked {ex.verifiedAt}
                </p>
                <p className="helper">{ex.verification}</p>
              </details>
              </ExerciseIllustration>
            </Card>
          ))}
          {matches.length > limit && (
            <button
              className="secondary-button"
              type="button"
              onClick={() => setLimit(limit + 20)}
            >
              Show 20 more exercises
            </button>
          )}
            <details>
              <summary>About the demos and equipment</summary>            {onMovement && (
              <button className="text-button" onClick={onMovement}>
                Movement routines & logging →
              </button>
            )}
            <p>
              {EXERCISE_LIBRARY.length} exercises across your home-gym
              equipment.
            </p>
            <p className="helper">
              Browse strength, muscle-building, core and rehab movements. Your
              Plan selects the exercises and doses appropriate to your current
              stage.
            </p>

              <p className="helper">
                Demo links open a single-exercise video or the provider’s
                exercise page. Most new provider pages have been checked, but
                not every video’s playback or length. Videos need an internet
                connection. Check each setup for required cable handles, padding
                and supports.
              </p>
              <p className="helper">
                Your stability ball is a yoga ball, not a medicine ball.
                Inflatable-cushion and vibration-plate demo coverage is still
                being curated; no mismatched demonstration is substituted.
              </p>
            </details>
          {category === "All" && (
            <details className="detail-section">
              <summary>Movement routine library</summary>
              <MovementLibrary
                category="All"
                onMovement={onMovement}
                equipment={ownedEquipment}
              />
            </details>
          )}
        </>
      )}
    </>
  );
}
