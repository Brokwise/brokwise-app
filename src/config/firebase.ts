import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  indexedDBLocalPersistence, 
  initializeAuth,
  Auth
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { Config } from "./index";
import { Broker } from "@/stores/authStore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Initialize Firebase app only once
export const firebaseApp = getApps().length === 0 
  ? initializeApp(Config.firebaseConfig) 
  : getApp();

export const firebaseDb = getFirestore(firebaseApp);

// Initialize auth with proper persistence for the platform
// Use indexedDBLocalPersistence for Capacitor (more reliable in WebViews)
function getFirebaseAuth(): Auth {
  if (Capacitor.isNativePlatform()) {
    try {
      // Try to initialize with indexedDB persistence for native platforms
      return initializeAuth(firebaseApp, {
        persistence: indexedDBLocalPersistence,
      });
    } catch {
      // If already initialized, just get the existing auth instance
      return getAuth(firebaseApp);
    }
  }
  return getAuth(firebaseApp);
}

export const firebaseAuth = getFirebaseAuth();
export const firebaseStorage = getStorage(firebaseApp);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});
export const getUserDoc = (userId: string) =>
  doc(firebaseDb, `users/${userId}`);
export const setUserDoc = async (
  userDoc: DocumentReference<DocumentData>,
  userData: Partial<Broker>
) => {
  return await setDoc(userDoc, userData, { merge: true });
};
