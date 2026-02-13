"use client";

import * as React from "react";
import {
  Building2,
  Bookmark,
  Calculator,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Users,
  FileText,
  LandPlotIcon,
  ChevronRight,
  Contact2,
  type LucideIcon,
  HomeIcon,
  Crown,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import {
  DEFAULT_RESOURCE_STATE,
  getStoredResourceState,
  setStoredResourceState,
  useResourceCatalog,
} from "@/hooks/useResourceCatalog";
import {
  buildResourceHref,
  isResourceActive,
  opensInNewTab,
  resolveResourceIcon,
} from "@/lib/resourceCatalog";

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
  const searchParams = useSearchParams();
  const currentResourceKey = searchParams.get("resourceKey") || undefined;
  const { companyData } = useApp();
  const { t } = useTranslation();
  const { setOpenMobile, isMobile } = useSidebar();

  const [selectedState, setSelectedState] = React.useState<string>(DEFAULT_RESOURCE_STATE);

  React.useEffect(() => {
    setSelectedState(getStoredResourceState());
  }, []);

  const { catalog } = useResourceCatalog(selectedState);

  React.useEffect(() => {
    const allowed = new Set(catalog.states.map((state) => state.code));
    if (!allowed.size) {
      return;
    }

    if (!selectedState || !allowed.has(selectedState)) {
      const next = catalog.selectedState || catalog.states[0]?.code || DEFAULT_RESOURCE_STATE;
      setSelectedState(next);
      setStoredResourceState(next);
    }
  }, [catalog, selectedState]);

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isMenuItemActive = (url: string) => {
    if (url === "/resources") {
      return pathname === url || pathname.startsWith(`${url}/`);
    }
    return pathname === url;
  };

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

  const sidebarItems: SidebarNavItem[] = companyData ? companyNav : brokerNav;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <Image
            src="/logo.webp"
            height={52}
            className="rounded-full"
            width={52}
            alt="Brokwise"
          />

          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-lg text-foreground md:text-sidebar-foreground">
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
                                  onClick={handleMenuClick}
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
                      onClick={handleMenuClick}
                      asChild
                      className="hover:bg-transparent hover:text-sidebar-background"
                      tooltip={item.title}
                      isActive={isMenuItemActive(item.url)}
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
          <>
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav_tools")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleMenuClick}
                      asChild
                      tooltip={t("nav_news")}
                      isActive={pathname === "/resources/news"}
                    >
                      <Link href="/resources/news">
                        <Newspaper />
                        <span>{t("nav_news")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleMenuClick}
                      asChild
                      tooltip={t("nav_resources")}
                      isActive={pathname === "/resources"}
                    >
                      <Link href="/resources">
                        <FileText />
                        <span>{t("nav_resources")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {catalog.tools.map((item) => {
                    const isLandConverterTool =
                      item.key === "land-converter" ||
                      item.target === "/resources/land-convertor";
                    if (!isLandConverterTool) {
                      return null;
                    }

                    const Icon = resolveResourceIcon(item);
                    const href = buildResourceHref(item, selectedState);
                    const active = isResourceActive(item, pathname, currentResourceKey);
                    const newTab = opensInNewTab(item);
                    const title = t("nav_land_convertor");

                    return (
                      <SidebarMenuItem key={item._id}>
                        <SidebarMenuButton
                          onClick={handleMenuClick}
                          asChild
                          tooltip={title}
                          isActive={active}
                        >
                          {newTab ? (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              <Icon />
                              <span>{title}</span>
                              <ExternalLink className="ml-auto size-3 opacity-70 group-data-[collapsible=icon]:hidden" />
                            </a>
                          ) : (
                            <Link href={href}>
                              <Icon />
                              <span>{title}</span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  {!catalog.tools.some(
                    (item) =>
                      item.key === "land-converter" ||
                      item.target === "/resources/land-convertor"
                  ) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleMenuClick}
                        asChild
                        tooltip={t("nav_land_convertor")}
                        isActive={pathname === "/resources/land-convertor"}
                      >
                        <Link href="/resources/land-convertor">
                          <Calculator />
                          <span>{t("nav_land_convertor")}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-4 py-3 group-data-[collapsible=icon]:hidden">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link
              href="/privacy-policy"
              onClick={handleMenuClick}
              className="hover:text-sidebar-foreground transition-colors"
            >
              {t("label_privacy")}
            </Link>
            <Link
              href="/terms-and-conditions"
              onClick={handleMenuClick}
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
