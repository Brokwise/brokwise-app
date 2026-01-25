"use client";

import { useGetMyListings } from "@/hooks/useProperty";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PageHeader, PageShell } from "@/components/ui/layout";

export default function MyListings() {
  const { myListings, isLoading, error } = useGetMyListings();

  return (
    <PageShell>
      <PageHeader
        title="My Listings"
        description="Manage your property listings and their status."
      />
      <DataTable
        columns={columns}
        data={myListings || []}
        isLoading={isLoading}
        error={error}
      />
    </PageShell>
  );
}
