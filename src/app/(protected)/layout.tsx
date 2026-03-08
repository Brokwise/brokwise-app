"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { Input } from "@/components/ui/input";
import { ChatbotWidget } from "@/components/chatbot";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useTheme } from "next-themes";
import { SwipeBackProvider } from "@/components/SwipeBackProvider";
import { cn, getCookie } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import Script from "next/script";
import FacebookPixel from "@/components/analytics/facebook-pixel";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { useGetCurrentSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceFilterStore } from "@/stores/marketplaceFilterStore";
import {
  Home,
  Bookmark,
  Building2,
  FileText,
  MessageSquare,
  PlusCircle,
  Contact2,
  LandPlotIcon,
  Crown,
  LayoutDashboard,
  HomeIcon,
  Users,
  Search,
  X,
  Wrench,
  Newspaper,
  Calculator,
  Tag,
  KeyIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function TopNavLinks() {
  const pathname = usePathname();
  const { companyData } = useApp();
  const { t } = useTranslation();
  const [homeOpen, setHomeOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    listingPurposeFilter,
    setListingPurposeFilter,
  } = useMarketplaceFilterStore();

  const isBroker = !companyData;
  const { subscription, isLoading: subLoading } = useGetCurrentSubscription({
    enabled: isBroker,
  });
  const hasActiveSubscription =
    isBroker &&
    !!subscription &&
    (subscription.status === "active" ||
      subscription.status === "authenticated" ||
      subscription.status === "created");

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    setHomeOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  type NavItem = { title: string; url: string; icon: React.ElementType };

  const brokerHomeItems: NavItem[] = [
    { title: t("nav_my_listings"), url: "/my-listings", icon: Building2 },
    { title: t("nav_my_enquiries"), url: "/my-enquiries", icon: FileText },
    { title: t("nav_contacts"), url: "/contacts", icon: Contact2 },
    { title: t("nav_messages"), url: "/message", icon: MessageSquare },
    { title: t("nav_projects"), url: "/projects", icon: LandPlotIcon },
    { title: t("nav_subscription"), url: "/subscription", icon: Crown },
    { title: t("nav_bookmarks"), url: "/bookmarks", icon: Bookmark },
  ];

  const companyHomeItems: NavItem[] = [
    { title: t("nav_dashboard"), url: "/company-dashboard", icon: LayoutDashboard },
    { title: t("nav_home"), url: "/company-marketplace", icon: HomeIcon },
    { title: t("nav_brokers"), url: "/company-brokers", icon: Users },
    { title: t("nav_properties"), url: "/company-properties", icon: Building2 },
    { title: t("nav_enquiries"), url: "/company-enquiries", icon: FileText },
    { title: t("nav_bookmarks"), url: "/bookmarks", icon: Bookmark },
    { title: t("nav_messages"), url: "/message", icon: MessageSquare },
    { title: t("nav_list_property"), url: "/property/createProperty", icon: PlusCircle },
  ];

  const homeItems: NavItem[] = companyData
    ? companyHomeItems
    : !subLoading && isBroker && !hasActiveSubscription
      ? brokerHomeItems.filter((item) => item.url === "/subscription")
      : brokerHomeItems;

  const toolItems: NavItem[] = [
    { title: t("nav_news"), url: "/resources/news", icon: Newspaper },
    { title: t("nav_resources"), url: "/resources", icon: FileText },
    { title: t("nav_land_convertor"), url: "/resources/land-convertor", icon: Calculator },
  ];

  const closeAll = () => {
    setHomeOpen(false);
    setToolsOpen(false);
  };

  const activeItems = homeOpen ? homeItems : toolItems;

  const overlay = (
    <AnimatePresence>
      {(homeOpen || toolsOpen) && (
        <>
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md hidden lg:block"
          />
          <motion.div
            key="nav-popup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[110] hidden lg:flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <button
                onClick={closeAll}
                className="mb-4 h-12 w-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              {activeItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Link
                      href={item.url}
                      onClick={closeAll}
                      className="flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors min-w-[240px] justify-center"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <nav className="hidden lg:flex items-center gap-2 flex-1 max-w-3xl mx-auto">
        {/* Home popup trigger */}
        <button
          onClick={() => {
            setHomeOpen(!homeOpen);
            setToolsOpen(false);
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap border",
            homeOpen
              ? "bg-primary text-primary-foreground shadow-sm border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
          )}
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </button>

        {/* Tools popup trigger */}
        <button
          onClick={() => {
            setToolsOpen(!toolsOpen);
            setHomeOpen(false);
          }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap border",
            toolsOpen
              ? "bg-primary text-primary-foreground shadow-sm border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
          )}
        >
          <Wrench className="h-3.5 w-3.5" />
          Tools
        </button>

        {/* Search box */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-muted/30 border-border/40 rounded-lg placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Purpose selector: All | Buy | Rent */}
        <div className="flex gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/30 shrink-0">
          {([
            { value: "ALL", label: "All", icon: Home },
            { value: "SALE", label: "Buy", icon: Tag },
            { value: "RENT", label: "Rent", icon: KeyIcon },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setListingPurposeFilter(opt.value)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                listingPurposeFilter === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <opt.icon className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </nav>

      {portalTarget && createPortal(overlay, portalTarget)}
    </>
  );
}

const ROUTE_STORAGE_KEY = "bw_last_route";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [defaultSidebarOpen, setDefaultSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    const sidebarCookie = getCookie("sidebar_state");
    setDefaultSidebarOpen(sidebarCookie === undefined ? true : sidebarCookie === "true");
    setMounted(true);
  }, []);

  // Persist current route so it can be restored after iOS WebView reload
  useEffect(() => {
    try {
      const fullPath = pathname + window.location.search;
      localStorage.setItem(ROUTE_STORAGE_KEY, fullPath);
    } catch { /* storage unavailable */ }
  }, [pathname]);

  // Restore route on Capacitor native when WebView reloads from root
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const saved = localStorage.getItem(ROUTE_STORAGE_KEY);
      if (saved && saved !== "/" && saved !== pathname) {
        router.replace(saved);
      }
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <>
      {gtmId ? (
        <>
          <Script
            id="gtm-script-protected"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}
      <FacebookPixel />
      <AppProvider>
        <ProtectedPage>
          <SwipeBackProvider>
            <UndoDeleteProvider>
              <SidebarProvider defaultOpen={defaultSidebarOpen}>
                <AppSidebar className="lg:!hidden" />
                <SidebarInset className="flex flex-col h-svh">
                  <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-xl shrink-0">
                    <div style={{ height: "env(safe-area-inset-top, 0px)" }} />
                    <header className="flex h-14 items-center justify-between gap-3 border-b border-border/60 px-4 lg:px-6">
                      {/* Left: Mobile sidebar trigger + Desktop logo */}
                      <div className="flex items-center gap-2 shrink-0">
                        <SidebarTrigger className="-ml-1 lg:hidden" />
                        <Separator orientation="vertical" className="mr-2 h-4 lg:hidden" />
                        <Link href="/" className="flex items-center gap-2.5">
                          <Image
                            src="/logo.webp"
                            height={32}
                            width={32}
                            alt="Brokwise"
                            className="rounded-full"
                          />
                          <span className="font-semibold text-base text-foreground tracking-tight hidden lg:block">
                            Brokwise
                          </span>
                        </Link>
                      </div>

                      {/* Center: Desktop nav links */}
                      <TopNavLinks />

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CreditsBadge />
                        <LandConverter />
                        <Notifications />
                        <UserAvatar />
                      </div>
                    </header>
                  </div>

                  <div
                    data-scroll-container="protected-main"
                    className="flex-1 overflow-hidden min-h-0"
                  >
                    <main className="h-full flex flex-col w-full overflow-auto overscroll-y-contain scrollbar-hide">
                      <SubscriptionGate>
                        {children}
                      </SubscriptionGate>
                    </main>
                  </div>

                  <BottomNav />
                  <ChatbotWidget />
                  <ScrollToTop />
                </SidebarInset>
              </SidebarProvider>
            </UndoDeleteProvider>
          </SwipeBackProvider>
        </ProtectedPage>
      </AppProvider>
    </>
  );
};

export default Layout;
