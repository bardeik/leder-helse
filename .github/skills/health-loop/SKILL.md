---
name: health-loop
description: >-
  Skill for implementing and extending the Leader Health Loop app with the
  repository's existing architecture, UX patterns, and validation/test
  standards.
user-invocable: true
---

# Skill: Leader Health Loop

When the user asks for health-loop features, load this skill.

## What this skill knows
- The 6-week loop metrics: weight (weekly), energy 1–5, sleep ok yes/no.
- Workouts: Strength A, Strength B, Walk.
- Status thresholds: green >=80%, yellow 50–79%, red <50% adherence.

## Implementation status
All MVP features are implemented. Key things already in place:
- Auto-save on Log Today (no Save button needed — don't add one)
- Auto-save on Weekly Check-In via input blur
- Date navigation on Log Today (useLogToday: selectedDate, goBack/goForward, MAX_PAST_DAYS=13)
- Date navigation on Weekly Check-In (current week plus 2 previous Monday-based weeks)
- Workout delete actions on Log Today (no undo button)
- PWA offline via next-pwa; update banner via PwaRegister.tsx
- Export/import backup in Settings
- Locale-aware number input parsing/formatting for weight and sleep hours
- Portal-based save toast fixed to the visible mobile viewport
- Playwright mobile E2E coverage for save-toast visibility
- Auto-save toast text in UI: "Endringer lagret"

## Not yet built (valid next features)
- Push notifications (needs server component)
- Cloud sync

## How to respond
- Before implementing: read the relevant existing files to avoid duplicating patterns.
- Preserve auto-save, date navigation, and safe-area padding conventions.
- Preserve the portal-based save toast so it remains visible while mobile users scroll.
- Prefer minimal UI steps and simple data model.
- Always propose small increments.
- Provide unit tests for any new domain calculations.
- Run `npm run lint` and `npm run test` and report results. If the change affects viewport behavior or user flows, also run `npm run test:e2e`.
