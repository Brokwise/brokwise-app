import React from "react";
import { ProtectedPage } from "./_components/protected";
import { AppProvider } from "@/context/AppContext";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Notifications } from "./_components/notifications";
import { UserAvatar } from "./_components/userAvatar";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      <ProtectedPage>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background/50 backdrop-blur-sm sticky top-0 z-10 w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {/* Global Search Trigger Placeholder */}
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex items-center gap-2 text-muted-foreground bg-muted/50 w-64 justify-start"
                >
                  <Search className="h-4 w-4" />
                  <span>Search properties...</span>
                  <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Header Elements could go here if needed, but usually kept minimal */}
                <div className="flex items-center gap-2">
                  <Notifications />
                  <UserAvatar />
                </div>
              </div>
            </header>

            <div className="flex-1 p-4 pt-4 pb-24 md:pb-4 max-w-[1600px] mx-auto w-full">
              {children}
            </div>

            <BottomNav />
          </SidebarInset>
        </SidebarProvider>
      </ProtectedPage>
    </AppProvider>
  );
};

export default layout;
