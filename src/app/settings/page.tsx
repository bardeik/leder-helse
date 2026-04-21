"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  exportBackup,
  getStorageSummary,
  importBackup,
  type BackupImportMode,
  type StorageSummary
} from "@/data/backup";
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
  const [importMode, setImportMode] = useState<BackupImportMode>("overwrite");

  const canUseNotifications = useMemo(() => typeof window !== "undefined" && "Notification" in window, []);

  async function refreshSummary() {
    try {
      const nextSummary = await getStorageSummary();
      setSummary(nextSummary);
    } catch {
      setMessage("Kunne ikke lese oppsummering av lokal lagring.");
    }
  }

  function updateSettings(next: ReminderSettings) {
    setSettings(next);
    saveReminderSettings(next);
  }

  async function enableNotifications() {
    const permission = await requestNotificationPermission();
    setMessage(`Varslingstillatelse: ${permission}`);
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
      link.download = `helseloggen-sikkerhetskopi-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setMessage("Sikkerhetskopi eksportert og nedlasting startet.");
      await refreshSummary();
    } catch {
      setMessage("Eksport av sikkerhetskopi mislyktes. Kontroller at lokale data er gyldige.");
    } finally {
      setBusy(false);
    }
  }

  function handleJsonChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setJsonPreview(event.target.value);
  }

  async function handleImport() {
    if (
      importMode === "overwrite" &&
      !window.confirm("Dette vil overskrive alle lokale data med innholdet i sikkerhetskopien. Vil du fortsette?")
    ) {
      return;
    }

    setBusy(true);
    try {
      await importBackup(jsonPreview, undefined, { mode: importMode });
      setMessage(
        importMode === "overwrite"
          ? "Sikkerhetskopi importert og eksisterende data overskrevet."
          : "Sikkerhetskopi importert og slått sammen med eksisterende data."
      );
      await refreshSummary();
    } catch {
      setMessage("Import av sikkerhetskopi mislyktes. Kontroller JSON-formatet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card appear" aria-labelledby="settings-title">
      <h1 id="settings-title">Innstillinger</h1>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <fieldset style={{ border: "1px solid #e7ded2", borderRadius: 10, padding: "0.75rem" }}>
          <legend>Påminninger (valgfritt)</legend>
          <label>
            <input
              type="checkbox"
              checked={settings.energyReminderEnabled}
              onChange={(event) => updateSettings({ ...settings, energyReminderEnabled: event.target.checked })}
            />{" "}
            Daglig energipåminnelse kl. 15:00
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.strengthMorningEnabled}
              onChange={(event) => updateSettings({ ...settings, strengthMorningEnabled: event.target.checked })}
            />{" "}
            Morgenpåminnelse for styrkeøkt
          </label>
          <label htmlFor="strength-hour">Klokkeslett for styrkepåminnelse (0-23)</label>
          <input
            id="strength-hour"
            type="number"
            min={0}
            max={23}
            value={settings.strengthReminderHour}
            onChange={(event) => updateSettings({ ...settings, strengthReminderHour: Number(event.target.value) })}
          />
          <button className="secondary" type="button" disabled={!canUseNotifications} onClick={enableNotifications}>
            Aktiver nettleservarsler
          </button>
        </fieldset>

        <fieldset style={{ border: "1px solid #e7ded2", borderRadius: 10, padding: "0.75rem" }}>
          <legend>Sikkerhetskopi</legend>
          <p>
            <small className="muted">
              Lagret nå: daglige logger {summary?.dailyLogs ?? "-"}, ukentlige innsjekker {summary?.weeklyCheckIns ?? "-"}, økter {summary?.workoutLogs ?? "-"}
            </small>
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="secondary" type="button" onClick={() => void refreshSummary()} disabled={busy}>
              Oppdater antall lagrede
            </button>
            <button className="secondary" type="button" onClick={handleExport} disabled={busy}>
              {busy ? "Jobber..." : "Eksporter sikkerhetskopi (JSON)"}
            </button>
          </div>
          <label htmlFor="backup-json">Importer sikkerhetskopi-JSON</label>
          <textarea id="backup-json" value={jsonPreview} onChange={handleJsonChange} />
          <fieldset style={{ border: "1px solid #e7ded2", borderRadius: 10, padding: "0.75rem", margin: "0 0 0.75rem" }}>
            <legend>Importmodus</legend>
            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="overwrite"
                checked={importMode === "overwrite"}
                onChange={() => setImportMode("overwrite")}
              />{" "}
              Overskriv eksisterende data med sikkerhetskopien
            </label>
            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="merge"
                checked={importMode === "merge"}
                onChange={() => setImportMode("merge")}
              />{" "}
              Slå sammen med eksisterende data
            </label>
            <small className="muted">
              Overskriv sletter dagens lokale data før import. Slå sammen beholder eksisterende data og oppdaterer poster med samme nøkkel.
            </small>
          </fieldset>
          <button className="primary" type="button" onClick={handleImport} disabled={busy || jsonPreview.trim().length === 0}>
            {busy ? "Jobber..." : importMode === "overwrite" ? "Importer og overskriv" : "Importer og slå sammen"}
          </button>
        </fieldset>

        {message ? <small aria-live="polite">{message}</small> : null}
      </div>
    </section>
  );
}
