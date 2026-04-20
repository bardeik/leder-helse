"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { weeklyCheckInsRepo } from "@/data/repositories/weeklyCheckInsRepo";
import { addDays, getWeekStartDate } from "@/domain/calc";

interface WeeklyCheckInState {
  weekStartDate: string;
  weightKg: number;
  notes: string;
  adjustment: string;
}

function currentWeekStart() {
  return getWeekStartDate(new Date().toISOString().slice(0, 10));
}

export function useWeeklyCheckIn() {
  const maxWeekStart = currentWeekStart();
  const minWeekStart = addDays(maxWeekStart, -14);

  const [selectedWeekStart, setSelectedWeekStart] = useState(maxWeekStart);
  const [state, setState] = useState<WeeklyCheckInState>({
    weekStartDate: selectedWeekStart,
    weightKg: 80,
    notes: "",
    adjustment: ""
  });
  const [message, setMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canGoBack = useMemo(() => selectedWeekStart > minWeekStart, [minWeekStart, selectedWeekStart]);
  const canGoForward = useMemo(() => selectedWeekStart < maxWeekStart, [maxWeekStart, selectedWeekStart]);

  useEffect(() => {
    let mounted = true;

    weeklyCheckInsRepo.get(selectedWeekStart).then((checkIn) => {
      if (!mounted) {
        return;
      }

      setState({
        weekStartDate: selectedWeekStart,
        weightKg: checkIn?.weightKg ?? 80,
        notes: checkIn?.notes ?? "",
        adjustment: checkIn?.adjustment ?? ""
      });

      setMessage("");
    });

    return () => {
      mounted = false;
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, [selectedWeekStart]);

  function goBack() {
    if (canGoBack) {
      setSelectedWeekStart((weekStart) => addDays(weekStart, -7));
      setMessage("");
    }
  }

  function goForward() {
    if (canGoForward) {
      setSelectedWeekStart((weekStart) => addDays(weekStart, 7));
      setMessage("");
    }
  }

  function setTransientMessage(text: string) {
    setMessage(text);
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }
    messageTimer.current = setTimeout(() => setMessage(""), 1800);
  }

  async function save(nextState: WeeklyCheckInState = state) {
    setSaving(true);

    try {
      await weeklyCheckInsRepo.upsert({
        weekStartDate: nextState.weekStartDate,
        weightKg: nextState.weightKg,
        notes: nextState.notes.trim() || undefined,
        adjustment: nextState.adjustment.trim() || undefined
      });
      setTransientMessage("Endringer lagret");
      return true;
    } catch {
      setMessage("Skriv inn en gyldig vekt.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    state,
    setState,
    save,
    saving,
    message,
    selectedWeekStart,
    maxWeekStart,
    canGoBack,
    canGoForward,
    goBack,
    goForward
  };
}
