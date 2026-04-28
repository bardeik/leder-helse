---
applyTo: "src/domain/**/*"
description: "Domain model and calculations"
---

# Domain instructions

## Rules
- Domain code must be framework-agnostic (no React, no browser APIs, no Dexie imports).
- Use pure functions for all calculations (adherence, trends, status thresholds).
- Keep types in `types.ts` and Zod schemas in `schemas.ts`.
- Use ISO dates: day identifiers as `YYYY-MM-DD`, timestamps as full ISO-8601.

## Key types (src/domain/types.ts)
```ts
WorkoutType:    "strengthA" | "strengthB" | "walk"
HealthStatus:   "green" | "yellow" | "red"
DailyLog:       { date, energy(1-5), sleepOk, sleepHours?, notes? }
WeeklyCheckIn:  { weekStartDate, weightKg, notes?, adjustment? }
WorkoutLog:     { id?, dateTime, date, type, durationMin?, notes? }
WeeklyAdherence:{ weekStartDate, energyDays, sleepDays, workouts, adherencePercent, status }
WeeklyTrendPoint:{ weekStartDate, weightKg?, weightDeltaKg?, energyAverage?, sleepOkCount }
```

## Adherence thresholds
- green: >= 80% adherence
- yellow: 50-79%
- red: < 50%

## Test coverage
- `src/domain/calc.test.ts` — 7 tests for adherence + status calculations (including prorated adherence), workout progress, and weekly trends
- Provide unit tests for any non-trivial calculation added.
