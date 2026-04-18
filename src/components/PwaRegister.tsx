"use client";

import { useEffect, useRef, useState } from "react";

export function PwaRegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const handleControllerChange = () => {
      if (!cancelled) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    const watchInstallingWorker = (registration: ServiceWorkerRegistration) => {
      const installing = registration.installing;
      if (!installing) {
        return;
      }

      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = registration.waiting;

          if (document.visibilityState === "hidden") {
            setInstallingUpdate(true);
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            return;
          }

          setUpdateReady(true);
        }
      });
    };

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setUpdateReady(true);
        }

        registration.addEventListener("updatefound", () => watchInstallingWorker(registration));
        watchInstallingWorker(registration);

        // Trigger an update check on startup, then continue polling periodically.
        void registration.update();

        const intervalId = window.setInterval(() => {
          void registration.update();
        }, 5 * 24 * 60 * 60 * 1000);

        return () => window.clearInterval(intervalId);
      } catch {
        return undefined;
      }
    };

    let cleanupInterval: (() => void) | undefined;

    void registerWorker().then((cleanup) => {
      cleanupInterval = cleanup;
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      cleanupInterval?.();
    };
  }, []);

  function applyUpdateAndRestart() {
    if (!waitingWorkerRef.current) {
      return;
    }

    setInstallingUpdate(true);
    setUpdateReady(false);
    waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
  }

  if (!updateReady && !installingUpdate) {
    return null;
  }

  return (
    <aside className="pwa-update-banner" role="status" aria-live="polite">
      <p>
        {installingUpdate
          ? "Installerer ny appversjon og starter på nytt..."
          : "En ny versjon er tilgjengelig og klar til installasjon."}
      </p>
      {updateReady ? (
        <button className="primary" type="button" onClick={applyUpdateAndRestart}>
          Start appen på nytt
        </button>
      ) : null}
    </aside>
  );
}
