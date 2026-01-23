import React from "react";
import { ProtectedPage } from "./_components/protected";
import { AppProvider } from "@/context/AppContext";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cookies } from "next/headers";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Notifications } from "./_components/notification/notifications";
import { UserAvatar } from "./_components/userAvatar";
import { CreditsBadge } from "./_components/creditsBadge";
import { Separator } from "@/components/ui/separator";
import { ChatbotWidget } from "@/components/chatbot";

const layout = ({ children }: { children: React.ReactNode }) => {
  const sidebarCookie = cookies().get("sidebar_state")?.value;
  const defaultSidebarOpen =
    sidebarCookie === undefined ? true : sidebarCookie === "true";

  return (
    <AppProvider>
      <ProtectedPage>
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-40 w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>

              <div className="flex items-center gap-2">
                <CreditsBadge />
                <Notifications />
                <UserAvatar />
              </div>
            </header>

            <main className="flex-1 min-h-0 px-4 flex flex-col max-w-[1600px] mx-auto w-full p-4 pt-[3px] pb-32 md:pb-[3px] overflow-auto scrollbar-hide">
              {children}
            </main>

            <BottomNav />
            <ChatbotWidget />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedPage>
    </AppProvider>
  );
};

export default layout;
