import { useId, useRef, useState, type ReactNode } from "react";
import manifest from "../../public/assets/exercises/manifests/exercise-illustrations.json";
import { illustrationUrl } from "../data/illustrationPaths.js";
import "./ExerciseIllustration.css";

const illustrations = new Map(manifest.map(record => [record.exerciseId, record]));

/** Shared by both libraries; missing artwork never changes the exercise actions. */
export function ExerciseIllustration({ exerciseId, name, children }: {
  exerciseId: string; name: string; children: ReactNode;
}) {
  const record = illustrations.get(exerciseId);
  const url = illustrationUrl(record, import.meta.env.BASE_URL);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useId();
  const available = Boolean(url && !failed);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div className="illustrated-exercise" data-exercise-id={exerciseId}
      onKeyDown={event => { if (open && event.key === "Escape") { event.stopPropagation(); close(); } }}>
      <div className="illustrated-exercise-row">
        {available ? (
          <button className="illustration-thumbnail" type="button" ref={trigger}
            aria-label={`View illustration for ${name}`} aria-expanded={open}
            aria-controls={panel} onClick={() => setOpen(!open)}>
            <img src={url!} alt={record?.altText || `${name} illustration`}
              width="640" height="960" loading="lazy" decoding="async"
              onError={() => { setFailed(true); setOpen(false); }} />
            <span>Enlarge</span>
          </button>
        ) : <div className="illustration-unavailable"><span>Illustration unavailable</span></div>}
        <div className="illustrated-exercise-content">{children}</div>
      </div>
      {available && open && (
        <section id={panel} className="illustration-detail" aria-label={`${name} illustration`}>
          <button className="secondary-button" type="button" onClick={close}>Close illustration</button>
          <img src={url!} alt={record?.altText || `${name} illustration`} width="640" height="960"
            onError={() => { setFailed(true); setOpen(false); }} />
          <p className="helper">{record?.panelDescription}</p>
          <p className="helper">Illustration supplements the setup and Short Demo above. Follow your Plan for the prescribed dose.</p>
        </section>
      )}
    </div>
  );
}
