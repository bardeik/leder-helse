"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockMode = "none" | "screen-wake-lock" | "ios-fallback";

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
};

type WakeLockApi = {
  request: (type: "screen") => Promise<WakeLockSentinelLike>;
};

type AudioContextLike = AudioContext & {
  close?: () => Promise<void>;
};

type AudioFallbackState = {
  context: AudioContextLike;
  oscillator: OscillatorNode;
  gain: GainNode;
};

function getWakeLockApi(): WakeLockApi | undefined {
  const navigatorLike = navigator as Navigator & { wakeLock?: WakeLockApi };
  return navigatorLike.wakeLock;
}

function getAudioContextCtor():
  | (new () => AudioContextLike)
  | ((new () => AudioContextLike) & typeof AudioContext)
  | undefined {
  const standardCtor =
    typeof AudioContext === "undefined" ? undefined : (AudioContext as unknown as new () => AudioContextLike);
  const windowLike = window as Window & { webkitAudioContext?: new () => AudioContextLike };
  return standardCtor ?? windowLike.webkitAudioContext;
}

export function useWorkoutWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const audioFallbackRef = useRef<AudioFallbackState | null>(null);
  const shouldKeepAwakeRef = useRef(false);
  const [mode, setMode] = useState<WakeLockMode>("none");
  const [active, setActive] = useState(false);

  const stopAudioFallback = useCallback(() => {
    const fallback = audioFallbackRef.current;
    audioFallbackRef.current = null;

    if (!fallback) {
      return;
    }

    fallback.oscillator.stop();
    fallback.oscillator.disconnect();
    fallback.gain.disconnect();
    void fallback.context.close?.();
  }, []);

  const release = useCallback(() => {
    shouldKeepAwakeRef.current = false;

    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (wakeLock) {
      void wakeLock.release();
    }

    stopAudioFallback();

    setMode("none");
    setActive(false);
  }, [stopAudioFallback]);

  const acquire = useCallback(async () => {
    shouldKeepAwakeRef.current = true;

    if (typeof document === "undefined" || document.visibilityState !== "visible") {
      return;
    }

    const existingWakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (existingWakeLock) {
      await existingWakeLock.release();
    }

    stopAudioFallback();

    const wakeLockApi = getWakeLockApi();
    if (wakeLockApi) {
      try {
        const sentinel = await wakeLockApi.request("screen");
        wakeLockRef.current = sentinel;
        sentinel.addEventListener?.("release", () => {
          wakeLockRef.current = null;
          setActive(false);
          setMode("none");
        });
        setMode("screen-wake-lock");
        setActive(true);
        return;
      } catch {
        // Falls back to iOS-compatible no-sleep technique below.
      }
    }

    try {
      const AudioContextCtor = getAudioContextCtor();
      if (!AudioContextCtor) {
        setMode("none");
        setActive(false);
        return;
      }

      const context = new AudioContextCtor();
      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 20;
      gain.gain.value = 0.00001;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();

      audioFallbackRef.current = {
        context,
        oscillator,
        gain
      };
      setMode("ios-fallback");
      setActive(true);
    } catch {
      setMode("none");
      setActive(false);
    }
  }, [stopAudioFallback]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (shouldKeepAwakeRef.current) {
          void acquire();
        }
        return;
      }

      stopAudioFallback();
      setActive(false);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      release();
    };
  }, [acquire, release, stopAudioFallback]);

  return {
    active,
    mode,
    acquire,
    release
  };
}
