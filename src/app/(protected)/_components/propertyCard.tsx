"use client";
import React, { useState } from "react";
import { Property } from "@/types/property";
import { Typography } from "@/components/ui/typography";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useToggleBookmark } from "@/hooks/useBookmarks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  BedDouble,
  Bath,
  Move,
  Home,
  Building2,
  Share2,
  Link2,
  Download,
  CheckCircle2,
  Loader2,
  Bookmark,
  MessageCircle,
  Map,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatAddress, formatPriceShort } from "@/utils/helper";
import { toast } from "sonner";
import { createRoot } from "react-dom/client";
import { format } from "date-fns";
import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart } from "@/utils/pdf";
import { useTranslation } from "react-i18next";

interface PropertyCardProps {
  property: Property;
  hideShare?: boolean;
  onShowOnMap?: (propertyId: string) => void;
  showMapButton?: boolean;
  actionSlot?: React.ReactNode;
  isSameCity?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  hideShare = false,
  onShowOnMap,
  showMapButton = false,
  actionSlot,
  isSameCity = false,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { userData, brokerData, setBrokerData, companyData, setCompanyData } =
    useApp();
  const { toggleBookmarkAsync, isPending: isBookmarkPending } =
    useToggleBookmark();
  const { t } = useTranslation();

  const isCompany = userData?.userType === "company";

  const rateDisplay =
    property.rate && property.sizeUnit
      ? `${formatPriceShort(property.rate)}/${property.sizeUnit.toLowerCase().replace(/_/g, " ")}`
      : null;

  // Check if property is private/enquiry-only
  const isPrivateProperty =
    property.listingStatus === "ENQUIRY_ONLY" ||
    !!property.submittedForEnquiryId;
  const canShareExternally = !hideShare && !isPrivateProperty;

  // Check bookmark status from the correct user data
  const isBookmarked = isCompany
    ? !!companyData?.bookmarkedPropertyIds?.includes(property._id)
    : !!brokerData?.bookmarkedPropertyIds?.includes(property._id);

  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/property/${property._id}`
      : `/property/${property._id}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(propertyUrl);
      toast.success(t("toast_link_copied"), {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
    } catch {
      toast.error(t("toast_error_copy_link"));
    }
  };

  const handleShareNative = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: `${property.bhk ? `${property.bhk} BHK ` : ""
        }${property.propertyType.replace(/_/g, " ")}`,
      text: `Check out this property: ${formatAddress(
        property.address
      )} - ${formatCurrency(property.totalPrice)}`,
      url: propertyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed - do nothing
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyLink(e);
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const propertyTitle = `${property.bhk ? `${property.bhk} BHK ` : ""
      }${property.propertyType.replace(/_/g, " ")}`;

    // Using Unicode escapes to ensure emojis render correctly regardless of file encoding
    // \uD83C\uDFE0 = House
    // \uD83D\uDCCD = Round Pushpin
    // \uD83D\uDCB0 = Money Bag
    // \uD83D\uDD17 = Link Symbol

