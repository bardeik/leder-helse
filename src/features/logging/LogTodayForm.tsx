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

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <button
          className="secondary"
          type="button"
          aria-label="Forrige dag"
          onClick={goBack}
          disabled={!canGoBack}
          style={{ padding: "0.4rem 0.75rem", fontWeight: 600 }}
        >
          ‹
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: "0.9rem" }}>
          {isToday ? <strong>I dag</strong> : selectedDate}
        </span>
        <button
          className="secondary"
          type="button"
          aria-label="Neste dag"
          onClick={goForward}
          disabled={!canGoForward}
          style={{ padding: "0.4rem 0.75rem", fontWeight: 600 }}
        >
          ›
        </button>
      </div>

      <p>
        <small className="muted">Lagrer automatisk når du går ut av feltet. Du kan gå opptil 2 uker tilbake.</small>
      </p>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <div>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend>Energi kl. 15:00 (1-5)</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
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

        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
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
            <small className="muted" style={{ display: "block", marginTop: "0.4rem" }}>
              Ingen økter loggført enda.
            </small>
          ) : (
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem" }}>
              {todayWorkouts.map((item) => (
                <li key={`${item.id ?? item.dateTime}-${item.type}`} style={{ marginBottom: "0.35rem" }}>
                  {formatWorkoutType(item.type)}
                  {item.durationMin ? ` (${item.durationMin}m)` : ""}
                  <button
                    className="secondary"
                    type="button"
                    style={{ marginLeft: "0.5rem", padding: "0.35rem 0.55rem" }}
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
