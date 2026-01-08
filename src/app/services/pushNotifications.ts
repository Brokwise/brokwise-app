"use client";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

export class PushNotificationsService {
  static async initalize(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log("Push notifications not supported on web");
      return;
    }
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== "granted") {
      console.log("PN permissions denied");
      return;
    }
    await PushNotifications.register();

    await PushNotifications.addListener("registration", async (token) => {
      console.log("Push registration done, token", token.value);

      await fetch("http://localhost:8080/notification/registerToken", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          userId,
          token: token.value,
        }),
      });
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.error("Error registration" + JSON.stringify(error));
    });
    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push received", JSON.stringify(notification));
      }
    );
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push action performed: " + JSON.stringify(notification));

        const data = notification.notification.data;
        if (data.route) {
          window.location.hash = data.route;
        }
      }
    );
  }
  static async removeAllListeners() {
    await PushNotifications.removeAllListeners();
  }
}
