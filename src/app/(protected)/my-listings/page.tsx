"use client";

import { useGetMyListings } from "@/hooks/useProperty";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function MyListings() {
  const { myListings, isLoading, error } = useGetMyListings();

  return (
    <div className="p-6 md:p-8 pb-24">
      <DataTable
        columns={columns}
        data={myListings || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
