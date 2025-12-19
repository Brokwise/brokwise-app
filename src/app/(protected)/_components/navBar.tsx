"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { Notifications } from "./notifications";
import { FavouriteProperties } from "./favouriteProperties";

import { UserAvatar } from "./userAvatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { companyData } = useApp();

  // If user is a company, show simplified navbar
  if (companyData) {
    const navLinks = [
      { href: "/company-brokers", label: "Brokers" },
      { href: "/company-dashboard", label: "Dashboard" },
      { href: "/message", label: "Messages" },
      { href: "/company-properties", label: "Properties" },
      { href: "/company-enquiries", label: "Enquiries" },
      { href: "/property/createProperty", label: "List Property" },
    ];

    return (
      <div
        id="navHeader"
        className="w-full h-[4rem] flex justify-between items-center px-4xl"
      >
        <div>
          <h1 className="font-instrument-serif text-2xl">Brokwise</h1>
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
          {/* <Notifications /> Company might need notifications later, but for now strict "only brokers" */}
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
        <h1 className="font-instrument-serif">Brokwise</h1>
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
              Properties
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
              Messages
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
              Enquiries
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
              List Property
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="" variant="ghost">
              Resources
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
              <Link href="/resources/land-convertor" className="w-full">
                Land Convertor
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/resources/jaipur-dlc-rates" className="w-full">
                Jaipur DLC Rates
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/resources/webview?url=${encodeURIComponent(
                  "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/orders-circulars.html"
                )}&title=JDA Circulars`}
                className="flex items-center justify-between w-full"
              >
                JDA Circulars <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/resources/webview?url=${encodeURIComponent(
                  "https://gis.rajasthan.gov.in/"
                )}&title=GIS Portal`}
                className="flex items-center justify-between w-full"
              >
                GIS Portal <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/resources/webview?url=${encodeURIComponent(
                  "https://apnakhata.rajasthan.gov.in/"
                )}&title=Apna Khata`}
                className="flex items-center justify-between w-full"
              >
                Apna Khata <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/resources/webview?url=${encodeURIComponent(
                  "https://bhunaksha.rajasthan.gov.in/"
                )}&title=BhuNaksha`}
                className="flex items-center justify-between w-full"
              >
                BhuNaksha <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/resources/webview?url=${encodeURIComponent(
                  "https://rera.rajasthan.gov.in/"
                )}&title=RERA`}
                className="flex items-center justify-between w-full"
              >
                RERA <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </DropdownMenuItem>
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
