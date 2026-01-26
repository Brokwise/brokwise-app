"use client";

import * as React from "react";
import {
  Building2,
  Bookmark,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Users,
  FileText,
  Map,
  FileDigit,
  Calculator,
  Gavel,
  LandPlotIcon,
  ChevronRight,
  Contact2,
  type LucideIcon,
  HomeIcon,
  NewspaperIcon,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useApp } from "@/context/AppContext";

type SidebarNavSubItem = {
  title: string;
  url: string;
};

type SidebarNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: SidebarNavSubItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { companyData } = useApp();
  const { t } = useTranslation();

  // Company Navigation
  const companyNav: SidebarNavItem[] = [
    {
      title: t("nav_dashboard"),
      url: "/company-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("nav_home"),
      url: "/company-marketplace",
      icon: HomeIcon,
    },
    {
      title: t("nav_brokers"),
      url: "/company-brokers",
      icon: Users,
    },
    {
      title: t("nav_properties"),
      url: "/company-properties",
      icon: Building2,
    },
    {
      title: t("nav_enquiries"),
      url: "/company-enquiries",
      icon: FileText,
    },
    {
      title: t("nav_bookmarks"),
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: t("nav_messages"),
      url: "/message",
      icon: MessageSquare,
    },
    {
      title: t("nav_list_property"),
      url: "/property/createProperty",
      icon: PlusCircle,
    },
  ];

  const brokerNav: SidebarNavItem[] = [
    {
      title: t("nav_home"),
      url: "/",
      icon: Home,
    },

    {
      title: t("nav_bookmarks"),
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: t("nav_my_listings"),
      url: "/my-listings",
      icon: Building2,
    },
    {
      title: t("nav_my_enquiries"),
      url: "/my-enquiries",
      icon: FileText,
    },
    {
      title: t("nav_messages"),
      url: "/message",
      icon: MessageSquare,
    },
    {
      title: t("nav_list_property"),
      url: "/property/createProperty",
      icon: PlusCircle,
    },
    {
      title: t("nav_contacts"),
      url: "/contacts",
      icon: Contact2,
    },
    {
      title: t("nav_projects"),
      url: "/projects",
      icon: LandPlotIcon,
    },
    {
      title: t("nav_subscription"),
      url: "/subscription",
      icon: Crown,
    },
  ];

  const resourcesNav: SidebarNavItem[] = [
    {
      title: t("nav_news"),
      url: "/resources/news",
      icon: NewspaperIcon,
    },
    {
      title: t("nav_land_convertor"),
      url: "/resources/land-convertor",
      icon: Calculator,
    },
    {
      title: t("nav_dlc_rates"),
      url: "/resources/jaipur-dlc-rates",
      icon: FileDigit,
    },
    {
      title: t("nav_jda_circulars"),
      url: `/resources/webview?url=${encodeURIComponent(
        "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/orders-circulars.html"
      )}&title=JDA Circulars`,
      icon: FileText,
    },
    {
      title: t("nav_gis_portal"),
      url: `/resources/webview?url=${encodeURIComponent(
        "https://gis.rajasthan.gov.in/"
      )}&title=GIS Portal`,
      icon: Map,
    },
    {
      title: t("nav_apna_khata"),
      url: `/resources/webview?url=${encodeURIComponent(
        "https://apnakhata.rajasthan.gov.in/"
      )}&title=Apna Khata`,
      icon: FileText,
    },
    {
      title: t("nav_bhunaksha"),
      url: `/resources/webview?url=${encodeURIComponent(
        "https://bhunaksha.rajasthan.gov.in/"
      )}&title=BhuNaksha`,
      icon: Map,
    },
    {
      title: t("nav_rera"),
      url: `/resources/webview?url=${encodeURIComponent(
        "https://rera.rajasthan.gov.in/"
      )}&title=RERA`,
      icon: Gavel,
    },
  ];

  const sidebarItems: SidebarNavItem[] = companyData ? companyNav : brokerNav;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-lg text-sidebar-foreground">
              Brokwise
            </span>
            <span className="text-xs text-muted-foreground">
              {companyData ? t("nav_enterprise") : t("nav_professional")}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav_menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                if (item.items?.length) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.items.some(
                        (subItem) => pathname === subItem.url
                      )}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                return (
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!companyData && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav_resources")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Resources Collapsible/Dropdown could go here, but flat list is fine for sidebar */}
                {resourcesNav.map((item) => (
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
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link
              href="/privacy-policy"
              className="hover:text-sidebar-foreground transition-colors"
            >
              {t("label_privacy")}
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-sidebar-foreground transition-colors"
            >
              {t("label_terms")}
            </Link>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            © {new Date().getFullYear()} Brokwise
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
