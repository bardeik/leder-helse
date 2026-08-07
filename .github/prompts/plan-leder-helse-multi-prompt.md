# Instruks for GitHub Copilot: Analyse og migrering av Helse Loop til MAUI + Blazor Hybrid/Web

Du er senior løsningsarkitekt og erfaren .NET-utvikler. Analyser dette repoet for en helse-/leder-rutine-app kalt **"Helse Loop"** og vurder hvordan appen kan videreutvikles til en felles kodebase som støtter:

- Windows native app
- macOS native app
- Android native app
- iPhone/iPad native app
- Web-app i nettleser

Målarkitekturen skal være basert på:

- .NET MAUI
- Blazor Hybrid
- Blazor Web App
- Shared Razor Class Library for felles UI-komponenter
- Shared domain/business logic
- Shared API-klienter
- Shared datamodeller
- Plattformspesifikke adaptere der det er nødvendig

---

## Viktig kontekst

Appen skal støtte personlig helse- og lederproduktivitet, inkludert typiske funksjoner som:

- daglig innsjekk
- søvnregistrering
- trening
- vekt
- energinivå
- fokusområder
- vaner/rutiner
- refleksjoner
- dashboard
- historikk
- måloppfølging
- varslinger/påminnelser
- eventuell AI-basert innsikt senere

Appen bør kunne brukes både på mobil, desktop og web.

---

## Oppgave 1: Analyser dagens kodebase

Gå gjennom repoet og identifiser:

1. Hvilket rammeverk og språk appen bruker i dag.
2. Hvordan prosjektstrukturen er organisert.
3. Hvor UI-kode ligger.
4. Hvor forretningslogikk ligger.
5. Hvor datamodeller/entities ligger.
6. Hvor eventuell lokal lagring, database eller API-integrasjon håndteres.
7. Om appen allerede har separasjon mellom UI, logikk og data.
8. Hvilke deler som kan gjenbrukes i en MAUI + Blazor Hybrid/Web arkitektur.
9. Hvilke deler som bør refaktoreres før migrering.
10. Eventuelle tekniske risikoer eller anti-patterns.

Ikke gjør endringer ennå. Start med analyse.

---

## Oppgave 2: Foreslå målarkitektur

Foreslå en konkret arkitektur med denne strukturen eller bedre:

```text
/src
  /HelseLoop.App.Maui
      Native MAUI host for Windows, macOS, Android and iOS

  /HelseLoop.App.Web
      Blazor Web App for browser

  /HelseLoop.Shared.UI
      Razor Class Library with shared Blazor components, pages and styling

  /HelseLoop.Shared.Domain
      Domain models, business rules, validation and core logic

  /HelseLoop.Shared.Application
      Use cases, services, DTOs, orchestration and app workflows

  /HelseLoop.Shared.Infrastructure
      API clients, local storage, database access, external integrations

  /HelseLoop.Tests
      Unit tests for domain and application logic
```

Vurder om denne strukturen passer dagens repo. Hvis ikke, foreslå en bedre struktur og forklar hvorfor.

---

## Oppgave 3: Vurder web-støtte

Analyser hvordan løsningen kan støtte både native og web med mest mulig delt kode.

Vurder spesielt:

- Hvilke Blazor-komponenter som kan deles mellom MAUI og Web.
- Hvilken kode som bør ligge i Razor Class Library.
- Hvilke tjenester som bør ha egne implementasjoner for Web og Native.
- Hvordan dependency injection bør brukes for plattformspesifikke forskjeller.
- Hvordan autentisering bør håndteres på web kontra native.
- Hvordan lokal lagring/offline-støtte bør håndteres på mobil/desktop kontra web.
- Hvordan responsivt design bør implementeres.

---

## Oppgave 4: Plattformspesifikke behov

Identifiser hvilke funksjoner som sannsynligvis må håndteres ulikt på plattformene:

- push-varsler
- lokal lagring
- SQLite eller browser storage
- biometri
- kamera
- filsystem
- bakgrunnsjobber
- deep links
- autentisering
- installasjon og publisering
- app settings/secrets
- telemetry/logging

