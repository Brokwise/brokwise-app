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
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <Avatar className="h-9 w-9 border border-border">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user?.displayName || "User"}
                width={100}
                height={100}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary font-semibold">
                {(user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3 bg-muted/50 border border-border/50 rounded-lg mb-2 shadow-sm">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none text-foreground">{user?.displayName || "User"}</p>
            <p className="text-xs leading-normal text-muted-foreground truncate max-w-[280px] pb-0.5" title={user?.email || ""}>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem asChild className="cursor-pointer py-2.5 focus:bg-accent/50">
            <Link href="/profile" className="w-full flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="font-medium">{t("nav_profile") || "Profile"}</span>
            </Link>
          </DropdownMenuItem>

          <div className="px-2 py-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</span>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-2 rounded-lg border bg-card mb-2 hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Languages className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{t("select_language") || "Language"}</span>
              </div>
              <div className="flex gap-1 p-1 bg-muted/60 rounded-lg">
                <Button
                  variant={currentLang === "en" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-3 rounded-md text-xs font-medium transition-all ${currentLang === 'en' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    changeLanguage("en");
                  }}
                >
                  EN
                </Button>
                <Button
                  variant={currentLang === "hi" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-3 rounded-md text-xs font-medium transition-all ${currentLang === 'hi' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    changeLanguage("hi");
                  }}
                >
                  हिं
                </Button>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sun className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Theme</span>
              </div>
              <div className="flex gap-1 p-1 bg-muted/60 rounded-lg">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 rounded-md transition-all ${theme === 'light' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme("light");
                  }}
                >
                  <Sun className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 rounded-md transition-all ${theme === 'dark' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme("dark");
                  }}
                >
                  <Moon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 rounded-md transition-all ${theme === 'system' ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme("system");
                  }}
                >
                  <Computer className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={() => signOut(firebaseAuth)}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5 flex items-center gap-3 font-medium"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          </div>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
