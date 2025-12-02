"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { Notifications } from "./notifications";
import { FavouriteProperties } from "./favouriteProperties";

import { UserAvatar } from "./userAvatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div
      id="navHeader"
      className="w-full h-[4rem]  flex justify-between items-center px-4xl"
    >
      <div>
        <h1 className="font-instrument-serif">Brokwise</h1>
      </div>
      <div>
        <Tabs defaultValue="properties" className="" value={pathname}>
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
