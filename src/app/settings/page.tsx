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
import { useTranslation } from "@/i18n/LanguageProvider";

export default function SettingsPage() {
  const { locale, setLocale, translations: t } = useTranslation();
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
      setMessage(t.settings.storageSummaryFailed);
    }
  }

  function updateSettings(next: ReminderSettings) {
    setSettings(next);
    saveReminderSettings(next);
  }

  function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
      if (error.message === t.settings.backupTooLarge || error.message === t.settings.backupInvalidJson) {
        return error.message;
      }
    }

    return fallback;
  }

  async function enableNotifications() {
    const permission = await requestNotificationPermission();
    setMessage(t.settings.notificationPermission(permission));
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
      link.download = `${t.settings.backupFilenamePrefix}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setMessage(t.settings.exportSuccess);
      await refreshSummary();
    } catch {
      setMessage(t.settings.exportFailed);
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
      !window.confirm(t.settings.confirmOverwrite)
    ) {
      return;
    }

    setBusy(true);
    try {
      await importBackup(jsonPreview, undefined, {
        mode: importMode,
        messages: {
          tooLarge: t.settings.backupTooLarge,
          invalidJson: t.settings.backupInvalidJson
        }
      });
      setMessage(
        importMode === "overwrite"
          ? t.settings.importOverwriteSuccess
          : t.settings.importMergeSuccess
      );
      await refreshSummary();
    } catch (error) {
      setMessage(getErrorMessage(error, t.settings.importFailed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card appear" aria-labelledby="settings-title">
      <h1 id="settings-title">{t.settings.title}</h1>

      <div className="grid section-margin-top">
        <fieldset className="settings-panel">
          <legend>{t.settings.languageTitle}</legend>
          <div className="settings-actions">
            <button className={locale === "no" ? "primary" : "secondary"} type="button" onClick={() => setLocale("no")}>
              {t.languagePrompt.norskButton}
            </button>
            <button className={locale === "en" ? "primary" : "secondary"} type="button" onClick={() => setLocale("en")}>
              {t.languagePrompt.englishButton}
            </button>
          </div>
        </fieldset>

        <fieldset className="settings-panel">
          <legend>{t.settings.remindersTitle}</legend>
          <label>
            <input
              type="checkbox"
              checked={settings.energyReminderEnabled}
              onChange={(event) => updateSettings({ ...settings, energyReminderEnabled: event.target.checked })}
            />{" "}
            {t.settings.energyReminderLabel}
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.strengthMorningEnabled}
              onChange={(event) => updateSettings({ ...settings, strengthMorningEnabled: event.target.checked })}
            />{" "}
            {t.settings.strengthReminderLabel}
          </label>
          <label htmlFor="strength-hour">{t.settings.strengthHourLabel}</label>
          <input
            id="strength-hour"
            type="number"
            min={0}
            max={23}
            value={settings.strengthReminderHour}
            onChange={(event) => updateSettings({ ...settings, strengthReminderHour: Number(event.target.value) })}
          />
          <button className="secondary" type="button" disabled={!canUseNotifications} onClick={enableNotifications}>
            {t.settings.enableNotificationsButton}
          </button>
        </fieldset>

        <fieldset className="settings-panel">
          <legend>{t.settings.backupTitle}</legend>
          <p>
            <small className="muted">
              {t.settings.storageSummary(summary?.dailyLogs ?? "-", summary?.weeklyCheckIns ?? "-", summary?.workoutLogs ?? "-")}
            </small>
          </p>
          <div className="settings-actions">
            <button className="secondary" type="button" onClick={() => void refreshSummary()} disabled={busy}>
              {t.settings.refreshStorageButton}
            </button>
            <button className="secondary" type="button" onClick={handleExport} disabled={busy}>
              {busy ? t.common.busy : t.settings.exportButton}
            </button>
          </div>
          <label htmlFor="backup-json">{t.settings.importLabel}</label>
          <textarea id="backup-json" value={jsonPreview} onChange={handleJsonChange} />
          <fieldset className="settings-panel settings-import-mode">
            <legend>{t.settings.importModeTitle}</legend>
            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="overwrite"
                checked={importMode === "overwrite"}
                onChange={() => setImportMode("overwrite")}
              />{" "}
              {t.settings.importModeOverwrite}
            </label>
            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="merge"
                checked={importMode === "merge"}
                onChange={() => setImportMode("merge")}
              />{" "}
              {t.settings.importModeMerge}
            </label>
            <small className="muted">
              {t.settings.importModeHint}
            </small>
          </fieldset>
          <button
            className="primary"
            type="button"
            onClick={handleImport}
            disabled={busy || jsonPreview.trim().length === 0}
          >
            {busy
              ? t.common.busy
              : importMode === "overwrite"
                ? t.settings.importOverwriteButton
                : t.settings.importMergeButton}
          </button>
        </fieldset>

        {message ? <small aria-live="polite">{message}</small> : null}
      </div>
    </section>
  );
}
