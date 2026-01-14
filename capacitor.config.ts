import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.brokwise.app",
  appName: "Brokwise",
  webDir: "public",
  server: {
    url: "http://localhost:3001",
    cleartext: true,
    iosScheme: "http",
  },
  ios: {
    path: "ios",
    scheme: "App",
    contentInset: "always",
    //@ts-ignore
    allowsFullScreenMode: true,
  },
  plugins: {
    App: {
      //@ts-ignore
      scheme: "brokwise",
    },
    SplashScreen: {
      launchShowDuration: 3,
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
