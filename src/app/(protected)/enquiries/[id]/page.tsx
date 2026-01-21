"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  useGetEnquiryById,
  useGetEnquirySubmissions,
  useGetMyEnquiries,
  useCloseEnquiry,
  useMarkAsInterested,
} from "@/hooks/useEnquiry";
import { EnquirySubmission } from "@/models/types/enquiry";
import { Property } from "@/types/property";
import {
  Loader2,
  MapPin,
  Calendar,
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  Home,
  Compass,
  IndianRupee,
  DoorOpen,
  LayoutGrid,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ReceivedProperties } from "./_components/received-properties";
import { AdminMessages } from "./_components/admin-messages";
import { PropertyPreviewModal } from "./_components/PropertyPreviewModal";
import {
  formatCurrencyEnquiry,
  getStatusColor,
  formatPrice,
  formatEnquiryLocation,
} from "@/utils/helper";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";

const isPopulatedProperty = (
  propertyId: Property | string | undefined | null
): propertyId is Property => {
  return (
    propertyId !== null &&
    propertyId !== undefined &&
    typeof propertyId === "object" &&
    "_id" in propertyId
  );
};

const getPropertyId = (submission: EnquirySubmission): string | null => {
  if (!submission.propertyId) return null;
  if (typeof submission.propertyId === "string") return submission.propertyId;
  if (isPopulatedProperty(submission.propertyId))
    return submission.propertyId._id;
  return null;
};

