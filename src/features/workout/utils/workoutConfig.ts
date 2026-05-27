export const TOTAL_ROUNDS = 3;
export const WORK_SECONDS = 40;
export const REST_SECONDS = 20;
export const ROUND_REST_SECONDS = 90;
export const EXERCISES_PER_ROUND = 9;
/** Duration of the pre-workout startup countdown (seconds). */
export const COUNTDOWN_SECONDS = 5;

export type WorkoutPhase = "idle" | "countdown" | "work" | "rest" | "roundRest" | "complete";

export const PHASE_LABELS: Record<WorkoutPhase, string> = {
  idle: "VENTER",
  countdown: "KLAR!",
  work: "JOBB",
  rest: "HVIL",
  roundRest: "HVILE MELLOM RUNDER",
  complete: "FERDIG"
};
