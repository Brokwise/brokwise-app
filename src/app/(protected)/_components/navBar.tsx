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

  return (
    <div
      id="navHeader"
      className="w-full h-[4rem]  flex justify-between items-center px-4xl"
    >
      <div>
        <h1 className="font-instrument-serif">Brokwise</h1>
      </div>
      <div>
        <Tabs defaultValue="properties" className="w-[400px]" value={pathname}>
          <TabsList>
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
              className={cn(
                "cursor-pointer",
                pathname === "/property/createProperty" &&
                  "bg-primary text-white"
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
