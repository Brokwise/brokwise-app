"use client";

import React, { useMemo, useState } from "react";
import { useGetCompanyEnquiries } from "@/hooks/useCompany";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { H2 } from "@/components/text/h2";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AllEnquiries = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetCompanyEnquiries({ limit: "100" });
  const [activeTab, setActiveTab] = useState<"company" | "broker">("company");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enquiries = (data?.enquiries as any[]) || [];
  const filteredEnquiries = useMemo(
    () => enquiries.filter((enquiry) => enquiry.source === activeTab),
    [enquiries, activeTab]
  );
  const heading =
    activeTab === "company" ? "Company Enquiries" : "Broker Enquiries";

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <H2 text={heading} />
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="company">Company Enquiries</TabsTrigger>
              <TabsTrigger value="broker">Broker Enquiries</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button onClick={() => router.push("/enquiries/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Enquiry
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredEnquiries}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default AllEnquiries;
