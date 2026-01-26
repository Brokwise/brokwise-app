"use client";

import React, { useState } from "react";
import { useGetProjects } from "@/hooks/useProject";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Loader2, Search, MapPin, LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { formatAddress } from "@/utils/helper";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useGetAllBookings } from "@/hooks/useBooking";
import { useRouter } from "next/navigation";

const ProjectsPage = () => {
  const [viewMode, setViewMode] = useState<"PROJECTS" | "BOOKINGS">("PROJECTS");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { data: bookingsResponse, isLoading: isBookingsLoading } =
    useGetAllBookings();
  const bookings = bookingsResponse?.data?.bookings || [];

  const [recentOpen, setRecentOpen] = useState(false);
  const {
    recentSearches,
    isLoading: isRecentLoading,
    refetch: refetchRecentSearches,
    addRecentSearch,
  } = useRecentSearches({ enabled: false });

  const { projects, isLoading, error } = useGetProjects({
    search: debouncedSearch,
  });

  return (
    <main className="container mx-auto py-8 space-y-8">
      <div className="shrink-0 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 pb-4 pt-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <h1 className="text-2xl md:text-3xl text-foreground tracking-tight shrink-0">
              Projects
            </h1>

            {/* Segmented Control */}
            <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-lg border border-border/40">
              <Button
                type="button"
                variant={viewMode === "PROJECTS" ? "default" : "ghost"}
                onClick={() => setViewMode("PROJECTS")}
                size="sm"
                className={`h-8 rounded-md px-3 md:px-4 text-sm font-medium transition-all ${
                  viewMode === "PROJECTS"
                    ? "shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Projects
              </Button>
              <Button
                type="button"
                variant={viewMode === "BOOKINGS" ? "default" : "ghost"}
                onClick={() => setViewMode("BOOKINGS")}
                size="sm"
                className={`h-8 rounded-md px-3 md:px-4 text-sm font-medium transition-all ${
                  viewMode === "BOOKINGS"
                    ? "shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Bookings
              </Button>
            </div>
          </div>
        </div>

        {/* Full-Width Search Bar */}
        <div className="relative w-full">
          <Popover open={recentOpen} onOpenChange={setRecentOpen}>
            <PopoverAnchor asChild>
              <div className="relative flex items-center w-full rounded-xl bg-muted/40 border border-border/50 hover:border-border/80 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                <Search className="absolute left-4 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder={
                    viewMode === "PROJECTS"
                      ? "Search projects by name, location..."
                      : "Search bookings..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={async () => {
                    setRecentOpen(true);
                    await refetchRecentSearches();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setRecentOpen(false);
                      return;
                    }
                    if (e.key === "Enter") {
                      const term = searchQuery.trim();
                      if (term) {
                        void addRecentSearch(term);
                      }
                      setRecentOpen(false);
                    }
                  }}
                  className="pl-11 pr-10 h-11 text-sm bg-transparent border-0 shadow-none rounded-xl placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 h-7 w-7 hover:bg-muted rounded-lg"
                    title="Clear"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </PopoverAnchor>

            <PopoverContent
              className="w-[min(28rem,calc(100vw-2rem))] p-0 rounded-xl"
              align="start"
            >
              <div className="p-3 border-b border-border/50">
                <h4 className="font-semibold text-sm">Recent Searches</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {isRecentLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : recentSearches.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No recent searches yet.
                    <br />
                    <span className="text-xs">
                      Press Enter to save a search term.
                    </span>
                  </div>
                ) : (
                  recentSearches.slice(0, 5).map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                      onClick={() => {
                        setSearchQuery(term);
                        setRecentOpen(false);
                        void addRecentSearch(term);
                      }}
                    >
                      <span className="font-medium">{term}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content */}
      {viewMode === "PROJECTS" ? (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading projects: {error.message}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project._id} href={`/projects/${project._id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                    <div className="aspect-video relative bg-muted">
                      <Image
                        width={100}
                        height={100}
                        src={project.images?.[0] || "/images/placeholder.webp"}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.webp";
                        }}
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={
                          project.projectStatus === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.projectStatus}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {formatAddress(project.address)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <LayoutGrid className="h-4 w-4" />
                          {project.numberOfPlots} Plots
                        </div>
                        <div className="capitalize">{project.projectUse}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {isBookingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card
                  key={booking._id}
                  className="h-full hover:shadow-md transition-shadow cursor-default"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {booking.projectId.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Plot {booking.plotId.plotNumber}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          booking.bookingStatus === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize shrink-0"
                      >
                        {booking.bookingStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/40 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">
                        {booking.customerDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">
                        ₹{booking.plotId.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        router.push("/booking/" + booking._id);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default ProjectsPage;
