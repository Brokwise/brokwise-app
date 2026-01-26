"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetMyEnquiries } from "@/hooks/useEnquiry";
import { EnquiryCard } from "@/app/(protected)/enquiries/_components/EnquiryCard";
import {
  Loader2,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
  const [view, setView] = useState<"grid" | "list" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const { t } = useTranslation();

  // Load view preference from local storage
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY);
      setView(savedView === "list" ? "list" : "grid");
    } catch {
      setView("grid");
    }
  }, []);

  const handleSetView = (newView: "grid" | "list") => {
    setView(newView);
    try {
      localStorage.setItem(STORAGE_KEY, newView);
    } catch {
      // ignore
    }
  };

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

      const descriptionMatch = enquiry.description
        ?.toLowerCase()
        .includes(search);

      const locationString = formatEnquiryLocation(enquiry);
      const locationMatch = locationString.toLowerCase().includes(search);

      const categoryMatch = enquiry.enquiryCategory
        ?.toLowerCase()
        .includes(search);

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

      <div className="space-y-6">
        {/* Filters Section */}
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
              <div className="flex items-center bg-muted/50 p-1 rounded-md border shadow-sm">
                <Button
                  variant={effectiveView === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${effectiveView === "grid" ? "shadow-sm border border-border/50 bg-background" : ""}`}
                  onClick={() => handleSetView("grid")}
                  title={t("label_grid_view")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={effectiveView === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${effectiveView === "list" ? "shadow-sm border border-border/50 bg-background" : ""}`}
                  onClick={() => handleSetView("list")}
                  title={t("label_table_view")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredEnquiries}
          viewMode={effectiveView}
          onRowClick={(enquiry) => router.push(`/enquiries/${enquiry._id}`)}
          renderGridItem={(enquiry) => <EnquiryCard enquiry={enquiry} />}
        />
      </div>
    </PageShell>
  );
};

export default MyEnquiriesPage;
