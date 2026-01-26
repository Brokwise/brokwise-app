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
import { useTranslation } from "react-i18next";
import { PageShell, PageHeader } from "@/components/ui/layout";

const STORAGE_KEY = "myEnquiriesView";

const MyEnquiriesPage = () => {
  const router = useRouter();
  const { myEnquiries, isLoading, error } = useGetMyEnquiries();
  const [view, setView] = useState<"grid" | "list" | null>(null); // null = loading from storage
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const { t } = useTranslation();

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
        <p>{t("page_my_enquiries_error")}</p>
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={t("page_my_enquiries_title")}
        description={t("page_my_enquiries_subtitle")}
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 sm:h-10"
            onClick={() => router.push("/enquiries/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("action_create_enquiry")}
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-5 sm:space-y-6">
        {/* Filters Section - Visible in both views */}
        {myEnquiries && myEnquiries.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1 sm:mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("page_my_enquiries_search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm bg-background"
              />
            </div>
            <div className="flex gap-2">


              <div className="w-full sm:w-48 flex flex-row">
                <Select
                  value={propertyTypeFilter}
                  onValueChange={setPropertyTypeFilter}
                >
                  <SelectTrigger className="h-10 text-sm bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("label_select_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("label_all_types")}</SelectItem>
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
                  <SelectTrigger className="h-10 text-sm bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("label_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("label_all_status")}</SelectItem>
                    <SelectItem value="active">{t("label_active")}</SelectItem>
                    <SelectItem value="closed">{t("label_closed")}</SelectItem>
                    <SelectItem value="expired">{t("label_expired")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center bg-muted/50 p-1 rounded-md border">
                <Button
                  variant={effectiveView === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleSetView("grid")}
                  title={t("label_grid_view")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={effectiveView === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleSetView("list")}
                  title={t("label_table_view")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2">
            <div className="text-xl sm:text-2xl font-bold">
              {myEnquiries?.length || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              {t("page_my_enquiries_total")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {myEnquiries?.filter((e) => e.status === "active").length || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              {t("page_my_enquiries_active")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {myEnquiries?.reduce(
                (acc, curr) => acc + (curr.submissionCount || 0),
                0
              ) || 0}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              {t("page_my_enquiries_responses")}
            </div>
          </CardContent>
        </Card>
      </div>

      {!myEnquiries || myEnquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          <Inbox className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4 opacity-50" />
          <h3 className="text-lg font-medium">
            {t("page_my_enquiries_empty_title")}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto mt-2">
            {t("page_my_enquiries_empty_desc")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-9 sm:h-10"
            onClick={() => router.push("/enquiries/create")}
          >
            {t("page_my_enquiries_empty_button")}
          </Button>
        </div>
      ) : (
        <>
          {effectiveView === "grid" ? (
            filteredEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border rounded-xl bg-muted/20 border-dashed">
                <Inbox className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                <h3 className="text-lg font-medium">
                  {t("page_my_enquiries_no_match")}
                </h3>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPropertyTypeFilter("all");
                  }}
                >
                  {t("action_clear_filters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    </PageShell>
  );
};

export default MyEnquiriesPage;
