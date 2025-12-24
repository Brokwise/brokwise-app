"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Search,
    Plus,
    MessageSquare,
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
        <div className="relative -top-5">
            <Link href="/property/createProperty">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg text-accent-foreground border-4 border-background hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6" />
                </div>
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
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden">
            <div className="flex h-16 items-center justify-around px-4">
                {navItems.map((item, index) => {
                    if (item.component) {
                        const Component = item.component;
                        return <Component key={index} />;
                    }

                    const Icon = item.icon!;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={index}
                            href={item.href!}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[3rem]",
                                isActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
