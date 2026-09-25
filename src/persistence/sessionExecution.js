import { saveV2, readV2, atomicV2 } from "./v2Repository.js";
import { startSession, sessionCommand } from "../domain/v2/execution.js";
import { clone } from "../domain/v2/composition.js";
const store = "v2WorkoutSessions";
export const recoveryKey = (id) => `v2-execution-recovery:${id}`;
export async function persistStart(plan, now, sessionId) {
  const s = startSession(plan, now, sessionId);
  if(plan.planning) await atomicV2([{store,record:s,expectedRevision:null}],{guards:[{store:"v2PlannedWorkouts",id:plan.id,value:plan}]});
  else await saveV2(store, s, null);
  return s;
}
// A recovery envelope is a local crash journal, never a second training session.
// It is not included in training totals. Canonical records always use repositories.
/** @param {any} initial @param {(status:string,saved?:any)=>void} notify @param {any} storage */
export function sessionWriter(
  initial,
  notify = () => {},
  storage = globalThis.localStorage,
) {
  let current = clone(initial),
    queue = Promise.resolve(),
    pending = 0,
    failure = null;
  let commands = [];
  const journal = () => {
    try {
      storage?.setItem(
        recoveryKey(current.id),
        JSON.stringify({
          sessionId: current.id,
          baseRevision: current.revision,
          commands,
        }),
      );
    } catch (e) {
      notify("Recovery journal unavailable. Keep this page open until Saved.");
    }
  };
  const clear = () => {
    try {
      storage?.removeItem(recoveryKey(current.id));
    } catch {}
  };
  const writer = {
    get current() {
      return clone(current);
    },
    get pending() {
      return pending > 0;
    },
    get failed() {
      return failure;
    },
    async flush() {
      await queue;
      if (failure) throw failure;
      return clone(current);
    },
    dispatch(command, at = new Date().toISOString(), snapshot = null) {
      const c = clone(command);
      commands.push({
        command: c,
        at,
        ...(snapshot ? { snapshot: clone(snapshot) } : {}),
      });
      journal();
      pending++;
      notify("Saving…");
      const task = queue
        .then(async () => {
          if (failure) return;
          try {
            const next = {
              ...(snapshot ? clone(snapshot) : sessionCommand(current, c, at)),
              revision: current.revision + 1,
            };
            await saveV2(store, next, current.revision);
            current = next;
            commands.shift();
            if (commands.length) journal();
            else clear();
          } catch (e) {
            failure = e;
            notify(
              `Not saved: ${e.message}. Your pending edits are retained for recovery.`,
            );
          }
        })
        .finally(() => {
          pending--;
          if (!pending && !failure)
            notify("Saved on this device", clone(current));
        });
      queue = task;
      return task;
    },
    recovery() {
      return {
        sessionId: current.id,
        baseRevision: current.revision,
        commands: clone(commands),
      };
    },
    async retry() {
      await queue;
      const latest = await readV2(store, current.id);
      if (latest.revision !== current.revision)
        throw Error(
          "A newer session revision exists. Download pending edits and load the saved session; automatic overwrite is disabled.",
        );
      const todo = clone(commands);
      commands = [];
      failure = null;
      for (const entry of todo)
        await writer.dispatch(entry.command, entry.at, entry.snapshot);
      return writer.flush();
    },
  };
  return writer;
}
export function readRecovery(id, storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(recoveryKey(id)) || "null");
    return value?.sessionId === id && Array.isArray(value.commands)
      ? value
      : null;
  } catch {
    return null;
  }
}
