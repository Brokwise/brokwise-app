"use client";

import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { useGetProperty } from "@/hooks/useProperty";
import { useToggleBookmark } from "@/hooks/useBookmarks";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldX,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

// Components
import { PropertyHeader } from "./_components/property-header";
import { PropertyActionsBar } from "./_components/property-actions-bar";
import { MediaCarousel } from "./_components/media-carousel";
import { PropertyFacts } from "./_components/property-facts";
import { PropertyDescription } from "./_components/property-description";
import { DocumentsList } from "./_components/documents-list";
import { PropertySidebar } from "./_components/property-sidebar";

import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart, imagesToBase64 } from "@/utils/pdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id);
  const { userData, brokerData, setBrokerData, companyData, setCompanyData } = useApp();
  const { toggleBookmarkAsync, isPending: isBookmarkPending } = useToggleBookmark();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagNotes, setFlagNotes] = useState("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const { t } = useTranslation();

  // Check bookmark status from the correct user data (same pattern as PropertyCard)
  const isCompany = userData?.userType === "company";
  const isBookmarked = property
    ? isCompany
      ? !!companyData?.bookmarkedPropertyIds?.includes(property._id)
      : !!brokerData?.bookmarkedPropertyIds?.includes(property._id)
    : false;

  // const offerSectionRef = useRef<HTMLDivElement>(null);
  // const calendarSectionRef = useRef<HTMLDivElement>(null);

  // const scrollToOffer = () => {
  //   offerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  // };

  // const scrollToCalendar = () => {
  //   // Placeholder if we add scheduling later, or just scroll to sidebar where contact buttons might form
  // };


  const handleExportPdf = useCallback(async () => {
    if (!property) return;

    let host: HTMLDivElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;

    try {
      setIsExportingPdf(true);

      const exportedOnLabel = format(new Date(), "PPP p");

      // Collect all image URLs for pre-fetching
      const allImageUrls = [
        ...(property.featuredMedia ? [property.featuredMedia] : []),
        ...(property.images ?? []),
      ].filter((m) => !!m && !m.toLowerCase().endsWith(".mp4"));

      // Pre-fetch and convert images to base64
      const imageMap = await imagesToBase64(allImageUrls);

      host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-10000px";
      host.style.top = "0";
      host.style.zIndex = "2147483647";
      document.body.appendChild(host);

      root = createRoot(host);
      root.render(
        <div className="w-[794px] bg-white text-black">
          <PropertyPdfLayout
            property={property}
            exportedOnLabel={exportedOnLabel}
            imageMap={imageMap}
          />
        </div>
      );

      // Ensure layout is painted before capture.
      await new Promise((r) => setTimeout(r, 300));

      const element = host.querySelector(
        "[data-property-pdf]"
      ) as HTMLElement | null;
      if (!element) {
        throw new Error("PDF layout failed to render");
      }

      const safeId = makeSafeFilePart(
        property.propertyId || property._id || "property"
      );
      await exportElementAsPdf({
        element,
        fileName: `Brokwise_Property_${safeId}.pdf`,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      try {
        root?.unmount();
      } catch {
        // no-op
      }
      host?.remove();
      setIsExportingPdf(false);
    }
  }, [property]);

  const handleSubmitFlag = useCallback(async () => {
    if (!flagReason || !property) return;
    setIsSubmittingFlag(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success(t("toast_report_submitted"));
      setIsFlagDialogOpen(false);
      setFlagReason("");
      setFlagNotes("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingFlag(false);
    }
  }, [flagReason, property]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t("loading_property")}</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    // Check if it's a 403 Forbidden error
    const is403 = (error as AxiosError)?.response?.status === 403;

    if (is403) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldX className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">{t("access_restricted")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("access_restricted_property")}
              </p>
              <Button className="w-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("action_go_back")}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error?.message || "Property not found"}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages = [
    ...(property.featuredMedia ? [property.featuredMedia] : []),
    ...property.images,
  ];

  return (
    <main className="min-h-screen pb-10">
      {/* Sticky Header */}
      <PropertyHeader
        property={property}
        onFlag={() => setIsFlagDialogOpen(true)}
      />

      <div className="container mx-auto px-4 max-w-7xl pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Image Carousel - Shows FIRST on mobile (order-1), part of left column on desktop */}
          <div className="order-1 lg:order-1 lg:col-span-7">
            <MediaCarousel images={allImages} property={property} />
          </div>

          {/* Sidebar - Shows SECOND on mobile (order-2), right side on desktop (order-2) */}
          <div className="order-2 lg:order-2 lg:col-span-3 lg:row-span-2 space-y-4">
            {/* Actions Bar at top of sidebar */}
            <PropertyActionsBar
              onExportPdf={handleExportPdf}
              isExportingPdf={isExportingPdf}
              isBookmarked={isBookmarked}
              isBookmarkPending={isBookmarkPending}
              onToggleBookmark={async () => {
                if (!property) return;

                if (!brokerData && !companyData) {
                  toast.error("Please complete your profile to use bookmarks");
                  return;
                }

                if (isCompany && companyData) {
                  const prev = companyData.bookmarkedPropertyIds ?? [];
                  const next = isBookmarked
                    ? prev.filter((id) => id !== property._id)
                    : [property._id, ...prev.filter((id) => id !== property._id)];

                  // Optimistic update
                  setCompanyData({ ...companyData, bookmarkedPropertyIds: next });

                  try {
                    const res = await toggleBookmarkAsync({
                      itemType: "PROPERTY",
                      itemId: property._id,
                    });
                    setCompanyData({
                      ...companyData,
                      bookmarkedPropertyIds: res.bookmarkedPropertyIds,
                      bookmarkedEnquiryIds: res.bookmarkedEnquiryIds,
                    });
                    toast.success(
                      res.isBookmarked
                        ? "Property saved to bookmarks!"
                        : "Property removed from bookmarks"
                    );
                  } catch {
                    // Rollback on error
                    setCompanyData({
                      ...companyData,
                      bookmarkedPropertyIds: prev,
                    });
                  }
                } else if (brokerData) {
                  const prev = brokerData.bookmarkedPropertyIds ?? [];
                  const next = isBookmarked
                    ? prev.filter((id) => id !== property._id)
                    : [property._id, ...prev.filter((id) => id !== property._id)];

                  // Optimistic update
                  setBrokerData({ ...brokerData, bookmarkedPropertyIds: next });

                  try {
                    const res = await toggleBookmarkAsync({
                      itemType: "PROPERTY",
                      itemId: property._id,
                    });
                    setBrokerData({
                      ...brokerData,
                      bookmarkedPropertyIds: res.bookmarkedPropertyIds,
                      bookmarkedEnquiryIds: res.bookmarkedEnquiryIds,
                    });
                    toast.success(
                      res.isBookmarked
                        ? "Property saved to bookmarks!"
                        : "Property removed from bookmarks"
                    );
                  } catch {
                    // Rollback on error
                    setBrokerData({ ...brokerData, bookmarkedPropertyIds: prev });
                  }
                }
              }}
              shareUrl={typeof window !== "undefined" ? window.location.href : ""}
              propertyTitle={`Property #${property.propertyId || "N/A"}`}
            />
            <PropertySidebar property={property} />
          </div>

          {/* Main Content (after image) - Shows THIRD on mobile (order-3), continues left column on desktop */}
          <div className="order-3 lg:order-3 lg:col-span-7 space-y-8">
            {/* Property Facts Grid */}
            <PropertyFacts property={property} />

            {/* Description */}
            <PropertyDescription description={property.description} />

            {/* Localities (if needed inline) */}
            {property.localities && property.localities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t("property_nearby_localities")}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.localities.map((locality, index) => (
                    <div key={index} className="px-3 py-1 bg-muted/50 rounded-full text-sm flex items-center gap-1.5 border border-border/50">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {locality}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            <DocumentsList property={property} />
          </div>
        </div>
      </div>

      {/* Flag Dialog - Kept from original */}
      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("flag_property_title")}</DialogTitle>
            <DialogDescription>
              {t("flag_property_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="flag-reason">{t("label_reason")}</Label>
              <Select value={flagReason} onValueChange={setFlagReason}>
                <SelectTrigger id="flag-reason">
                  <SelectValue placeholder={t("label_select_reason")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MISLEADING_INFORMATION">
                    {t("label_misleading_info")}
                  </SelectItem>
                  <SelectItem value="INCORRECT_PRICING">
                    {t("label_incorrect_pricing")}
                  </SelectItem>
                  <SelectItem value="DUPLICATE_LISTING">
                    {t("label_duplicate_listing")}
                  </SelectItem>
                  <SelectItem value="SCAM_OR_FRAUD">{t("label_scam_fraud")}</SelectItem>
                  <SelectItem value="SPAM">{t("label_spam")}</SelectItem>
                  <SelectItem value="OTHER">{t("label_other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-notes">{t("label_additional_details")}</Label>
              <Textarea
                id="flag-notes"
                value={flagNotes}
                onChange={(e) => setFlagNotes(e.target.value)}
                placeholder={t("label_details_placeholder")}
                className="min-h-[96px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFlagDialogOpen(false)}
              disabled={isSubmittingFlag}
            >
              {t("action_cancel")}
            </Button>
            <Button
              onClick={handleSubmitFlag}
              disabled={!flagReason || isSubmittingFlag}
            >
              {isSubmittingFlag ? t("submitting") : t("action_submit_report")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PropertyPage;
