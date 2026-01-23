"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { Computer, Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
export function UserAvatar() {
  const [user] = useAuthState(firebaseAuth);
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <Image
              src={user?.photoURL || ""}
              alt={user?.displayName || "User"}
              width={100}
              height={100}
            />
            <AvatarFallback>
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full cursor-pointer">
              {t("nav_profile")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Language Toggle */}
          <DropdownMenuItem
            className="focus:bg-transparent focus:text-foreground"
            onSelect={(e) => e.preventDefault()}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span className="text-sm">{t("select_language")}</span>
              </div>
              <div className="flex gap-1 border rounded-full px-1 py-0.5 bg-muted/50">
                <Button
                  variant={currentLang === "en" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 rounded-full text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeLanguage("en");
                  }}
                >
                  EN
                </Button>
                <Button
                  variant={currentLang === "hi" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 rounded-full text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changeLanguage("hi");
                  }}
                >
                  हिं
                </Button>
              </div>
            </div>
          </DropdownMenuItem>
          {/* Theme Toggle */}
          <DropdownMenuItem
            className="focus:bg-transparent focus:text-foreground"
            onSelect={(e) => e.preventDefault()}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-sm">Theme</span>
              <div className="flex gap-1 border rounded-full px-1 py-0.5 bg-muted/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTheme("light");
                  }}
                >
                  <Sun className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTheme("dark");
                  }}
                >
                  <Moon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTheme("system");
                  }}
                >
                  <Computer className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut(firebaseAuth)}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
