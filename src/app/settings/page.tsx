"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { exportBackup, getStorageSummary, importBackup, type StorageSummary } from "@/data/backup";
import {
  getReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
  type ReminderSettings
} from "@/features/settings/notifications";

export default function SettingsPage() {
  const [settings, setSettings] = useState<ReminderSettings>(() => getReminderSettings());
  const [message, setMessage] = useState("");
  const [jsonPreview, setJsonPreview] = useState("");
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const canUseNotifications = useMemo(() => typeof window !== "undefined" && "Notification" in window, []);

  async function refreshSummary() {
    try {
      const nextSummary = await getStorageSummary();
      setSummary(nextSummary);
    } catch {
      setMessage("Could not read local storage summary.");
    }
  }

  function updateSettings(next: ReminderSettings) {
    setSettings(next);
    saveReminderSettings(next);
  }

  async function enableNotifications() {
    const permission = await requestNotificationPermission();
    setMessage(`Notification permission: ${permission}`);
  }

  async function handleExport() {
    setBusy(true);
    try {
      const json = await exportBackup();
      setJsonPreview(json);

      const blob = new Blob([json], { type: "application/json" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `leader-health-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setMessage("Backup exported and file download started.");
      await refreshSummary();
    } catch {
      setMessage("Backup export failed. Please verify local data is valid.");
    } finally {
      setBusy(false);
    }
  }

  function handleJsonChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setJsonPreview(event.target.value);
  }

  async function handleImport() {
    setBusy(true);
    try {
      await importBackup(jsonPreview);
      setMessage("Backup imported successfully.");
      await refreshSummary();
    } catch {
      setMessage("Backup import failed. Verify JSON format.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card appear" aria-labelledby="settings-title">
      <h1 id="settings-title">Settings</h1>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <fieldset style={{ border: "1px solid #e7ded2", borderRadius: 10, padding: "0.75rem" }}>
          <legend>Reminders (opt-in)</legend>
          <label>
            <input
              type="checkbox"
              checked={settings.energyReminderEnabled}
              onChange={(event) => updateSettings({ ...settings, energyReminderEnabled: event.target.checked })}
            />{" "}
            Daily energy reminder at 15:00
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.strengthMorningEnabled}
              onChange={(event) => updateSettings({ ...settings, strengthMorningEnabled: event.target.checked })}
            />{" "}
            Morning Strength A/B reminder
          </label>
          <label htmlFor="strength-hour">Strength reminder hour (0-23)</label>
          <input
            id="strength-hour"
            type="number"
            min={0}
            max={23}
            value={settings.strengthReminderHour}
            onChange={(event) => updateSettings({ ...settings, strengthReminderHour: Number(event.target.value) })}
          />
          <button className="secondary" type="button" disabled={!canUseNotifications} onClick={enableNotifications}>
            Enable browser notifications
          </button>
        </fieldset>

        <fieldset style={{ border: "1px solid #e7ded2", borderRadius: 10, padding: "0.75rem" }}>
          <legend>Backup</legend>
          <p>
            <small className="muted">
              Stored now: daily logs {summary?.dailyLogs ?? "-"}, weekly check-ins {summary?.weeklyCheckIns ?? "-"}, workouts {summary?.workoutLogs ?? "-"}
            </small>
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="secondary" type="button" onClick={() => void refreshSummary()} disabled={busy}>
              Refresh stored counts
            </button>
            <button className="secondary" type="button" onClick={handleExport} disabled={busy}>
              {busy ? "Working..." : "Export backup (JSON)"}
            </button>
          </div>
          <label htmlFor="backup-json">Import backup JSON</label>
          <textarea id="backup-json" value={jsonPreview} onChange={handleJsonChange} />
          <button className="primary" type="button" onClick={handleImport} disabled={busy || jsonPreview.trim().length === 0}>
            {busy ? "Working..." : "Import from text area"}
          </button>
        </fieldset>

        {message ? <small aria-live="polite">{message}</small> : null}
      </div>
    </section>
  );
}
