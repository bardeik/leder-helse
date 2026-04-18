"use client";

import { useState } from "react";
import { useWeeklyCheckIn } from "@/features/logging/hooks/useWeeklyCheckIn";
import { parseLocalNumber, formatLocalNumber, getDecimalSeparator } from "@/domain/localeNumber";
import { FloatingSaveNotice } from "@/components/FloatingSaveNotice";

export function WeeklyCheckInForm() {
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
      <div className="week-nav" style={{ marginBottom: "0.5rem" }}>
        <button type="button" onClick={goBack} disabled={!canGoBack} aria-label="Forrige uke">
          ‹
        </button>
        <span>{isCurrentWeek ? <strong>Denne uken</strong> : selectedWeekStart}</span>
        <button type="button" onClick={goForward} disabled={!canGoForward} aria-label="Neste uke">
          ›
        </button>
      </div>

      <h1 id="checkin-title">Ukentlig veiing</h1>
      <small>Uke som starter {selectedWeekStart} (mandag)</small>
      <div className="grid" style={{ marginTop: "1rem" }}>
        <div>
          <label htmlFor="weight">Vekt (kg)</label>
          <input
            id="weight"
            type="text"
            placeholder={`f.eks. 75${getDecimalSeparator()}5`}
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
          <label htmlFor="checkin-notes">Notater</label>
          <textarea
            id="checkin-notes"
            value={state.notes}
            onChange={(event) => setState((prev) => ({ ...prev, notes: event.target.value }))}
            onBlur={() => void save(state)}
          />
        </div>

        <div>
          <label htmlFor="adjustment">En justering for neste uke</label>
          <input
            id="adjustment"
            type="text"
            value={state.adjustment}
            onChange={(event) => setState((prev) => ({ ...prev, adjustment: event.target.value }))}
            onBlur={() => void save(state)}
          />
        </div>

        <FloatingSaveNotice message={message} />
        {saving ? <small className="muted">Lagrer...</small> : null}
      </div>
    </section>
  );
}
