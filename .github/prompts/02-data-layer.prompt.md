# Implement local persistence (Dexie)

Create the IndexedDB schema and repositories.

## Requirements
- Database name: leader-health-loop
- Tables:
  - dailyLogs (primary key: date)
  - weeklyCheckIns (primary key: weekStartDate)
  - workoutLogs (auto id) + indexed by date
- Repositories must expose:
  - upsert/get/listByRange/delete
- Provide export/import JSON for all tables.

## Deliverables
- `src/data/db.ts`
- `src/data/repositories/*.ts`
- `src/data/backup.ts`
- Unit tests for backup import/export (mocked) if feasible
