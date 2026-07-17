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

## Current security constraints / Gjeldende sikkerhetsgrenser
- Backup import is local and user-initiated, with a 5 MB pre-parse size limit and a maximum of 10,000 imported records per collection.
- Imported backup collections fail fast with clear validation errors when malformed.
- Persisted timestamps must match the canonical UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Production responses use HSTS, COOP, CORP, and a stricter CSP than development.
- Sikkerhetskopi-import er lokal og brukerinitiert, med 5 MB grense før parsing og maks 10 000 importerte poster per samling.
- Importerte sikkerhetskopier feiler raskt med tydelige valideringsfeil ved feil format.
- Lagrede tidsstempler må følge den kanoniske UTC-formen `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Produksjon bruker HSTS, COOP, CORP og en strengere CSP enn utvikling.
