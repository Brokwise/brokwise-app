import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.brokwise.app",
  appName: "Brokwise",
  webDir: "out",
  // server: {
  //   url: "http://localhost:3001",
  //   cleartext: true
  // },

  ios: {
    path: "ios",
    scheme: "App",
  },
  plugins: {
    App: {
      //@ts-ignore
      scheme: "brokwise",
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    SplashScreen: {
      launchShowDuration: 3,
    },
    Browser: {
      customScheme: "brokwise",
    },
    PrivacyScreen: {
      enable: true,
    },
    StatusBar: {
      style: "dark",
      overlaysWebView: true,
    },
  },
  packageClassList: [
    "AppPlugin",
    "CAPBrowserPlugin",
    "ClipboardPlugin",
    "FilesystemPlugin",
    "KeyboardPlugin",
    "StatusBarPlugin",
    "VoiceRecorder",
  ],
};

export default config;
