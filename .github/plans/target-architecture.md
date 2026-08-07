# Anbefalt målarkitektur

## Arkitekturbeslutning

Bygg en .NET 10-løsning side om side med dagens Next.js-app under `/dotnet`. Bruk ports-and-adapters med rene Domain- og Application-prosjekter, en render-mode-uavhengig Razor Class Library og separate infrastrukturer for browser og native.

Før Web-scaffolding skal en ADR sammenligne:

1. Blazor Web App med global Interactive WebAssembly.
2. Standalone Blazor WebAssembly PWA.

Foreløpig anbefaling er Blazor Web App med global Interactive WebAssembly og uten prerendering for app-rutene. Dette beholder en ASP.NET Core-host for sikkerhetsheadere, health endpoint og Fly/container-drift, samtidig som kjerneflyter kjører lokalt. Dersom serverhosten ikke gir reell verdi, er standalone WASM PWA enklere og bør velges.

Interactive Server skal ikke brukes for kjerneflyter fordi det bryter lokal-først- og offline-målet. Interactive Auto utsettes fordi det introduserer to utførelsesmodeller.

## Foreslått struktur

```text
/dotnet
  HelseLoop.slnx
  global.json
  Directory.Build.props
  Directory.Packages.props

  /src
    /HelseLoop.Domain
    /HelseLoop.Application
    /HelseLoop.Shared.UI
    /HelseLoop.Infrastructure.Browser
    /HelseLoop.Infrastructure.Native
    /HelseLoop.App.Web
    /HelseLoop.App.Web.Client
    /HelseLoop.App.Maui

  /tests
    /HelseLoop.Domain.Tests
    /HelseLoop.Application.Tests
    /HelseLoop.ContractTests
    /HelseLoop.Infrastructure.Browser.Tests
    /HelseLoop.Infrastructure.Native.Tests
    /HelseLoop.Shared.UI.Tests
    /HelseLoop.Web.E2E
    /fixtures/backups

  /docs/adr
```

`HelseLoop.App.Web` og `.Client` opprettes bare hvis ADR-en velger Blazor Web App. Standalone WASM krever én klienthost i stedet.

## Prosjektansvar

### HelseLoop.Domain

Ingen avhengighet til UI, Blazor, MAUI, ASP.NET Core, persistens eller lokalisering.

Innhold:

- `DailyLog`, `WeeklyCheckIn`, `WorkoutLog`, `WorkoutType`, `HealthStatus`.
- `DateOnly` for loggdato og ukestart.
- UTC-normalisert `DateTimeOffset` for instants.
- Valideringsgrenser, mål og statusregler.
- Uke-, adherence-, workout- og trendberegninger.
- Ren workout timer-state-machine.
- Legacy workout-normalisering.

Domenet returnerer data og koder, ikke lokalisert tekst. Dashboard-handlinger uttrykkes for eksempel som `NextActionKind` og `Count`.

### HelseLoop.Application

Refererer kun Domain og eier use cases og porter.

Use cases:

- Hent/lagre daglig logg.
- Bounded dag- og uke-navigasjon.
- Legg til, slett og list workouts.
- Hent dashboard-projeksjon.
- Hent/lagre weekly check-in med besluttet fallback.
- Backup eksport/import og storage summary.
- Språk-, reminder- og workout-progress-innstillinger.
- Workout session coordination rundt ren state-machine.

Porter:

```csharp
public interface IClock
{
    DateOnly LocalToday { get; }
    DateTimeOffset UtcNow { get; }
}

public interface IDailyLogRepository { /* use-case-orienterte metoder */ }
public interface IWeeklyCheckInRepository { /* use-case-orienterte metoder */ }
public interface IWorkoutLogRepository { /* use-case-orienterte metoder */ }
public interface IBackupStore { /* atomisk merge/overwrite */ }
public interface ILocalePreferenceStore { /* typed locale */ }
public interface IReminderSettingsStore { /* typed settings */ }
public interface IWorkoutProgressStore { /* normalized session */ }
```

