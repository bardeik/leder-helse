namespace HelseLoop.SharedUI;

/// <summary>
/// Registered by each host to expose the shared RCL assembly to Blazor routing
/// discovery via <c>Router.AdditionalAssemblies</c>.
/// </summary>
public static class SharedUiAssembly
{
    public static System.Reflection.Assembly Reference =>
        typeof(SharedUiAssembly).Assembly;
}
