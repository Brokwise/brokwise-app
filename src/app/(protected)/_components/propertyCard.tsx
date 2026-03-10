"use client";
import React from "react";
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
  CheckCircle2,
  Loader2,
  Bookmark,
  Map,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatAddress, formatPriceShort } from "@/utils/helper";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getPropertyMediaSrc, isSampleLandMedia } from "@/lib/property-media";

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
  const { userData, brokerData, setBrokerData, companyData, setCompanyData } =
    useApp();
  const { toggleBookmarkAsync, isPending: isBookmarkPending } =
    useToggleBookmark();
  const { t } = useTranslation();

  const isCompany = userData?.userType === "company";

  const isRental = (property.listingPurpose || "SALE") === "RENT";
  const rateDisplay = isRental
    ? null
    : property.rate && property.sizeUnit
      ? `${formatPriceShort(property.rate)}/${property.sizeUnit.toLowerCase().replace(/_/g, " ")}`
      : null;
  const priceDisplay = isRental
    ? `${formatPriceShort(property.monthlyRent || 0)}/mo`
    : formatPriceShort(property.totalPrice);

  const canShare = !hideShare;
  const isSampleLand =
    property.propertyType === "LAND" && isSampleLandMedia(property.featuredMedia);

  const isBookmarked = isCompany
    ? !!companyData?.bookmarkedPropertyIds?.includes(property._id)
    : !!brokerData?.bookmarkedPropertyIds?.includes(property._id);

  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/property/detail?id=${property._id}`
      : `/property/detail?id=${property._id}`;

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

    const propertyTitle = `${property.bhk ? `${property.bhk} BHK ` : ""}${property.propertyType.replace(/_/g, " ")}`;
    const shareText = `Check out this property: ${formatAddress(property.address)} - ${formatCurrency(property.totalPrice)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: shareText,
          url: propertyUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopyLink(e);
    }
  };

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShowOnMap && hasValidCoordinates) {
      onShowOnMap(property._id);
    }
  };

  const coordinates = property.location?.coordinates;
  const hasValidCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number";

  const isFeatured = property.isFeatured;

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 bg-card flex flex-col rounded-xl lg:rounded-xl border-border/40`}
    >
      {/* Floating Image Section */}
      <div className="p-2 md:p-2 pb-0 md:pb-0">
        <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[2/1] w-full overflow-hidden rounded-lg lg:rounded-lg bg-muted">
          {/* <Link
            href={`/property/detail?id=${property._id}`}
            className="block w-full h-full"
          > */}
          <Image
            src={getPropertyMediaSrc(property.featuredMedia)}
            alt={property.description || "Property Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 w-full h-full"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${isRental
              ? "from-blue-950/50 via-transparent"
              : "from-black/40 via-transparent"
              } to-transparent`}
          />
          {/* </Link> */}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 items-start">
            {isSameCity && (
              <Badge className="shadow-sm backdrop-blur-md border-none bg-blue-600/90 text-white text-[9px] md:text-[10px] px-1.5 py-0.5">
                <MapPin className="h-2.5 w-2.5 mr-0.5" />
                {t("label_same_city")}
              </Badge>
            )}
            {isSampleLand && (
              <Badge className="shadow-sm backdrop-blur-md border-none bg-amber-600/90 text-white text-[9px] md:text-[10px] px-1.5 py-0.5">
                Sample image
              </Badge>
            )}
          </div>

          {/* Featured crown indicator (top-right) */}
          {isFeatured && (
            <div className="absolute top-2 right-2 z-10">
              <div className="group/featured h-8 w-8 hover:w-24 md:h-9 md:w-9 md:hover:w-28 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 flex items-center justify-start overflow-hidden pl-1.5 md:pl-2 shadow-md shadow-amber-500/30 transition-all duration-300 ease-out">
                <Crown className="h-5 w-5 text-white fill-white drop-shadow-sm shrink-0" />
                <span className="ml-2 text-xs font-semibold text-white whitespace-nowrap max-w-0 opacity-0 group-hover/featured:max-w-20 group-hover/featured:opacity-100 transition-all duration-300 ease-out">
                  Featured
                </span>
              </div>
            </div>
          )}

          {/* Bottom overlay: badge left, actions right */}
          <div className="absolute bottom-2 left-2 right-2 z-10 flex items-end justify-between">
            <div className="flex flex-col gap-1">
              {isRental && (
                <Badge className="shadow-sm backdrop-blur-md border-none bg-white/95 text-blue-700 text-[9px] md:text-[10px] px-2 py-0.5 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 inline-block" />
                  For Rent
                </Badge>
              )}
              {!isRental && property.listingStatus === "ACTIVE" && !property.deletingStatus && (
                <Badge className="shadow-sm backdrop-blur-md border-none bg-white/95 text-emerald-700 text-[9px] md:text-[10px] px-2 py-0.5 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                  Active
                </Badge>
              )}
              {property.deletingStatus && (
                <Badge className="shadow-sm backdrop-blur-md border-none bg-white/95 text-red-600 text-[9px] md:text-[10px] px-2 py-0.5 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1 inline-block" />
                  Deletion Pending
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {showMapButton && hasValidCoordinates && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm text-foreground/70 hover:bg-white hover:text-accent transition-colors border-0"
                  onClick={handleShowOnMap}
                  title="Show on Map"
                >
                  <Map className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </Button>
              )}

              <Button
                size="icon"
                variant="secondary"
                className={`h-7 w-7 md:h-8 md:w-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm hover:bg-white border-0 transition-colors ${isBookmarked ? "text-rose-500" : "text-foreground/60"
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
                  <Loader2 className="h-3 w-3 md:h-3.5 md:w-3.5 animate-spin" />
                ) : (
                  <Bookmark
                    className={`h-3 w-3 md:h-3.5 md:w-3.5 ${isBookmarked ? "text-rose-500" : "text-foreground/60"
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
                    className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm hover:bg-white border-0 text-foreground/60"
                    onClick={(e) => e.stopPropagation()}
                    title="Share"
                  >
                    <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canShare && (
                    <>
                      <DropdownMenuItem
                        onClick={handleCopyLink}
                        className="cursor-pointer"
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleShareNative}
                        className="cursor-pointer"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Property
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="px-2 lg:px-2.5 pt-2 lg:pt-2.5 pb-1 flex-grow flex flex-col gap-1.5 lg:gap-2">
        {/* Price Row */}
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1">
            <Typography
              variant="h2"
              className="text-sm md:text-sm lg:text-base font-semibold leading-none text-white dark:text-black rounded-md px-2 py-[0.5px] bg-black/50 dark:bg-white/70"
            >
              {priceDisplay}
            </Typography>
            {rateDisplay && (
              <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium">
                {rateDisplay}
              </span>
            )}
          </div>
          <Badge
            className={`shadow-sm border-none shrink-0 text-[9px] md:text-[9px] px-1.5 py-0 ${property.listingStatus === "ACTIVE" && !property.deletingStatus
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : property.deletingStatus
                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {property.deletingStatus
              ? "Pending"
              : property.listingStatus === "ACTIVE"
                ? "Active"
                : property.listingStatus.replace("_", " ")}
          </Badge>
        </div>

        {/* Title */}
        <div className="space-y-0.5">
          <h3 className="text-xs md:text-xs font-medium leading-tight line-clamp-1 text-foreground">
            {property.bhk ? `${property.bhk} BHK ` : ""}
            {property.propertyType.replace(/_/g, " ")}
          </h3>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 mr-0.5 shrink-0 text-muted-foreground/60" />
            <span className="line-clamp-1 text-[10px] md:text-[10px]">
              {formatAddress(property.address)}
            </span>
          </div>
        </div>

        {/* Amenities Row - Compact Inline */}
        <div className="flex items-center gap-2 md:gap-2.5 text-muted-foreground mt-auto">
          <div className="flex items-center gap-0.5">
            {property.propertyCategory === "RESIDENTIAL" && property.bhk ? (
              <>
                <BedDouble className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 shrink-0" />
                <span className="text-[9px] md:text-[9px] font-medium whitespace-nowrap">
                  {property.bhk} bed
                </span>
              </>
            ) : (
              <>
                <Building2 className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 shrink-0" />
                <span className="text-[9px] md:text-[9px] font-medium truncate max-w-[50px] md:max-w-[60px]">
                  {property.propertyCategory}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            {property.washrooms ? (
              <>
                <Bath className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 shrink-0" />
                <span className="text-[9px] md:text-[9px] font-medium whitespace-nowrap">
                  {property.washrooms} bath
                </span>
              </>
            ) : (
              <>
                <Home className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 shrink-0" />
                <span className="text-[9px] md:text-[9px] font-medium truncate max-w-[50px] md:max-w-[60px]">
                  {property.propertyType.replace(/_/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <Move className="h-2.5 w-2.5 md:h-2.5 md:w-2.5 shrink-0" />
            <span className="text-[9px] md:text-[9px] font-medium whitespace-nowrap">
              {property.size} {property.sizeUnit?.replace("SQ_", "")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-2 lg:px-2.5 py-1.5 lg:py-2 gap-2 flex justify-end">
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-7 lg:h-7 text-[10px] md:text-[11px] rounded-md"
        >
          <Link href={`/property/detail?id=${property._id}`}>
            {t("action_view_details")}
          </Link>
        </Button>
        {actionSlot}
      </CardFooter>
    </Card>
  );
};
