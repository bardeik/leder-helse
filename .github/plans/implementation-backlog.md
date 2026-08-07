<!-- markdownlint-disable MD032 MD036 -->

# Implementeringsbacklog

Hver issue skal normalt gjennomføres i egen branch og PR. Eksisterende Next.js-kvalitetsgate beholdes til cutover.

## Epic: Beslutninger og grunnlag

### Issue A1: Registrer migrerings-ADR-er

**Beskrivelse**
Dokumenter side-by-side-strategi, .NET 10, Shared RCL, browser/native adapter-splitt og lokal-only MVP.

**Akseptansekriterier**
- [ ] Alternativer og konsekvenser er dokumentert.
- [ ] Ingen auth/cloud/AI inngår i MVP.
- [ ] Cutover og rollback har eier.
- [ ] Historikk og PWA er markert som nytt omfang.

**Avhenger av**
Ingen.

**Prioritet**
High

### Issue A2: Velg Web-host og render mode

**Beskrivelse**
Sammenlign Blazor Web App global WASM med standalone Blazor WASM PWA.

**Akseptansekriterier**
- [ ] Offline/lokal storage, CSP, Fly-host og health endpoint vurderes.
- [ ] Interactive Server avvises eller begrunnes eksplisitt.
- [ ] Prerender-strategi er besluttet.
- [ ] Valgt host har dokumentert deploymodell.

**Avhenger av**
A1.

**Prioritet**
High

### Issue A3: Avklar dato- og produktsemantikk

**Beskrivelse**
Avgjør lokal dag mot UTC, standardlogg ved besøk, 80 kg-fallback og timer/logg-forhold.

**Akseptansekriterier**
- [ ] Dag- og instant-semantikk er entydig.
- [ ] Adherence påvirkes ikke utilsiktet av navigasjon.
- [ ] Vektfallback kan ikke lagres utilsiktet.
- [ ] Workout timer og logg har eksplisitt relasjon.

**Avhenger av**
A1.

**Prioritet**
High

### Issue A4: Korriger repository-instruksjoner og dokumentasjon

**Beskrivelse**
Rett workout-modell, Dexie schema-versjon, PWA-påstander, pakkeversjoner og ExorLive-personvern.

**Akseptansekriterier**
- [ ] `strength/walk` er aktiv modell; A/B beskrives kun som legacy-import.
- [ ] Dexie schema-versjon 2 er dokumentert.
- [ ] Ingen filer hevder at `next-pwa` eller `PwaRegister.tsx` finnes.
- [ ] Offline-begrepet presiseres.
- [ ] ExorLive omtales i personverndokumentasjon.

**Avhenger av**
A1-A3.

**Prioritet**
High

### Issue A5: Opprett golden characterization fixtures

**Beskrivelse**
Gjør eksisterende TypeScript-testscenarioer språk- og runtime-uavhengige.

**Akseptansekriterier**
- [ ] Fixtures dekker ukegrenser, 49/50/79/80, proratering og trendavrunding.
- [ ] Fixtures dekker ugyldige kalenderdatoer, midnatt, årsskifte og DST.
- [ ] Timeroverganger og never-autostart er dekket.
- [ ] Ingen ekte persondata brukes.

**Avhenger av**
A3.

**Prioritet**
High

## Epic: Shared Domain

### Issue D1: Opprett minimal .NET 10 domain-løsning

**Beskrivelse**
Opprett `/dotnet`, pinning, Domain og Domain.Tests uten tomme hostprosjekter.

**Akseptansekriterier**
- [ ] SDK er pinnet.
- [ ] Nullable og analyzers er aktivert.
- [ ] Clean restore/build/test passerer.
- [ ] Domain har ingen framework-, UI-, storage- eller localization-avhengighet.

**Avhenger av**
A1-A5.

**Prioritet**
High

### Issue D2: Porter entiteter og tidssemantikk

**Beskrivelse**
Porter dagens entiteter med `DateOnly` og UTC `DateTimeOffset`.

**Akseptansekriterier**
- [ ] Ugyldige kalenderdatoer avvises.
- [ ] Kanoniske timestamps håndheves ved kontraktgrensen.
- [ ] Feltgrenser matcher dagens løsning.
- [ ] Legacy workout-verdier normaliseres.

**Avhenger av**
D1.

**Prioritet**
High

### Issue D3: Porter ukeberegninger og trender

