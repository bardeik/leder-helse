using HelseLoop.Infrastructure.Native;
using Microsoft.AspNetCore.Components.WebView.Maui;
using Microsoft.Extensions.Logging;

namespace HelseLoop.App.Maui;

/// <summary>MAUI Blazor Hybrid composition root.</summary>
public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        builder.Services.AddHelseLoopNativeInfrastructure();

        return builder.Build();
    }
}
