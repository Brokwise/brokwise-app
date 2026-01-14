"use client";

import React from "react";
import { useGetCompanyEnquiries } from "@/hooks/useCompany";
import { DataTable } from "../data-table";
import { columns } from "../columns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { H2 } from "@/components/text/h2";

const BrokerEnquiries = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetCompanyEnquiries({ limit: "100" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enquiries = (data?.enquiries as any[]) || [];
  const brokerEnquiries = enquiries.filter((e) => e.source === "broker");

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <H2 text="Broker Enquiries" />
        <Button onClick={() => router.push("/enquiries/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Enquiry
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={brokerEnquiries}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default BrokerEnquiries;
