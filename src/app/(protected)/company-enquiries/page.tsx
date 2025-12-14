"use client";

import React from "react";
import { useGetCompanyEnquiries } from "@/hooks/useCompany";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { H2 } from "@/components/text/h2";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CompanyEnquiries = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetCompanyEnquiries({ limit: "100" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enquiries = (data?.enquiries as any[]) || [];
  const brokerEnquiries = enquiries.filter((e) => e.source === "broker");
  const companyEnquiries = enquiries.filter((e) => e.source === "company");

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <H2 text="Company Enquiries" />
        <Button onClick={() => router.push("/enquiries/create")}>
          <Plus className="mr-2 h-4 w-4" /> Create Enquiry
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Enquiries</TabsTrigger>
          <TabsTrigger value="broker">Broker Enquiries</TabsTrigger>
          <TabsTrigger value="company">Company Enquiries</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={enquiries}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="broker">
          <DataTable
            columns={columns}
            data={brokerEnquiries}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="company">
          <DataTable
            columns={columns}
            data={companyEnquiries}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyEnquiries;
