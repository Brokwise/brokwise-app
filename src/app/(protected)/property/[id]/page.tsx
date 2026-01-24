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


import { PropertyHeader } from "./_components/property-header";
import { PropertyActionsBar } from "./_components/property-actions-bar";
import { MediaCarousel } from "./_components/media-carousel";
import { PropertyFacts } from "./_components/property-facts";
import { PropertyDescription } from "./_components/property-description";
import { DocumentsList } from "./_components/documents-list";
import { PropertySidebar } from "./_components/property-sidebar";

import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart, imagesToBase64 } from "@/utils/pdf";


import { FlagInAppropriate } from "./_components/flag-inappropriate";


const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id);
  const { userData, brokerData, setBrokerData, companyData, setCompanyData } = useApp();
  const { toggleBookmarkAsync, isPending: isBookmarkPending } = useToggleBookmark();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);

  const { t } = useTranslation();


  // Check bookmark status from the correct user data (same pattern as PropertyCard)
  const [exportedOnLabel,] = useState<string>("");
  const isCompany = userData?.userType === "company";
  const isBookmarked = property
    ? isCompany
      ? !!companyData?.bookmarkedPropertyIds?.includes(property._id)
      : !!brokerData?.bookmarkedPropertyIds?.includes(property._id)
    : false;



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
      await new Promise((r) => setTimeout(r, 75));

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
      <PropertyHeader
        property={property}
        onFlag={() => setIsFlagDialogOpen(true)}
      />

      <div className="container mx-auto px-4 max-w-7xl pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="order-1 lg:order-1 lg:col-span-7">
            <MediaCarousel images={allImages} property={property} />
          </div>

          <div className="order-2 lg:order-2 lg:col-span-3 lg:row-span-2 space-y-4">
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
                    setBrokerData({ ...brokerData, bookmarkedPropertyIds: prev });
                  }
                }
              }}
              shareUrl={typeof window !== "undefined" ? window.location.href : ""}
              propertyTitle={`Property #${property.propertyId || "N/A"}`}
            />
            <PropertySidebar property={property} />
          </div>

          <div className="order-3 lg:order-3 lg:col-span-7 space-y-8">
            <PropertyFacts property={property} />
            <PropertyDescription description={property.description} />
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
            <DocumentsList property={property} />
          </div>
        </div>
      </div>

      <FlagInAppropriate property={property} isFlagDialogOpen={isFlagDialogOpen} setIsFlagDialogOpen={setIsFlagDialogOpen} />

      <div className="fixed left-[-10000px] top-0 w-[794px] bg-white text-black">
        <PropertyPdfLayout
          property={property}
          exportedOnLabel={exportedOnLabel}
        />
      </div>
    </main >
  );
};

export default PropertyPage;
