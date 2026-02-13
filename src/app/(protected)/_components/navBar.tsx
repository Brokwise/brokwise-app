"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { Notifications } from "./notification/notifications";
import { FavouriteProperties } from "./favouriteProperties";

import { UserAvatar } from "./userAvatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_RESOURCE_STATE,
  getStoredResourceState,
  setStoredResourceState,
  useResourceCatalog,
} from "@/hooks/useResourceCatalog";
import {
  buildResourceHref,
  opensInNewTab,
} from "@/lib/resourceCatalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceItem } from "@/types/resource";

const toolTitleByKey: Record<string, string> = {
  "land-converter": "nav_land_convertor",
};

const resourceTitleByKey: Record<string, string> = {
  news: "nav_news",
};

const ResourceLinkRow = ({
  item,
  label,
  stateCode,
}: {
  item: ResourceItem;
  label: string;
  stateCode?: string;
}) => {
  const href = buildResourceHref(item, stateCode);
  const newTab = opensInNewTab(item);

  return (
    <DropdownMenuItem>
      {newTab ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full"
        >
          {label}
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      ) : (
        <Link href={href} className="flex items-center justify-between w-full">
          {label}
          {item.targetType === "external" && (
            <ExternalLink className="w-4 h-4 ml-2" />
          )}
        </Link>
      )}
    </DropdownMenuItem>
  );
};

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { companyData } = useApp();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = React.useState<string>(
    DEFAULT_RESOURCE_STATE
  );

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
      const next =
        catalog.selectedState || catalog.states[0]?.code || DEFAULT_RESOURCE_STATE;
      setSelectedState(next);
      setStoredResourceState(next);
    }
  }, [catalog, selectedState]);

  // If user is a company, show simplified navbar
  if (companyData) {
    const navLinks = [
      { href: "/company-brokers", label: t("nav_brokers") },
      { href: "/company-dashboard", label: t("nav_dashboard") },
      { href: "/message", label: t("nav_messages") },
      { href: "/company-properties", label: t("nav_properties") },
      { href: "/company-enquiries", label: t("nav_enquiries") },
      { href: "/property/createProperty", label: t("nav_list_property") },
    ];

    return (
      <div
        id="navHeader"
        className="w-full h-[4rem] flex justify-between items-center px-4xl"
      >
        <div>
          <h1 className="text-2xl">Brokwise</h1>
        </div>
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname.includes(link.href)
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-md">
          <UserAvatar />
        </div>
      </div>
    );
  }

  return (
    <div
      id="navHeader"
      className="w-full h-[4rem]  flex justify-between items-center px-4xl"
    >
      <div>
        <h1 className="">Brokwise</h1>
      </div>
      <div className="flex items-center gap-4">
        <Tabs
          defaultValue="properties"
          className=""
          value={
            pathname === "/"
              ? "/"
              : pathname.includes("/enquiries")
              ? "/enquiries"
              : pathname.includes("/property/createProperty")
              ? "listProperty"
              : pathname.includes("/message")
              ? "message"
              : "none"
          }
        >
          <TabsList className="bg-transparent">
            <TabsTrigger
              onClick={() => {
                router.push("/");
              }}
              className={cn(
                "cursor-pointer",
                pathname === "/" && "bg-primary text-white"
              )}
              value="/"
            >
              {t("nav_properties")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                router.push("/message");
              }}
              className={cn(
                "cursor-pointer",
                pathname.includes("/message") && "bg-primary text-white"
              )}
              value="message"
            >
              {t("nav_messages")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                router.push("/enquiries");
              }}
              className={cn(
                "cursor-pointer",
                pathname.includes("/enquiries") && "bg-primary text-white"
              )}
              value="/enquiries"
            >
              {t("nav_enquiries")}
            </TabsTrigger>
            <TabsTrigger
              className={cn(
                "cursor-pointer",
                pathname === "/property/createProperty" && " text-white"
              )}
              value="listProperty"
              onClick={() => {
                router.push("/property/createProperty");
              }}
            >
              {t("nav_list_property")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-44">
          <Select
            value={selectedState}
            onValueChange={(value) => {
              setSelectedState(value);
              setStoredResourceState(value);
            }}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={t("resources_select_state", "Select State")} />
            </SelectTrigger>
            <SelectContent>
              {catalog.states.map((state) => (
                <SelectItem key={state._id} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="" variant="ghost">
              {t("nav_resources")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72">
            <DropdownMenuLabel>{t("nav_tools")}</DropdownMenuLabel>
            {catalog.tools.map((item) => (
              <ResourceLinkRow
                key={item._id}
                item={item}
                stateCode={selectedState}
                label={t(toolTitleByKey[item.key] || item.label, item.label)}
              />
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("resources_common_links", "Common Resources")}</DropdownMenuLabel>
            {catalog.commonResources.map((item) => (
              <ResourceLinkRow
                key={item._id}
                item={item}
                stateCode={selectedState}
                label={t(resourceTitleByKey[item.key] || item.label, item.label)}
              />
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              {t("resources_state_links", "State Resources")}
            </DropdownMenuLabel>
            {catalog.stateResources.length ? (
              catalog.stateResources.map((item) => (
                <ResourceLinkRow
                  key={item._id}
                  item={item}
                  stateCode={selectedState}
                  label={t(resourceTitleByKey[item.key] || item.label, item.label)}
                />
              ))
            ) : (
              <DropdownMenuItem disabled>
                {t("resources_empty_state", "No links for selected state")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-md">
        <Notifications />
        <FavouriteProperties />
        <UserAvatar />
      </div>
    </div>
  );
};

export default NavBar;
