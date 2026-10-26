# Security Policy / Sikkerhetspolicy

## Core principles / Grunnprinsipper
- Never commit secrets, API keys, tokens, or customer/company confidential data.
- Treat AI-generated output as third-party code and review before merge.
- Keep the app local-first and offline-friendly by default.
- Aldri commit secrets, API-nøkler, tokens eller konfidensiell kunde-/firmadata.
- Behandle AI-generert innhold som tredjepartskode og gjennomgå før sammenslåing.
- Hold appen lokal-først og offline-vennlig som standard.

## Secure development / Sikker utvikling
- Run `npm run lint`, `npm run test`, and `npm run build` before shipping.
- CI enforces `npm ci`, production `npm audit --omit=dev --audit-level=high`, lint, test, and build on push/PR.
- Keep dependencies patched and current.
- Use Zod schemas and runtime validators at persistence/import boundaries.
- New locale text must exist in both Norwegian and English, and translation parity tests must pass.
- Kjør `npm run lint`, `npm run test` og `npm run build` før publisering.
- CI håndhever `npm ci`, produksjons-`npm audit --omit=dev --audit-level=high`, lint, test og build på push/PR.
- Hold avhengigheter oppdatert og patchet.
- Bruk Zod-skjemaer og runtime-validering ved lagring/import.
- Ny tekst må finnes både på norsk og engelsk, og paritetstester for oversettelser må passere.

## Development dependency advisory / Varsel for utviklingsavhengighet
- GHSA-vfj7-8cjw-p6xm for `braces@3.0.3` was withdrawn. The package remains in the development-only path `eslint-config-next@16.4.3` -> `@next/eslint-plugin-next@16.4.3` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`; no patched `braces` release is available. As of 2026-10-26, `npm audit` reports no vulnerabilities. Keep the production audit gate enabled.
- GHSA-vfj7-8cjw-p6xm for `braces@3.0.3` er trukket tilbake. Pakken finnes fortsatt i den utviklingsavhengige kjeden `eslint-config-next@16.4.3` -> `@next/eslint-plugin-next@16.4.3` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`; det finnes ingen patchet `braces`-versjon. Per 2026-10-26 rapporterer `npm audit` ingen sårbarheter. Behold produksjonskontrollen aktiv.

## Current security constraints / Gjeldende sikkerhetsgrenser
- Backup import is local and user-initiated, with a 5 MB pre-parse size limit and a maximum of 10,000 imported records per collection.
- Imported backup collections fail fast with clear validation errors when malformed.
- Persisted timestamps must match the canonical UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Production responses use HSTS, COOP, CORP, and CSP with no `unsafe-inline` or `unsafe-eval` in `script-src`. Static inline script hashes and SHA-256 SRI secure Next.js assets without changing static rendering.
- Sikkerhetskopi-import er lokal og brukerinitiert, med 5 MB grense før parsing og maks 10 000 importerte poster per samling.
- Importerte sikkerhetskopier feiler raskt med tydelige valideringsfeil ved feil format.
- Lagrede tidsstempler må følge den kanoniske UTC-formen `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Produksjon bruker HSTS, COOP, CORP og CSP uten `unsafe-inline` eller `unsafe-eval` i `script-src`. Hashverdier for statiske inline-skript og SHA-256 SRI sikrer Next.js-ressurser uten å endre statisk rendering.