**Beskrivelse**
Porter week start, add days, goals, adherence og seksukers trender.

**Akseptansekriterier**
- [ ] Golden cases matcher TypeScript eksakt.
- [ ] Proratering og cap på workout goals er bevart.
- [ ] Sparse trend-data håndteres identisk.
- [ ] Ingen ambient timezone brukes skjult.

**Avhenger av**
D2.

**Prioritet**
High

### Issue D4: Ekstraher ren workout state-machine

**Beskrivelse**
Porter timerfaser og state-normalisering uten scheduler eller storage.

**Akseptansekriterier**
- [ ] Idle/countdown/work/rest/round-rest/complete er testet.
- [ ] Reload autostarter aldri.
- [ ] Pause/reset/completion matcher dagens oppførsel.
- [ ] Ugyldig persisted state normaliseres trygt.

**Avhenger av**
D2.

**Prioritet**
High

### Issue D5: Legg til uavhengig .NET CI-gate

**Beskrivelse**
Kjør restore/build/test uten å svekke Node-gaten.

**Akseptansekriterier**
- [ ] Jobbene feiler uavhengig.
- [ ] `global.json` brukes.
- [ ] Testfeil kan ikke undertrykkes.
- [ ] MAUI-workloads er ikke krav før MAUI-host finnes.

**Avhenger av**
D1.

**Prioritet**
High

## Epic: Application

### Issue AP1: Definer application-porter og typede resultater

**Beskrivelse**
Opprett repositories, clock, backup, settings og workout-progress-kontrakter.

**Akseptansekriterier**
- [ ] Kontraktene eies av Application.
- [ ] Async bruker cancellation.
- [ ] UI-tekst finnes ikke i feilkoder.
- [ ] Backup uttrykker atomisk operasjon, ikke Dexie-tabeller.
- [ ] Arkitekturtester håndhever retningen.

**Avhenger av**
D2-D3.

**Prioritet**
High

### Issue AP2: Implementer daglig logg-use cases

**Beskrivelse**
Implementer load/save, 14-dagers navigasjon og quick workout add/delete.

**Akseptansekriterier**
- [ ] Fremtidige datoer kan ikke velges.
- [ ] Past workout timestamp-policy er eksplisitt.
- [ ] Standardlogg følger A3-beslutningen.
- [ ] `IClock` brukes.
- [ ] Trim og optional fields matcher dagens regler.

**Avhenger av**
AP1.

**Prioritet**
High

### Issue AP3: Implementer weekly check-in-use cases

**Beskrivelse**
Implementer tre-ukers navigasjon, load og besluttet vektfallback.

**Akseptansekriterier**
- [ ] Års- og månedsskifter er testet.
- [ ] Fallback kan ikke skape utilsiktet data.
- [ ] Notat- og adjustment-grenser håndheves.
- [ ] Save returnerer typet resultat.

**Avhenger av**
AP1.

**Prioritet**
High

### Issue AP4: Implementer dashboard-projeksjon

**Beskrivelse**
Porter dashboard snapshot og next action-data uten lokalisert tekst.

**Akseptansekriterier**
- [ ] Adherence, trends, latest reflection og recent workouts matcher fixtures.
- [ ] Actions returneres som kind/count.
- [ ] Sparse data har testet oppførsel.
- [ ] Ingen separat history-feature snikes inn.

**Avhenger av**
AP1 og D3.

**Prioritet**
High

### Issue AP5: Implementer workout session coordinator

**Beskrivelse**
Koordiner scheduler, persistens og capability cues rundt state-machine.

**Akseptansekriterier**
- [ ] Tick scheduling kan stoppes og disposes.
- [ ] Resume krever brukerhandling.
- [ ] Capability-feil stopper ikke timeren.
- [ ] Tester bruker fake clock/scheduler.

**Avhenger av**
AP1 og D4.

**Prioritet**
Medium

## Epic: Backup og lagring

### Issue B1: Implementer backup v1-kontrakt i .NET

**Beskrivelse**
Porter parser, serializer, størrelse og collection limits.

**Akseptansekriterier**
- [ ] Feltnavn og version er kompatible.
- [ ] 5 MB og 10 000 per collection håndheves.
- [ ] Legacy workout normaliseres.
- [ ] Feil identifiserer collection/item uten å logge data.
- [ ] TypeScript og .NET kan lese hverandres eksport.

**Avhenger av**
AP1 og D2.

