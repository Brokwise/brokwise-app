"use client";

import { useGetMyListings } from "@/hooks/useProperty";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const MyListings = () => {
  const { myListings, isLoading, error } = useGetMyListings();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={myListings || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default MyListings;
