"use client";

import { useGetMyListings } from "@/hooks/useProperty";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PageHeader, PageShell } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MyListings() {
  const { myListings, isLoading, error } = useGetMyListings();

  const { t } = useTranslation();

  return (
    <PageShell>
      <PageHeader
        title="My Listings"
        description="Manage your property listings and their status."
        className="sm:items-start"
      >
        <Button asChild size="sm" className="h-10 mt-1">
          <Link href="/property/createProperty">
            <Plus className="h-4 w-4 mr-2" />
            {t("page_add_property")}
          </Link>
        </Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={myListings || []}
        isLoading={isLoading}
        error={error}
      />
    </PageShell>
  );
}
