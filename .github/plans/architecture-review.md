<!-- markdownlint-disable MD024 -->

# Arkitekturgjennomgang: Helse Loop

Dato: 2026-08-07

## Sammendrag

Helse Loop er en moden lokal-først Next.js-applikasjon, ikke en prototype som bør erstattes med en stor omskriving. Kodebasen har allerede et nyttig skille mellom domene, Dexie-persistens, funksjonsområder, ruter og lokalisering. Det viktigste migreringsgrepet er derfor å bevare observerbar oppførsel og dataformat, samtidig som applikasjonslogikk flyttes ut av React-hooks og bak eksplisitte porter.

.NET MAUI med Blazor Hybrid og Blazor Web er et egnet mål, men eksisterende React/TypeScript-UI kan ikke gjenbrukes direkte. Det som kan gjenbrukes er domeneregler, datakontrakter, oversettelser, CSS-intensjon, testscenarioer og UX-kontrakter. Razor-komponentene må reimplementeres og kan deretter deles mellom Web og MAUI gjennom en Razor Class Library.

Migreringen bør skje side om side under `/dotnet`. Dagens Next.js-app skal forbli produksjonsreferanse til data-, funksjons- og kvalitetsparitet er bevist.

## Dagens teknologistakk

- Next.js 16 med App Router, React 19 og strict TypeScript.
- Dexie 4 over IndexedDB, database `leader-health-loop`, schema-versjon 2.
- Zod-skjemaer og separat håndskrevet runtime-validering.
- Vitest/jsdom med V8-dekningsterskler: 88 % linjer/funksjoner/statements og 75 % branches.
- Playwright for mobil Chrome, desktop Chrome og mobil Safari-profil.
- Standalone Next-container på Fly.io.
- GitHub Actions for installasjon, audit, lint, test, build, CodeQL og sikkerhetsheader-smoke.
- Lokal lagring av helseopplysninger; ingen API, autentisering, sky-synk eller serverdatabase.

## Faktisk arkitektur

```text
Next-ruter og React-komponenter
        |
        v
Feature-hooks og sideorkestrering
        |
        v
Konkrete Dexie-repositories og browser-API-er
        |
        v
Domeneobjekter, validering og beregninger
```

Dette er en brukbar lagdeling, men avhengighetsretningen er ikke konsekvent. React-hooks fungerer ofte samtidig som view model, use case, klokke og adapter.

## Domene

Sentrale filer:

- `src/domain/types.ts`: entiteter og backup-kontrakt.
- `src/domain/calc.ts`: ukegrenser, datoaritmetikk, adherence, treningsmål og trender.
- `src/domain/workouts.ts`: workout-normalisering og lokalisert formattering.
- `src/domain/localeNumber.ts`: tolerant parsing av punkt og komma.
- `src/domain/schemas.ts`: Zod-skjemaer.
- `src/domain/validation.ts`: håndskrevne validatorer og backup-parser.
- `src/domain/backupLimits.ts`: størrelses- og antallsgrenser.

### Styrker

- De viktigste beregningene er deterministiske og rammeverksuavhengige.
- Grønn/gul/rød-terskler og ukesmål er eksplisitte.
- Legacy-verdiene `strengthA` og `strengthB` normaliseres til `strength` ved import.
- Backup har streng UTC-tidsprofil, payload-grense og samlingsgrenser.
- Testene uttrykker forretningsreglene tydelig.

### Risikoer

- Zod og håndskrevet validering er to sannhetskilder som kan drive fra hverandre.
- ISO-dato valideres hovedsakelig som tekstformat, ikke alltid som gyldig kalenderdato.
- `src/domain/workouts.ts` importerer i18n-typer, slik at domenet inneholder presentasjonsansvar.
- JavaScript `Date` og `toISOString()` skjuler UTC-antakelser i kode som fremstår som ren dato-logikk.
- Den lokale kalenderdagen kan avvike fra UTC-dagen nær midnatt.

## Applikasjonslogikk

Sentrale orkestreringspunkter:

