"use client";

import { getToken } from "firebase/messaging";
import { useEffect, useRef, useState } from "react";

import { getFirebaseMessaging } from "./firebase";

const FCM_TOKEN_KEY = "pedefree_fcm_token";
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useFcmToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const cached = sessionStorage.getItem(FCM_TOKEN_KEY);
    if (cached) {
      setToken(cached);
      return;
    }

    const request = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const messaging = await getFirebaseMessaging();
        if (!messaging || !VAPID_KEY) return;

        await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (fcmToken) {
          sessionStorage.setItem(FCM_TOKEN_KEY, fcmToken);
          setToken(fcmToken);
        }
      } catch {
        // notificações não disponíveis
      }
    };

    request();
  }, []);

  return token;
}

