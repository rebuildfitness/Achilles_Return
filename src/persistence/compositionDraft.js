import { readV2, saveV2, atomicV2 } from "./v2Repository.js";
import { newDraft, clone, copyTemplate } from "../domain/v2/composition.js";
// Serial writes prevent rapid edits from racing one another. Cross-tab conflicts
// fork a recoverable intent draft rather than overwrite a newer revision.
/** @param {any} initial @param {(message:string,saved?:any)=>void} notify */
export function draftWriter(initial, notify = () => {}) {
  let current = clone(initial),
    queue = Promise.resolve(),
    pending = 0,
    failure = null;
  return {
    get current() {
      return clone(current);
    },
    get pending() {
      return pending > 0;
    },
    async flush() {
      await queue;
      if (failure) throw failure;
      return clone(current);
    },
    saveTemplate(snapshot, source = null) {
      const intent = clone(snapshot);
      let result, caught;
      pending++;
      notify("Saving…");
      const task = queue
        .catch(() => {})
        .then(async () => {
          try {
            const template = source
              ? {
                  ...clone(intent),
                  id: source.id,
                  recordVersion: 1,
                  revision: source.revision + 1,
                  source: "user",
                  archived: false,
                }
              : { ...copyTemplate(intent), recordVersion: 1, archived: false };
            const next = {
              ...current,
              snapshot: intent,
              revision: current.revision + 1,
              templateRef: { id: template.id, revision: template.revision },
            };
            await atomicV2([
              {
                store: "v2WorkoutTemplates",
                record: template,
                expectedRevision: source?.revision ?? null,
              },
              {
                store: "v2PlannedWorkouts",
                record: next,
                expectedRevision: current.revision,
              },
            ]);
            current = next;
            result = template;
            failure = null;
          } catch (error) {
            caught = failure = error;
            notify(
              `Template not saved: ${error.message}. No template or draft link was changed.`,
            );
          } finally {
            pending--;
            if (!pending && !failure)
              notify("Saved on this device", clone(current));
          }
        });
      queue = task;
      return task.then(() => {
        if (caught) throw caught;
        return result;
      });
    },
    save(snapshot, metadata = {}) {
      const intent = clone(snapshot);
      pending++;
      notify("Saving…");
      queue = queue
        .catch(() => {})
        .then(async () => {
          try {
            const next = {
              ...current,
              ...metadata,
              snapshot: intent,
              revision: current.revision + 1,
            };
            try {
              await saveV2("v2PlannedWorkouts", next, current.revision);
              current = next;
            } catch (error) {
              if (!String(error).includes("Stale revision")) throw error;
              const recovery = {
                ...newDraft(intent, current.date),
                recoveredFrom: current.id,
              };
              await saveV2("v2PlannedWorkouts", recovery, null);
              current = recovery;
              notify(
                "A newer edit exists. Your changes were saved as a separate recovery draft.",
                clone(current),
              );
            }
            failure = null;
          } catch (error) {
            failure = error;
            notify(
              `Not saved: ${error.message}. Keep this page open and retry.`,
            );
          } finally {
            pending--;
            if (!pending && !failure)
              notify("Saved on this device", clone(current));
          }
        });
      return queue;
    },
  };
}
export async function archiveDraft(draft) {
  return saveV2(
    "v2PlannedWorkouts",
    {
      ...draft,
      revision: draft.revision + 1,
      composition: { ...draft.composition, archived: true },
    },
    draft.revision,
  );
}
export async function updateTemplate(template, intent) {
  // Never fetch a fresh revision just to override a stale caller's expectation.
  const next = {
    ...clone(intent),
    id: template.id,
    recordVersion: 1,
    revision: template.revision + 1,
    source: "user",
    archived: false,
  };
  await saveV2("v2WorkoutTemplates", next, template.revision);
  return next;
}
export { readV2 };
