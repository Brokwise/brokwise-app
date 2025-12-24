"use client";

import * as React from "react";
import {
    Building2,
    Home,
    LayoutDashboard,
    MessageSquare,
    PlusCircle,
    Users,
    FileText,
    FolderOpen,
    Map,
    FileDigit,
    Calculator,
    Gavel,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useApp } from "@/context/AppContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { companyData } = useApp();

    // Company Navigation
    const companyNav = [
        {
            title: "Dashboard",
            url: "/company-dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Brokers",
            url: "/company-brokers",
            icon: Users,
        },
        {
            title: "Properties",
            url: "/company-properties",
            icon: Building2,
        },
        {
            title: "Enquiries",
            url: "/company-enquiries",
            icon: FileText,
        },
        {
            title: "Messages",
            url: "/message",
            icon: MessageSquare,
        },
        {
            title: "List Property",
            url: "/property/createProperty",
            icon: PlusCircle,
        },
    ];

    // Regular Broker Navigation
    const brokerNav = [
        {
            title: "Properties",
            url: "/",
            icon: Home,
        },
        {
            title: "Enquiries",
            url: "/enquiries",
            icon: FileText,
        },
        {
            title: "Messages",
            url: "/message",
            icon: MessageSquare,
        },
        {
            title: "List Property",
            url: "/property/createProperty",
            icon: PlusCircle,
        },
    ];

    const resourcesNav = [
        {
            title: "Land Convertor",
            url: "/resources/land-convertor",
            icon: Calculator,
        },
        {
            title: "Jaipur DLC Rates",
            url: "/resources/jaipur-dlc-rates",
            icon: FileDigit,
        },
        {
            title: "JDA Circulars",
            url: `/resources/webview?url=${encodeURIComponent(
                "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/orders-circulars.html"
            )}&title=JDA Circulars`,
            icon: FileText,
        },
        {
            title: "GIS Portal",
            url: `/resources/webview?url=${encodeURIComponent(
                "https://gis.rajasthan.gov.in/"
            )}&title=GIS Portal`,
            icon: Map,
        },
        {
            title: "Apna Khata",
            url: `/resources/webview?url=${encodeURIComponent(
                "https://apnakhata.rajasthan.gov.in/"
            )}&title=Apna Khata`,
            icon: FileText,
        },
        {
            title: "BhuNaksha",
            url: `/resources/webview?url=${encodeURIComponent(
                "https://bhunaksha.rajasthan.gov.in/"
            )}&title=BhuNaksha`,
            icon: Map,
        },
        {
            title: "RERA",
            url: `/resources/webview?url=${encodeURIComponent(
                "https://rera.rajasthan.gov.in/"
            )}&title=RERA`,
            icon: Gavel,
        },
    ];

    const sidebarItems = companyData ? companyNav : brokerNav;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Building2 className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold text-lg font-instrument-serif text-white">Brokwise</span>
                        <span className="text-xs text-muted-foreground">
                            {companyData ? "Enterprise" : "Professional"}
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {!companyData && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Resources</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* Resources Collapsible/Dropdown could go here, but flat list is fine for sidebar */}
                                {resourcesNav.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