**Prioritet**
High

### Issue B2: Beslutt og test workout-ID-kollisjoner

**Beskrivelse**
Definer v1-kompatibel merge-policy uten stille overskriving.

**Akseptansekriterier**
- [ ] Konfliktoppførsel er dokumentert.
- [ ] Merge og overwrite er separate.
- [ ] Kollisjon kan ikke gi skjult datatap.
- [ ] Eventuell backup v2 behandles som separat migrering.

**Avhenger av**
B1 og A3.

**Prioritet**
High

### Issue B3: Implementer browser IndexedDB-adapter

**Beskrivelse**
Implementer repositories med isolert JS-modul.

**Akseptansekriterier**
- [ ] Range/order/key-semantikk består contract suite.
- [ ] Schema-versjon og upgrade er eksplisitt.
- [ ] Reell browser-test beviser transaksjon/rollback.
- [ ] Concurrent tab/versionchange er testet.
- [ ] Ny database/origin brukes først.

**Avhenger av**
AP1, B1-B2.

**Prioritet**
High

### Issue B4: Implementer native SQLite-adapter

**Beskrivelse**
Implementer schema, migrasjoner og repositories.

**Akseptansekriterier**
- [ ] Samme contract suite består som for IndexedDB.
- [ ] Backup overwrite er transaksjonell.
- [ ] Upgrade bevarer data.
- [ ] Databaseplassering og lifecycle er dokumentert.

**Avhenger av**
AP1, B1-B2.

**Prioritet**
High

### Issue B5: Implementer filimport/-eksport

**Beskrivelse**
Lag browser- og native-adaptere med typed cancellation/failure.

**Akseptansekriterier**
- [ ] Shared UI bruker interfaces.
- [ ] Plaintext backup-advarsel er lokalisert.
- [ ] Malformed/oversized data gir ingen writes.
- [ ] Roundtrip fungerer på Web, Windows og Android.

**Avhenger av**
B1-B4.

**Prioritet**
Medium

### Issue B6: Valgfri in-place Dexie-kompatibilitet

**Beskrivelse**
Vurder om ny Web-app trygt kan lese eksisterende IndexedDB direkte.

**Akseptansekriterier**
- [ ] Databaseschema og nøkkeloppførsel er testet i reell browser.
- [ ] To apper skriver ikke samtidig uten eksplisitt støtte.
- [ ] Rollback er demonstrert.
- [ ] Backup-import forblir fallback.

**Avhenger av**
B3 og godkjent Web-paritet.

**Prioritet**
Low

## Epic: Shared UI og Web

### Issue UI1: Opprett Shared Razor UI og lokalisering

**Beskrivelse**
Opprett RCL, typed resources og felles page states.

**Akseptansekriterier**
- [ ] Komponentene er host- og render-mode-uavhengige.
- [ ] `nb-NO` og `en-US` har key-paritet.
- [ ] CSS bevarer responsiv og tilgjengelig intensjon.
- [ ] Ingen konkret infrastruktur refereres.

**Avhenger av**
AP1 og A2.

**Prioritet**
High

### Issue W1: Opprett valgt Web-host

**Beskrivelse**
Scaffold hosten fra A2 og koble Browser Infrastructure og Shared UI.

**Akseptansekriterier**
- [ ] Kjerneflyter kjører klient-side uten server-circuit.
- [ ] Prerender/storage-init er trygt.
- [ ] Ingen konto eller serverdatabase kreves.
- [ ] Development/deploy er dokumentert.

**Avhenger av**
A2, AP1, UI1.

**Prioritet**
High

### Issue W2: Lever daglig logg vertikal slice

**Beskrivelse**
Bygg komplett `/log` som arkitekturbevis.

**Akseptansekriterier**
- [ ] Energi, søvn, timer, noter og quick workouts fungerer.
- [ ] Auto-save matcher dagens triggers.
- [ ] Punkt/komma fungerer under redigering.
- [ ] 14-dagers navigasjon er tilgjengelig.
- [ ] Save notice er viewport-synlig i 1800 ms.
- [ ] Reload og backup roundtrip er testet.

**Avhenger av**
AP2, B3, UI1, W1.

**Prioritet**
High

### Issue W3: Lever weekly check-in

**Beskrivelse**
Porter check-in-UI etter W2-mønsteret.

