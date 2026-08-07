using HelseLoop.App.Web.Components;
using HelseLoop.Infrastructure.Browser;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveWebAssemblyComponents();

builder.Services.AddHelseLoopBrowserInfrastructure();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(HelseLoop.SharedUI.SharedUiAssembly.Reference);

await app.RunAsync().ConfigureAwait(false);
