import { describe, expect, it } from "vitest";
import { advanceTimedSequence, createTimedSequence, getTimedSequenceState } from "@/domain/timedSequence";
import type { TimedSequenceDefinition } from "@/domain/types";

const tabata: TimedSequenceDefinition = {
  steps: [
    { name: "Work", kind: "activity", durationMs: 20_000 },
    { name: "Rest", kind: "rest", durationMs: 10_000 }
  ],
  repetitions: 8,
  omitFinalRest: true
};

describe("timed sequences", () => {
  it("transitions precisely between activity, rest and repetitions without final rest", () => {
    const sequence = createTimedSequence(tabata);
    expect(sequence.totalDurationMs).toBe(230_000);
    expect(getTimedSequenceState(sequence, 19_999)).toMatchObject({ stepIndex: 0, remainingMs: 1, repetitionIndex: 0 });
    expect(getTimedSequenceState(sequence, 20_000)).toMatchObject({
      stepIndex: 1,
      remainingMs: 10_000,
      repetitionIndex: 0
    });
    expect(getTimedSequenceState(sequence, 30_000)).toMatchObject({
      stepIndex: 0,
      remainingMs: 20_000,
      repetitionIndex: 1
    });
    expect(getTimedSequenceState(sequence, 229_999)).toMatchObject({
      stepIndex: 0,
      repetitionIndex: 7,
      remainingMs: 1
    });
    expect(getTimedSequenceState(sequence, 230_000)).toEqual({ phase: "complete", elapsedMs: 230_000, remainingMs: 0 });
  });

  it("handles named steps with different durations and optional final rest", () => {
    const sequence = createTimedSequence({
      steps: [
        { name: "Stretch left", kind: "activity", durationMs: 500 },
        { name: "Change sides", kind: "rest", durationMs: 100 },
        { name: "Stretch right", kind: "activity", durationMs: 700 },
        { name: "Recovery", kind: "rest", durationMs: 300 }
      ],
      repetitions: 2,
      omitFinalRest: false
    });
    expect(getTimedSequenceState(sequence, 600)).toMatchObject({ step: { name: "Stretch right" }, remainingMs: 700 });
    expect(getTimedSequenceState(sequence, 3_199)).toMatchObject({ step: { name: "Recovery" }, remainingMs: 1 });
    expect(getTimedSequenceState(sequence, 3_200).phase).toBe("complete");
  });

  it("skips no activity when omitting rest from a single repetition", () => {
    const sequence = createTimedSequence({ ...tabata, repetitions: 1 });
    expect(sequence.totalDurationMs).toBe(20_000);
    expect(getTimedSequenceState(sequence, 20_000).phase).toBe("complete");
    const noRest = createTimedSequence({ steps: [tabata.steps[0]], repetitions: 2, omitFinalRest: true });
    expect(getTimedSequenceState(noRest, 20_000)).toMatchObject({ repetitionIndex: 1, stepIndex: 0 });
  });

  it("supports pause and resume and jumps over multiple phases without drift", () => {
    const sequence = createTimedSequence(tabata);
    const beforePause = advanceTimedSequence(sequence, 0, 12_345);
    const afterPause = advanceTimedSequence(sequence, beforePause.elapsedMs, 0);
    const resumed = advanceTimedSequence(sequence, afterPause.elapsedMs, 98_765);
    expect(afterPause).toEqual(beforePause);
    expect(resumed).toEqual(getTimedSequenceState(sequence, 111_110));
    expect(advanceTimedSequence(sequence, resumed.elapsedMs, Number.MAX_SAFE_INTEGER)).toEqual(
      getTimedSequenceState(sequence, 230_000)
    );
    expect(advanceTimedSequence(sequence, 230_000, 1)).toEqual(getTimedSequenceState(sequence, 230_000));
  });

  it("snapshots the supplied steps", () => {
    const step = { name: "Original", kind: "activity" as const, durationMs: 100 };
    const sequence = createTimedSequence({ steps: [step], repetitions: 1, omitFinalRest: true });
    step.name = "Changed";
    expect(getTimedSequenceState(sequence, 0)).toMatchObject({ step: { name: "Original" } });
  });

  it.each([
    { ...tabata, steps: [] },
    { ...tabata, repetitions: 0 },
    { ...tabata, repetitions: 1.5 },
    { ...tabata, repetitions: Number.MAX_SAFE_INTEGER },
    { ...tabata, steps: [{ name: " ", kind: "activity", durationMs: 1 }] },
    { ...tabata, steps: [{ name: "Rest", kind: "rest", durationMs: 1 }] },
    { ...tabata, steps: [{ name: "Work", kind: "activity", durationMs: 0 }] },
    { ...tabata, steps: [{ name: "Work", kind: "activity", durationMs: Number.NaN }] },
    { ...tabata, steps: [{ name: "Work", kind: "activity", durationMs: 0.5 }] }
  ] satisfies TimedSequenceDefinition[])("rejects invalid sequence definitions %#", (definition) => {
    expect(() => createTimedSequence(definition)).toThrow(RangeError);
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid elapsed time %s",
    (elapsed) => {
      const sequence = createTimedSequence(tabata);
      expect(() => getTimedSequenceState(sequence, elapsed)).toThrow(RangeError);
      expect(() => advanceTimedSequence(sequence, 0, elapsed)).toThrow(RangeError);
      expect(() => advanceTimedSequence(sequence, elapsed, 0)).toThrow(RangeError);
    }
  );
});
