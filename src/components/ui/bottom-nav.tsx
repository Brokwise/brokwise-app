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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export function BottomNav() {
  const pathname = usePathname();
  const { companyData } = useApp();

  // Floating Action Button (Add Property)
  const Fab = () => (
    <div className="relative flex items-center justify-center">
      <div
        className="pointer-events-none absolute h-20 w-20 rounded-full bg-background/20 blur-md"
        aria-hidden
      />
      <Link
        href="/property/createProperty"
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary bg-background text-primary shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );

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
          component: Fab, // Middle Button
          href: "/property/createProperty",
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
          component: Fab, // Middle Button
          href: "/property/createProperty",
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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center md:hidden">
      <div className="pointer-events-auto relative flex h-20 w-[92vw] max-w-3xl items-center justify-between gap-2 rounded-full bg-primary px-4 shadow-[0_12px_35px_rgba(0,0,0,0.22)] backdrop-blur">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground/10 blur-lg"
          aria-hidden
        />
        {navItems.map((item, index) => {
          if (item.component) {
            const Component = item.component;
            return (
              <div
                key={index}
                className="relative flex basis-1/5 items-center justify-center"
              >
                <Component />
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
                "flex basis-1/5 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "fill-current" : "opacity-80"
                )}
              />
              <span>{item.label}</span>
              {isActive && <span className="h-1 w-1 rounded-full bg-current" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
