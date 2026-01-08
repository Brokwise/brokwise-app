import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.brokwise.app",
  appName: "Brokwise",
  webDir: "public",
  server: {
    url: "https://app.brokwise.com",
    cleartext: true,
    iosScheme: "https",
  },
  ios: {
    path: "ios",
    scheme: "App",
    contentInset: "never",
    //@ts-ignore
    allowsFullScreenMode: true,
  },
  plugins: {
    App: {
      scheme: "brokwise",
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
    Browser: {
      customScheme: "brokwise",
    },
    StatusBar: {
      style: "dark",
      overlaysWebView: true,
      hideStatusBar: true,
    },
  },
  packageClassList: [
    "AppPlugin",
    "CAPBrowserPlugin",
    "ClipboardPlugin",
    "FilesystemPlugin",
    "KeyboardPlugin",
    "VoiceRecorder",
  ],
};

export default config;
