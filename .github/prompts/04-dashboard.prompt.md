# Dashboard + trends

Create a dashboard that shows the 6‑week loop status.

## Must show
- This week: adherence % + green/yellow/red
- Weight trend (line)
- Energy average per week (bar or line)
- Sleep ok nights per week (bar)
- Recent workouts list
- Next actions (derived): if Strength A not done this week → suggest

## Constraints
- Keep charts simple (small dependency; prefer lightweight chart lib or simple SVG).
- Should work offline.

## Deliverables
- `src/app/page.tsx` (dashboard)
- `src/features/dashboard/*`
- unit tests for any trend helpers