    const message = `\uD83C\uDFE0 *${propertyTitle}*\n\n\uD83D\uDCCD ${formatAddress(
      property.address
    )}\n\uD83D\uDCB0 ${formatCurrency(
      property.totalPrice
    )}\n\n\uD83D\uDD17 ${propertyUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExportingPdf) return;

    let host: HTMLDivElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;

    const toastId = toast.loading("Generating PDF…");

    try {
      setIsExportingPdf(true);

      const exportedOnLabel = format(new Date(), "PPP p");

      // Collect all image URLs for pre-fetching
      const allImageUrls = [
        ...(property.featuredMedia ? [property.featuredMedia] : []),
        ...(property.images ?? []),
      ].filter((m) => !!m && !m.toLowerCase().endsWith(".mp4"));

      // Pre-fetch and convert images to base64
      const { imagesToBase64 } = await import("@/utils/pdf");
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

      toast.success(t("toast_pdf_downloaded"), { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(t("toast_error_pdf_export"), { id: toastId });
    } finally {
      try {
        root?.unmount();
      } catch {
        // no-op
      }
      host?.remove();
      setIsExportingPdf(false);
    }
  };

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShowOnMap && hasValidCoordinates) {
      onShowOnMap(property._id);
    }
  };

  // Check if property has valid coordinates for map display
  const coordinates = property.location?.coordinates;
  const hasValidCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number";

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card h-[27rem] flex flex-col rounded-3xl">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Link
          href={`/property/${property._id}`}
          className="block w-full h-full"
        >
          <Image
            src={
              (property.featuredMedia &&
                property.featuredMedia.includes(
                  "firebasestorage.googleapis.com"
                )) ||
                property.featuredMedia?.includes("picsum.photos")
                ? property.featuredMedia
                : "/images/placeholder.webp"
            }
            alt={property.description || "Property Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 h-12!"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </Link>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
          {property.isFeatured && (
            <Badge className="relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.5)] border-none bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white px-3 py-1.5 font-bold tracking-wide">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
              <div className="relative flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 fill-white text-white animate-pulse" />
                <span className="drop-shadow-md">FEATURED</span>
              </div>
            </Badge>
          )}
          {isSameCity && (
            <Badge className="shadow-sm backdrop-blur-md border-none bg-blue-600/90 text-white">
              <MapPin className="h-3 w-3 mr-1" />
              {t("label_same_city")}
            </Badge>
          )}

        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {showMapButton && hasValidCoordinates && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-sm text-foreground/70 hover:bg-background hover:text-accent transition-colors"
              onClick={handleShowOnMap}
              title="Show on Map"
            >
              <Map className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="icon"
            variant="secondary"
            className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm ${isBookmarked ? "text-accent" : ""
              }`}
            disabled={(!brokerData && !companyData) || isBookmarkPending}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!brokerData && !companyData) {
                toast.error(t("toast_error_profile_incomplete"));
                return;
              }

              if (isCompany && companyData) {
                const prev = companyData.bookmarkedPropertyIds ?? [];
                const next = isBookmarked
                  ? prev.filter((id) => id !== property._id)
                  : [property._id, ...prev.filter((id) => id !== property._id)];

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
                } catch {
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
                } catch {
                  setBrokerData({ ...brokerData, bookmarkedPropertyIds: prev });
                }
              }
            }}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {isBookmarkPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "text-accent" : "text-foreground/70"
                  }`}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm"
                onClick={(e) => e.stopPropagation()}
                title={canShareExternally ? "Share" : "Export PDF"}
              >
                {canShareExternally ? (
                  <Share2 className="h-4 w-4 text-foreground/70" />
                ) : (
                  <Download className="h-4 w-4 text-foreground/70" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canShareExternally && (
                <>
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleShareWhatsApp}
                    className="cursor-pointer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Share via WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleShareNative}
                    className="cursor-pointer"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Property
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="cursor-pointer"
              >
                {isExportingPdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isExportingPdf ? "Exporting…" : "Export as PDF"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price Tag Overlay (Luxurious Touch) */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-background/95 backdrop-blur shadow-md px-3 py-1.5 rounded-lg border border-accent/10 flex flex-col items-end">
            <Typography variant="large" className="font-bold text-accent leading-none">
              {formatPriceShort(property.totalPrice)}
            </Typography>
            {rateDisplay && (
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                {rateDisplay}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-3 flex-grow flex flex-col gap-1 md:gap-2">
        <div className="flex justify-between items-start gap-1 md:gap-1">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-xs font-medium text-accent uppercase tracking-wider">
              {property.propertyCategory}
            </div>
            <Typography variant="h3" className="text-[17px] line-clamp-1 leading-tight">
              {property.bhk ? `${property.bhk} BHK ` : ""}
              {property.propertyType.replace(/_/g, " ")}
            </Typography>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-accent/70" />
              <span className="line-clamp-1 text-sm">
                {formatAddress(property.address)}
              </span>
            </div>
          </div>
          <Badge
            className={`shadow-sm backdrop-blur-md border-none shrink-0 ${property.listingStatus === "ACTIVE" && !property.deletingStatus
              ? "bg-emerald-600/90 text-white"
              : property.deletingStatus
                ? "bg-red-600/90 text-white"
                : "bg-background/80 text-foreground"
              }`}
          >
            {property.deletingStatus
              ? "Deletion Pending"
              : property.listingStatus === "ACTIVE"
                ? "Active"
                : property.listingStatus.replace("_", " ")}
          </Badge>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="grid grid-cols-3 gap-1 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-1">
            {property.propertyCategory === "RESIDENTIAL" && property.bhk ? (
              <>
                <BedDouble className="h-4 w-4" />
                <span className="text-xs font-medium">{property.bhk} Beds</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyCategory}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1 border-l border-border/40">
            {property.washrooms ? (
              <>
                <Bath className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {property.washrooms} Baths
                </span>
              </>
            ) : (
              <>
                <Home className="h-4 w-4" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyType.replace(/_/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 border-l border-border/40">
            <Move className="h-4 w-4" />
            <span className="text-xs font-medium">
              {property.size} {property.sizeUnit?.replace("SQ_", "")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          asChild
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Link href={`/property/${property._id}`}>{t("action_view_details")}</Link>
        </Button>
        {actionSlot}
      </CardFooter>
    </Card>
  );
};
