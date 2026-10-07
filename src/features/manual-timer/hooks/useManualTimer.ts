"use client";

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { advanceManualTimer, createManualTimer, DEFAULT_MANUAL_TIMER_SETTINGS } from "@/domain/manualTimer";
import { manualTimerSettingsSchema } from "@/domain/schemas";
import type { ManualTimerSettings } from "@/domain/types";

export const MANUAL_TIMER_STORAGE_KEY = "leader-health-manual-timer-settings";

function subscribeSettings(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function readStoredSettings() {
  try {
    return localStorage.getItem(MANUAL_TIMER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseStoredSettings(stored: string | null) {
  try {
    const parsed = manualTimerSettingsSchema.safeParse(stored ? JSON.parse(stored) : null);
    return parsed.success ? parsed.data : DEFAULT_MANUAL_TIMER_SETTINGS;
  } catch {
    return DEFAULT_MANUAL_TIMER_SETTINGS;
  }
}

export function useManualTimer() {
  const stored = useSyncExternalStore(subscribeSettings, readStoredSettings, () => null);
  const [customSettings, setSettings] = useState<ManualTimerSettings | null>(null);
  const settings = customSettings ?? parseStoredSettings(stored);
  const [session, setSession] = useState({ timer: createManualTimer(), running: false, started: false });
  const [muted, setMuted] = useState(false);
  const [wakeStatus, setWakeStatus] = useState<"inactive" | "pending" | "active" | "unavailable">("inactive");
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const sessionRef = useRef(session);
  const settingsRef = useRef(settings);
  const mutedRef = useRef(false);
  const lastTime = useRef(0);
  const lastCue = useRef("");
  const audio = useRef<AudioContext | null>(null);
  const tones = useRef(new Set<OscillatorNode>());
  const lock = useRef<WakeLockSentinel | null>(null);
  const lockGeneration = useRef(0);

  function publish(next: typeof session) {
    sessionRef.current = next;
    setSession(next);
  }

  function stopTones() {
    for (const oscillator of tones.current) {
      try {
        oscillator.stop();
      } catch {}
    }
    tones.current.clear();
  }

  function releaseLock() {
    lockGeneration.current += 1;
    const sentinel = lock.current;
    lock.current = null;
    if (sentinel) void sentinel.release().catch(() => undefined);
  }

  async function acquireLock() {
    if (lock.current && !lock.current.released) return;
    const generation = ++lockGeneration.current;
    setWakeStatus("pending");
    try {
      if (!navigator.wakeLock) throw new Error("Wake lock unavailable");
      const sentinel = await navigator.wakeLock.request("screen");
      if (generation !== lockGeneration.current) {
        void sentinel.release().catch(() => undefined);
        return;
      }
      lock.current = sentinel;
      setWakeStatus("active");
      sentinel.addEventListener("release", () => {
        if (lock.current !== sentinel) return;
        lock.current = null;
        setWakeStatus("unavailable");
      });
    } catch {
      if (generation === lockGeneration.current) setWakeStatus("unavailable");
    }
  }

  function playCue(previousPhase?: string) {
    const timer = sessionRef.current.timer;
    const seconds = Math.ceil(timer.remainingMs / 1000);
    const countdown = (timer.phase === "ready" || timer.phase === "rest") && seconds >= 1 && seconds <= 3;
    const transition = (timer.phase === "rest" && previousPhase === "activity") || timer.phase === "complete";
    if (!countdown && !transition) return;
    const key = `${timer.completedRounds}:${timer.phase}:${transition ? "transition" : seconds}`;
    if (lastCue.current === key) return;
    const context = audio.current;
    if (mutedRef.current || !context || context.state !== "running") return;
    lastCue.current = key;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const duration = transition || seconds === 1 ? 0.7 : 0.12;
      oscillator.frequency.value = timer.phase === "complete" ? 1100 : transition ? 550 : 880;
      oscillator.connect(gain);
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0.25, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      tones.current.add(oscillator);
      oscillator.onended = () => {
        tones.current.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch {
      setAudioUnavailable(true);
    }
  }

  function tick() {
    const previous = sessionRef.current;
    if (!previous.running) return;
    const now = performance.now();
    const timer = advanceManualTimer(previous.timer, settingsRef.current, now - lastTime.current);
    lastTime.current = now;
    publish({ ...previous, timer, running: timer.phase !== "complete" });
    playCue(previous.timer.phase);
    if (timer.phase === "complete") {
      releaseLock();
      setWakeStatus("inactive");
    }
  }

  function pause() {
    tick();
    publish({ ...sessionRef.current, running: false });
    stopTones();
  }

  function start() {
    if (sessionRef.current.running || sessionRef.current.timer.phase === "complete") return;
    settingsRef.current = settings;
    setSettings(settings);
    try {
      audio.current ??= new AudioContext();
      void audio.current
        .resume()
        .then(() => {
          setAudioUnavailable(false);
          if (sessionRef.current.running) playCue();
        })
        .catch(() => setAudioUnavailable(true));
    } catch {
      setAudioUnavailable(true);
    }
    lastTime.current = performance.now();
    publish({ ...sessionRef.current, running: true, started: true });
    void acquireLock();
  }

  function reset() {
    stopTones();
    releaseLock();
    setWakeStatus("inactive");
    lastCue.current = "";
    publish({ timer: createManualTimer(), running: false, started: false });
  }

  function updateSettings(next: ManualTimerSettings) {
    const parsed = manualTimerSettingsSchema.safeParse(next);
    if (sessionRef.current.started || !parsed.success) return;
    settingsRef.current = parsed.data;
    setSettings(parsed.data);
    try {
      localStorage.setItem(MANUAL_TIMER_STORAGE_KEY, JSON.stringify(parsed.data));
    } catch {}
  }

  function toggleMute() {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (mutedRef.current) stopTones();
  }

  const onTick = useEffectEvent(tick);
  const onVisibilityChange = useEffectEvent(() => {
    if (document.visibilityState === "hidden") {
      pause();
      releaseLock();
      setWakeStatus("inactive");
    } else if (sessionRef.current.started && sessionRef.current.timer.phase !== "complete") {
      void acquireLock();
    }
  });

  useEffect(() => {
    const interval = window.setInterval(onTick, 50);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopTones();
      releaseLock();
      if (audio.current) void audio.current.close().catch(() => undefined);
    };
  }, []);

  return { settings, ...session, muted, wakeStatus, audioUnavailable, start, pause, reset, updateSettings, toggleMute };
}
