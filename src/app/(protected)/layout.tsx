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
import { Separator } from "@/components/ui/separator";
import { ChatbotWidget } from "@/components/chatbot";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useTheme } from "next-themes";

// Helper to get cookie value on client side
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [defaultSidebarOpen, setDefaultSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const sidebarCookie = getCookie("sidebar_state");
    setDefaultSidebarOpen(sidebarCookie === undefined ? true : sidebarCookie === "true");
    setMounted(true);
  }, []);

  // Handle status bar based on theme
  useEffect(() => {
    if (!mounted || !Capacitor.isNativePlatform()) return;

    const updateStatusBar = async () => {
      try {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        
        // Show status bar
        await StatusBar.show();
        
        // Update status bar style based on theme
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

  // Avoid hydration mismatch by rendering null until mounted
  if (!mounted) {
    return null;
  }

  return (
    <AppProvider>
      <ProtectedPage>
        <UndoDeleteProvider>
          <SidebarProvider defaultOpen={defaultSidebarOpen}>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-svh">
              {/* Fixed header with safe area - this doesn't scroll */}
              <div className="sticky top-0 z-40 w-full bg-background shrink-0">
                {/* Safe area spacer for iOS status bar */}
                <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
                {/* Actual header content */}
                <header className="flex h-16 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-auto scrollbar-hide">
                <main className="flex-1 min-h-0 flex flex-col w-full">
                  {children}
                </main>
              </div>

              <BottomNav />
              <ChatbotWidget />
              <ScrollToTop />
            </SidebarInset>
          </SidebarProvider>
        </UndoDeleteProvider>
      </ProtectedPage>
    </AppProvider>
  );
};

export default Layout;
