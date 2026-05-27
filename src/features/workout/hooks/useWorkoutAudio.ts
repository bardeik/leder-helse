"use client";

import { useCallback, useRef, useState } from "react";
import type { Locale } from "@/i18n/types";
import type { WorkoutPhase } from "../utils/workoutConfig";

export interface UseWorkoutAudioReturn {
  /** Must be called inside a user-gesture handler (e.g. onClick) to satisfy browser AudioContext policy. */
  initAudio: () => void;
  /** Play a countdown tick for the last 3 seconds of any active phase (seconds = 3, 2, or 1). */
  playCountdownTick: (secondsLeft: number) => void;
  /** Play a distinct transition sound when the phase changes. */
  playTransitionBeep: (toPhase: WorkoutPhase) => void;
  muted: boolean;
  toggleMute: () => void;
}

const COUNTDOWN_WORDS: Record<Locale, Partial<Record<number, string>>> = {
  no: {
    1: "en",
    2: "to",
    3: "tre",
    4: "fire",
    5: "fem"
  },
  en: {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five"
  }
};

export function useWorkoutAudio(locale: Locale = "no"): UseWorkoutAudioReturn {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  // Keep a ref to avoid stale-closure issues inside useCallback
  const mutedRef = useRef(false);

  /** Lazily create and return the shared AudioContext. */
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    // Supports both standard and legacy webkit prefix
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Schedule a single sine-wave tone on the shared AudioContext.
   * Uses AudioContext time scheduling for sample-accurate playback.
   */
  const playTone = useCallback(
    (
      frequency: number,
      startTime: number,
      duration: number,
      gainValue = 0.25,
      waveform: OscillatorType = "sine"
    ): void => {
      if (mutedRef.current) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = waveform;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(gainValue, startTime);
        // Exponential ramp to silence avoids a hard click at note end
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.01);
      } catch {
        // Silently ignore if browser blocks audio
      }
    },
    [getAudioContext]
  );

  const speakCountdownWord = useCallback((secondsLeft: number): boolean => {
    if (typeof window === "undefined" || mutedRef.current) {
      return false;
    }

    const word = COUNTDOWN_WORDS[locale][secondsLeft];
    if (!word) {
      return false;
    }

    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      return false;
    }

    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = locale === "en" ? "en-US" : "nb-NO";
      utterance.rate = 1.15;
      utterance.pitch = 1.35;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }, [locale]);

  /** Resume or create AudioContext — must be called inside a click/touch handler. */
  const initAudio = useCallback((): void => {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") {
      void ctx.resume();
    }
  }, [getAudioContext]);

  /**
   * Speak the countdown when available; otherwise play a louder high-pitched fallback tone.
   */
  const playCountdownTick = useCallback(
    (secondsLeft: number): void => {
      if (speakCountdownWord(secondsLeft)) {
        return;
      }

      const ctx = getAudioContext();
      if (!ctx) return;
      const frequency = secondsLeft === 1 ? 1700 : secondsLeft === 2 ? 1500 : 1300;
      playTone(frequency, ctx.currentTime, 0.12, 0.45, "square");
    },
    [getAudioContext, playTone, speakCountdownWord]
  );

  /**
   * Plays a two-tone transition cue when the phase changes.
   * - work: ascending (energising)
   * - rest / roundRest: descending (calming)
   * - complete: celebratory ascending triple tone
   */
  const playTransitionBeep = useCallback(
    (toPhase: WorkoutPhase): void => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      if (toPhase === "work") {
        playTone(660, t, 0.1, 0.3);
        playTone(990, t + 0.13, 0.18, 0.35);
      } else if (toPhase === "rest" || toPhase === "roundRest") {
        playTone(880, t, 0.1, 0.3);
        playTone(550, t + 0.13, 0.22, 0.28);
      } else if (toPhase === "complete") {
        playTone(660, t, 0.1, 0.3);
        playTone(880, t + 0.15, 0.1, 0.3);
        playTone(1100, t + 0.3, 0.3, 0.38);
      }
    },
    [getAudioContext, playTone]
  );

  const toggleMute = useCallback((): void => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
  }, []);

  return { initAudio, playCountdownTick, playTransitionBeep, muted, toggleMute };
}