**Akseptansekriterier**
- [ ] Tre-ukers bound fungerer.
- [ ] Vektfallback følger beslutningen.
- [ ] Lokal tallredigering fungerer.
- [ ] Auto-save og feil er lokalisert.

**Avhenger av**
AP3 og godkjent W2.

**Prioritet**
High

### Issue W4: Lever dashboard

**Beskrivelse**
Porter dashboard uten å legge til ny history-feature.

**Akseptansekriterier**
- [ ] Alle dagens dashboardseksjoner er med.
- [ ] Empty/loading/error states er brukbare.
- [ ] Mobile/desktop labels klipper ikke.
- [ ] Charts har tekstalternativ.

**Avhenger av**
AP4 og godkjent W2.

**Prioritet**
High

### Issue W5: Lever workout UI og browser-capabilities

**Beskrivelse**
Porter timer, øvelser, kontroller, audio, speech og wake lock.

**Akseptansekriterier**
- [ ] Timer matcher state-machine-testene.
- [ ] Persisted resume autostarter ikke.
- [ ] Unsupported capabilities degraderer eksplisitt.
- [ ] ExorLive åpnes sikkert og er personvernvurdert.

**Avhenger av**
AP5 og godkjent W2.

**Prioritet**
Medium

### Issue W6: Lever settings og lokal datasletting

**Beskrivelse**
Porter språk, reminders, backup, storage summary og «slett alle data».

**Akseptansekriterier**
- [ ] Merge/overwrite er eksplisitt.
- [ ] Reminder hour clampes 0-23.
- [ ] Permission/capability states er sannferdige.
- [ ] Busy state hindrer duplikatoperasjoner.
- [ ] Brukeren kan slette alle lokale data.

**Avhenger av**
B5 og godkjent W2.

**Prioritet**
High

### Issue W7: Reetabler Web-sikkerhet og deploy

**Beskrivelse**
Implementer CSP/headere, container/Fly og E2E-smoke for valgt Blazor-host.

**Akseptansekriterier**
- [ ] Ingen unsafe-eval i produksjon.
- [ ] Behovet for unsafe-inline er minimert og testet.
- [ ] HSTS, COOP, CORP, frame, nosniff, referrer og permissions er testet.
- [ ] Ingen helsedata logges.
- [ ] Rollback er dokumentert.

**Avhenger av**
Stabil W3-W6.

**Prioritet**
High

### Issue W8: Valgfri PWA offline app-shell

**Beskrivelse**
Legg til scoped service worker som en forbedring.

**Akseptansekriterier**
- [ ] Kald offline-start fungerer etter første load.
- [ ] Update/retirement sletter ikke unrelated caches.
- [ ] IndexedDB overlever oppdateringer.
- [ ] Install, offline reload og upgrade er testet.

**Avhenger av**
W7 og separat produktgodkjenning.

**Prioritet**
Medium

## Epic: MAUI og native

### Issue N1: Opprett MAUI Blazor Hybrid-host

**Beskrivelse**
Opprett minimal MAUI-shell og composition root.

**Akseptansekriterier**
- [ ] Windows og Android debug-build starter Shared UI.
- [ ] Least-privilege permissions er dokumentert.
- [ ] Shared UI refererer ikke MAUI.
- [ ] Unsupported capabilities vises eksplisitt.

**Avhenger av**
UI1, B4 og stabil W2.

**Prioritet**
High

### Issue N2: Implementer native kapabiliteter

**Beskrivelse**
Implementer Preferences, filer, external URI, audio, speech og keep-awake.

**Akseptansekriterier**
- [ ] Hver capability har supported/denied/unavailable.
- [ ] Ressurser disposes korrekt.
- [ ] Timer fungerer selv om alle capabilities feiler.
- [ ] Ingen generisk device-service introduseres.

**Avhenger av**
N1 og AP5.

**Prioritet**
Medium

### Issue N3: Implementer native lokale varsler

**Beskrivelse**
Planlegg/cancel OS-varsler for Windows og Android.

**Akseptansekriterier**
- [ ] Permission og capability er typet.
- [ ] Timezone/day changes er testet.
- [ ] Duplicates hindres.
- [ ] Varseltekst eksponerer ikke sensitive detaljer.

**Avhenger av**
N1-N2.

**Prioritet**
Medium

### Issue N4: Valider og pakk Windows

**Akseptansekriterier**
- [ ] Kjerneflyter fungerer på clean install.
- [ ] Keyboard, resize, high DPI og screen reader er testet.
- [ ] MSIX/unpackaged er besluttet.
- [ ] Packaged upgrade bevarer data.

