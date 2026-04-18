---
applyTo: "**/*.{ts,tsx}"
description: "Frontend + UI rules"
---

# Frontend instructions

- Use React functional components and hooks.
- Accessibility: semantic HTML, labels for inputs, keyboard navigable controls.
- Keep components presentational when possible; move logic into hooks under `/src/features/**/hooks`.
- Prefer CSS modules or Tailwind (if already configured) — but keep styling minimal.
- Avoid heavy UI libraries unless necessary.
- Ensure forms validate with Zod schemas from `/src/domain`.
- Provide loading/empty states for lists and charts.
