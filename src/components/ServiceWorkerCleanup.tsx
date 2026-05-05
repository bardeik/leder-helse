"use client";

import { useEffect } from "react";

const APP_ARTIFACT_TOKEN = "leader-health-loop";

type RegistrationWorkerLike = {
  scriptURL: string;
};

type ServiceWorkerRegistrationLike = {
  scope: string;
  unregister: () => Promise<boolean>;
  active?: RegistrationWorkerLike | null;
  installing?: RegistrationWorkerLike | null;
  waiting?: RegistrationWorkerLike | null;
};

type CacheStorageLike = Pick<CacheStorage, "keys" | "delete">;

type ServiceWorkerContainerLike = Pick<ServiceWorkerContainer, "getRegistrations">;

function includesAppArtifactToken(value: string | undefined): boolean {
  return value?.toLowerCase().includes(APP_ARTIFACT_TOKEN) ?? false;
}

export function shouldCleanupRegistration(registration: ServiceWorkerRegistrationLike): boolean {
  const workerScriptUrls = [registration.active, registration.installing, registration.waiting]
    .map((worker) => worker?.scriptURL)
    .filter((scriptURL): scriptURL is string => typeof scriptURL === "string");

  return includesAppArtifactToken(registration.scope) || workerScriptUrls.some(includesAppArtifactToken);
}

export function shouldCleanupCache(cacheName: string): boolean {
  return includesAppArtifactToken(cacheName);
}

export async function cleanupAppServiceWorkerArtifacts(
  serviceWorker: ServiceWorkerContainerLike,
  cacheStorage: CacheStorageLike
): Promise<void> {
  const registrations = await serviceWorker.getRegistrations();
  const registrationsToCleanup = registrations.filter(shouldCleanupRegistration);

  await Promise.all(registrationsToCleanup.map((registration) => registration.unregister()));

  const cacheKeys = await cacheStorage.keys();
  const cacheKeysToCleanup = cacheKeys.filter(shouldCleanupCache);

  await Promise.all(cacheKeysToCleanup.map((cacheKey) => cacheStorage.delete(cacheKey)));
}

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || typeof caches === "undefined") {
      return;
    }

    void (async () => {
      // Scope the cleanup to app-owned artifacts so retiring this app's legacy worker/caches
      // does not unregister unrelated service workers or delete caches from the same origin.
      await cleanupAppServiceWorkerArtifacts(navigator.serviceWorker, caches);
    })();
  }, []);

  return null;
}
