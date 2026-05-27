export type Locale = "no" | "en";

export interface TranslationDict {
  /** BCP 47 locale tag used for Intl.DateTimeFormat etc. */
  intlLocale: string;

  common: {
    yes: string;
    no: string;
    delete: string;
    notes: string;
    notesOptional: string;
    busy: string;
    saving: string;
    saveConfirm: string;
  };

  languagePrompt: {
    title: string;
    body: string;
    norskButton: string;
    englishButton: string;
  };

  nav: {
    brandName: string;
    mainNavigationLabel: string;
    menuOpenLabel: string;
    pages: {
      home: string;
      log: string;
      checkIn: string;
      workout: string;
      settings: string;
    };
  };

  workoutType: {
    strength: string;
    walk: string;
  };

  dashboard: {
    loadingData: string;
    motivationSection: string;
    thisWeek: string;
    adherenceFormat: (pct: number) => string;
    statusLabel: {
      green: string;
      yellow: string;
      red: string;
    };
    energyLabel: string;
    sleepLabel: string;
    strengthWorkoutsLabel: string;
    walksLabel: string;
    weeklyCheckInLabel: string;
    registered: string;
    missing: string;
    daysOf7Format: (count: number) => string;
    ofGoalFormat: (current: number, total: number) => string;
    completeThisWeek: string;
    daysMissing: (count: number) => string;
    strengthGoalReached: string;
    strengthWorkoutsRemaining: (count: number) => string;
    walksGoalReached: string;
    walksRemaining: (count: number) => string;
    weightLoggedThisWeek: string;
    weightNotLogged: string;
    weightTrend: string;
    energyAverage: string;
    sleepNights: string;
    noDataYet: string;
    noComparableWeek: string;
    trendValueWeight: (val: string) => string;
    trendValueEnergy: (val: string) => string;
    trendValueSleep: (val: number) => string;
    trendChangeWeight: (delta: string) => string;
    trendChangeEnergy: (delta: string) => string;
    trendChangeSleep: (delta: string) => string;
    recentWorkouts: string;
    noWorkoutsYet: string;
    latestReflection: string;
    weightRegisteredForWeek: (weight: string, weekStart: string) => string;
    adjustmentLabel: string;
    noAdjustmentSaved: string;
    notesLabel: string;
    noReflectionSaved: string;
    noCheckInYet: string;
    nextActions: string;
    onTrack: string;
    trendGraphAriaLabel: string;
    nextActionLogEnergy: (count: number) => string;
    nextActionLogSleep: (count: number) => string;
    nextActionAddStrength: (count: number) => string;
    nextActionAddWalk: (count: number) => string;
    nextActionWeeklyCheckIn: string;
  };

  log: {
    titleToday: string;
    titleDate: (date: string) => string;
    prevDayLabel: string;
    today: string;
    nextDayLabel: string;
    autoSaveHint: string;
    energyLabel: string;
    sleepOkLabel: string;
    sleepHoursLabel: string;
    sleepHoursPlaceholder: string;
    addWalkButton: string;
    addStrengthButton: string;
    activitiesToday: string;
    activitiesDate: (date: string) => string;
    noWorkoutsYet: string;
    saveFailed: string;
    activityDeleted: string;
  };

  checkIn: {
    title: string;
    weekStarting: (date: string) => string;
    prevWeekLabel: string;
    thisWeek: string;
    nextWeekLabel: string;
    weightLabel: string;
    weightPlaceholder: string;
    adjustmentLabel: string;
    saveFailed: string;
  };

  workout: {
    pageTitle: string;
    description: string;
    articleLinkText: string;
    warmupTitle: string;
    warmupDescription: string;
    formReminder: string;
    phase: {
      idle: string;
      countdown: string;
      work: string;
      rest: string;
      roundRest: string;
      complete: string;
    };
    getReady: string;
    roundExercise: (round: number, exercise: number) => string;
    statusTitle: string;
    activeExercise: string;
    nextExercise: string;
    lastInterval: string;
    sessionRunning: string;
    pressStartToContinue: string;
    progressTitle: string;
    progressText: (completed: number, total: number, pct: number) => string;
    progressAriaLabel: string;
    controlsTitle: string;
    start: string;
    pause: string;
    reset: string;
    countdownStart: string;
    countdownPause: string;
    unmuteLabel: string;
    muteLabel: string;
    soundOff: string;
    soundOn: string;
    exercisesInRound: string;
    watchVideo: string;
    watchVideoAria: (name: string) => string;
    confirmReset: string;
    summaryTitle: string;
    summaryBody: string;
    summaryStats: (rounds: number, steps: number) => string;
    restart: string;
  };

  settings: {
    title: string;
    languageTitle: string;
    remindersTitle: string;
    energyReminderLabel: string;
    strengthReminderLabel: string;
    strengthHourLabel: string;
    enableNotificationsButton: string;
    notificationPermission: (perm: string) => string;
    backupTitle: string;
    storageSummary: (daily: string | number, checkIns: string | number, workouts: string | number) => string;
    refreshStorageButton: string;
    exportButton: string;
    backupFilenamePrefix: string;
    importLabel: string;
    importModeTitle: string;
    importModeOverwrite: string;
    importModeMerge: string;
    importModeHint: string;
    importOverwriteButton: string;
    importMergeButton: string;
    confirmOverwrite: string;
    exportSuccess: string;
    exportFailed: string;
    importOverwriteSuccess: string;
    importMergeSuccess: string;
    importFailed: string;
    storageSummaryFailed: string;
    backupTooLarge: string;
    backupInvalidJson: string;
  };

  notifications: {
    energyTitle: string;
    energyBody: string;
    strengthTitle: string;
    strengthBody: string;
  };
}
