import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
  const thumbnailUrl = illustrationUrl(record, import.meta.env.BASE_URL, true);
  const [detailFailed, setDetailFailed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(()=>{ if(open) {dialog.current?.showModal(); const previous=document.body.style.overflow; document.body.style.overflow='hidden'; return()=>{document.body.style.overflow=previous;};} },[open]);
  const panel = useId();
  const available = Boolean(thumbnailUrl && !failed);
  function close() {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus({preventScroll:true});
  }
  return (
    <div className="illustrated-exercise" data-exercise-id={exerciseId}
      onKeyDown={event => { if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } }}>
      <div className="illustrated-exercise-row">
        {available ? (
          <button className="illustration-thumbnail" type="button" ref={trigger}
            aria-label={`View illustration for ${name}`} aria-expanded={open}
            aria-controls={panel} onClick={() => setOpen(!open)}>
            <img src={thumbnailUrl!} alt={record?.altText || `${name} illustration`}
              width="192" height="288" loading="lazy" decoding="async"
              onError={() => { setFailed(true); setOpen(false); }} />
            <span>Enlarge</span>
          </button>
        ) : <div className="illustration-unavailable"><span>{url ? "Connect to load illustration" : "Illustration unavailable"}</span>{url && <button type="button" onClick={() => setFailed(false)}>Retry</button>}</div>}
        <div className="illustrated-exercise-content">{children}</div>
      </div>
      {available && open && (
        <dialog ref={dialog} onCancel={e=>{e.preventDefault();close();}} id={panel} className="illustration-detail" aria-label={`${name} illustration`}>
          <button className="secondary-button" type="button" onClick={close}>Close illustration</button>
          {detailFailed ? <div role="status"><p>Connect to load the larger illustration.</p><button type="button" onClick={() => setDetailFailed(false)}>Retry larger image</button></div> :
            <img src={url!} alt={record?.altText || `${name} illustration`} width="640" height="960"
              onError={() => setDetailFailed(true)} />}
          <p className="helper">{record?.panelDescription}</p>
          <p className="helper">Illustration supplements the setup and Short Demo above. Follow your Plan for the prescribed dose.</p>
          <details><summary>Offline image availability</summary><p className="helper">Small previews download as you browse. Larger images download when you tap Enlarge. Each is saved for offline use after loading. App updates or cleared browser storage may require another download. Short Demos require internet.</p></details>
        </dialog>
      )}
    </div>
  );
}