Asynkrone metoder bruker `CancellationToken`. Feil returneres som typede resultater/koder slik at UI kan lokalisere uten å parse exception-tekst.

### HelseLoop.Shared.UI

Razor Class Library som brukes av Web-klienten og MAUI.

Innhold:

- Delte page bodies for dashboard, daglig logg, weekly check-in, workout og settings.
- Navigasjon, loading/empty/error states, save notice, dato/uke-kontroller, trendvisning og workout-komponenter.
- CSS isolation og et lite sett globale design-tokens.
- Typed lokalisering for `nb-NO` og `en-US`.
- Eksplisitte capability states for unsupported/denied/unavailable.

Shared UI skal ikke referere IndexedDB, SQLite, `HttpContext`, MAUI Essentials eller browser-globals. Hostene eier ruter og render mode gjennom tynne wrappers.

En separat historikkside er ikke dagens paritet. Den opprettes bare etter eksplisitt produktgodkjenning.

### HelseLoop.Infrastructure.Browser

- IndexedDB via isolert JS-modul og `IJSRuntime`.
- LocalStorage for enkle preferanser.
- Browser Notification-permission og foreground reminders.
- Filimport/-eksport.
- Web Audio, speech synthesis, wake lock og external URI.
- Reelle browser-kontrakttester.

Første migreringsvei er backup eksport/import mellom separat gammel og ny database/origin. Direkte bruk av eksisterende Dexie-database er en valgfri senere oppgave med kompatibilitets- og rollback-test.

### HelseLoop.Infrastructure.Native

- SQLite med eksplisitt schema-versjon og migrasjoner.
- Native Preferences.
- File picker/share/export.
- OS-planlagte lokale varsler.
- Text-to-speech, audio, keep-awake og external URI.
- SecureStorage kun for fremtidige hemmeligheter/tokens, ikke hele helsedatabasen.

En samlet native infrastructure er tilstrekkelig først. Den splittes per plattform bare hvis pakke- eller trimmingavhengigheter krever det.

### HelseLoop.App.Web

Hvis Blazor Web App velges:

- ASP.NET Core composition root.
- Global Interactive WebAssembly for app-rutene.
- Ingen serverdatabase eller konto i MVP.
- Prerendering av forbrukersidene avslås først for å unngå storage/hydration-problemer.
- Sikkerhetsheadere, CSP, health endpoint og deploy-konfigurasjon.
- PWA-service worker eies av Web-hosten, ikke Shared UI.

PWA app-shell er en kontrollert forbedring etter Web-paritet, ikke et skjult paritetskrav.

### HelseLoop.App.Maui

- MAUI single-project Blazor Hybrid-host.
- Minimal native shell rundt `BlazorWebView`.
- Registrerer Shared UI og native adaptere.
- Plattformmanifest, permissions, ikoner, package identity og signing.
- Windows og Android er første native leveranse.
- iOS og Mac Catalyst følger etter at Mac/Xcode/signering er eid.

## Avhengighetsregler

Tillatt:

```text
Domain -> ingen prosjektavhengigheter
Application -> Domain
Shared.UI -> Application + Domain
Infrastructure.Browser -> Application + Domain
Infrastructure.Native -> Application + Domain
Web Client -> Shared.UI + Infrastructure.Browser
MAUI -> Shared.UI + Infrastructure.Native
```

Forbudt:

- Domain/Application refererer Blazor, JS interop, MAUI, SQLite, IndexedDB eller ASP.NET Core.
- Shared UI refererer konkret infrastruktur.
- Infrastruktur refererer Shared UI.
- Web og MAUI deler composition root som skjuler plattformforskjeller.

Reglene håndheves med prosjektstruktur og arkitekturtester.

## Data og kompatibilitet

Backup v1 beholdes:

