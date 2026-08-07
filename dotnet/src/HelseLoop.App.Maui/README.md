# HelseLoop.App.Maui

.NET MAUI Blazor Hybrid-host for Windows, Android, iOS og Mac Catalyst.

Prosjektet er **ekskludert fra `HelseLoop.slnx`** inntil MAUI-workloaden installeres:

```powershell
dotnet workload install maui
```

Etter installasjon: legg til prosjektet i solution eller kjør direkte:

```powershell
dotnet build dotnet/src/HelseLoop.App.Maui/HelseLoop.App.Maui.csproj -f net10.0-windows10.0.19041.0
```

Apple-mål (`net10.0-ios`, `net10.0-maccatalyst`) er kommentert ut i csproj til Mac/Xcode/signing er på plass (plan issue N6).

## Kilder

- Blazor-komponenter: [HelseLoop.Shared.UI](../HelseLoop.Shared.UI)
- Native infrastruktur: [HelseLoop.Infrastructure.Native](../HelseLoop.Infrastructure.Native)