- `src/features/logging/hooks/useLogToday.ts`: dato-navigasjon, standardlogg, auto-save, workout add/delete og meldinger.
- `src/features/logging/hooks/useWeeklyCheckIn.ts`: uke-navigasjon, vekt-fallback og lagring.
- `src/app/page.tsx`: henting og sammensetning av dashboarddata.
- `src/features/dashboard/trends.ts`: dashboard-projeksjon blandet med lokalisert handlingstekst.
- `src/features/workout/hooks/useWorkoutTimer.ts`: state machine, klokkeintervall og persistens.
- `src/app/settings/page.tsx`: backup, påminnelser, filnedlasting og bekreftelser.

### Kritiske produktantakelser

1. Å besøke en dato uten data oppretter en standardlogg med energi 3 og søvn OK. Denne loggen teller i adherence og kan overvurdere faktisk registrering.
2. Ukentlig check-in bruker 80 kg som siste fallback. Et senere blur kan lagre denne verdien utilsiktet.
3. Treningstimeren oppretter ikke automatisk en `WorkoutLog`. Timer og aktivitetslogging er separate arbeidsflyter.
4. Web-påminnelser kjører bare mens siden er aktiv. De er ikke ekvivalente med OS-planlagte native varsler.
5. Datoer bruker UTC, mens reminder-time bruker lokal tid og UTC-dato som dedupliseringsnøkkel.

Disse punktene må besluttes eksplisitt før de porteres.

## Persistens og backup

Sentrale filer:

- `src/data/db.ts`: Dexie-database og schema-versjon 2.
- `src/data/repositories/*.ts`: CRUD og range queries.
- `src/data/backup.ts`: eksport, merge/overwrite-import og lagringsoversikt.

### Styrker

- Primærnøkler og indekser passer dagens arbeidsflyter.
- Validering skjer ved skrivegrensen.
- Overwrite-import er transaksjonell på tvers av tre tabeller.
- Ugyldig eller for stor backup avvises før skriving.

### Risikoer

- Repository-objektene er konkrete singletons, ikke applikasjonseide interfaces.
- `BackupDataSource` eksponerer Dexie-tabellmekanikk i stedet for en forretningskapabilitet.
- Numeriske workout-ID-er kan kollidere ved merge og overskrive eksisterende poster.
- Mock-transaksjonene i enhetstestene beviser ikke faktisk IndexedDB-rollback.
- IndexedDB og SQLite trenger egne, eksplisitte migreringsløp.
- Backupfilene er ukryptert JSON med sensitive personopplysninger.

## UI, tilgjengelighet og lokalisering

Dagens ruter er dashboard `/`, daglig logg `/log`, check-in `/check-in`, workout `/workout` og settings `/settings`. Det finnes ingen separat historikkside.

### Styrker

- Semantiske skjemaer og tastaturnavigerbare kontroller.
- Norsk Bokmål og engelsk med paritetstest.
- Auto-save uten unødvendige lagreknapper.
- 1800 ms save-notice via portal, testet i mobil viewport.
- Lokal tallredigering med både punkt og komma.
- Presentasjonskomponenter for workout er allerede godt delt opp.

### Risikoer

- JSX og React-hooks må reimplementeres i Razor.
- Oversettelsesordbøkene inneholder funksjoner; de kan ikke kopieres direkte til `.resx`.
- Portal, DOM-filnedlasting, `window.confirm`, document language og storage-events er browser-spesifikke.
- WebView trenger egne kontroller av safe areas, keyboard, fokus, resize og skjermleser.
- ExorLive-lenker gir tredjeparts-, lisens-, tilgjengelighets- og personvernrisiko.

## Plattformkapabiliteter i bruk

Dagens app bruker:

- IndexedDB.
- LocalStorage for språk, reminders, sendemarkører og workout-fremdrift.
- Browser Notification API.
- Web Audio og speech synthesis.
- Screen Wake Lock med audio-fallback.
- DOM-basert eksport/import.
- Eksterne treningsvideoer.
- Service worker- og cache-opprydding.

Disse bør abstraheres som smale kapabiliteter, eksempelvis:

- `IClock`
- `IDailyLogRepository`
- `IWeeklyCheckInRepository`
- `IWorkoutLogRepository`
- `IBackupStore`
- `ILocalePreferenceStore`
- `IReminderSettingsStore`
- `IWorkoutProgressStore`
- `INotificationPermissionService`
- `IReminderScheduler`
- `IFileImportService` og `IFileExportService`
- `IAudioCueService`
- `ISpeechService`
- `IKeepAwakeService`
- `IExternalUriLauncher`

