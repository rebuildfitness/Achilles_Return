import { clone, uid, newDraft, copyTemplate } from "./composition.js";
export const day = () => new Date().toLocaleDateString("en-CA");
export function shiftDate(date, amount) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}
export function schedule(intent, date, templateRef, id = uid()) {
  return {
    ...newDraft(intent, date),
    id,
    planning: { version: 1, archived: false, audit: [] },
    ...(templateRef ? { templateRef: clone(templateRef) } : {}),
  };
}
export function planCommand(plan, command, at = new Date().toISOString()) {
  const p = clone(plan);
  if (!p.planning || p.planning.archived)
    throw Error("Open an available dated plan");
  if (command.type === "move") p.date = command.date;
  else if (command.type === "skip") p.status = "skipped";
  else if (command.type === "restore") p.status = "planned";
  else if (command.type === "archive") p.planning.archived = true;
  else if (command.type === "replace") {
    p.snapshot = copyTemplate(command.intent);
    p.status = "planned";
    delete p.templateRef;
  } else throw Error("Unknown planning command");
  p.revision++;
  p.planning.audit.push({
    id: uid(),
    at,
    command: clone(command),
    previousDate: plan.date,
    previousStatus: plan.status,
    ...(command.type === "replace"
      ? { previousIntent: clone(plan.snapshot) }
      : {}),
  });
  return p;
}
export function expandWeekly(
  intent,
  { start, end, weekdays, seriesId = uid(), templateRef },
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
    start > end ||
    !weekdays.length ||
    weekdays.some((x) => !Number.isInteger(x) || x < 0 || x > 6)
  )
    throw Error("Choose dates and weekly days");
  const result = [];
  let count = 0;
  for (let date = start; date <= end; date = shiftDate(date, 1)) {
    if (++count > 366) throw Error("Expand up to one year at a time");
    if (!weekdays.includes(new Date(date + "T12:00:00Z").getUTCDay())) continue;
    const p = schedule(intent, date, templateRef, `${seriesId}:${date}`);
    p.planning.recurrence = {
      seriesId,
      start,
      end,
      weekdays: clone(weekdays),
      name: intent.name,
    };
    result.push(p);
  }
  return result;
}
