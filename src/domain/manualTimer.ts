import type { ManualTimerSettings, ManualTimerState } from "@/domain/types";

export const DEFAULT_MANUAL_TIMER_SETTINGS: ManualTimerSettings = {
  activitySeconds: 40,
  restSeconds: 20,
  rounds: 6
};

/** Creates the three-second preparation phase for a new session. */
export function createManualTimer(): ManualTimerState {
  return { phase: "ready", remainingMs: 3000, completedRounds: 0 };
}

/** Advances across phase boundaries using elapsed time, without accumulating timer drift. */
export function advanceManualTimer(
  state: ManualTimerState,
  settings: ManualTimerSettings,
  elapsedMs: number
): ManualTimerState {
  let next = { ...state };
  let elapsed = Math.max(0, elapsedMs);
  while (next.phase !== "complete" && elapsed >= next.remainingMs) {
    elapsed -= next.remainingMs;
    if (next.phase === "activity") {
      next.completedRounds += 1;
      if (next.completedRounds === settings.rounds) {
        return { phase: "complete", remainingMs: 0, completedRounds: settings.rounds };
      }
      next.phase = settings.restSeconds > 0 ? "rest" : "activity";
      next.remainingMs = (settings.restSeconds > 0 ? settings.restSeconds : settings.activitySeconds) * 1000;
    } else {
      next.phase = "activity";
      next.remainingMs = settings.activitySeconds * 1000;
    }
  }
  if (next.phase !== "complete") next.remainingMs -= elapsed;
  return next;
}
