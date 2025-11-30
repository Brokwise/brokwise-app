import React from "react";
import { ProtectedPage } from "./_components/protected";
import { AppProvider } from "@/context/AppContext";
import NavBar from "./_components/navBar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      <ProtectedPage>
        <main className="h-screen w-full flex flex-col bg-background">
          <NavBar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </ProtectedPage>
    </AppProvider>
  );
};

export default layout;
