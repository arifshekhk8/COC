"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check browser support
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications are not supported in this browser.");
      }

      // 2. Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 3. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied.");
      }

      // 4. Get push subscription
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        ...(vapidKey && {
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }),
      };

      const subscription = await registration.pushManager.subscribe(
        subscribeOptions
      );
      const json = subscription.toJSON();

      // 5. Send to backend
      await api.post("/api/push/subscribe/", {
        endpoint: json.endpoint,
        keys: json.keys,
      });

      setIsSubscribed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to subscribe.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSubscribed, isLoading, error, subscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
