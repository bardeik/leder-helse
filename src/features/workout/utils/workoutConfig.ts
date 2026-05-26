export const TOTAL_ROUNDS = 3;
export const WORK_SECONDS = 40;
export const REST_SECONDS = 20;
export const ROUND_REST_SECONDS = 60;
export const EXERCISES_PER_ROUND = 9;

export type WorkoutPhase = "idle" | "work" | "rest" | "roundRest" | "complete";

export const PHASE_LABELS: Record<WorkoutPhase, string> = {
  idle: "IDLE",
  work: "WORK",
  rest: "REST",
  roundRest: "ROUND REST",
  complete: "COMPLETE"
};
