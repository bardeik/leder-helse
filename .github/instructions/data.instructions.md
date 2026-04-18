---
applyTo: "src/data/**/*"
description: "Local persistence (IndexedDB/Dexie)"
---

# Data layer instructions

## Database setup
- DB class: `LeaderHealthDb` in `src/data/db.ts`; DB name: `leader-health-loop`
- Use Dexie 4. Keep version upgrades explicit in `LeaderHealthDb.constructor`.
- Current schema (version 1):
  - `dailyLogs`: primary key `&date` (YYYY-MM-DD string)
  - `weeklyCheckIns`: primary key `&weekStartDate` (YYYY-MM-DD string)
  - `workoutLogs`: auto-increment `++id`, indexed on `date`, `dateTime`, `type`

## Repositories
- One file per entity in `src/data/repositories/`: `dailyLogsRepo.ts`, `weeklyCheckInsRepo.ts`, `workoutLogsRepo.ts`
- Export a singleton object (e.g. `export const dailyLogsRepo = { ... }`)
- Key methods to follow: `get(date)`, `upsert(entity)`, `listByDate(date)` for workouts
- Never store secrets. Never expose raw db table outside the repository.

## Backup
- `src/data/backup.ts` handles export (full JSON dump) and import (merge/overwrite all tables).
- Tests in `src/data/backup.test.ts`.

## General rules
- Do not call Dexie directly from UI components — always go through a repository.
- Prefer `put` (upsert) over `add`+`update` gymnastics.
- All date keys are ISO `YYYY-MM-DD` strings; timestamps are full ISO-8601.
