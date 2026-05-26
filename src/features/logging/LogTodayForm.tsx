"use client";

import { useState } from "react";
import { useLogToday } from "@/features/logging/hooks/useLogToday";
import type { LogTodayState } from "@/features/logging/hooks/useLogToday";
import { parseLocalNumber, formatLocalNumber } from "@/domain/localeNumber";
import { formatWorkoutType } from "@/domain/workouts";
import { FloatingSaveNotice } from "@/components/FloatingSaveNotice";

export function LogTodayForm() {
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
      <h1 id="log-title">{isToday ? "Logg i dag" : `Logg — ${selectedDate}`}</h1>

      <div className="log-date-nav">
        <button
          className="secondary"
          type="button"
          aria-label="Forrige dag"
          onClick={goBack}
          disabled={!canGoBack}
          data-testid="log-date-back"
        >
          ‹
        </button>
        <span className="log-date-nav-label">
          {isToday ? <strong>I dag</strong> : selectedDate}
        </span>
        <button
          className="secondary"
          type="button"
          aria-label="Neste dag"
          onClick={goForward}
          disabled={!canGoForward}
          data-testid="log-date-forward"
        >
          ›
        </button>
      </div>

      <p>
        <small className="muted">Lagrer automatisk når du går ut av feltet. Du kan gå opptil 2 uker tilbake.</small>
      </p>

      <div className="grid section-margin-top">
        <div>
          <fieldset className="fieldset-reset">
            <legend>Energi kl. 15:00 (1-5)</legend>
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
          <legend>Søvn ok?</legend>
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
            Ja
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
            Nei
          </label>
        </fieldset>

        <div>
          <label htmlFor="sleep-hours">Sovntimer (valgfritt)</label>
          <input
            id="sleep-hours"
            type="text"
            placeholder="f.eks. 7,5"
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
          <label htmlFor="notes">Notater (valgfritt)</label>
          <textarea
            id="notes"
            value={state.notes ?? ""}
            onChange={(event) => updateState({ ...state, notes: event.target.value })}
            onBlur={() => void save(state)}
          />
        </div>

        <div className="grid grid-3">
          <button className="secondary" type="button" onClick={() => addQuickWorkout("walk", 20)}>
            + Gåtur 20 min
          </button>
          <button className="secondary" type="button" onClick={() => addQuickWorkout("strength")}>
            + Styrkeøkt
          </button>
        </div>

        <div>
          <strong>{isToday ? "Dagens aktiviteter" : `Aktiviteter — ${selectedDate}`}</strong>
          {todayWorkouts.length === 0 ? (
            <small className="muted log-workouts-empty">
              Ingen økter loggført enda.
            </small>
          ) : (
            <ul className="log-workouts-list">
              {todayWorkouts.map((item) => (
                <li key={`${item.id ?? item.dateTime}-${item.type}`} className="log-workouts-item">
                  {formatWorkoutType(item.type)}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                  <button
                    className="secondary log-delete-button"
                    type="button"
                    onClick={() => item.id && void removeWorkout(item.id)}
                  >
                    Slett
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FloatingSaveNotice message={message} />
        {saving ? <small className="muted">Lagrer...</small> : null}
      </div>
    </section>
  );
}
