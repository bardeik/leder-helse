# MVP Backlog — GitHub Issues (kopier/lim inn eller bulk-opprett)

## 1. MVP: Bootstrap prosjekt (Next.js + TypeScript + PWA grunnstruktur)

**Labels:** mvp,setup,frontend,pwa

## Bakgrunn

Vi trenger et minimalt, mobilvennlig og offline-first sporingsverktøy for 6-ukers leder-helse loop.

## Mål

- Kjørbar PWA (lokalt) med Next.js App Router + TypeScript strict
- Repo-struktur: src/domain, src/data, src/features, src/components

## Oppgaver

- [ ] Opprett Next.js prosjekt (App Router) med TypeScript strict
- [ ] Legg til PWA-støtte (manifest + service worker-basics)
- [ ] Legg til lint/format (minimum) og test-runner (Vitest)
- [ ] Lag enkel navigasjon: Dashboard, Logg i dag, Ukesjekk, Innstillinger

## Akseptansekriterier

- Appen starter lokalt og kan åpnes på mobil
- Navigasjon mellom sider fungerer
- `npm test` kjører (kan være en placeholder-test i starten)

## 2. MVP: Domene-modell + beregninger (adherence + grønn/gul/rød)

**Labels:** mvp,domain,backend,test

## Bakgrunn

Domene-logikken skal være testbar og uavhengig av UI.

## Leveranser

- DailyLog, WeeklyCheckIn, WorkoutLog (typer + validering)
- Beregninger:
  - Ukentlig adherence %
  - Status: grønn (>=80), gul (50-79), rød (<50)
  - 6-ukers trender: vekt-delta, energi-snitt, søvn-ok antall

## Oppgaver

- [ ] Definer typer og Zod-skjema
- [ ] Implementer calc-funksjoner
- [ ] Skriv unit tests for beregninger

## Akseptansekriterier

- Alle beregninger har unit tests
- Domenekode er «pure» (ingen browser/React-avhengigheter)

## 3. MVP: Lokal lagring (IndexedDB/Dexie) + repositories

**Labels:** mvp,data,backend

## Bakgrunn

Appen skal fungere offline og lagre alt lokalt (IndexedDB).

## Oppgaver

- [ ] Opprett Dexie DB med tabeller: dailyLogs (pk=date), weeklyCheckIns (pk=weekStartDate), workoutLogs (auto id)
- [ ] Repositories: upsert/get/listByRange/delete
- [ ] Indekser for effektiv range-spørring

## Akseptansekriterier

- Data kan lagres og hentes i offline modus
- Repositories har tydelige grensesnitt

## 4. MVP: Backup (eksport/import JSON) for brukerdata

**Labels:** mvp,data,privacy

## Bakgrunn

Bruker skal kunne ta backup uten sky.

## Oppgaver

- [ ] Eksporter alle tabeller til én JSON-fil
- [ ] Importer JSON og gjenopprett data (med validering)
- [ ] UI i Innstillinger: «Eksporter» og «Importer»

## Akseptansekriterier

- Eksportfil inneholder alle tabeller
- Import validerer schema og feiler med forståelig feilmelding ved ugyldig data

## 5. MVP UI: Logg i dag (energi 1–5, søvn ok, hurtigknapper for økter)

**Labels:** mvp,frontend,ux

## Bakgrunn

Primærflyt: 2 taps logging.

## Skjerm

/log

- Energi (1–5)
- Søvn OK (ja/nei) + valgfritt timer
- Hurtigknapper: +Gåtur 20m, +Styrke A, +Styrke B
- Notat

## Akseptansekriterier

- Kan lagre dagens logg på under 30 sek
- Lagrer i lokale repositories
- Viser tydelig «lagret»-bekreftelse

## 6. MVP UI: Ukesjekk (vekt + “én justering” for neste uke)

**Labels:** mvp,frontend,ux

## Skjerm

/check-in

- Vekt (kg)
- Notat
- Én justering (tekst)

## Akseptansekriterier

- Lagres som WeeklyCheckIn med uke-startdato
- Enkel visning av forrige check-in

## 7. MVP UI: Dashboard (uke-status + 6-ukers trender)

**Labels:** mvp,frontend,ux,dashboard

## Må vise

- Denne uke: adherence % + grønn/gul/rød
- Vekttrend (6 uker)
- Energi-snitt per uke
- Søvn-ok netter per uke
- Siste økter
- Neste anbefalte action (enkel regel)

## Akseptansekriterier

- Dashboard fungerer offline
- Trender er forståelige på mobil

## 8. MVP: PWA offline-first (cache strategi + installbar)

**Labels:** mvp,pwa,frontend

## Oppgaver

- [ ] Manifest (navn, ikon, theme color)
- [ ] Service worker / caching for app-shell
- [ ] Offline fallback for navigasjon

## Akseptansekriterier

- Appen kan installeres på mobil (PWA)
- Åpner og viser siste data uten nett

## 9. MVP: Enkle diagrammer uten tung avhengighet

**Labels:** mvp,frontend,ux

## Bakgrunn

Vi vil ha trender uten å dra inn tung chart-lib.

## Oppgaver

- [ ] Implementer enkle SVG-diagrammer (linje + stolpe)
- [ ] Sørg for tilgjengelighet (alt-text / data-tabell fallback)

## Akseptansekriterier

- Diagrammer fungerer på mobil
- Ingen unødvendig stor bundle

## 10. MVP: Innstillinger (påminnelser toggle, backup, personvern)

**Labels:** mvp,frontend,settings,privacy

## Oppgaver

- [ ] Side /settings
- [ ] Toggle for påminnelser (hvis implementert)
- [ ] Backup eksport/import UI
- [ ] Lenke til PRIVACY.md

## Akseptansekriterier

- Bruker kan finne og bruke backup-funksjoner
- Personvern er tydelig forklart

## 11. VALGFRI: Påminnelse kl 15:00 for energi (opt-in)

**Labels:** optional,frontend,notifications

## Bakgrunn

Påminnelse kan øke adherence.

## Krav

- Kun browser notifications
- Opt-in
- Kan slås av

## Akseptansekriterier

- Bruker kan skru på/av og teste varsel

## 12. VALGFRI: Morgenpåminnelser for Styrke A/B (opt-in, konfigurerbart)

**Labels:** optional,frontend,notifications

## Krav

- Opt-in
- Konfigurer dager/tid
- Ikke avhengig av server

## Akseptansekriterier

- Bruker kan velge tid og få varsel

## 13. Kvalitet: Unit test suite for domene + trendhelpers

**Labels:** mvp,test,domain

## Oppgaver

- [ ] Sørg for god dekning av domene-beregninger
- [ ] Test dato-/ukegruppering

## Akseptansekriterier

- Kritiske beregninger har tester
- Testene er raske og stabile

## 14. Dok: README, PRIVACY og SECURITY oppdatert for lokal lagring

**Labels:** mvp,docs,privacy,security

## Oppgaver

- [ ] Oppdater README med “how to use”
- [ ] Oppdater PRIVACY (local-first)
- [ ] Oppdater SECURITY (ingen secrets, review av Copilot-kode)

## Akseptansekriterier

- Docs beskriver appen og begrensninger tydelig

## 15. Tilgjengelighet: WCAG-sjekk av logging og dashboard

**Labels:** mvp,frontend,a11y

## Oppgaver

- [ ] Tastatur-navigasjon
- [ ] Labels og fokus
- [ ] Kontrast

## Akseptansekriterier

- Kritiske flyter er tilgjengelige