**Avhenger av**
N1-N3 og Web-paritet.

**Prioritet**
High

### Issue N5: Valider og pakk Android

**Akseptansekriterier**
- [ ] Emulator og fysisk enhet passerer critical journeys.
- [ ] Lifecycle, rotation, keyboard og safe areas er testet.
- [ ] Signert AAB produseres.
- [ ] Upgrade bevarer data.

**Avhenger av**
N1-N3 og Web-paritet.

**Prioritet**
High

### Issue N6: Forbered iOS og Mac Catalyst

**Beskrivelse**
Etabler Mac/Xcode, signing og real-device-validering.

**Akseptansekriterier**
- [ ] Apple developer-eierskap og bundle IDs er dokumentert.
- [ ] iOS 16.4+ og macOS 12+ bygger.
- [ ] Signerte real-device builds passerer critical journeys.
- [ ] Distribusjonsrunbook finnes.

**Avhenger av**
Stabil N4-N5 og eid signingmiljø.

**Prioritet**
Medium

## Epic: Personvern, test og release

### Issue R1: Oppdater privacy, security og logging-policy

**Akseptansekriterier**
- [ ] Datalokasjon og plaintext backup beskrives per host.
- [ ] Sletting og eksport er dokumentert.
- [ ] Logger/crash reports redakterer alle helseverdier og noter.
- [ ] Cloud/AI krever ny personvernreview.
- [ ] Native databasekryptering er eksplisitt besluttet eller utsatt.

**Avhenger av**
A1-A4.

**Prioritet**
High

### Issue R2: Etabler tverrplattform testmatrise

**Akseptansekriterier**
- [ ] IndexedDB og SQLite bruker samme contract suite.
- [ ] bUnit dekker Shared UI-states og språkparitet.
- [ ] Playwright dekker Web storage, backup og CSP.
- [ ] Appium dekker utvalgte Windows/Android-flyter.
- [ ] Tunge emulatorløp har dokumentert PR/scheduled/release-policy.

**Avhenger av**
B3-B4, UI1 og N1.

**Prioritet**
High

### Issue R3: Etabler multi-platform CI/CD og servicing

**Akseptansekriterier**
- [ ] Linux bygger/tester Domain/Application/Web.
- [ ] Windows bygger MAUI Windows.
- [ ] Android package-build er automatisert.
- [ ] Apple-jobb legges først til etter signing-eierskap.
- [ ] .NET/MAUI workload og NuGet oppdateres regelmessig.
- [ ] Secrets ligger i CI secret store.

**Avhenger av**
D5, W1 og N1.

**Prioritet**
High

### Issue R4: Rehearse migrering og rollback

**Akseptansekriterier**
- [ ] Backup roundtrip passerer mellom gammel Web, ny Web, Windows og Android.
- [ ] Corrupt/oversize/ID-kollisjon gir ikke datatap.
- [ ] Upgrade og rollback er utført produksjonslikt.
- [ ] Produktansvarlig godkjenner cutover.

**Avhenger av**
W7, N4-N5 og R1-R3.

**Prioritet**
High

### Issue R5: Stage release og pensjoner Next.js

**Beskrivelse**
Release Web, Windows og Android gradvis; fjern gammel runtime sist.

**Akseptansekriterier**
- [ ] Next er deploybar gjennom rollback-vinduet.
- [ ] Node-only CI/deploy fjernes kontrollert.
- [ ] Backup v1-fixtures beholdes gjennom supportvinduet.
- [ ] README, SECURITY og PRIVACY beskriver .NET-hostene.
- [ ] Legacy service-worker cleanup har sikker retirement.

**Avhenger av**
R4 og eksplisitt cutover-godkjenning.

**Prioritet**
Low

## Agentsekvens

1. Planlegger/reviewer: A1-A5 og R1.
2. Domain-agent: D1-D5.
3. Application-agent: AP1-AP5.
4. Data-agent: B1-B6.
5. Web-agent: UI1 og W1-W8 etter kontrakt-gates.
6. MAUI-agent: N1-N6 etter stabil Web-slice.
7. Release/security-agent: R2-R5.

Parallelisering starter først etter at delte contracts og fixtures er merged. Flere agenter skal ikke definere entiteter, backup DTO-er, repository interfaces eller localization keys uavhengig.
