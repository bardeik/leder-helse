"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dailyLogsRepo } from "@/data/repositories/dailyLogsRepo";
import { workoutLogsRepo } from "@/data/repositories/workoutLogsRepo";
import type { WorkoutLog, WorkoutType } from "@/domain/types";
import { useTranslation } from "@/i18n/LanguageProvider";

export interface LogTodayState {
  date: string;
  energy: number;
  sleepOk: boolean;
  sleepHours?: number;
  notes?: string;
}

const MAX_PAST_DAYS = 13;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function useLogToday() {
  const { translations: t } = useTranslation();
  const today = todayIsoDate();
  const minDate = addDaysToIso(today, -MAX_PAST_DAYS);

  const [selectedDate, setSelectedDate] = useState(today);
  const [state, setState] = useState<LogTodayState>({
    date: selectedDate,
    energy: 3,
    sleepOk: true,
    sleepHours: undefined,
    notes: ""
  });
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutLog[]>([]);
  const [message, setMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSave = useMemo(() => state.energy >= 1 && state.energy <= 5, [state.energy]);
  const canGoBack = selectedDate > minDate;
  const canGoForward = selectedDate < today;

  useEffect(() => {
    let mounted = true;

    Promise.all([dailyLogsRepo.get(selectedDate), workoutLogsRepo.listByDate(selectedDate)]).then(
      ([dailyLog, workoutList]) => {
        if (!mounted) {
          return;
        }

        const defaultState: LogTodayState = {
          date: selectedDate,
          energy: 3,
          sleepOk: true,
          sleepHours: undefined,
          notes: ""
        };

        setState({
          date: selectedDate,
          energy: dailyLog?.energy ?? defaultState.energy,
          sleepOk: dailyLog?.sleepOk ?? defaultState.sleepOk,
          sleepHours: dailyLog?.sleepHours,
          notes: dailyLog?.notes ?? defaultState.notes
        });

        setTodayWorkouts(workoutList);
        setMessage("");

        if (!dailyLog) {
          void dailyLogsRepo.upsert(defaultState);
        }
      }
    );

    return () => {
      mounted = false;
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, [selectedDate]);

  function goBack() {
    if (canGoBack) {
      setSelectedDate((d) => addDaysToIso(d, -1));
    }
  }

  function goForward() {
    if (canGoForward) {
      setSelectedDate((d) => addDaysToIso(d, 1));
    }
  }

  function setTransientMessage(text: string) {
    setMessage(text);
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }
    messageTimer.current = setTimeout(() => setMessage(""), 1800);
  }

  async function save(nextState: LogTodayState = state) {
    setSaving(true);

    try {
      await dailyLogsRepo.upsert({
        date: nextState.date,
        energy: nextState.energy,
        sleepOk: nextState.sleepOk,
        sleepHours: nextState.sleepHours,
        notes: nextState.notes?.trim() || undefined
      });
      setTransientMessage(t.common.saveConfirm);
      return true;
    } catch {
      setMessage(t.log.saveFailed);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addQuickWorkout(type: WorkoutType, durationMin?: number) {
    const now = new Date();
    // For past dates use noon of that day as the dateTime so ordering is stable
    const dateTime = state.date === today ? now.toISOString() : `${state.date}T12:00:00.000Z`;
    const id = await workoutLogsRepo.upsert({
      dateTime,
      date: state.date,
      type,
      durationMin
    });

    const added: WorkoutLog = {
      id,
      dateTime,
      date: state.date,
      type,
      durationMin
    };

    setTodayWorkouts((prev) => [added, ...prev]);
    setTransientMessage(t.common.saveConfirm);
  }

  async function removeWorkout(id: number) {
    await workoutLogsRepo.delete(id);
    setTodayWorkouts((prev) => prev.filter((item) => item.id !== id));
    setTransientMessage(t.log.activityDeleted);
  }

  return {
    state,
    setState,
    save,
    addQuickWorkout,
    todayWorkouts,
    removeWorkout,
    canSave,
    saving,
    message,
    selectedDate,
    today,
    canGoBack,
    canGoForward,
    goBack,
    goForward
  };
}
