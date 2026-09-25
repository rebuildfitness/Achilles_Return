import { BASE_WORKOUT } from "./workouts.js";
import { exercises, usesOnlyOwnedEquipment } from "./exercises.js";
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
// Port of index.html's provisional schedule, not Sprint C's plan generator.
export function currentWeekPlan(today = new Date()) {
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const schedule = [
    { title: BASE_WORKOUT.title, workout: BASE_WORKOUT },
    {
      title: "Low-Impact Conditioning",
      workout: { id: "conditioning-bike", items: [exercises.bike] },
    },
    {
      title: "Achilles Strength + Lower Body B",
      workout: {
        id: "foundation-strength-b",
        items: [
          exercises.seatedCalf,
          exercises.singleCalf,
          exercises.stepUp,
          exercises.rdl,
          exercises.pallof,
        ].filter(usesOnlyOwnedEquipment),
      },
    },
    { title: "Recovery / Mobility", workout: null },
    { title: BASE_WORKOUT.title, workout: BASE_WORKOUT },
    {
      title: "Easy Conditioning / Walk",
      workout: { id: "easy-conditioning", items: [exercises.bike] },
    },
    { title: "Rest / Mobility", workout: null },
  ];
  return schedule.map((item, i) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    return { ...item, date: dayKey(date), dateObj: date };
  });
}
