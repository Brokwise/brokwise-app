"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetMyListings } from "@/hooks/useProperty";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PageHeader, PageShell } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  Loader2,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyCard } from "@/app/(protected)/_components/propertyCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/constants";
import { formatAddress } from "@/utils/helper";
import { PropertyActions } from "@/components/property/property-actions";

const STORAGE_KEY = "myListingsView";

export default function MyListings() {
  const router = useRouter();
  const { myListings, isLoading, error } = useGetMyListings();
  const { t } = useTranslation();

  const [view, setView] = useState<"grid" | "list" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");

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

  const filteredListings = useMemo(() => {
    if (!myListings) return [];
    return myListings.filter((property) => {
      // Status Filter
      if (statusFilter !== "all" && property.listingStatus !== statusFilter) {
        return false;
      }

      // Property Type Filter
      if (
        propertyTypeFilter !== "all" &&
        property.propertyType !== propertyTypeFilter
      ) {
        return false;
      }

      // Search Filter
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();

      const descriptionMatch = property.description
        ?.toLowerCase()
        .includes(search);

      const addressMatch = formatAddress(property.address)
        .toLowerCase()
        .includes(search);

      const typeMatch = property.propertyType
        .toLowerCase()
        .replace(/_/g, " ")
        .includes(search);

      const categoryMatch = property.propertyCategory
        .toLowerCase()
        .includes(search);

      return descriptionMatch || addressMatch || typeMatch || categoryMatch;
    });
  }, [myListings, searchQuery, statusFilter, propertyTypeFilter]);

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
        <p>{t("toast_error_property_list") || "Error loading properties"}</p>
      </div>
    );
  }

  return (
    <PageShell className="pt-4 md:pt-6 scrollbar-hide">
      <PageHeader
        title="My Listings"
        description="Manage your property listings and their status."
        className="w-full"
      >
        <Button asChild size="sm" className="h-9 sm:h-10">
          <Link href="/property/createProperty">
            <Plus className="h-4 w-4 mr-2" />
            {t("page_add_property")}
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Filters Section */}
        {myListings && myListings.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1 sm:mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("page_my_enquiries_search_placeholder") || "Search..."}
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
                    <SelectItem value="ACTIVE">{t("label_active")}</SelectItem>
                    <SelectItem value="SOLD">{t("label_sold") || "Sold"}</SelectItem>
                    <SelectItem value="RENTED">{t("label_rented") || "Rented"}</SelectItem>
                    <SelectItem value="EXPIRED">{t("label_expired")}</SelectItem>
                    <SelectItem value="DRAFT">{t("label_draft")}</SelectItem>
                    <SelectItem value="DELISTED">{t("label_delisted")}</SelectItem>
                    <SelectItem value="DELETED">{t("label_deleted")}</SelectItem>
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
          data={filteredListings}
          viewMode={effectiveView}
          onRowClick={(property) => router.push(`/property/${property._id}`)}
          renderGridItem={(property) => (
            <PropertyCard
              property={property}
              showMapButton={false}
              actionSlot={<PropertyActions property={property} />}
            />
          )}
        />
      </div>
    </PageShell>
  );
}
