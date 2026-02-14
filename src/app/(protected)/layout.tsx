"use client";

import React, { useEffect, useState } from "react";
import { ProtectedPage } from "./_components/protected";
import { AppProvider } from "@/context/AppContext";
import { UndoDeleteProvider } from "@/context/UndoDeleteContext";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Notifications } from "./_components/notification/notifications";
import { UserAvatar } from "./_components/userAvatar";
import { CreditsBadge } from "./_components/creditsBadge";
import { LandConverter } from "./_components/landConverter";
import { SubscriptionGate } from "./_components/subscriptionGate";
import { Separator } from "@/components/ui/separator";
import { ChatbotWidget } from "@/components/chatbot";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useTheme } from "next-themes";
import { SwipeBackProvider } from "@/components/SwipeBackProvider";
import { getCookie } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [defaultSidebarOpen, setDefaultSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const sidebarCookie = getCookie("sidebar_state");
    setDefaultSidebarOpen(sidebarCookie === undefined ? true : sidebarCookie === "true");
    setMounted(true);
  }, []);

  useEffect(() => {

    const updateStatusBar = async () => {
      try {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        await StatusBar.show();
        if (currentTheme === "dark") {
          await StatusBar.setStyle({ style: Style.Dark });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
        }
      } catch (error) {
        console.error("Error updating status bar:", error);
      }
    };

    updateStatusBar();
  }, [mounted, theme, resolvedTheme]);

  useEffect(() => {
    if (!pathname.startsWith("/property/detail")) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isPrintShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p";
      if (isPrintShortcut) {
        event.preventDefault();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const originalPrint = window.print;
    window.print = () => undefined;

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.print = originalPrint;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <AppProvider>
      <ProtectedPage>
        <SwipeBackProvider>

          <UndoDeleteProvider>
            <SidebarProvider defaultOpen={defaultSidebarOpen}>
              <AppSidebar />
              <SidebarInset className="flex flex-col h-svh">
                <div className="sticky top-0 z-40 w-full bg-background shrink-0">
                  <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
                  <header className="flex h-16 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                      <SidebarTrigger className="-ml-1" />
                      <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditsBadge />
                      <LandConverter />
                      <Notifications />
                      <UserAvatar />
                    </div>
                  </header>
                </div>

                <div
                  data-scroll-container="protected-main"
                  className="flex-1 overflow-auto overscroll-y-contain scrollbar-hide"
                >
                  <main className="flex-1 min-h-0 flex flex-col w-full">
                    <SubscriptionGate>
                      {children}
                    </SubscriptionGate>
                  </main>
                </div>

                <BottomNav />
                <ChatbotWidget />
                <ScrollToTop />
              </SidebarInset >
            </SidebarProvider >
          </UndoDeleteProvider >
        </SwipeBackProvider >
      </ProtectedPage >
    </AppProvider >
  );
};

export default Layout;