const SingleEnquiry = () => {
  const { id } = useParams();
  const { brokerData } = useApp();
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [previewPropertyId, setPreviewPropertyId] = useState<string | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const { enquiry, isPending, error } = useGetEnquiryById(id as string);
  const { myEnquiries } = useGetMyEnquiries();
  const { enquirySubmissions } = useGetEnquirySubmissions(id as string);
  const { closeEnquiryAsync, isPending: isPendingCloseEnquiry } =
    useCloseEnquiry();
  const { markAsInterested, isPending: isMarkingInterested } =
    useMarkAsInterested();
  const isMyEnquiry =
    myEnquiries &&
    myEnquiries.length > 0 &&
    myEnquiries.some((e) => e._id === enquiry?._id);
  console.log(isMyEnquiry);
  console.log(enquiry?.interestedBrokersAndCompanies);
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

  const detailRow = (
    label: string,
    value: string | number | undefined | null
  ) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex justify-between py-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
      </div>
    );
  };

  const RequirementItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-full bg-background shadow-sm">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-0.5 font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0 mb-2">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Enquiries
          </Button>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center  gap-2">
              <div className="flex flex-wrap items-center gap-2 justify-between w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-background"
                  >
                    #{enquiry.enquiryId}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(enquiry.status)} border-0`}
                  >
                    {enquiry.status}
                  </Badge>

                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(enquiry.createdAt))} ago
                  </span>
                </div>
              </div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
                {enquiry.enquiryType} Enquiry{" "}
                {formatEnquiryLocation(enquiry)
                  ? `in ${formatEnquiryLocation(enquiry)}`
                  : ""}
              </h1>
            </div>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1.5 text-primary/70" />
            {formatEnquiryLocation(enquiry) || "—"}
            <div className="ml-2 rounded-full bg-muted px-2 ">
              {isMyEnquiry && (
                <div className="flex gap-3">
                  <span className="flex gap-2 font-semibold">
                    <span>Interested</span>
                    {enquiry.interestedBrokersAndCompanies?.length || 0}
                  </span>
                  <span className="flex gap-2 font-semibold">
                    <span>Submissions</span>
                    {enquiry.submissionCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {isMyEnquiry && enquiry.status === "active" && (
            <Dialog
              open={isCloseDialogOpen}
              onOpenChange={(open) => {
                setIsCloseDialogOpen(open);
                if (!open) setConfirmationText("");
              }}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">Close Enquiry</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Enquiry</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to close this enquiry? This action
                    cannot be undone. Type <strong>{enquiry.enquiryId}</strong>{" "}
                    to confirm.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder={`Type ${enquiry.enquiryId} to confirm`}
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    if (confirmationText === enquiry.enquiryId) {
                      try {
                        await closeEnquiryAsync(enquiry._id);
                        setIsCloseDialogOpen(false);
                        setConfirmationText("");
                        toast.success("Enquiry closed successfully");
                      } catch {
                        toast.error(
                          "Failed to close enquiry. Please try again."
                        );
                      }
                    }
                  }}
                  disabled={
                    confirmationText !== enquiry.enquiryId ||
                    isPendingCloseEnquiry
                  }
                >
                  {isPendingCloseEnquiry ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Closure
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Requirements Card */}
          <Card className="overflow-hidden border-muted">
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Requirement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <RequirementItem
                  icon={IndianRupee}
                  label="Budget Range"
                  value={`₹${formatCurrencyEnquiry(
                    enquiry.budget.min as number
                  )} - ₹${formatCurrencyEnquiry(enquiry.budget.max as number)}`}
                />

                {enquiry.bhk && (
                  <RequirementItem
                    icon={BedDouble}
                    label="BHK"
                    value={`${enquiry.bhk} BHK`}
                  />
                )}
                {enquiry.washrooms && (
                  <RequirementItem
                    icon={Bath}
                    label="Washrooms"
                    value={enquiry.washrooms}
                  />
                )}
                {enquiry.size && (
                  <RequirementItem
                    icon={Maximize}
                    label="Size"
                    value={`${enquiry.size.min} - ${enquiry.size.max} ${enquiry.size.unit}`}
                  />
                )}
                {enquiry.rooms && (
                  <RequirementItem
                    icon={DoorOpen}
                    label="Rooms"
                    value={enquiry.rooms}
                  />
                )}
                {enquiry.beds && (
                  <RequirementItem
                    icon={BedDouble}
                    label="Beds"
                    value={enquiry.beds}
                  />
                )}
                {enquiry.plotType && (
                  <RequirementItem
                    icon={Home}
                    label="Plot Type"
                    value={enquiry.plotType}
                  />
                )}
                {enquiry.facing && (
                  <RequirementItem
                    icon={Compass}
                    label="Facing"
                    value={
                      <span className="capitalize">
                        {enquiry.facing.replace("_", " ").toLowerCase()}
                      </span>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm md:text-base">
                {enquiry.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Received Properties (For My Enquiry) */}
          <ReceivedProperties
            id={id as string}
            isMyEnquiry={isMyEnquiry || false}
          />

          {/* Submissions List (For Others' Enquiries) */}
          {!isMyEnquiry && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Submissions</h2>
                {enquirySubmissions?.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No submissions yet
                  </span>
                )}
              </div>

              {enquirySubmissions && enquirySubmissions.length > 0 ? (
                <div className="space-y-3">
                  {enquirySubmissions.map((submission) => {
                    const propertyIdStr = getPropertyId(submission);
                    const property = isPopulatedProperty(submission.propertyId)
                      ? submission.propertyId
                      : null;
                    const viewStatus = submission.viewStatus ?? "not_viewed";
                    const viewStatusLabel =
                      viewStatus === "contact_shared"
                        ? "Contact shared"
                        : viewStatus === "viewed"
                          ? "Viewed"
                          : "Not viewed";

                    return (
                      <Card key={submission._id}>
                        <CardHeader className="pb-2 p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <CardTitle className="text-base line-clamp-1">
                                {property?.propertyTitle ||
                                  property?.address?.city ||
                                  "View Property Details"}
                              </CardTitle>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {property?.address?.city ||
                                    "Click to view location"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className={
                                  viewStatus === "contact_shared"
                                    ? "border-green-300 text-green-700"
                                    : viewStatus === "viewed"
                                      ? "border-blue-300 text-blue-700"
                                      : "text-muted-foreground"
                                }
                              >
                                {viewStatusLabel}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          {property?.totalPrice && (
                            <div className="font-medium text-sm text-primary">
                              {formatPrice(property.totalPrice)}
                            </div>
                          )}

                          {submission.privateMessage ? (
                            <div className="bg-muted/30 p-2 rounded text-sm text-muted-foreground italic border border-dashed">
                              &quot;{submission.privateMessage}&quot;
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 italic">
                              No message attached
                            </p>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs border"
                            onClick={() => {
                              if (propertyIdStr) {
                                setPreviewPropertyId(propertyIdStr);
                                setIsPreviewOpen(true);
                              }
                            }}
                            disabled={!propertyIdStr}
                          >
                            View Property
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : null}

              {/* Action to Submit */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={!!enquiry.isInterested || isMarkingInterested}
                  onClick={() => {
                    markAsInterested(enquiry._id, {
                      onSuccess: () => {
                        toast.success("Marked as interested");
                      },

                      onError: (error) => {
                        console.log(error);
                        const e = error as {
                          response?: { data?: { message?: string } };
                        };
                        toast.error(
                          e.response?.data?.message ||
                          "Failed to mark as interested"
                        );
                      },
                    });
                  }}
                >
                  <ThumbsUp
                    className={`mr-2 h-4 w-4 ${!!enquiry.isInterested ? "fill-current" : ""
                      }`}
                  />
                  {!!enquiry.isInterested ? "Interested" : "I am Interested"}
                </Button>
                <Button
                  onClick={() => {
                    router.push(`/enquiries/${enquiry._id}/submit`);
                  }}
                  className="flex-1"
                  size="lg"
                  disabled={
                    (typeof brokerData?.companyId === "object" &&
                      brokerData?.companyId !== null &&
                      enquiry.createdByCompanyId ===
                      brokerData?.companyId._id) ||
                    enquiry.status === "closed"
                  }
                >
                  Submit Proposal
                </Button>
              </div>
              {enquiry.status == "closed" && (
                <Alert>
                  Enquiry is closed, can&apos;t submit properties anymore
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-muted/20 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Enquiry Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {detailRow("Enquiry ID", enquiry.enquiryId)}
              {detailRow("Category", enquiry.enquiryCategory)}
              {detailRow("Type", enquiry.enquiryType)}
              {detailRow("Status", enquiry.status)}

              {detailRow(
                "Created",
                new Date(enquiry.createdAt).toLocaleDateString()
              )}
              {detailRow(
                "Updated",
                new Date(enquiry.updatedAt).toLocaleDateString()
              )}
            </CardContent>
          </Card>

          {/* Admin Messages */}
          {typeof brokerData?.companyId === "object" &&
            brokerData?.companyId !== null &&
            enquiry.createdByCompanyId === brokerData?.companyId._id ? (
            <p>
              Someone from your company has raised this enquiry, so you
              can&apos;t submit a property.
            </p>
          ) : !isMyEnquiry &&
            enquirySubmissions &&
            enquirySubmissions.length === 0 ? (
            <p>
              No submissions yet, to view admin messages please submit a
              property
            </p>
          ) : (
            !isMyEnquiry && <AdminMessages id={id as string} />
          )}
        </div>
      </div>

      {/* Property Preview Modal */}
      <PropertyPreviewModal
        propertyId={previewPropertyId}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
};

export default SingleEnquiry;
