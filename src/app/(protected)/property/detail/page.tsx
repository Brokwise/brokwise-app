"use client";

import React, { useState, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PropertyHeader } from "../[id]/_components/property-header";
import { PropertyActionsBar } from "../[id]/_components/property-actions-bar";
import { MediaCarousel } from "../[id]/_components/media-carousel";
import { PropertyFacts } from "../[id]/_components/property-facts";
import { PropertyDescription } from "../[id]/_components/property-description";
import { DocumentsList } from "../[id]/_components/documents-list";
import { PropertySidebar } from "../[id]/_components/property-sidebar";
import { FlagInAppropriate } from "../[id]/_components/flag-inappropriate";
import { PropertyOffers } from "../[id]/_components/propertyOffers";
import {
  isSampleLandMedia,
  normalizeSampleLandMediaPath,
  SAMPLE_LAND_MEDIA_DISCLAIMER,
} from "@/lib/property-media";

const PropertyPageContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id || "");
  const { userData, brokerData, setBrokerData, companyData, setCompanyData } = useApp();
  const { toggleBookmarkAsync, isPending: isBookmarkPending } = useToggleBookmark();
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const isOwner = property?.listedBy?._id === brokerData?._id;

  const { t } = useTranslation();


  // Check bookmark status from the correct user data (same pattern as PropertyCard)
  const isCompany = userData?.userType === "company";
  const isBookmarked = property
    ? isCompany
      ? !!companyData?.bookmarkedPropertyIds?.includes(property._id)
      : !!brokerData?.bookmarkedPropertyIds?.includes(property._id)
    : false;



  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Property ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No property ID was provided.</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    ...(property.featuredMedia
      ? [normalizeSampleLandMediaPath(property.featuredMedia)]
      : []),
    ...property.images.map((image) => normalizeSampleLandMediaPath(image)),
  ];
  const watermarkText = `${brokerData?.brokerId || userData?.email || "BROKWISE"} • ${property.propertyId || property._id
    }`;
  const shouldShowSampleDisclaimer =
    property.propertyType === "LAND" && isSampleLandMedia(property.featuredMedia);

  return (
    <main className="min-h-screen pb-5 md:pb-20">
      <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden select-none">
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-20 p-6 opacity-[0.08]">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="text-xs md:text-sm font-semibold text-foreground/70 rotate-[-20deg] whitespace-nowrap"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      </div>

      <PropertyHeader
        property={property}
        onFlag={() => setIsFlagDialogOpen(true)}
      />

      <div className="container mx-auto px-4 max-w-7xl pt-4 pb-20 md:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="order-1 lg:order-1 lg:col-span-7">
            <MediaCarousel images={allImages} property={property} />
            {shouldShowSampleDisclaimer && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {SAMPLE_LAND_MEDIA_DISCLAIMER}
              </div>
            )}
          </div>

          <div className="order-2 lg:order-2 lg:col-span-3 lg:row-span-2 space-y-4">
            <PropertyActionsBar
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
              isDeleted={property.listingStatus === "DELETED"}
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
            {isOwner && property.listingStatus !== "ENQUIRY_ONLY" && property.listingStatus !== "DELETED" && (
              <PropertyOffers property={property} />
            )}
            <DocumentsList property={property} />
          </div>
        </div>
      </div>

      <FlagInAppropriate property={property} isFlagDialogOpen={isFlagDialogOpen} setIsFlagDialogOpen={setIsFlagDialogOpen} />
    </main >
  );
};

// Wrap in Suspense for useSearchParams
const PropertyPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <PropertyPageContent />
    </Suspense>
  );
};

export default PropertyPage;
