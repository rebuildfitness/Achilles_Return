import { MOVEMENT_EXERCISES } from "../data/movementRoutines.js";
import media from "../data/movementMedia.json";
export function MovementDemo({ exerciseId }: { exerciseId: string }) {
  const ex = MOVEMENT_EXERCISES.find((e) => e.id === exerciseId),
    demo = (media as Record<string, any>)[exerciseId];
  return (
    <details className="movement-demo">
      <summary>Short Demo & setup</summary>
      {demo?.url ? (
        <>
          <a href={demo.url} target="_blank" rel="noopener noreferrer">
            Open external demo ↗
          </a>
          <p>{demo.title}</p>
          <small>
            External provider · Internet required · In-app playback not
            verified.
          </small>
        </>
      ) : (
        <p>Demo verification pending. Written setup is available below.</p>
      )}
      <p>{ex?.setup}</p>
      <small>
        {ex?.position} ·{" "}
        {ex?.equipment.join(", ") || "Bodyweight / stable support"}
      </small>
      <p>Alternative: {ex?.substitution}</p>
    </details>
  );
}
