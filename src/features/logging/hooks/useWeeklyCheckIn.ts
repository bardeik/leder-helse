"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { weeklyCheckInsRepo } from "@/data/repositories/weeklyCheckInsRepo";
import { addDays, getWeekStartDate } from "@/domain/calc";
import { useTranslation } from "@/i18n/LanguageProvider";

interface WeeklyCheckInState {
  weekStartDate: string;
  weightKg: number;
  notes: string;
  adjustment: string;
}

const DEFAULT_WEIGHT_KG = 80;

function currentWeekStart() {
  return getWeekStartDate(new Date().toISOString().slice(0, 10));
}

export function resolveInitialWeightKg(currentWeekWeight?: number, previousWeekWeight?: number) {
  return currentWeekWeight ?? previousWeekWeight ?? DEFAULT_WEIGHT_KG;
}

export function useWeeklyCheckIn() {
  const { translations: t } = useTranslation();
  const maxWeekStart = currentWeekStart();
  const minWeekStart = addDays(maxWeekStart, -14);

  const [selectedWeekStart, setSelectedWeekStart] = useState(maxWeekStart);
  const [state, setState] = useState<WeeklyCheckInState>({
    weekStartDate: selectedWeekStart,
    weightKg: DEFAULT_WEIGHT_KG,
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

    Promise.all([weeklyCheckInsRepo.get(selectedWeekStart), weeklyCheckInsRepo.get(addDays(selectedWeekStart, -7))]).then(
      ([checkIn, previousCheckIn]) => {
        if (!mounted) {
          return;
        }

        setState({
          weekStartDate: selectedWeekStart,
          weightKg: resolveInitialWeightKg(checkIn?.weightKg, previousCheckIn?.weightKg),
          notes: checkIn?.notes ?? "",
          adjustment: checkIn?.adjustment ?? ""
        });

        setMessage("");
      }
    );

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
      setTransientMessage(t.common.saveConfirm);
      return true;
    } catch {
      setMessage(t.checkIn.saveFailed);
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
