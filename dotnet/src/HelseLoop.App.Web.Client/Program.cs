using HelseLoop.Infrastructure.Browser;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddHelseLoopBrowserInfrastructure();

await builder.Build().RunAsync().ConfigureAwait(false);
