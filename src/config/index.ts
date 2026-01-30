import { FirebaseConfig } from "./firebase";
import pkg from "../../package.json";

export type Environment = "prod" | "staging" | "dev" | "local" | "backendLocal";

export interface FrontendConfig {
  environment: Environment;
  frontendUrl: string;
  backendUrl: string;
  googleOauthClientId: string;
  firebaseConfig: FirebaseConfig;
}

const initClient = () => {
  return {
    version: pkg.version,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,
    googleOauthClientId: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    backendUrl: process.env.NEXT_PUBLIC_API_URL,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT as Environment,
  } as const;
};

export const Config = initClient();
