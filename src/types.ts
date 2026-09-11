export type Tab = "Today" | "Plan" | "Progress" | "Tests" | "More";
export type Readiness = { level: string; reason: string; action: string };
export type Answers = {
  pain: string;
  stiffness: string;
  swelling: string;
  previousResponse: string;
  recovery: string;
  unusualSymptoms: string[];
};
export type CheckIn = {
  id: string;
  date: string;
  createdAt: string;
  answers: Answers;
  readiness: Readiness;
  rulesetVersion?: string;
};
export type SetLog = {
  load?: string;
  reps?: string;
  complete?: boolean;
  rpe?: string;
  quality?: string;
  symptoms?: string;
};
export type WorkoutLog = Record<string, { sets: SetLog[] }>;
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  restSec: number;
  cue: string;
  purpose: string;
  evidence: string;
  videoUrl: string;
  videoSource?: string;
  adjustment?: string;
  unit?: string;
};
export type Workout = {
  id: string;
  title: string;
  phase: string;
  items: Exercise[];
  stopped?: boolean;
  notes?: string[];
  omitted?: { id: string; name: string; reason: string }[];
};
export type Session = {
  id: string;
  date: string;
  createdAt: string;
  workoutId: string;
  workoutTitle?: string;
  exerciseLog: WorkoutLog;
  readiness?: Readiness;
  status: string;
  overallDifficulty?: string;
  immediateAchillesResponse?: string;
  notes?: string;
  plannedItems?: Exercise[];
  rulesetVersion?: string;
  domain?: string;
  exposureLevel?: string;
  movementQuality?: string;
  minutes?: string;
  sessionRPE?: string;
  nextDayResponse?: unknown;
};
export type Values = Record<string, string | string[]>;
export type Assessment = {
  id: string;
  values: Values;
  completedAt?: string;
  updatedAt: string;
  step: number;
};
export type Profile = {
  id: string;
  availableDays: string[];
  equipment: string[];
};
