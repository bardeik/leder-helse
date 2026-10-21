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

## Open development dependency advisory / Åpent varsel for utviklingsavhengighet
- `npm audit` reports GHSA-vfj7-8cjw-p6xm (CVE-2026-93687), a high-severity stack-exhaustion issue in `braces@3.0.3`. The affected development-only path is `eslint-config-next@16.4.0` -> `@next/eslint-plugin-next@16.4.0` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`. The audit reports five affected packages in this same dependency chain.
- As checked on 2026-10-20, GitHub lists no patched `braces` release and npm's latest version is 3.0.3. The compatible Next.js 16.4.2 lint config still resolves the affected chain. npm's suggested `eslint-config-next@14.2.35` fix is a major downgrade and is not accepted.
- Residual risk: the vulnerable package is in the development/lint toolchain, not the production dependency set. `npm audit --omit=dev --audit-level=high` reports zero vulnerabilities. Keep this production audit gate enabled.
- Owner: repository maintainers. Recheck by 2026-11-20, or earlier when a patched `braces` release or compatible upstream lint-tool update becomes available.
- `npm audit` rapporterer GHSA-vfj7-8cjw-p6xm (CVE-2026-93687), en høyt alvorlig stack exhaustion-sårbarhet i `braces@3.0.3`. Den berørte utviklingsavhengighetskjeden er `eslint-config-next@16.4.0` -> `@next/eslint-plugin-next@16.4.0` -> `fast-glob@3.3.1` -> `micromatch@4.0.8` -> `braces@3.0.3`. Revisjonen rapporterer fem berørte pakker i samme avhengighetskjede.
- Kontrollert 2026-10-20: GitHub har ingen patchet `braces`-versjon, og nyeste versjon på npm er 3.0.3. Den kompatible Next.js 16.4.2 lint-konfigurasjonen bruker fortsatt den berørte kjeden. npm foreslår `eslint-config-next@14.2.35`, som er en nedgradering av hovedversjonen og ikke godtas.
- Restrisiko: den sårbare pakken finnes i utviklings-/lint-verktøykjeden, ikke i produksjonsavhengighetene. `npm audit --omit=dev --audit-level=high` rapporterer null sårbarheter. Behold denne produksjonskontrollen aktiv.
- Ansvarlig: vedlikeholderne av repositoriet. Kontroller på nytt innen 2026-11-20, eller tidligere dersom en patchet `braces`-versjon eller kompatibel oppdatering av lint-verktøyene blir tilgjengelig.

## Current security constraints / Gjeldende sikkerhetsgrenser
- Backup import is local and user-initiated, with a 5 MB pre-parse size limit and a maximum of 10,000 imported records per collection.
- Imported backup collections fail fast with clear validation errors when malformed.
- Persisted timestamps must match the canonical UTC format `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Production responses use HSTS, COOP, CORP, and CSP with no `unsafe-inline` or `unsafe-eval` in `script-src`. Static inline script hashes and SHA-256 SRI secure Next.js assets without changing static rendering.
- Sikkerhetskopi-import er lokal og brukerinitiert, med 5 MB grense før parsing og maks 10 000 importerte poster per samling.
- Importerte sikkerhetskopier feiler raskt med tydelige valideringsfeil ved feil format.
- Lagrede tidsstempler må følge den kanoniske UTC-formen `YYYY-MM-DDTHH:mm:ss.sssZ`.
- Produksjon bruker HSTS, COOP, CORP og CSP uten `unsafe-inline` eller `unsafe-eval` i `script-src`. Hashverdier for statiske inline-skript og SHA-256 SRI sikrer Next.js-ressurser uten å endre statisk rendering.
