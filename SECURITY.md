# Security Policy

## Core Principles

- Never commit secrets, API keys, tokens, or customer/company confidential data.
- Treat AI-generated output as third-party code and review before merge.
- Keep the app local-first and offline-friendly by default.

## Secure Development Checklist

### Run tests and linters before committing

- `npm run lint`
- `npm run test`
- `npm run build`
- Keep dependencies patched (`npm audit` + regular updates).
- Next.js baseline is patched to `^16.2.6` (outside the previously affected `<16.2.5` range).
- Use Zod schemas in `src/domain/schemas.ts` to define validation intent and shared data shapes.
- Treat runtime validators in `src/domain/validation.ts` as authoritative for persistence/import boundaries.
- Use least privilege if new APIs/services are introduced.

## Validation Boundaries

- UI and domain code reuse Zod schemas for shape validation and normalization.
- Persistence, backup import, and tamper-prone browser storage must still pass the runtime validation layer before data is accepted.
- Do not bypass runtime validation for IndexedDB writes, backup restore, or localStorage-derived settings.

## Current Security Constraints

- Backup import is local and user-initiated, with a 5 MB pre-parse size limit and a maximum of 10,000 imported records per collection.
- Imported backup collections fail fast with clear validation errors when an item or collection is malformed.
- Persisted timestamps must match the canonical UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Production responses use a stricter CSP/header set than development, including HSTS, COOP, and CORP; development keeps the looser CSP needed for hot reload.

## Data Handling

- Health logs are stored in browser IndexedDB via Dexie.
- No remote transmission is required for core features.
- Backup/import uses JSON initiated by the user and validated locally before merge/overwrite.

## Reporting a Vulnerability

1. Do not publish exploit details in public issues.
2. Share a private report with reproduction steps, impact, and affected files.
3. Include suggested mitigation if known.
