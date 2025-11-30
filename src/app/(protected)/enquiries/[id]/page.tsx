"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetEnquiryById } from "@/hooks/useEnquiry";
import {
  Loader2,
  MapPin,
  Calendar,
  ArrowLeft,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Enquiry } from "@/models/types/enquiry";

const SingleEnquiry = () => {
  const { id } = useParams();
  const router = useRouter();
  const { enquiry, isPending, error } = useGetEnquiryById(id as string);

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] text-destructive gap-4">
        <p>Error loading enquiry details or enquiry not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    }
    return amount.toLocaleString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const detailRow = (
    label: string,
    value: string | number | undefined | null
  ) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      <Button
        variant="ghost"
        className="mb-2 pl-0 hover:bg-transparent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{enquiry.enquiryId}
                  </Badge>
                  <Badge className={getStatusColor(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold leading-tight">
                  {enquiry.enquiryType} Enquiry in {enquiry.city}
                </h1>
              </div>
              {/* Actions if needed */}
            </div>
            <div className="flex items-center text-muted-foreground text-sm gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {enquiry.localities.join(", ")}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(enquiry.createdAt))} ago
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {enquiry.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="font-semibold text-lg text-primary">
                  ₹{formatCurrency(enquiry.budget.min)} - ₹
                  {formatCurrency(enquiry.budget.max)}
                </p>
              </div>

              {/* Conditional Details based on type */}
              {enquiry.bhk && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">BHK</p>
                  <p className="font-medium">{enquiry.bhk} BHK</p>
                </div>
              )}
              {enquiry.washrooms && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Washrooms</p>
                  <p className="font-medium">{enquiry.washrooms}</p>
                </div>
              )}
              {enquiry.size && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {enquiry.size.min} - {enquiry.size.max} {enquiry.size.unit}
                  </p>
                </div>
              )}
              {enquiry.rooms && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rooms</p>
                  <p className="font-medium">{enquiry.rooms}</p>
                </div>
              )}
              {enquiry.beds && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Beds</p>
                  <p className="font-medium">{enquiry.beds}</p>
                </div>
              )}
              {enquiry.plotType && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Plot Type</p>
                  <p className="font-medium">{enquiry.plotType}</p>
                </div>
              )}
              {enquiry.facing && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Facing</p>
                  <p className="font-medium capitalize">
                    {enquiry.facing.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enquiry Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {detailRow("Category", enquiry.enquiryCategory)}
              {detailRow("Type", enquiry.enquiryType)}
              <Separator className="my-2" />
              {detailRow("City", enquiry.city)}
              {detailRow("Source", enquiry.source)}
              {detailRow(
                "Created",
                new Date(enquiry.createdAt).toLocaleDateString()
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {/* <div className="space-y-3">
            <Button className="w-full" size="lg">
              Submit Proposal
            </Button>
            <Button variant="outline" className="w-full">
              Message Broker
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SingleEnquiry;
