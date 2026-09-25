import { clone, known } from "./composition.js";
export function correctSession(current, command) {
  if (
    !["completed", "partial", "abandoned", "unknown"].includes(
      current.lifecycle,
    )
  )
    throw Error("Use the active workout editor before finishing");
  if (
    !command.reason?.trim() ||
    !command.id ||
    !Number.isFinite(Date.parse(command.at))
  )
    throw Error("Correction requires reason, identity and timestamp");
  const next = clone(current);
  if (command.type === "set") {
    const o = next.occurrences.find((o) => o.id === command.occurrenceId),
      s = o?.sets.find((s) => s.id === command.setId);
    const target = command.boutId
      ? s?.intervals.find((b) => b.id === command.boutId)
      : s;
    if (!target) throw Error("Recorded set not found");
    target.actual = clone(command.actual);
    if (command.actualType && !command.boutId)
      target.actualType = clone(command.actualType);
    if (command.disposition) target.disposition = command.disposition;
  } else if (command.type === "notes") {
    if (next.execution) next.execution.notes = command.notes;
    else next.recordNotes = command.notes;
  } else if (command.type === "date") next.date = known(command.date);
  else throw Error("Unsupported factual correction");
  next.revision = current.revision + 1;
  // Prior lineage is already preserved, in order, on this same aggregate.
  // New corrections reference that immutable prefix instead of recursively
  // duplicating it. Existing version-1 payloads are never rewritten.
  const previous=clone(current), priorCount=current.correctionLineage.length;
  if(priorCount) delete previous.correctionLineage;
  next.correctionLineage = [
    ...clone(current.correctionLineage),
    {
      version: priorCount ? 2 : 1,
      id: command.id,
      at: command.at,
      reason: command.reason,
      previousRevision: current.revision,
      command: clone(command),
      previous,
      ...(priorCount ? {previousLineageCount:priorCount} : {}),
    },
  ];
  return next;
}
export function priorCorrectionState(session,index){
 const entry=session.correctionLineage[index];
 if(!entry)throw Error('Correction not found');
 if(entry.version!==2)return clone(entry.previous);
 if(entry.previousLineageCount!==index)throw Error('Invalid correction lineage reference');
 return {...clone(entry.previous),correctionLineage:clone(session.correctionLineage.slice(0,index))};
}
