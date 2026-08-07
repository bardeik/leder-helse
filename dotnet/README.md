# HelseLoop (.NET 10)

.NET 10 migreringsoppsett for Helse Loop. Se `.github/plans/` for arkitektur, migreringsplan
og backlog. Dette treet eksisterer side om side med den kjørende Next.js-appen under `../src`.

## Struktur

```text
src/
  HelseLoop.Domain                # Rene entiteter, dato/tid, beregninger, timer-state
  HelseLoop.Application           # Use cases og porter (interfaces)
  HelseLoop.Shared.UI             # Razor Class Library (delt UI mellom Web og MAUI)
  HelseLoop.Infrastructure.Browser
  HelseLoop.Infrastructure.Native
  HelseLoop.App.Web               # Blazor Web App host (global Interactive WASM)
  HelseLoop.App.Web.Client        # WebAssembly-klient
  HelseLoop.App.Maui              # MAUI Blazor Hybrid host
tests/
  HelseLoop.Domain.Tests
  HelseLoop.Application.Tests
  fixtures/backups/               # Golden JSON-fixtures for backup v1
```

## Bygg og test

```powershell
dotnet restore dotnet/HelseLoop.slnx
dotnet build   dotnet/HelseLoop.slnx --no-restore
dotnet test    dotnet/HelseLoop.slnx --no-build
```

MAUI-hosten krever `dotnet workload install maui`. Den er ekskludert fra Web/Domain-CI
inntil workloaden er tilgjengelig i CI-runneren.
