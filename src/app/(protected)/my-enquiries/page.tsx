"use client";

import React, { useState } from "react";
import { useGetMyEnquiries } from "@/hooks/useEnquiry";
import { EnquiryCard } from "@/app/(protected)/enquiries/_components/EnquiryCard";
import { Loader2, Plus, Inbox, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const MyEnquiriesPage = () => {
  const router = useRouter();
  const { myEnquiries, isPending, error } = useGetMyEnquiries();
  const [view, setView] = useState<"grid" | "list">("grid");

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh] text-destructive">
        <p>Error loading your enquiries. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">My Enquiries</h1>
          <p className="text-muted-foreground">
            Manage the enquiries you have posted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/50 p-1 rounded-md border">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setView("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setView("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => router.push("/enquiries/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Enquiry
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEnquiries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myEnquiries?.filter((e) => e.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Closed/Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myEnquiries?.filter((e) => e.status !== "active").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {!myEnquiries || myEnquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No enquiries yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            You haven&apos;t created any enquiries yet. Start by creating one to
            find properties.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/enquiries/create")}
          >
            Create your first enquiry
          </Button>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEnquiries.map((enquiry) => (
                <EnquiryCard key={enquiry._id} enquiry={enquiry} />
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={myEnquiries} />
          )}
        </>
      )}
    </div>
  );
};

export default MyEnquiriesPage;

