import type { TranslationDict } from "@/i18n/types";

export const en: TranslationDict = {
  intlLocale: "en-US",

  common: {
    yes: "Yes",
    no: "No",
    delete: "Delete",
    notes: "Notes",
    notesOptional: "Notes (optional)",
    busy: "Working...",
    saving: "Saving...",
    saveConfirm: "Changes saved"
  },

  languagePrompt: {
    title: "Choose language",
    body: "Which language do you want to use in the app?",
    norskButton: "Norsk",
    englishButton: "English"
  },

  nav: {
    brandName: "Health Loop",
    mainNavigationLabel: "Main navigation",
    menuOpenLabel: "Open menu",
    pages: {
      home: "Overview",
      log: "Log today",
      checkIn: "Weekly check-in",
      workout: "Workout",
      settings: "Settings"
    }
  },

  workoutType: {
    strength: "Strength workout",
    walk: "Walk"
  },

  dashboard: {
    loadingData: "Loading local data...",
    motivationSection: "Today's motivation",
    thisWeek: "This week",
    adherenceFormat: (pct) => `${pct}% adherence`,
    statusLabel: {
      green: "green",
      yellow: "yellow",
      red: "red"
    },
    energyLabel: "Energy",
    sleepLabel: "Sleep",
    strengthWorkoutsLabel: "Strength workouts",
    walksLabel: "Walks",
    weeklyCheckInLabel: "Weekly check-in",
    registered: "Registered",
    missing: "Missing",
    daysOf7Format: (count) => `${count} of 7 days`,
    ofGoalFormat: (current, total) => `${current} of ${total}`,
    completeThisWeek: "Complete this week.",
    daysMissing: (count) => `${count} ${count === 1 ? "day missing" : "days missing"}.`,
    strengthGoalReached: "This week's strength goal is complete.",
    strengthWorkoutsRemaining: (count) => `${count} ${count === 1 ? "strength workout left" : "strength workouts left"}.`,
    walksGoalReached: "This week's walks are logged.",
    walksRemaining: (count) => `${count} ${count === 1 ? "walk left" : "walks left"}.`,
    weightLoggedThisWeek: "Weight has been logged for this week.",
    weightNotLogged: "Add weight and reflection to complete the week.",
    weightTrend: "Weight trend",
    energyAverage: "Energy average",
    sleepNights: "Nights with enough sleep",
    noDataYet: "No data yet.",
    noComparableWeek: "No comparable week yet.",
    trendValueWeight: (val) => `${val} kg`,
    trendValueEnergy: (val) => `${val} avg`,
    trendValueSleep: (val) => `${val} nights`,
    trendChangeWeight: (delta) => `${delta} kg since the previous weigh-in`,
    trendChangeEnergy: (delta) => `${delta} since the previous comparable week`,
    trendChangeSleep: (delta) => `${delta} nights since the previous comparable week`,
    recentWorkouts: "Recent workouts",
    noWorkoutsYet: "No workouts logged yet.",
    latestReflection: "Latest weekly reflection",
    weightRegisteredForWeek: (weight, weekStart) => `${weight} kg logged for the week starting ${weekStart}.`,
    adjustmentLabel: "Adjustment:",
    noAdjustmentSaved: "No adjustment saved.",
    notesLabel: "Notes:",
    noReflectionSaved: "No reflection saved.",
    noCheckInYet: "No weekly check-in logged yet.",
    nextActions: "Next actions",
    onTrack: "Nice work. You're on track this week.",
    trendGraphAriaLabel: "Trend chart",
    nextActionLogEnergy: (count) => `Log energy for ${count} more ${count === 1 ? "day" : "days"}`,
    nextActionLogSleep: (count) => `Log sleep for ${count} more ${count === 1 ? "day" : "days"}`,
    nextActionAddStrength: (count) => `Missing ${count} ${count === 1 ? "strength workout" : "strength workouts"} this week`,
    nextActionAddWalk: (count) => `Missing ${count} ${count === 1 ? "walk" : "walks"} this week`,
    nextActionWeeklyCheckIn: "Weekly weigh-in and reflection missing"
  },

  log: {
    titleToday: "Log today",
    titleDate: (date) => `Log — ${date}`,
    prevDayLabel: "Previous day",
    today: "Today",
    nextDayLabel: "Next day",
    autoSaveHint: "Saves automatically when you leave a field. You can go back up to 2 weeks.",
    energyLabel: "Energy at 3 PM (1-5)",
    sleepOkLabel: "Sleep okay?",
    sleepHoursLabel: "Sleep hours (optional)",
    sleepHoursPlaceholder: "e.g. 7.5",
    addWalkButton: "+ Walk 20 min",
    addStrengthButton: "+ Strength workout",
    activitiesToday: "Today's activities",
    activitiesDate: (date) => `Activities — ${date}`,
    noWorkoutsYet: "No workouts logged yet.",
    saveFailed: "Check your fields.",
    activityDeleted: "Activity deleted"
  },

  checkIn: {
    title: "Weekly check-in",
    weekStarting: (date) => `Week starting ${date} (Monday)`,
    prevWeekLabel: "Previous week",
    thisWeek: "This week",
    nextWeekLabel: "Next week",
    weightLabel: "Weight (kg)",
    weightPlaceholder: "e.g. 75.5",
    adjustmentLabel: "An adjustment for next week",
    saveFailed: "Enter a valid weight."
  },

  workout: {
    pageTitle: "Workout",
    description:
      "3 rounds, 9 exercises per round, 40 seconds work and 20 seconds rest. 120 seconds rest between rounds.",
    articleLinkText: "Read the article: The physiologist's favourite workout (fvn.no) ↗",
    warmupTitle: "Warm-up",
    warmupDescription:
      "8-10 minutes before the main workout. Examples: brisk walking, bodyweight squats, walking lunges, and jumping jacks.",
    formReminder: "Perform each rep with good posture, an active core, and controlled movement.",
    phase: {
      idle: "WAITING",
      countdown: "READY!",
      work: "WORK",
      rest: "REST",
      roundRest: "REST BETWEEN ROUNDS",
      complete: "DONE"
    },
    getReady: "Get ready...",
    roundExercise: (round, exercise) => `Round ${round} - Exercise ${exercise}`,
    statusTitle: "Status",
    activeExercise: "Active exercise:",
    nextExercise: "Next exercise:",
    lastInterval: "None - last interval",
    sessionRunning: "The workout is running.",
    pressStartToContinue: "Press Start to continue.",
    progressTitle: "Progress",
    progressText: (completed, total, pct) => `${completed} / ${total} exercises complete (${pct}%)`,
    progressAriaLabel: "Progress percentage",
    controlsTitle: "Controls",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    countdownStart: "Start",
    countdownPause: "Pause",
    nextExerciseAnnouncement: (name) => `Next exercise: ${name}`,
    unmuteLabel: "Turn sound on",
    muteLabel: "Turn sound off",
    soundOff: "Sound off",
    soundOn: "Sound on",
    exercisesInRound: "Exercises in the round",
    watchVideo: "Watch video ↗",
    watchVideoAria: (name) => `Watch video for ${name}`,
    confirmReset: "Do you want to reset the progress for this workout?",
    summaryTitle: "Workout complete!",
    summaryBody: "Great job! You completed the full interval workout.",
    summaryStats: (rounds, steps) => `${rounds} rounds complete, ${steps} intervals completed.`,
    restart: "Start again"
  },

  settings: {
    title: "Settings",
    languageTitle: "Language",
    remindersTitle: "Reminders (optional)",
    energyReminderLabel: "Daily energy reminder at 3 PM",
    strengthReminderLabel: "Morning reminder for strength workout",
    strengthHourLabel: "Strength reminder time (0-23)",
    enableNotificationsButton: "Enable browser notifications",
    notificationPermission: (perm) => `Notification permission: ${perm}`,
    backupTitle: "Backup",
    storageSummary: (daily, checkIns, workouts) =>
      `Saved now: daily logs ${daily}, weekly check-ins ${checkIns}, workouts ${workouts}`,
    refreshStorageButton: "Refresh saved counts",
    exportButton: "Export backup (JSON)",
    backupFilenamePrefix: "leader-health-loop-backup",
    importLabel: "Import backup JSON",
    importModeTitle: "Import mode",
    importModeOverwrite: "Overwrite existing data with the backup",
    importModeMerge: "Merge with existing data",
    importModeHint:
      "Overwrite clears today's local data before import. Merge keeps existing data and updates items with the same key.",
    importOverwriteButton: "Import and overwrite",
    importMergeButton: "Import and merge",
    confirmOverwrite:
      "This will overwrite all local data with the contents of the backup. Do you want to continue?",
    exportSuccess: "Backup exported and download started.",
    exportFailed: "Backup export failed. Check that local data is valid.",
    importOverwriteSuccess: "Backup imported and existing data overwritten.",
    importMergeSuccess: "Backup imported and merged with existing data.",
    importFailed: "Backup import failed.",
    storageSummaryFailed: "Could not read local storage summary.",
    backupTooLarge: "Backup is too large. Maximum size is 5 MB.",
    backupInvalidJson: "Backup must be valid JSON."
  },

  notifications: {
    energyTitle: "Energy check-in",
    energyBody: "How is your energy right now on a scale from 1 to 5?",
    strengthTitle: "Strength reminder",
    strengthBody: "Plan a strength workout for tomorrow morning."
  }
};