Et generisk `IDeviceInfoService` bør ikke opprettes uten et konkret use case.

## Hva som kan gjenbrukes

Følgende kan porteres som kontrakter og karakterisering:

- Entitetsfelter og backup v1-format.
- Valideringsgrenser og kanonisk UTC-format.
- Mandagsbasert ukelogikk.
- Adherence, treningsmål og trendberegninger.
- 14-dagers og tre-ukers navigasjonsgrenser.
- Dashboard-projeksjoner.
- Timerfaser og aldri-autostart-etter-reload.
- Auto-save-semantikk og save-notice-varighet.
- Norsk/engelsk tekst og oversettelsesparitet.
- CSS-tokens, responsiv intensjon og tilgjengelighetskrav.
- Eksisterende testdata som golden cases.

Følgende må reimplementeres:

- React-sider, hooks og portaler som Razor-komponenter og application services.
- Dexie som browser IndexedDB-adapter og native SQLite-adapter.
- Browser-API-hooks som plattformadaptere.
- Next-host, CSP og deploy som ASP.NET Core-konfigurasjon.
- Vitest/bibliotektester som xUnit og bUnit; Playwright beholdes for Web.

Følgende skal ikke bygges i paritets-MVP:

- Autentisering.
- Cloud sync eller API-klienter.
- AI-innsikt.
- Kamera, biometri eller deep links.
- Fokusområder, vaner eller generaliserte mål.
- Telemetri med helseverdier eller fritekst.

## Offline-funn

Appen er lokal-først for data, men `public/sw.js` avregistrerer service workeren og sletter cacher. `src/components/ServiceWorkerCleanup.tsx` rydder også gamle app-artefakter. Dagens app garanterer derfor ikke kald offline-start; PWA app-shell-caching i ny løsning er en forbedring, ikke ren paritet.

## Dokumentasjonsavvik

- `.github/copilot-instructions.md` og enkelte instruksjoner beskriver fortsatt `strengthA/strengthB`, mens aktiv modell er `strength/walk`.
- `.github/instructions/data.instructions.md` omtaler schema-versjon 1, mens koden bruker versjon 2.
- `.github/skills/health-loop/SKILL.md` omtaler `next-pwa` og `PwaRegister.tsx`, som ikke finnes.
- README bruker «offline-first» uten å presisere manglende kald offline-shell.
- `PRIVACY.md` beskriver ingen ekstern deling, men workout-sidene åpner ExorLive.
- Pakkedetaljer i repository-instruksjonene avviker fra `package.json`.
- CI bruker Node 22.22.2, mens `Dockerfile` bruker Node 20.
- Produksjons-CSP tillater fortsatt `'unsafe-inline'` for scripts, og testen aksepterer dette.

## Viktigste tekniske risikoer

1. Datatap eller inkompatibel backup.
2. Lokal dag/UTC-avvik og DST-feil.
3. Adherence påvirkes av auto-opprettede standardlogger.
4. Utilsiktet lagring av 80 kg-fallback.
5. ID-kollisjoner ved backup merge.
6. Forskjellig observerbar oppførsel mellom IndexedDB og SQLite.
7. Feil Blazor render mode som gjør appen nettverksavhengig.
8. For tidlig produksjonscutover.
9. MAUI/WebView-forskjeller i lifecycle og kapabiliteter.
10. Ukrypterte lokale databaser og backupfiler.
11. ExorLive-lisens og personvern.
12. MAUI har kortere servicing-vindu enn .NET 10 LTS.
13. Historikk, PWA, auth eller AI sniker seg inn som ukontrollert scope.

## Konklusjon

Migreringen er gjennomførbar, men den bør styres som en kontraktsbevarende strangler-migrering. Første milepæl er ikke en MAUI-shell; den er en eksplisitt beslutningspakke og et portert, testet domene. Deretter bevises arkitekturen med én komplett Web-vertikal før bred UI-porting. Ingen gammel runtime skal fjernes før backup-roundtrip, kjerneflyter, rollback og personvern er godkjent.
