import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  ServiceWorkerCleanup,
  cleanupAppServiceWorkerArtifacts,
  shouldCleanupCache,
  shouldCleanupRegistration
} from "@/components/ServiceWorkerCleanup";

function createRegistration({
  scope,
  activeScriptURL,
  waitingScriptURL
}: {
  scope: string;
  activeScriptURL?: string;
  waitingScriptURL?: string;
}) {
  return {
    scope,
    unregister: vi.fn().mockResolvedValue(true),
    active: activeScriptURL ? { scriptURL: activeScriptURL } : undefined,
    waiting: waitingScriptURL ? { scriptURL: waitingScriptURL } : undefined
  };
}

const navigatorDescriptor = Object.getOwnPropertyDescriptor(window, "navigator");
const serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(window.navigator, "serviceWorker");
const cachesDescriptor = Object.getOwnPropertyDescriptor(window, "caches");

function setServiceWorker(value: unknown) {
  Object.defineProperty(window.navigator, "serviceWorker", {
    configurable: true,
    value
  });
}

function setCaches(value: unknown) {
  Object.defineProperty(window, "caches", {
    configurable: true,
    value
  });
}

describe("ServiceWorkerCleanup", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();

    if (serviceWorkerDescriptor) {
      Object.defineProperty(window.navigator, "serviceWorker", serviceWorkerDescriptor);
    } else if (navigatorDescriptor) {
      Object.defineProperty(window, "navigator", navigatorDescriptor);
    }

    if (cachesDescriptor) {
      Object.defineProperty(window, "caches", cachesDescriptor);
    } else {
      Reflect.deleteProperty(window, "caches");
    }
  });

  it("matches only app-specific cache names", () => {
    expect(shouldCleanupCache("leader-health-loop-precache-v1")).toBe(true);
    expect(shouldCleanupCache("LEADER-HEALTH-LOOP-runtime")).toBe(true);
    expect(shouldCleanupCache("shared-origin-cache")).toBe(false);
  });

  it("matches registrations for this app by scope or worker script URL", () => {
    expect(
      shouldCleanupRegistration(
        createRegistration({
          scope: "https://example.com/leader-health-loop/"
        })
      )
    ).toBe(true);

    expect(
      shouldCleanupRegistration(
        createRegistration({
          scope: "https://example.com/",
          activeScriptURL: "https://example.com/assets/leader-health-loop-sw.js"
        })
      )
    ).toBe(true);

    expect(
      shouldCleanupRegistration(
        createRegistration({
          scope: "https://example.com/shared-app/",
          activeScriptURL: "https://example.com/shared-app/sw.js"
        })
      )
    ).toBe(false);
  });

  it("unregisters and deletes only app-owned artifacts", async () => {
    const appRegistration = createRegistration({
      scope: "https://example.com/leader-health-loop/"
    });
    const legacyAppRegistration = createRegistration({
      scope: "https://example.com/",
      waitingScriptURL: "https://example.com/leader-health-loop-sw.js"
    });
    const otherRegistration = createRegistration({
      scope: "https://example.com/other-app/"
    });

    const getRegistrations = vi.fn().mockResolvedValue([appRegistration, legacyAppRegistration, otherRegistration]);
    const keys = vi
      .fn()
      .mockResolvedValue(["leader-health-loop-precache-v1", "shared-origin-cache", "leader-health-loop-data"]);
    const deleteCache = vi.fn().mockResolvedValue(true);

    await cleanupAppServiceWorkerArtifacts(
      { getRegistrations },
      {
        keys,
        delete: deleteCache
      }
    );

    expect(getRegistrations).toHaveBeenCalledOnce();
    expect(appRegistration.unregister).toHaveBeenCalledOnce();
    expect(legacyAppRegistration.unregister).toHaveBeenCalledOnce();
    expect(otherRegistration.unregister).not.toHaveBeenCalled();

    expect(keys).toHaveBeenCalledOnce();
    expect(deleteCache).toHaveBeenCalledTimes(2);
    expect(deleteCache).toHaveBeenCalledWith("leader-health-loop-precache-v1");
    expect(deleteCache).toHaveBeenCalledWith("leader-health-loop-data");
    expect(deleteCache).not.toHaveBeenCalledWith("shared-origin-cache");
  });

  it("does nothing when service worker APIs are unavailable", async () => {
    setServiceWorker(undefined);
    setCaches(undefined);

    await act(async () => {
      root.render(<ServiceWorkerCleanup />);
    });

    expect(container.innerHTML).toBe("");
  });

  it("runs scoped cleanup on mount when browser APIs exist", async () => {
    const appRegistration = createRegistration({
      scope: "https://example.com/leader-health-loop/"
    });
    const otherRegistration = createRegistration({
      scope: "https://example.com/other-app/"
    });
    const getRegistrations = vi.fn().mockResolvedValue([appRegistration, otherRegistration]);
    const deleteCache = vi.fn().mockResolvedValue(true);

    setServiceWorker({ getRegistrations });
    setCaches({
      keys: vi.fn().mockResolvedValue(["leader-health-loop-precache-v1", "shared-origin-cache"]),
      delete: deleteCache
    });

    await act(async () => {
      root.render(<ServiceWorkerCleanup />);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(getRegistrations).toHaveBeenCalledOnce();
    expect(appRegistration.unregister).toHaveBeenCalledOnce();
    expect(otherRegistration.unregister).not.toHaveBeenCalled();
    expect(deleteCache).toHaveBeenCalledOnce();
    expect(deleteCache).toHaveBeenCalledWith("leader-health-loop-precache-v1");
  });
});
