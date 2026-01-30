"use client";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";

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
        if (data && (data as { route?: string }).route) {
          window.location.hash = (data as { route: string }).route;
        }
      }
    );

    await FirebaseMessaging.getToken();
  }

  static async removeAllListeners() {
    await FirebaseMessaging.removeAllListeners();
  }
}
