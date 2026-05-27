import type { TranslationDict } from "@/i18n/types";

export const no: TranslationDict = {
  intlLocale: "nb-NO",

  common: {
    yes: "Ja",
    no: "Nei",
    delete: "Slett",
    notes: "Notater",
    notesOptional: "Notater (valgfritt)",
    busy: "Jobber...",
    saving: "Lagrer...",
    saveConfirm: "Endringer lagret"
  },

  languagePrompt: {
    title: "Velg språk",
    body: "Hvilket språk vil du bruke i appen?",
    norskButton: "Norsk",
    englishButton: "English"
  },

  nav: {
    brandName: "Helseloggen",
    mainNavigationLabel: "Hovednavigasjon",
    menuOpenLabel: "Åpne meny",
    pages: {
      home: "Oversikt",
      log: "Logg i dag",
      checkIn: "Ukentlig innsjekk",
      workout: "Intervalløkt",
      settings: "Innstillinger"
    }
  },

  workoutType: {
    strength: "Styrkeøkt",
    walk: "Gåtur"
  },

  dashboard: {
    loadingData: "Laster lokale data...",
    motivationSection: "Dagens motivasjon",
    thisWeek: "Denne uken",
    adherenceFormat: (pct) => `${pct}% etterlevelse`,
    statusLabel: {
      green: "grønn",
      yellow: "gul",
      red: "rød"
    },
    energyLabel: "Energi",
    sleepLabel: "Søvn",
    strengthWorkoutsLabel: "Styrkeøkter",
    walksLabel: "Gåturer",
    weeklyCheckInLabel: "Ukentlig innsjekk",
    registered: "Registrert",
    missing: "Mangler",
    daysOf7Format: (count) => `${count} av 7 dager`,
    ofGoalFormat: (current, total) => `${current} av ${total}`,
    completeThisWeek: "Komplett denne uken.",
    daysMissing: (count) => `${count} ${count === 1 ? "dag mangler" : "dager mangler"}.`,
    strengthGoalReached: "Ukens styrkemål er nådd.",
    strengthWorkoutsRemaining: (count) => `${count} ${count === 1 ? "styrkeøkt gjenstår" : "styrkeøkter gjenstår"}.`,
    walksGoalReached: "Ukens gåturer er registrert.",
    walksRemaining: (count) => `${count} ${count === 1 ? "gåtur gjenstår" : "gåturer gjenstår"}.`,
    weightLoggedThisWeek: "Veiing er lagret for denne uken.",
    weightNotLogged: "Legg inn vekt og refleksjon for å fullføre uken.",
    weightTrend: "Vekttrend",
    energyAverage: "Energisnitt",
    sleepNights: "Netter med godkjent søvn",
    noDataYet: "Ingen data enda.",
    noComparableWeek: "Ingen sammenlignbar uke enda.",
    trendValueWeight: (val) => `${val} kg`,
    trendValueEnergy: (val) => `${val} i snitt`,
    trendValueSleep: (val) => `${val} netter`,
    trendChangeWeight: (delta) => `${delta} kg siden forrige veiing`,
    trendChangeEnergy: (delta) => `${delta} siden forrige sammenlignbare uke`,
    trendChangeSleep: (delta) => `${delta} netter siden forrige sammenlignbare uke`,
    recentWorkouts: "Nylige økter",
    noWorkoutsYet: "Ingen økter loggført enda.",
    latestReflection: "Siste ukentlige refleksjon",
    weightRegisteredForWeek: (weight, weekStart) => `${weight} kg registrert for uken fra ${weekStart}.`,
    adjustmentLabel: "Justering:",
    noAdjustmentSaved: "Ingen justering lagret.",
    notesLabel: "Notat:",
    noReflectionSaved: "Ingen refleksjon lagret.",
    noCheckInYet: "Ingen ukentlig innsjekk registrert enda.",
    nextActions: "Neste tiltak",
    onTrack: "Bra jobba. Du er i rute denne uken.",
    trendGraphAriaLabel: "Trendgraf",
    nextActionLogEnergy: (count) => `Logg energi for ${count} ${count === 1 ? "dag" : "dager"} til`,
    nextActionLogSleep: (count) => `Logg søvn for ${count} ${count === 1 ? "dag" : "dager"} til`,
    nextActionAddStrength: (count) =>
      `Mangler ${count} ${count === 1 ? "styrkeøkt" : "styrkeøkter"} denne uken`,
    nextActionAddWalk: (count) => `Mangler ${count} ${count === 1 ? "gåtur" : "gåturer"} denne uken`,
    nextActionWeeklyCheckIn: "Ukentlig veiing og refleksjon mangler"
  },

  log: {
    titleToday: "Logg i dag",
    titleDate: (date) => `Logg — ${date}`,
    prevDayLabel: "Forrige dag",
    today: "I dag",
    nextDayLabel: "Neste dag",
    autoSaveHint: "Lagrer automatisk når du går ut av feltet. Du kan gå opptil 2 uker tilbake.",
    energyLabel: "Energi kl. 15:00 (1-5)",
    sleepOkLabel: "Søvn ok?",
    sleepHoursLabel: "Sovntimer (valgfritt)",
    sleepHoursPlaceholder: "f.eks. 7,5",
    addWalkButton: "+ Gåtur 20 min",
    addStrengthButton: "+ Styrkeøkt",
    activitiesToday: "Dagens aktiviteter",
    activitiesDate: (date) => `Aktiviteter — ${date}`,
    noWorkoutsYet: "Ingen økter loggført enda.",
    saveFailed: "Kontroller feltene dine.",
    activityDeleted: "Aktivitet slettet"
  },

  checkIn: {
    title: "Ukentlig veiing",
    weekStarting: (date) => `Uke som starter ${date} (mandag)`,
    prevWeekLabel: "Forrige uke",
    thisWeek: "Denne uken",
    nextWeekLabel: "Neste uke",
    weightLabel: "Vekt (kg)",
    weightPlaceholder: "f.eks. 75,5",
    adjustmentLabel: "En justering for neste uke",
    saveFailed: "Skriv inn en gyldig vekt."
  },

  workout: {
    pageTitle: "Intervalløkt",
    description:
      "3 runder, 9 øvelser per runde, 40 sekunder arbeid og 20 sekunder pause. 120 sekunder pause mellom rundene.",
    articleLinkText: "Les artikkelen: Fysiologens favorittøkt (fvn.no) ↗",
    warmupTitle: "Oppvarming",
    warmupDescription:
      "8-10 minutter før hoveddelen. Eksempler: rask gange, lette knebøy, gående utfall og jumping jacks.",
    formReminder: "Utfør hver repetisjon med god holdning, aktiv kjernemuskulatur og kontrollert bevegelse.",
    phase: {
      idle: "VENTER",
      countdown: "KLAR!",
      work: "JOBB",
      rest: "HVIL",
      roundRest: "HVILE MELLOM RUNDER",
      complete: "FERDIG"
    },
    getReady: "Gjør deg klar...",
    roundExercise: (round, exercise) => `Runde ${round} - Øvelse ${exercise}`,
    statusTitle: "Status",
    activeExercise: "Aktiv øvelse:",
    nextExercise: "Neste øvelse:",
    lastInterval: "Ingen - siste intervall",
    sessionRunning: "Økten er i gang.",
    pressStartToContinue: "Trykk Start for å fortsette.",
    progressTitle: "Fremdrift",
    progressText: (completed, total, pct) => `${completed} / ${total} øvelser fullført (${pct}%)`,
    progressAriaLabel: "Fremdrift i prosent",
    controlsTitle: "Kontroller",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    unmuteLabel: "Skru på lyd",
    muteLabel: "Skru av lyd",
    soundOff: "Lyd av",
    soundOn: "Lyd på",
    exercisesInRound: "Øvelser i runden",
    watchVideo: "Se video ↗",
    watchVideoAria: (name) => `Se video for ${name}`,
    confirmReset: "Vil du nullstille progresjonen for denne økten?",
    summaryTitle: "Økten er fullført!",
    summaryBody: "Bra jobba! Du har gjennomført hele intervalløkten.",
    summaryStats: (rounds, steps) => `${rounds} runder fullført, ${steps} intervaller gjennomført.`,
    restart: "Start på nytt"
  },

  settings: {
    title: "Innstillinger",
    languageTitle: "Språk",
    remindersTitle: "Påminnelser (valgfritt)",
    energyReminderLabel: "Daglig energipåminnelse kl. 15:00",
    strengthReminderLabel: "Morgenpåminnelse for styrkeøkt",
    strengthHourLabel: "Klokkeslett for styrkepåminnelse (0-23)",
    enableNotificationsButton: "Aktiver nettleservarsler",
    notificationPermission: (perm) => `Varslingstillatelse: ${perm}`,
    backupTitle: "Sikkerhetskopi",
    storageSummary: (daily, checkIns, workouts) =>
      `Lagret nå: daglige logger ${daily}, ukentlige innsjekker ${checkIns}, økter ${workouts}`,
    refreshStorageButton: "Oppdater antall lagrede",
    exportButton: "Eksporter sikkerhetskopi (JSON)",
    backupFilenamePrefix: "helseloggen-sikkerhetskopi",
    importLabel: "Importer sikkerhetskopi-JSON",
    importModeTitle: "Importmodus",
    importModeOverwrite: "Overskriv eksisterende data med sikkerhetskopien",
    importModeMerge: "Slå sammen med eksisterende data",
    importModeHint:
      "Overskriv sletter dagens lokale data før import. Slå sammen beholder eksisterende data og oppdaterer poster med samme nøkkel.",
    importOverwriteButton: "Importer og overskriv",
    importMergeButton: "Importer og slå sammen",
    confirmOverwrite:
      "Dette vil overskrive alle lokale data med innholdet i sikkerhetskopien. Vil du fortsette?",
    exportSuccess: "Sikkerhetskopi eksportert og nedlasting startet.",
    exportFailed: "Eksport av sikkerhetskopi mislyktes. Kontroller at lokale data er gyldige.",
    importOverwriteSuccess: "Sikkerhetskopi importert og eksisterende data overskrevet.",
    importMergeSuccess: "Sikkerhetskopi importert og slått sammen med eksisterende data.",
    importFailed: "Import av sikkerhetskopi mislyktes.",
    storageSummaryFailed: "Kunne ikke lese oppsummering av lokal lagring.",
    backupTooLarge: "Sikkerhetskopien er for stor. Maks størrelse er 5 MB.",
    backupInvalidJson: "Sikkerhetskopien må være gyldig JSON."
  },

  notifications: {
    energyTitle: "Energi-innsjekk",
    energyBody: "Hvordan er energien din akkurat nå på en skala fra 1 til 5?",
    strengthTitle: "Styrkepåminnelse",
    strengthBody: "Planlegg en styrkeøkt i morgen tidlig."
  }
};
