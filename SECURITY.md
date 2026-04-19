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
- Validate all user input with Zod schemas in `src/domain/schemas.ts`.
- Use least privilege if new APIs/services are introduced.

## Data Handling

- Health logs are stored in browser IndexedDB via Dexie.
- No remote transmission is required for core features.
- Backup/import uses JSON initiated by the user.

## Reporting a Vulnerability

1. Do not publish exploit details in public issues.
2. Share a private report with reproduction steps, impact, and affected files.
3. Include suggested mitigation if known.
