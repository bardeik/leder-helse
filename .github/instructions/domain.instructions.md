---
applyTo: "src/domain/**/*"
description: "Domain model and calculations"
---

# Domain instructions

- Domain code must be framework-agnostic (no React, no browser APIs).
- Use pure functions for calculations (adherence, trends).
- Provide unit tests for any non-trivial calculation.
- Keep types in `types.ts` and schemas in `schemas.ts` using Zod.
- Use ISO dates (YYYY-MM-DD) for day identifiers.
