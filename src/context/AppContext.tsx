"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth, getUserDoc } from "@/config/firebase";
import { onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { logError } from "@/utils/errors";
import { getBrokerDetails } from "@/models/api/user";
import type { GetBrokerDetailsResponse } from "@/models/types/user";

export interface UserData {
  email: string;
  fullName: string;
  uid: string;
}

export type BrokerData = GetBrokerDetailsResponse["data"];
interface AppContext {
  userData: UserData | null;
  userDataloading: boolean;
  setUserData: (userData: UserData | null) => void;
  brokerData: BrokerData | null;
  brokerDataLoading: boolean;
  setBrokerData: (brokerData: BrokerData | null) => void;
}
const Context = createContext<AppContext | null>(null);
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, userLoading] = useAuthState(firebaseAuth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userDataloading, setUserDataloading] = useState(false);
  const [brokerData, setBrokerData] = useState<BrokerData | null>(null);
  const [brokerDataLoading, setBrokerDataLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("userMetaData", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userMetaData");
      if (userData) {
        setUserData(JSON.parse(userData));
      }
    } catch (err) {
      logError({
        description: "Failed to parse cached user data",
        error: err as Error,
        slackChannel: "ui-errors",
      });
    }
  }, []);

  useEffect(() => {
    if (!user?.uid || userLoading) {
      return;
    }
    setUserDataloading(true);
    const userDoc = getUserDoc(user?.uid);

    const unsubscribe = onSnapshot(userDoc, (doc) => {
      try {
        if (doc.exists()) {
          const data = doc.data() as UserData;
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (err) {
        logError({
          description: "Error fetching user data",
          error: err as Error,
          slackChannel: "frontend-errors",
        });
        setUserData(null);
      } finally {
        setUserDataloading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, userLoading]);

  // Fetch broker data
  useEffect(() => {
    if (!user?.uid || userLoading) {
      return;
    }

    const fetchBrokerData = async () => {
      try {
        setBrokerDataLoading(true);
        const response = await getBrokerDetails({ uid: user.uid });
        console.log("response.data", response.data);
        setBrokerData(response.data);
      } catch (err) {
        logError({
          description: "Error fetching broker data",
          error: err as Error,
          slackChannel: "frontend-errors",
        });
        setBrokerData(null);
      } finally {
        setBrokerDataLoading(false);
      }
    };

    fetchBrokerData();
  }, [user?.uid, userLoading]);

  return (
    <Context.Provider
      value={{
        userData,
        userDataloading,
        setUserData,
        brokerData,
        brokerDataLoading,
        setBrokerData,
      }}
    >
      <main>{children}</main>
    </Context.Provider>
  );
};
export const useApp = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error("Cannot access AppContext outside AppProvider");
  }
  return value;
};