Lag forslag til interface-baserte abstraksjoner, for eksempel:

```csharp
public interface INotificationService
{
    Task ScheduleReminderAsync(string title, string message, DateTimeOffset when);
}

public interface ILocalStorageService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value);
}

public interface IDeviceInfoService
{
    string Platform { get; }
    string FormFactor { get; }
}
```

Tilpass forslagene til det du faktisk finner i repoet.

---

## Oppgave 5: Foreslå migreringsplan

Lag en konkret, trinnvis migreringsplan.

Del planen inn i faser:

### Fase 1: Rydding og separasjon

- skill ut datamodeller
- skill ut forretningslogikk
- fjern direkte avhengigheter mellom UI og storage/API
- etabler interfaces

### Fase 2: Shared libraries

- opprett Shared.Domain
- opprett Shared.Application
- opprett Shared.Infrastructure
- opprett Shared.UI hvis Blazor-komponenter kan deles

### Fase 3: Web App

- opprett Blazor Web App
- koble til shared UI og shared services
- verifiser at kjerneflyter fungerer i browser

### Fase 4: MAUI Blazor Hybrid

- opprett MAUI Blazor Hybrid host
- koble til samme shared UI
- implementer native services
- test Windows og Android først

### Fase 5: Apple-støtte

- vurder Mac Catalyst
- vurder iOS
- identifiser krav til Mac/Xcode/signering
- dokumenter publiseringsløp

### Fase 6: Stabilisering

- test
- logging
- telemetry
- offline
- sikkerhet
- CI/CD

For hver fase: foreslå konkrete filer/prosjekter som bør opprettes eller flyttes.

---

## Oppgave 6: Prioriter en MVP

Foreslå en realistisk MVP som først bør få støtte for:

1. Web
2. Windows desktop
3. Android
4. iOS/macOS senere

MVP bør minimum inneholde:

- daglig innsjekk
- registrering av søvn
- registrering av trening
- registrering av vekt
- enkelt dashboard
- historikk
- lokal eller serverbasert persistens

Vurder hva som bør bygges først for å redusere risiko.

---

## Oppgave 7: Lag konkret backlog

Lag en backlog med konkrete GitHub Issues.

Bruk formatet:

```markdown
## Epic: [navn]

### Issue: [tittel]
**Beskrivelse**
Kort forklaring.

**Akseptansekriterier**
- [ ] ...
- [ ] ...
- [ ] ...

**Teknisk notat**
Kort teknisk anbefaling.

**Prioritet**
High / Medium / Low
```

Backlogen skal dekke:

- arkitektur
- prosjektstruktur
- shared domain
- shared UI
- web app
- MAUI app
- storage
- authentication
- notifications
- dashboard
- tests
- CI/CD
- dokumentasjon

---

## Oppgave 8: Lag anbefalt første pull request

Foreslå den aller første PR-en jeg bør lage.

Den skal være liten nok til å kunne reviewes enkelt, men nyttig nok til å starte migreringen.

Format:

```markdown
# PR 1: [tittel]

## Formål
...

## Endringer
...

## Ikke inkludert
...

## Akseptansekriterier
...

## Risiko
...

## Test
...
```

---

## Oppgave 9: Ikke gjør store endringer automatisk

Før du endrer kode:

1. Presenter analysen.
2. Presenter anbefalt målarkitektur.
3. Presenter migreringsplan.
4. Presenter første foreslåtte PR.
5. Vent på at jeg ber deg implementere første steg.

Ikke gjør omfattende refaktorering uten eksplisitt beskjed.

---

## Ønsket output

Svar strukturert på norsk med:

1. Kort oppsummering
2. Dagens situasjon i repoet
3. Anbefalt målarkitektur
4. Hva som kan gjenbrukes
5. Hva som må refaktoreres
6. Risikoer
7. Migreringsplan
8. MVP-forslag
9. Backlog/GitHub Issues
10. Anbefalt første PR

Vær konkret og referer til faktiske filer, mapper og prosjekter i repoet der det er mulig.
