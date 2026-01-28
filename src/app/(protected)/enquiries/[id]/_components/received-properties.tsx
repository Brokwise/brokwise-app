"use client";

import {
  useGetReceivedProperties,
  useMarkSubmissionViewed,
} from "@/hooks/useEnquiry";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Eye, PhoneCall, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyPreviewModal } from "./PropertyPreviewModal";
import { Enquiry, EnquirySubmission } from "@/models/types/enquiry";
import { Property } from "@/types/property";
import { ShareContactDialog } from "./share-contact-dialog";
import moment from "moment";
import { useTranslation } from "react-i18next";
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
const getPopulatedProperty = (
  submission: EnquirySubmission
): Property | null => {
  const sub = submission as SubmissionWithProperty;
  if (isPopulatedProperty(sub.propertyId)) return sub.propertyId;
  if (isPopulatedProperty(sub.property)) return sub.property;
  return null;
};

export const ReceivedProperties = ({
  id,
  isMyEnquiry,
  enquiry,
}: {
  id: string;
  isMyEnquiry: boolean;
  enquiry?: Enquiry;
}) => {
  const [previewPropertyId, setPreviewPropertyId] = useState<string | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [shareContactSubmissionId, setShareContactSubmissionId] = useState<
    string | null
  >(null);
  const [isShareContactOpen, setIsShareContactOpen] = useState(false);

  const { receivedProperties, isPending, error } = useGetReceivedProperties(
    id as string,
    isMyEnquiry
  );
  const { markSubmissionViewed } = useMarkSubmissionViewed();
  const { t } = useTranslation();

  const sortedProperties = React.useMemo(() => {
    if (!receivedProperties) return [];
    return [...receivedProperties].sort((a, b) => {
      if (a.isBoosted && b.isBoosted) {
        return (a.bidRank || Infinity) - (b.bidRank || Infinity);
      }
      if (a.isBoosted) return -1;
      if (b.isBoosted) return 1;
      return 0;
    });
  }, [receivedProperties]);

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
        {t("page_enquiry_detail_error_loading")} {error.message}
      </div>
    );
  }

  if (!receivedProperties || receivedProperties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
        {t("page_enquiry_detail_no_properties_proposed")}
      </div>
    );
  }
  console.log(receivedProperties);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{t("page_enquiry_detail_received_proposals")}</h3>
        <Badge variant="secondary" className="rounded-full">
          {receivedProperties.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {sortedProperties.map((submission) => {
          const propertyIdStr = getPropertyId(submission);
          const property = getPopulatedProperty(submission);

          return (
            <Card
              key={submission._id || submission._id}
              className="overflow-hidden transition-all hover:shadow-md"
            >
              <CardHeader className="p-3 bg-muted/30 pb-2">
                <div className="flex flex-col gap-2">
                  {submission.isBoosted && (
                    <div className="flex items-center gap-2">
                      <Badge className="h-5 px-1.5 text-[10px] bg-yellow-500 hover:bg-yellow-600 border-yellow-600 text-white">
                        Boosted
                      </Badge>
                      {submission.bidRank && (
                        <span className="text-xs font-medium text-muted-foreground">
                          Rank #{submission.bidRank}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-medium line-clamp-1 leading-tight">
                      {property?.propertyTitle ||
                        t("page_enquiry_detail_view_property_details")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-2">
                <div>
                  <span className="text-xs">
                    {t("page_enquiry_detail_received")} {moment(submission.receivedAt).fromNow()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {property?.address?.city || t("page_enquiry_detail_click_view_location")}
                  </span>
                </div>
                {enquiry?.preferredLocations && enquiry.preferredLocations.length > 1 && (
                  <div className="flex items-center text-xs">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      <MapPin className="h-2.5 w-2.5 mr-0.5" />
                      For: {enquiry.preferredLocations[submission.preferredLocationIndex ?? 0]?.address?.split(",")[0] || `Location ${(submission.preferredLocationIndex ?? 0) + 1}`}
                    </Badge>
                  </div>
                )}

                {submission.privateMessage && (
                  <div className="bg-muted/20 p-2 rounded text-xs text-muted-foreground italic">
                    &quot;{submission.privateMessage}&quot;
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => {
                      if (propertyIdStr) {
                        setPreviewPropertyId(propertyIdStr);
                        setIsPreviewOpen(true);
                        if (
                          submission._id &&
                          submission.viewStatus !== "viewed" &&
                          submission.viewStatus !== "contact_shared"
                        ) {
                          markSubmissionViewed({
                            enquiryId: id,
                            submissionId: submission._id,
                          });
                        }
                      }
                    }}
                    disabled={!propertyIdStr}
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    {t("page_enquiry_detail_view")}
                  </Button>

                  {submission.contactSharedWithSubmitter ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 h-7 text-xs text-green-700 bg-green-50 hover:bg-green-100 border-green-200 border"
                      disabled
                    >
                      <CheckCheck className="h-3 w-3 mr-1.5" />
                      {t("page_enquiry_detail_shared")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-accent"
                      onClick={() => {
                        setShareContactSubmissionId(submission._id);
                        setIsShareContactOpen(true);
                      }}
                    >
                      <PhoneCall className="h-3 w-3 mr-1.5" />
                      {t("page_enquiry_detail_share_contact")}
                    </Button>
                  )}
                </div>
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

      {/* Share Contact Dialog */}
      {shareContactSubmissionId && (
        <ShareContactDialog
          isOpen={isShareContactOpen}
          onClose={() => {
            setIsShareContactOpen(false);
            setShareContactSubmissionId(null);
          }}
          enquiryId={id}
          submissionId={shareContactSubmissionId}
        />
      )}
    </div>
  );
};
