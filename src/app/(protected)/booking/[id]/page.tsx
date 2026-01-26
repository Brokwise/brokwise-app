"use client";

import { useGetBooking } from "@/hooks/useBooking";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Download,
  Clock,
  Ruler,
  Compass,
  Maximize2,
  IndianRupee,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking } from "@/models/types/booking";
import { PageShell, PageHeader } from "@/components/ui/layout";

const BookingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: bookingDetails, isLoading } = useGetBooking(
    (id as string) || ""
  );

  if (isLoading) {
    return <BookingLoadingSkeleton />;
  }

  if (!bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Booking not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const {
    plotId: plot,
    projectId: project,
    customerDetails,
    brokerId,
    developerId,
    bookingStatus,
    paymentStatus,
    amount,
    bookingDate,
    orderId,
    paymentId,
    notes,
  } = bookingDetails as Booking;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "paid":
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "pending":
      case "reserved":
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "cancelled":
      case "rejected":
      case "failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Booking Details"
        description={`${orderId} • ${format(new Date(bookingDate), "PPP p")}`}
      >
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(bookingStatus)}>
            {bookingStatus.toUpperCase().replace("_", " ")}
          </Badge>
          {bookingDetails.receiptUrl && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={bookingDetails.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Receipt
              </a>
            </Button>
          )}
        </div>
      </PageHeader>

      {bookingDetails.holdExpiresAt && (
        <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Hold expires on {format(new Date(bookingDetails.holdExpiresAt), "PPP p")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project & Plot Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <div className="flex items-start gap-2 mt-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    {project.address.address}, {project.address.city},{" "}
                    {project.address.state} - {project.address.pincode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Plot Information
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Number
                      </span>
                      <span className="font-medium">{plot.plotNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Maximize2 className="h-3 w-3" /> Area
                      </span>
                      <span className="font-medium">
                        {plot.area} {plot.areaUnit.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Ruler className="h-3 w-3" /> Dimensions
                      </span>
                      <span className="font-medium">
                        {plot.dimensions?.length || 0} x{" "}
                        {plot.dimensions?.width || 0}{" "}
                        {plot.dimensions?.unit || "FT"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Compass className="h-3 w-3" /> Facing
                      </span>
                      <span className="font-medium">{plot.facing}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Project Stats
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <span className="font-medium capitalize">
                        {project.projectType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        RERA ID
                      </span>
                      <span className="font-medium">{project.reraNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {project.projectStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Full Name
                    </div>
                    <div className="font-medium text-lg">
                      {customerDetails.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${customerDetails.email}`}
                        className="hover:underline"
                      >
                        {customerDetails.email}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${customerDetails.phone}`}
                        className="hover:underline"
                      >
                        {customerDetails.phone}
                      </a>
                    </div>
                    {customerDetails.alternatePhone && (
                      <div className="text-sm text-muted-foreground mt-1 ml-6">
                        Alt: {customerDetails.alternatePhone}
                      </div>
                    )}
                  </div>
                  {customerDetails.address && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Address
                      </div>
                      <div className="mt-1">{customerDetails.address}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center p-6 bg-muted/30 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">
                  Booking Amount
                </div>
                <div className="text-3xl font-bold text-primary">
                  ₹{amount?.toLocaleString()}
                </div>
                <Badge
                  className={`mt-3 ${getStatusColor(paymentStatus || "")}`}
                >
                  Payment {paymentStatus}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Plot Price
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span>
                      Rate ({plot.pricePerUnit || 0}/{plot.areaUnit})
                    </span>
                    <span>
                      ₹{(plot.area * (plot.pricePerUnit || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total Price</span>
                    <span>₹{plot.price.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="font-mono">{paymentId || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(new Date(bookingDate), "dd MMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Involved Parties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Involved Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Broker</div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium truncate">
                      {brokerId?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Broker ID: {brokerId?._id?.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Developer</div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium truncate">
                      {developerId?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Developer ID: {developerId?._id?.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
};

const BookingLoadingSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
