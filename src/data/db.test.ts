import { describe, expect, it, vi } from "vitest";

describe("LeaderHealthDb", () => {
  it("configures version 2 schema and handles versionchange", async () => {
    vi.resetModules();

    const closeMock = vi.fn();
    const onMock = vi.fn<(event: string, handler: () => void) => void>();
    const storesMock = vi.fn().mockReturnValue({});
    const versionMock = vi.fn().mockReturnValue({ stores: storesMock });
    let versionChangeHandler: (() => void) | undefined;

    onMock.mockImplementation((event, handler) => {
      if (event === "versionchange") {
        versionChangeHandler = handler;
      }
    });

    class DexieMock {
      version = versionMock;
      on = onMock;
      close = closeMock;

      constructor(_name: string) {}
    }

    vi.doMock("dexie", () => ({
      default: DexieMock
    }));

    await import("@/data/db");

    expect(versionMock).toHaveBeenCalledOnce();
    expect(versionMock).toHaveBeenCalledWith(2);
    expect(storesMock).toHaveBeenCalledWith({
      dailyLogs: "&date",
      weeklyCheckIns: "&weekStartDate",
      workoutLogs: "++id,date,dateTime,type"
    });

    expect(versionChangeHandler).toBeTypeOf("function");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      versionChangeHandler?.();
    } catch {
      // JSDOM may throw on location.reload(); the close() side effect is what we require.
    }
    consoleErrorSpy.mockRestore();
    expect(closeMock).toHaveBeenCalledOnce();
  });
});
