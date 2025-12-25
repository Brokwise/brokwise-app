"use client";

import { useGetReceivedProperties } from "@/hooks/useEnquiry";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyPreviewModal } from "./PropertyPreviewModal";
import { EnquirySubmission } from "@/models/types/enquiry";
import { Property } from "@/types/property";

// Helper to check if value is a populated Property object
const isPopulatedProperty = (value: unknown): value is Property => {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    "_id" in value
  );
};

// Extended submission type to handle potential API variations
type SubmissionWithProperty = EnquirySubmission & {
  property?: Property | string;
};

// Helper to get the property ID string from submission
const getPropertyId = (submission: EnquirySubmission): string | null => {
  const sub = submission as SubmissionWithProperty;

  // Try propertyId field first
  if (sub.propertyId) {
    if (typeof sub.propertyId === "string") return sub.propertyId;
    if (isPopulatedProperty(sub.propertyId)) return sub.propertyId._id;
    // Check for 'id' instead of '_id'
    if (typeof sub.propertyId === "object" && "id" in sub.propertyId) {
      return (sub.propertyId as unknown as { id: string }).id;
    }
  }

  // Try 'property' field as fallback (API might use this name)
  if (sub.property) {
    if (typeof sub.property === "string") return sub.property;
    if (isPopulatedProperty(sub.property)) return sub.property._id;
    if (typeof sub.property === "object" && "id" in sub.property) {
      return (sub.property as unknown as { id: string }).id;
    }
  }

  return null;
};

// Helper to get populated property object
const getPopulatedProperty = (submission: EnquirySubmission): Property | null => {
  const sub = submission as SubmissionWithProperty;
  if (isPopulatedProperty(sub.propertyId)) return sub.propertyId;
  if (isPopulatedProperty(sub.property)) return sub.property;
  return null;
};

export const ReceivedProperties = ({
  id,
  isMyEnquiry,
}: {
  id: string;
  isMyEnquiry: boolean;
}) => {
  const [previewPropertyId, setPreviewPropertyId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { receivedProperties, isPending, error } = useGetReceivedProperties(
    id as string,
    isMyEnquiry
  );

  if (!isMyEnquiry) return null;

  if (isPending) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-2">
        Error loading received properties. {error.message}
      </div>
    );
  }

  if (!receivedProperties || receivedProperties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
        No properties have been proposed yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Received Proposals</h3>
        <Badge variant="secondary" className="rounded-full">
          {receivedProperties.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {receivedProperties.map((submission) => {
          const propertyIdStr = getPropertyId(submission);
          const property = getPopulatedProperty(submission);

          return (
            <Card
              key={submission._id}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader className="p-3 bg-muted/30 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-medium line-clamp-1 leading-tight">
                    {property?.propertyTitle || "View Property Details"}
                  </CardTitle>
                  <Badge
                    variant={
                      submission.status === "pending" ? "outline" : "default"
                    }
                    className="text-[10px] h-5 px-1.5"
                  >
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {property?.address?.city || "Click to view location"}
                  </span>
                </div>

                {submission.privateMessage && (
                  <div className="bg-muted/20 p-2 rounded text-xs text-muted-foreground italic">
                    &quot;{submission.privateMessage}&quot;
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs mt-1"
                  onClick={() => {
                    if (propertyIdStr) {
                      setPreviewPropertyId(propertyIdStr);
                      setIsPreviewOpen(true);
                    }
                  }}
                  disabled={!propertyIdStr}
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Property
                </Button>
              </CardContent>
            </Card>
          );
        })}
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
