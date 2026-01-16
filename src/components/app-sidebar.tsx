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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  // Company Navigation
  const companyNav: SidebarNavItem[] = [
    {
      title: "Dashboard",
      url: "/company-dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Home",
      url: "/company-marketplace",
      icon: HomeIcon,
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
      items: [
        {
          title: "Company Enquiry",
          url: "/company-enquiries/company",
        },
        {
          title: "Broker Enquiry",
          url: "/company-enquiries/brokers",
        },
        {
          title: "Marketplace Enquiry",
          url: "/company-enquiries/marketplace",
        },
      ],
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
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
  const brokerNav: SidebarNavItem[] = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },

    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: "My Listings",
      url: "/my-listings",
      icon: Building2,
    },
    {
      title: "My Enquiries",
      url: "/my-enquiries",
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
    {
      title: "Contacts",
      url: "/contacts",
      icon: Contact2,
    },
    {
      title: "Projects (Coming soon)",
      url: "/projects",
      icon: LandPlotIcon,
    },
  ];

  const resourcesNav: SidebarNavItem[] = [
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

  const sidebarItems: SidebarNavItem[] = companyData ? companyNav : brokerNav;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-lg font-instrument-serif text-sidebar-foreground">
              Brokwise
            </span>
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
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
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
              Privacy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-sidebar-foreground transition-colors"
            >
              Terms
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
