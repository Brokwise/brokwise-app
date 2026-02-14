"use client";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { normalizeNotificationRoute } from "@/lib/notificationNavigation";

export class PushNotificationsService {
  static async initalize(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "Push notifications not supported on web (or use Service Worker)"
      );
      return;
    }

    const permStatus = await FirebaseMessaging.checkPermissions();
    if (permStatus.receive === "prompt") {
      await FirebaseMessaging.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
    }

    await FirebaseMessaging.addListener("tokenReceived", async (event) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/registerToken`,
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ userId, token: event.token }),
          }
        );
      } catch (e) {
        console.error("Failed to send token to backend", e);
      }
    });

    await FirebaseMessaging.addListener("notificationReceived", (event) => {
      console.log("Push received", JSON.stringify(event));
    });

    await FirebaseMessaging.addListener(
      "notificationActionPerformed",
      (event) => {
        console.log("Push action performed", JSON.stringify(event));
        const data = event.notification.data;
        const rawRoute = data ? (data as { route?: string }).route : undefined;
        const target = normalizeNotificationRoute(rawRoute) || "/";
        // Keep full reload for push-action navigation in Capacitor context.
        window.location.href = target;
      }
    );

    await FirebaseMessaging.getToken();
  }

  static async removeAllListeners() {
    await FirebaseMessaging.removeAllListeners();
  }
}
