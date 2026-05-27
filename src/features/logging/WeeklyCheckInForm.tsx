"use client";

import { useState } from "react";
import { useWeeklyCheckIn } from "@/features/logging/hooks/useWeeklyCheckIn";
import { parseLocalNumber, formatLocalNumber } from "@/domain/localeNumber";
import { FloatingSaveNotice } from "@/components/FloatingSaveNotice";
import { useTranslation } from "@/i18n/LanguageProvider";

export function WeeklyCheckInForm() {
  const { translations: t } = useTranslation();
  const {
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
  } = useWeeklyCheckIn();
  const [weightFocused, setWeightFocused] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const isCurrentWeek = selectedWeekStart === maxWeekStart;

  return (
    <section className="card appear" aria-labelledby="checkin-title">
      <div className="week-nav section-gap-bottom">
        <button type="button" onClick={goBack} disabled={!canGoBack} aria-label={t.checkIn.prevWeekLabel}>
          ‹
        </button>
        <span>{isCurrentWeek ? <strong>{t.checkIn.thisWeek}</strong> : selectedWeekStart}</span>
        <button type="button" onClick={goForward} disabled={!canGoForward} aria-label={t.checkIn.nextWeekLabel}>
          ›
        </button>
      </div>

      <h1 id="checkin-title">{t.checkIn.title}</h1>
      <small>{t.checkIn.weekStarting(selectedWeekStart)}</small>
      <div className="grid section-margin-top">
        <div>
          <label htmlFor="weight">{t.checkIn.weightLabel}</label>
          <input
            id="weight"
            type="text"
            placeholder={t.checkIn.weightPlaceholder}
            value={weightFocused ? weightInput : formatLocalNumber(state.weightKg)}
            onFocus={(event) => {
              setWeightFocused(true);
              setWeightInput(String(state.weightKg || ""));
              event.currentTarget.select();
            }}
            onChange={(event) => {
              // Allow digits, . and , (for localization)
              const filtered = event.target.value.replace(/[^0-9.,]/g, "");
              setWeightInput(filtered);
            }}
            onBlur={() => {
              setWeightFocused(false);
              const parsed = parseLocalNumber(weightInput);
              setState((prev) => ({ ...prev, weightKg: parsed }));
              void save({ ...state, weightKg: parsed });
            }}
          />
        </div>

        <div>
          <label htmlFor="checkin-notes">{t.common.notes}</label>
          <textarea
            id="checkin-notes"
            value={state.notes}
            onChange={(event) => setState((prev) => ({ ...prev, notes: event.target.value }))}
            onBlur={() => void save(state)}
          />
        </div>

        <div>
          <label htmlFor="adjustment">{t.checkIn.adjustmentLabel}</label>
          <input
            id="adjustment"
            type="text"
            value={state.adjustment}
            onChange={(event) => setState((prev) => ({ ...prev, adjustment: event.target.value }))}
            onBlur={() => void save(state)}
          />
        </div>

        <FloatingSaveNotice message={message} />
        {saving ? <small className="muted">{t.common.saving}</small> : null}
      </div>
    </section>
  );
}
