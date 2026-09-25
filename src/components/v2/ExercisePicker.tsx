import { useEffect, useRef, useState } from "react";
import { IllustratedExercise } from "./IllustratedExercise";
import {
  filterDefinitions,
  FILTERS,
  facet,
  display,
  safeUrl,
} from "../../domain/v2/composition.js";
export function DemoLinks({ definition }: { definition: any }) {
  const demos = definition.media.filter((m: any) => m.kind !== "illustration");
  return (
    <div className="builder-demo">
      {!demos.length && <span>No verified demo available</span>}
      {demos.map((m: any, i: number) => {
        const url = safeUrl(m.url || m.raw?.url || "");
        return (
          <div key={i}>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {m.kind === "related-demo" ? "Related demo" : "Short Demo"} ↗
              </a>
            ) : (
              <span>Demo unavailable</span>
            )}
            <small>
              {display(m.verification) || "Verification unknown"}
              {m.raw?.videoSource ? ` · ${m.raw.videoSource}` : ""}
            </small>
          </div>
        );
      })}
    </div>
  );
}
export function ExercisePicker({
  definitions,
  onSelect,
  onClose,
}: {
  definitions: any[];
  onSelect: (d: any) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    [search, setSearch] = useState(""),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [limit, setLimit] = useState(20);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => previous?.focus();
  }, []);
  const results = filterDefinitions(definitions, search, filters);
  return (
    <dialog
      ref={dialog}
      className="builder-picker"
      aria-label="Choose an exercise"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="builder-toolbar">
        <h2>Choose an exercise</h2>
        <button onClick={onClose}>Close picker</button>
      </div>
      <p>
        Browse the whole library. Rehab associations describe exercises; they do
        not restrict selection.
      </p>
      <label>
        Search exercises
        <input
          autoFocus
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLimit(20);
          }}
          type="search"
        />
      </label>
      <details>
        <summary>Filter exercises</summary>
        <div className="builder-grid">
          {Object.entries(FILTERS).map(([key, label]) => (
            <label key={key}>
              {label}
              <select
                aria-label={label}
                value={filters[key] || ""}
                onChange={(e) => {
                  setFilters({ ...filters, [key]: e.target.value });
                  setLimit(20);
                }}
              >
                <option value="">All</option>
                {[...new Set(definitions.flatMap((d) => facet(d, key)))]
                  .sort()
                  .map((v) => (
                    <option key={v}>{v}</option>
                  ))}
              </select>
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            setSearch("");
            setFilters({});
          }}
        >
          Clear filters
        </button>
      </details>
      <p role="status">{results.length} exercises</p>
      <ul className="builder-picker-list">
        {results.slice(0, limit).map((d: any) => (
          <li key={d.id}>
            <IllustratedExercise definition={d}>
            <h3>{display(d.name) || d.id}</h3>
            <p className="helper">
              {d.equipment.join(" · ") || "Equipment unspecified / bodyweight"}
              {d.provenance.origin === "custom" ? " · User-created" : ""}
            </p>
            <DemoLinks definition={d} />
            <button
              className="secondary-button"
              onClick={() => onSelect(d)}
              aria-label={`Add ${display(d.name)}`}
            >
              Select exercise
            </button>
            </IllustratedExercise>
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <button onClick={() => setLimit(limit + 20)}>
          Show more exercises
        </button>
      )}
      {!results.length && (
        <p>No matches. Clear a filter or create your own exercise.</p>
      )}
    </dialog>
  );
}
