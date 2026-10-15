"use client";

import { useState } from "react";
import type { ManualTimerSettings } from "@/domain/types";
import { useManualTimer } from "@/features/manual-timer/hooks/useManualTimer";
import { useTranslation } from "@/i18n/LanguageProvider";

function TimerSetting({
  name,
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  onValidityChange
}: {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const { translations: t } = useTranslation();
  const [draft, setDraft] = useState(String(value));
  const valid = draft.trim() !== "" && Number.isInteger(Number(draft)) && Number(draft) >= min && Number(draft) <= max;
  function adjust(delta: number) {
    onValidityChange(true);
    const next = Math.min(max, Math.max(min, value + delta));
    setDraft(String(next));
    onChange(next);
  }
  return (
    <div className="manual-timer-setting">
      <label htmlFor={name}>{label}</label>
      <div className="manual-timer-stepper">
        <button
          type="button"
          aria-label={t.manualTimer.decrease(label)}
          title={t.manualTimer.decrease(label)}
          disabled={disabled || value <= min}
          onClick={() => adjust(-step)}
        >
          -
        </button>
        <input
          id={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={draft}
          disabled={disabled}
          aria-invalid={!valid}
          aria-describedby={!valid ? "manual-timer-error" : undefined}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            const number = Number(raw);
            onValidityChange(raw.trim() !== "" && Number.isInteger(number) && number >= min && number <= max);
          }}
          onBlur={() => {
            if (valid) onChange(Number(draft));
          }}
        />
        <button
          type="button"
          aria-label={t.manualTimer.increase(label)}
          title={t.manualTimer.increase(label)}
          disabled={disabled || value >= max}
          onClick={() => adjust(step)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ManualTimerPage() {
  const { translations: t } = useTranslation();
  const timer = useManualTimer();
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const fields: { name: keyof ManualTimerSettings; label: string; min: number; max: number; step: number }[] = [
    { name: "activitySeconds", label: t.manualTimer.activitySeconds, min: 10, max: 600, step: 10 },
    { name: "restSeconds", label: t.manualTimer.restSeconds, min: 0, max: 600, step: 10 },
    { name: "rounds", label: t.manualTimer.rounds, min: 1, max: 99, step: 1 }
  ];
  const hasInvalid = Object.values(invalid).some(Boolean);
  const complete = timer.timer.phase === "complete";
  const phaseLabel = !timer.started ? t.manualTimer.phase.idle : t.manualTimer.phase[timer.timer.phase];
  const seconds = !timer.started ? timer.settings.activitySeconds : Math.ceil(timer.timer.remainingMs / 1000);

  return (
    <section className={`manual-timer manual-timer-${timer.timer.phase}`}>
      <h1>{t.nav.pages.manualTimer}</h1>
      <div className="manual-timer-settings">
        {fields.map((field) => (
          <TimerSetting
            key={`${field.name}:${timer.settings[field.name]}`}
            {...field}
            value={timer.settings[field.name]}
            disabled={timer.started}
            onChange={(value) => timer.updateSettings({ ...timer.settings, [field.name]: value })}
            onValidityChange={(valid) => setInvalid((previous) => ({ ...previous, [field.name]: !valid }))}
          />
        ))}
      </div>
      {hasInvalid && (
        <p id="manual-timer-error" role="alert">
          {t.manualTimer.invalidSettings}
        </p>
      )}
      <div className="manual-timer-display">
        <p className="manual-timer-phase" role="status">
          {phaseLabel}
          {timer.started && !timer.running && !complete ? ` - ${t.manualTimer.phase.paused}` : ""}
        </p>
        <output className="manual-timer-seconds" aria-label={t.manualTimer.seconds}>
          {seconds}
        </output>
        <p>
          {t.manualTimer.currentRound(
            Math.min(timer.timer.completedRounds + 1, timer.settings.rounds),
            timer.settings.rounds
          )}
        </p>
      </div>
      <dl className="manual-timer-progress">
        <div>
          <dt>{t.manualTimer.completedRounds}</dt>
          <dd>{timer.timer.completedRounds}</dd>
        </div>
        <div>
          <dt>{t.manualTimer.remainingRounds}</dt>
          <dd>{timer.settings.rounds - timer.timer.completedRounds}</dd>
        </div>
      </dl>
      <div className="manual-timer-controls">
        {timer.running ? (
          <button type="button" className="primary" onClick={timer.pause}>
            {t.manualTimer.pause}
          </button>
        ) : (
          <button type="button" className="primary" onClick={timer.start} disabled={hasInvalid || complete}>
            {timer.started ? t.manualTimer.resume : t.manualTimer.start}
          </button>
        )}
        <button
          type="button"
          className="secondary"
          disabled={!timer.started}
          onClick={() => {
            if (complete || window.confirm(t.manualTimer.confirmReset)) timer.reset();
          }}
        >
          {t.manualTimer.reset}
        </button>
        <button type="button" className="secondary" aria-pressed={timer.muted} onClick={timer.toggleMute}>
          {timer.muted ? t.manualTimer.unmute : t.manualTimer.mute}
        </button>
      </div>
      <div className="manual-timer-notices" aria-live="polite">
        {timer.wakeStatus === "active" && <p className="muted">{t.manualTimer.wakeActive}</p>}
        {timer.started && !complete && timer.wakeStatus === "unavailable" && (
          <p role="alert">{t.manualTimer.wakeUnavailable}</p>
        )}
        {timer.started && !complete && timer.audioUnavailable && <p role="alert">{t.manualTimer.audioUnavailable}</p>}
      </div>
    </section>
  );
}
