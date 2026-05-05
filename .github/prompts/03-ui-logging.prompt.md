# Build the logging UX (2 taps)

Implement the primary user flows.

## Pages

- /log: Log Today
  - Energy (1–5)
  - Sleep OK (yes/no) + optional hours
  - Quick buttons: +Walk 20m, +Strength A, +Strength B
  - Notes
  - Save
- /check-in: Weekly weigh-in
  - Weight kg
  - Notes
  - "One adjustment" text field

## Rules

- Mobile-first
- Persist to repositories
- Show confirmation toast
- Avoid heavy UI libraries

## Deliverables

- `src/app/log/page.tsx`, `src/app/check-in/page.tsx`
- feature components/hooks under `/src/features/logging`
