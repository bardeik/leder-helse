# Implement domain model + calculations

Implement the domain layer for the 6‑week leader health loop.

## Entities

- DailyLog: date, energy(1–5), sleepOk(bool), sleepHours?(number), notes?
- WeeklyCheckIn: weekStartDate, weightKg, notes?, adjustment?
- WorkoutLog: dateTime, type(strengthA|strengthB|walk), durationMin?, notes?

## Calculations

- adherence for a week (counts for: daily energy logged, sleep logged, workouts done)
- green/yellow/red status:
  - green: >= 80% adherence
  - yellow: 50–79%
  - red: < 50%
- trend helpers for 6 weeks:
  - weight delta (week-to-week)
  - energy average per week
  - sleep-ok nights count per week

## Deliverables

- `src/domain/types.ts`, `src/domain/schemas.ts`, `src/domain/calc.ts`
- Unit tests in `src/domain/calc.test.ts`
