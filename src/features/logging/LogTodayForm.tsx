"use client";

import { useState } from "react";
import { useLogToday } from "@/features/logging/hooks/useLogToday";
import type { LogTodayState } from "@/features/logging/hooks/useLogToday";
import { parseLocalNumber, formatLocalNumber } from "@/domain/localeNumber";
import { formatWorkoutType } from "@/domain/workouts";
import { FloatingSaveNotice } from "@/components/FloatingSaveNotice";
import { useTranslation } from "@/i18n/LanguageProvider";

export function LogTodayForm() {
  const { locale, translations: t } = useTranslation();
  const {
    state,
    setState,
    save,
    addQuickWorkout,
    todayWorkouts,
    removeWorkout,
    saving,
    message,
    selectedDate,
    today,
    canGoBack,
    canGoForward,
    goBack,
    goForward
  } = useLogToday();
  const [sleepHoursFocused, setSleepHoursFocused] = useState(false);
  const [sleepHoursInput, setSleepHoursInput] = useState("");

  const isToday = selectedDate === today;

  function updateState(next: LogTodayState) {
    setState(next);
  }

  return (
    <section className="card appear" aria-labelledby="log-title">
      <h1 id="log-title">{isToday ? t.log.titleToday : t.log.titleDate(selectedDate)}</h1>

      <div className="log-date-nav">
        <button
          className="secondary"
          type="button"
          aria-label={t.log.prevDayLabel}
          onClick={goBack}
          disabled={!canGoBack}
          data-testid="log-date-back"
        >
          ‹
        </button>
        <span className="log-date-nav-label">
          {isToday ? <strong>{t.log.today}</strong> : selectedDate}
        </span>
        <button
          className="secondary"
          type="button"
          aria-label={t.log.nextDayLabel}
          onClick={goForward}
          disabled={!canGoForward}
          data-testid="log-date-forward"
        >
          ›
        </button>
      </div>

      <p>
        <small className="muted">{t.log.autoSaveHint}</small>
      </p>

      <div className="grid section-margin-top">
        <div>
          <fieldset className="fieldset-reset">
            <legend>{t.log.energyLabel}</legend>
            <div className="inline-options">
              {[1, 2, 3, 4, 5].map((energyValue) => (
                <label key={energyValue}>
                  <input
                    name="energy"
                    type="radio"
                    value={energyValue}
                    checked={state.energy === energyValue}
                    onChange={() => {
                      const next = { ...state, energy: energyValue };
                      updateState(next);
                      void save(next);
                    }}
                  />{" "}
                  {energyValue}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="fieldset-reset">
          <legend>{t.log.sleepOkLabel}</legend>
          <label>
            <input
              name="sleep-ok"
              type="radio"
              checked={state.sleepOk}
              onChange={() => {
                const next = { ...state, sleepOk: true };
                updateState(next);
                void save(next);
              }}
            />{" "}
            {t.common.yes}
          </label>
          <label>
            <input
              name="sleep-ok"
              type="radio"
              checked={!state.sleepOk}
              onChange={() => {
                const next = { ...state, sleepOk: false };
                updateState(next);
                void save(next);
              }}
            />{" "}
            {t.common.no}
          </label>
        </fieldset>

        <div>
          <label htmlFor="sleep-hours">{t.log.sleepHoursLabel}</label>
          <input
            id="sleep-hours"
            type="text"
            placeholder={t.log.sleepHoursPlaceholder}
            value={sleepHoursFocused ? sleepHoursInput : state.sleepHours ? formatLocalNumber(state.sleepHours) : ""}
            onFocus={(event) => {
              setSleepHoursFocused(true);
              setSleepHoursInput(state.sleepHours ? String(state.sleepHours) : "");
              event.currentTarget.select();
            }}
            onChange={(event) => {
              // Allow digits, . and , (for localization)
              const filtered = event.target.value.replace(/[^0-9.,]/g, "");
              setSleepHoursInput(filtered);
            }}
            onBlur={() => {
              setSleepHoursFocused(false);
              const parsed = sleepHoursInput ? parseLocalNumber(sleepHoursInput) : undefined;
              updateState({ ...state, sleepHours: parsed });
              void save({ ...state, sleepHours: parsed });
            }}
          />
        </div>

        <div>
          <label htmlFor="notes">{t.common.notesOptional}</label>
          <textarea
            id="notes"
            value={state.notes ?? ""}
            onChange={(event) => updateState({ ...state, notes: event.target.value })}
            onBlur={() => void save(state)}
          />
        </div>

        <div className="grid grid-3">
          <button className="secondary" type="button" onClick={() => addQuickWorkout("walk", 20)}>
            {t.log.addWalkButton}
          </button>
          <button className="secondary" type="button" onClick={() => addQuickWorkout("strength")}>
            {t.log.addStrengthButton}
          </button>
        </div>

        <div>
          <strong>{isToday ? t.log.activitiesToday : t.log.activitiesDate(selectedDate)}</strong>
          {todayWorkouts.length === 0 ? (
            <small className="muted log-workouts-empty">
              {t.log.noWorkoutsYet}
            </small>
          ) : (
            <ul className="log-workouts-list">
              {todayWorkouts.map((item) => (
                <li key={`${item.id ?? item.dateTime}-${item.type}`} className="log-workouts-item">
                  {formatWorkoutType(item.type, locale)}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                  <button
                    className="secondary log-delete-button"
                    type="button"
                    onClick={() => item.id && void removeWorkout(item.id)}
                  >
                    {t.common.delete}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FloatingSaveNotice message={message} />
        {saving ? <small className="muted">{t.common.saving}</small> : null}
      </div>
    </section>
  );
}
