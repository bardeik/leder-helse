---
applyTo: "**/*.{ts,tsx}"
description: "Frontend + UI rules"
---

# Frontend instructions

## General

- Use React functional components and hooks.
- Accessibility: semantic HTML, labels for inputs, keyboard-navigable controls.
- Keep components presentational when possible; move logic into hooks under `/src/features/**/hooks`.
- Styles are plain CSS in `src/app/globals.css`. No Tailwind, no CSS modules, no UI library.
- Avoid heavy UI libraries.
- Ensure forms validate with Zod schemas from `/src/domain`.
- Provide loading/empty states for lists.

## Auto-save pattern (already implemented on /log)

- Save on every field change: radio buttons use `onChange`, text inputs use `onBlur`.
- No manual Save button on Log Today or Weekly Check-In.
- Show a transient "Endringer lagret" message for 1800ms via a `messageTimer` ref.
- Render the save toast through `src/components/FloatingSaveNotice.tsx` so it remains fixed to the visible viewport on mobile.

## Date navigation pattern (already implemented on /log)

- `useLogToday` hook owns `selectedDate` state, bounded by `[minDate, today]`.
- Expose `canGoBack`, `canGoForward`, `goBack()`, `goForward()` from the hook.
- Use `‹` / `›` buttons disabled when at boundary. Show date or "I dag" label.
- `MAX_PAST_DAYS = 13` (14 days including today).
- Past-date workout `dateTime` must be `${date}T12:00:00.000Z` for stable ordering.

## Weekly Check-In pattern

- `useWeeklyCheckIn` owns `selectedWeekStart` and bounds it between the current week and 2 prior Monday-based weeks.
- Weight input uses locale-aware raw editing on focus and localized formatting on blur.
- Keep auto-save on blur for weight, notes, and adjustment.

## Numeric input behavior

- Weight and sleep-hours inputs must accept both `.` and `,` while editing.
- Preserve raw user input while the field is focused; format with locale-specific separators on blur.

## PWA / mobile

- `main` element must keep `padding-bottom: env(safe-area-inset-bottom, 0px)` for iPhone home-bar.
- Body min-height is `100svh` (with `100vh` fallback).
- Use Playwright mobile tests when changing toast positioning or other viewport-sensitive UI.
- Do not add `console.log` statements.
