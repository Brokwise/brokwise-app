import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
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
export const firebaseApp = initializeApp(Config.firebaseConfig);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
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
