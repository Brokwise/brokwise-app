"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetMyEnquiries } from "@/hooks/useEnquiry";
import { EnquiryCard } from "@/app/(protected)/enquiries/_components/EnquiryCard";
import {
  Loader2,
  Plus,
  Inbox,
  LayoutGrid,
  List,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEnquiryLocation } from "@/utils/helper";
import { PROPERTY_TYPES } from "@/constants";

const STORAGE_KEY = "myEnquiriesView";

const MyEnquiriesPage = () => {
  const router = useRouter();
  const { myEnquiries, isLoading, error } = useGetMyEnquiries();
  const [view, setView] = useState<"grid" | "list" | null>(null); // null = loading from storage
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");

  // Load view preference from local storage (client-side only)
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY);
      setView(savedView === "list" ? "list" : "grid");
    } catch {
      // localStorage not available (SSR or privacy mode)
      setView("grid");
    }
  }, []);

  const handleSetView = (newView: "grid" | "list") => {
    setView(newView);
    try {
      localStorage.setItem(STORAGE_KEY, newView);
    } catch {
      // localStorage not available
    }
  };

  // Derive effective view for rendering (default to grid while loading)
  const effectiveView = view ?? "grid";

  const filteredEnquiries = useMemo(() => {
    if (!myEnquiries) return [];
    return myEnquiries.filter((enquiry) => {
      // Status Filter
      if (statusFilter !== "all" && enquiry.status !== statusFilter)
        return false;

      // Property Type Filter
      if (
        propertyTypeFilter !== "all" &&
        enquiry.enquiryType !== propertyTypeFilter
      )
        return false;

      // Search Filter
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();

      // Check if description matches
      const descriptionMatch = enquiry.description
        ?.toLowerCase()
        .includes(search);

      // Check if location matches
      const locationString = formatEnquiryLocation(enquiry);
      const locationMatch = locationString.toLowerCase().includes(search);

      // Check if category matches
      const categoryMatch = enquiry.enquiryCategory
        ?.toLowerCase()
        .includes(search);

      // Check if type matches
      const typeMatch = enquiry.enquiryType?.toLowerCase().includes(search);

      return descriptionMatch || locationMatch || categoryMatch || typeMatch;
    });
  }, [myEnquiries, searchQuery, statusFilter, propertyTypeFilter]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh] text-destructive">
        <p>Error loading your enquiries. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight">My Enquiries</h1>
            <p className="text-muted-foreground">
              Manage the enquiries you have posted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 p-1 rounded-md border">
              <Button
                variant={effectiveView === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleSetView("grid")}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={effectiveView === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleSetView("list")}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => router.push("/enquiries/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Enquiry
            </Button>
          </div>
        </div>

        {/* Filters Section - Visible in both views */}
        {myEnquiries && myEnquiries.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, location, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={propertyTypeFilter}
                onValueChange={setPropertyTypeFilter}
              >
                <SelectTrigger className="h-10 bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-bold">{myEnquiries?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Enquiries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {myEnquiries?.filter((e) => e.status === "active").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              {myEnquiries?.reduce(
                (acc, curr) => acc + (curr.submissionCount || 0),
                0
              ) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Responses</div>
          </CardContent>
        </Card>
      </div>

      {!myEnquiries || myEnquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium font-instrument-serif">
            No enquiries yet
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            You haven&apos;t created any enquiries yet. Start by creating one to
            find properties.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/enquiries/create")}
          >
            Create your first enquiry
          </Button>
        </div>
      ) : (
        <>
          {effectiveView === "grid" ? (
            filteredEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">
                  No enquiries match your filters
                </h3>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPropertyTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnquiries.map((enquiry) => (
                  <EnquiryCard key={enquiry._id} enquiry={enquiry} />
                ))}
              </div>
            )
          ) : (
            <DataTable columns={columns} data={filteredEnquiries} />
          )}
        </>
      )}
    </div>
  );
};

export default MyEnquiriesPage;