- `version`
- `exportedAt`
- `dailyLogs`
- `weeklyCheckIns`
- `workoutLogs`

Serialisering skal eksplisitt produsere:

- `yyyy-MM-dd` for dagverdier.
- `yyyy-MM-ddTHH:mm:ss.fffZ` for UTC-instants.
- Legacy `strengthA`/`strengthB` normalisert til `strength`.

Før implementering må merge-policy for numeriske workout-ID-kollisjoner avgjøres. Alternativer:

1. Behold import-ID og avvis konflikt.
2. Omtildel ID ved merge, men behold ved overwrite.
3. Introduser backup v2 med stabil UUID.

Ingen av disse skal endre backup v1 stille.

SQLite-tabellene skal speile query-semantikk, ikke Dexie-internals:

- Daily log keyed by ISO date.
- Weekly check-in keyed by week-start date.
- Workout med lokal integer-ID og indekser på date/dateTime/type.
- Egen schema-versjonstabell.

## Dato og tid

Før porting må produktet velge om daglige logger følger brukerens lokale kalenderdag eller UTC-dag. Anbefaling:

- `DateOnly` og lokal kalenderdag for brukerregistreringer og reminder-deduplisering.
- `DateTimeOffset` i UTC for faktiske instants.
- Eksplisitt timezone-input der planlegging krever det.
- Golden tests rundt midnatt, DST, årsskifte og mandagsgrenser.

## Lokalisering

- Ressurser for `nb-NO` og `en-US`.
- Paritetstest av alle keys.
- Formateringsfunksjoner ligger i UI/Application, ikke som kjørbare ressursverdier.
- Punkt og komma testes uavhengig av display culture.
- Runtime språkbytte kan kreve root reload i MAUI.

## Varsler

Tre forskjellige produkter holdes adskilt:

1. Web foreground reminders: fungerer bare mens appen kjører.
2. Web Push: krever backend, push-subscription og personverngodkjenning; ikke MVP.
3. Native local notifications: OS-planlagt og offline; implementeres etter native host.

UI skal aldri love garantert levering.

## Autentisering og API

MVP har ingen autentisering og ingen API. Det skal ikke opprettes tomme auth- eller API-client-prosjekter.

Hvis cloud sync senere godkjennes:

- Web bruker OIDC med sikker cookie/BFF der mulig.
- Native bruker systembrowser, Authorization Code + PKCE.
- Tokens lagres i native SecureStorage.
- Konfliktløsning, eierskap, sletting/eksport, retention, kryptering og samtykke må være besluttet først.
- Klienthemmeligheter skal aldri bygges inn.

## Testarkitektur

- xUnit for Domain/Application.
- bUnit for Shared UI.
- Playwright for Web, IndexedDB, CSP og eventuell PWA.
- Appium for et begrenset sett Windows/Android critical journeys.
- Golden JSON-fixtures for backup-kompatibilitet.
- Samme repository contract suite mot IndexedDB og SQLite.
- Arkitekturtester for referanseretning.
- Ingen ekte persondata i testfixtures.

## CI/CD

Under sameksistens:

- Eksisterende Node-gate beholdes.
- Egen .NET restore/build/test-gate.
- Web Playwright på Linux etter vertikal slice.
- MAUI Windows-build på Windows-runner.
- Android package-build og utvalgte emulatorløp.
- Apple build/sign på macOS først når secrets og eierskap finnes.
- npm og NuGet security/dependency maintenance.

## Plattformbaseline

- .NET 10 LTS med pinning i `global.json`.
- Seneste støttede MAUI 10 servicing release.
- Android 7/API 24+ for MAUI Blazor.
- iOS 16.4+.
- macOS 12+ gjennom Mac Catalyst.
- Windows 10 1809+.

MAUI følger et kortere supportvindu enn .NET 10. Månedlig workload- og servicing-eierskap er nødvendig.
