import type { TimedSequence, TimedSequenceDefinition, TimedSequenceState } from "@/domain/types";

/** Validates and snapshots a sequence. Durations and repetitions must be positive safe integers. */
export function createTimedSequence(definition: TimedSequenceDefinition): TimedSequence {
  if (
    !Array.isArray(definition.steps) ||
    definition.steps.length === 0 ||
    !Number.isSafeInteger(definition.repetitions) ||
    definition.repetitions < 1 ||
    typeof definition.omitFinalRest !== "boolean"
  ) {
    throw new RangeError("Invalid timed sequence definition");
  }

  let cycleDurationMs = 0;
  let hasActivity = false;
  const steps = definition.steps.map((step) => {
    if (
      !step ||
      typeof step.name !== "string" ||
      !step.name.trim() ||
      (step.kind !== "activity" && step.kind !== "rest") ||
      !Number.isSafeInteger(step.durationMs) ||
      step.durationMs < 1
    ) {
      throw new RangeError("Invalid timed sequence step");
    }
    hasActivity ||= step.kind === "activity";
    cycleDurationMs += step.durationMs;
    if (!Number.isSafeInteger(cycleDurationMs)) throw new RangeError("Timed sequence duration is too large");
    return { ...step };
  });
  if (!hasActivity) throw new RangeError("Timed sequence must contain an activity");

  const lastStep = steps[steps.length - 1];
  const omittedRestMs = definition.omitFinalRest && lastStep.kind === "rest" ? lastStep.durationMs : 0;
  const precedingCyclesMs = cycleDurationMs * (definition.repetitions - 1);
  const totalDurationMs = precedingCyclesMs + (cycleDurationMs - omittedRestMs);
  if (!Number.isSafeInteger(precedingCyclesMs) || !Number.isSafeInteger(totalDurationMs)) {
    throw new RangeError("Timed sequence duration is too large");
  }
  return {
    steps,
    repetitions: definition.repetitions,
    omitFinalRest: definition.omitFinalRest,
    cycleDurationMs,
    totalDurationMs
  };
}

/** Resolves accumulated active milliseconds to a step; exact boundaries select the next step. */
export function getTimedSequenceState(sequence: TimedSequence, elapsedMs: number): TimedSequenceState {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0) throw new RangeError("Invalid elapsed time");
  if (elapsedMs >= sequence.totalDurationMs) {
    return { phase: "complete", elapsedMs: sequence.totalDurationMs, remainingMs: 0 };
  }

  const repetitionIndex = Math.floor(elapsedMs / sequence.cycleDurationMs);
  let cycleElapsedMs = elapsedMs % sequence.cycleDurationMs;
  for (let stepIndex = 0; stepIndex < sequence.steps.length; stepIndex += 1) {
    const step = sequence.steps[stepIndex];
    if (cycleElapsedMs < step.durationMs) {
      return {
        phase: "running",
        elapsedMs,
        remainingMs: step.durationMs - cycleElapsedMs,
        repetitionIndex,
        stepIndex,
        step
      };
    }
    cycleElapsedMs -= step.durationMs;
  }
  throw new RangeError("Invalid timed sequence");
}

/** Advances by active elapsed time only; retain elapsedMs unchanged while paused. */
export function advanceTimedSequence(sequence: TimedSequence, elapsedMs: number, deltaMs: number): TimedSequenceState {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0 || !Number.isSafeInteger(deltaMs) || deltaMs < 0) {
    throw new RangeError("Invalid elapsed time");
  }
  const boundedElapsedMs = Math.min(elapsedMs, sequence.totalDurationMs);
  return getTimedSequenceState(
    sequence,
    boundedElapsedMs + Math.min(deltaMs, sequence.totalDurationMs - boundedElapsedMs)
  );
}
