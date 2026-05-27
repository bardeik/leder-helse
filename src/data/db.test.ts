import { describe, expect, it, vi } from "vitest";

describe("LeaderHealthDb", () => {
  it("configures schema versions, normalizes legacy workout types, and handles versionchange", async () => {
    vi.resetModules();

    const closeMock = vi.fn();
    const onMock = vi.fn<(event: string, handler: () => void) => void>();
    const storesV1Mock = vi.fn();
    const storesV2Mock = vi.fn();
    const versionMock = vi.fn();
    let upgradeHandler: ((tx: { table: (name: string) => { toCollection: () => { modify: (cb: (item: { type?: string }) => void) => void } } }) => Promise<void>) | undefined;
    let versionChangeHandler: (() => void) | undefined;

    const rows = [{ type: "strengthA" }, { type: "walk" }, { type: "unknown" }];
    const modifyMock = vi.fn((callback: (item: { type?: string }) => void) => {
      for (const row of rows) {
        callback(row);
      }
    });
    const toCollectionMock = vi.fn(() => ({ modify: modifyMock }));
    const tableMock = vi.fn(() => ({ toCollection: toCollectionMock }));

    storesV1Mock.mockReturnValue({});
    storesV2Mock.mockReturnValue({
      upgrade: (handler: typeof upgradeHandler) => {
        upgradeHandler = handler;
        return {};
      }
    });
    versionMock.mockImplementation((versionNumber: number) => {
      if (versionNumber === 1) {
        return { stores: storesV1Mock };
      }
      if (versionNumber === 2) {
        return { stores: storesV2Mock };
      }
      return { stores: vi.fn() };
    });
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

    expect(versionMock).toHaveBeenCalledWith(1);
    expect(versionMock).toHaveBeenCalledWith(2);
    expect(storesV1Mock).toHaveBeenCalledWith({
      dailyLogs: "&date",
      weeklyCheckIns: "&weekStartDate",
      workoutLogs: "++id,date,dateTime,type"
    });
    expect(storesV2Mock).toHaveBeenCalledWith({
      dailyLogs: "&date",
      weeklyCheckIns: "&weekStartDate",
      workoutLogs: "++id,date,dateTime,type"
    });

    expect(upgradeHandler).toBeTypeOf("function");
    await upgradeHandler?.({ table: tableMock });
    expect(tableMock).toHaveBeenCalledWith("workoutLogs");
    expect(toCollectionMock).toHaveBeenCalledOnce();
    expect(modifyMock).toHaveBeenCalledOnce();
    expect(rows).toEqual([{ type: "strength" }, { type: "walk" }, { type: "unknown" }]);

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
