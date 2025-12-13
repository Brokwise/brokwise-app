"use client";

import React from "react";
import { useGetCompanyProperties } from "@/hooks/useCompany";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const CompanyProperties = () => {
  const { data, isLoading, error } = useGetCompanyProperties({ limit: "100" });

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data?.properties || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default CompanyProperties;
