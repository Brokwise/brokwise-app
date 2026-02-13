"use client";
import { useCallback, useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter } from "next/navigation";
import { isNativeIOS } from "@/utils/helper";
import { Keyboard } from "@capacitor/keyboard";
import { PrivacyScreen } from "@capacitor/privacy-screen";
export type ContentType = "file" | "webURL" | "appContent";

export function DeepLinkHandler() {
  const router = useRouter();
  const isIOS = isNativeIOS();

  const handleUrl = useCallback(
    (url?: string) => {
      if (!url || !url.includes("brokwise://")) return;
      if (url.includes("brokwise://share")) {
        const queryString = url.split("brokwise://share?")[1];
        if (!queryString) return;
        const decodedQueryString = decodeURIComponent(queryString);
        const urlParams = new URLSearchParams(decodedQueryString);
        const sharedData = {
          title: urlParams.get("title"),
          description: urlParams.get("description"),
          url: urlParams.get("url"),
          type: urlParams.get("type"),
        };
        const { title, description, type, url: sharedUrl } = sharedData;
        if (!type || !sharedUrl) {
          console.error("Missing required parameters type or url");
          return;
        }
        const navigationUrl = `/share?type=${encodeURIComponent(
          type
        )}&url=${encodeURIComponent(sharedUrl)}${title ? `&title=${encodeURIComponent(title)}` : ""
          }${description ? `&description=${encodeURIComponent(description)}` : ""
          }`;
        router.push(navigationUrl);
        return;
      }

      const path = url.split("brokwise://")[1];
      if (path) {
        router.push(`/${path}`);
      }
    },
    [router]
  );

  useEffect(() => {
    if (isIOS) {
      PrivacyScreen.enable();
      Keyboard.setAccessoryBarVisible({ isVisible: false });
      App.addListener("appUrlOpen", (data: { url: string }) => {
        handleUrl(data.url);
      });
      // Handle cold start when the app is opened via brokwise:// URL.
      App.getLaunchUrl().then((data) => handleUrl(data?.url));
    }
    return () => {
      if (isIOS) {
        App.removeAllListeners();
      }
    };
  }, [router, isIOS, handleUrl]);

  return null;
}
