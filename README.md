# Leader Health Loop — 6-week tracker (PWA)

Dette repoet er laget for å la **GitHub Copilot** bygge en enkel app som hjelper deg å holde kontroll på en 6‑ukers «leder‑helse loop»:
- Ukentlig vekt
- Daglig energi (kl. 15, 1–5)
- Daglig søvn (OK ja/nei)
- Økter: Styrke A/B + gåtur

## Quick start
1. Installer Node.js 20+
2. `npm install`
3. `npm run dev`

## Struktur
- `src/domain` — typer, validering og beregninger (testbar)
- `src/data` — lokal lagring (IndexedDB/Dexie)
- `src/features` — funksjonelle moduler
- `src/app` — Next.js pages (App Router)

## Copilot
- Repo-wide instruksjoner: `.github/copilot-instructions.md`
- Path-specific: `.github/instructions/*.instructions.md`
- Reusable prompts: `.github/prompts/*.prompt.md`

Start i Copilot Chat med prompten: `00-bootstrap`.
