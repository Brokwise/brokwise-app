"use client";

import React from "react";
import { useGetMarketPlaceEnquiries } from "@/hooks/useEnquiry";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { EnquiryCard } from "../../../enquiries/_components/EnquiryCard";
import { Button } from "@/components/ui/button";

const MarketPlaceEnquiries = () => {
  const {
    marketPlaceEnquiries,
    isPending: isMarketplaceLoading,
    error: marketplaceError,
  } = useGetMarketPlaceEnquiries();

  if (isMarketplaceLoading) {
    return (
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
    );
  }

  if (marketplaceError) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <p className="text-red-500 font-medium">
          Unable to load enquiries at the moment.
        </p>
        <Button variant="link" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (marketPlaceEnquiries.length === 0) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">
          No marketplace enquiries found
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketPlaceEnquiries.map((enquiry) => (
        <div key={enquiry._id}>
          <EnquiryCard enquiry={enquiry} />
        </div>
      ))}
    </div>
  );
};

export default MarketPlaceEnquiries;
