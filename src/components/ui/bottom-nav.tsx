"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  User,
  LayoutDashboard,
  Building2,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const { companyData } = useApp();
  const [isFabOpen, setIsFabOpen] = React.useState(false);

  // Close FAB menu when pathname changes
  React.useEffect(() => {
    setIsFabOpen(false);
  }, [pathname]);

  const navItems = companyData
    ? [
        {
          label: "Dashboard",
          href: "/company-dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Properties",
          href: "/company-properties",
          icon: Building2,
        },
        {
          isFab: true,
        },
        {
          label: "Enquiries",
          href: "/company-enquiries",
          icon: FileText,
        },
        {
          label: "Profile",
          href: "/profile",
          icon: User,
        },
      ]
    : [
        {
          label: "Home",
          href: "/",
          icon: Home,
        },
        {
          label: "Listings",
          href: "/my-listings",
          icon: Building2,
        },
        {
          isFab: true,
        },
        {
          label: "Enquiries",
          href: "/my-enquiries",
          icon: FileText,
        },
        {
          label: "Profile",
          href: "/profile",
          icon: User,
        },
      ];

  const FabMenu = () => (
    <AnimatePresence>
      {isFabOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFabOpen(false)}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm md:hidden"
          />
          <div className="fixed bottom-36 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-4 items-center w-max">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Link
                href="/property/createProperty"
                className="flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg hover:bg-primary/90"
                onClick={() => setIsFabOpen(false)}
              >
                <Building2 className="h-5 w-5" />
                <span className="font-medium">Create Property</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{
                delay: 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Link
                href="/enquiries/create"
                className="flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-lg hover:bg-primary/90"
                onClick={() => setIsFabOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Create Enquiry</span>
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <FabMenu />
      <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center md:hidden">
        <div className="pointer-events-auto relative flex h-16 w-[90vw] max-w-md items-center justify-between rounded-full border border-white/20 bg-background/60 px-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl">
          {navItems.map((item, index) => {
            if (item.isFab) {
              return (
                <div
                  key={index}
                  className="relative -top-8 flex h-16 w-16 items-center justify-center"
                >
                  <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={cn(
                      "relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-xl transition-transform active:scale-95",
                      isFabOpen
                        ? "bg-destructive text-destructive-foreground"
                        : ""
                    )}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isFabOpen ? 135 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                    >
                      <Plus className="h-8 w-8" />
                    </motion.div>
                  </button>
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive ? "scale-110" : "scale-100"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
                {/* Optional: Hide text on inactive to make it cleaner, or keep it. I'll keep it for now but maybe fade it. */}
                <span
                  className={cn(
                    "transition-opacity duration-300",
                    isActive ? "opacity-100 font-semibold" : "opacity-70"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
