"use client";

import React from "react";
import { useGetCompanyEnquiries } from "@/hooks/useCompany";
import { useGetMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Inbox } from "lucide-react";
import { H2 } from "@/components/text/h2";
import { EnquiryCard } from "../../enquiries/_components/EnquiryCard";
import { Skeleton } from "@/components/ui/skeleton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CompanyEnquiries = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetCompanyEnquiries({ limit: "100" });
  const {
    marketPlaceEnquiries,
    isPending: isMarketplaceLoading,
    error: marketplaceError,
  } = useGetMarketPlaceEnquiries();

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
          <TabsTrigger value="marketplace">Marketplace Enquiries</TabsTrigger>
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
        <TabsContent value="marketplace">
          {isMarketplaceLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : marketplaceError ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <p className="text-red-500 font-medium">
                Unable to load enquiries at the moment.
              </p>
              <Button variant="link" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : marketPlaceEnquiries.length === 0 ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No marketplace enquiries found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketPlaceEnquiries.map((enquiry) => (
                <div key={enquiry._id}>
                  <EnquiryCard enquiry={enquiry} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyEnquiries;
