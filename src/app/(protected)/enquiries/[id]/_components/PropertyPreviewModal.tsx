"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetProperty } from "@/hooks/useProperty";
import {
  MapPin,
  Loader2,
  Ruler,
  Home,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bath,
  BedDouble,
  Layers,
  Compass,
  Calendar,
  IndianRupee,
  BadgeCheck,
  Sparkles,
  Tag,
  Car,
  Dumbbell,
  TreePine,
  Shield,
  ShieldX,
  Wifi,
  Wind,
} from "lucide-react";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { format } from "date-fns";

type PropertyPreviewModalProps = {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PropertyPreviewModal: React.FC<PropertyPreviewModalProps> = ({
  propertyId,
  open,
  onOpenChange,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { property, isLoading, error } = useGetProperty(propertyId ?? "", {
    enabled: !!propertyId && open,
  });

  const allImages =
    property && (property.featuredMedia || property.images?.length)
      ? [
          ...(property.featuredMedia ? [property.featuredMedia] : []),
          ...(property.images || []),
        ]
      : [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // Reset image index when modal opens with new property
  React.useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  }, [open, propertyId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 pr-12 border-b bg-gradient-to-r from-background to-muted/30">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Property Preview
          </DialogTitle>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              if (propertyId) {
                window.open(`/property/${propertyId}`, "_blank");
              }
            }}
            disabled={!propertyId}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Full Details
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(92vh-60px)]">
          <div className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Loading property details...</p>
              </div>
            ) : error || !property ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                {(error as any)?.response?.status === 403 ? (
                  <>
                    <div className="rounded-full bg-destructive/10 p-4 mb-3">
                      <ShieldX className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">
                      Access Restricted
                    </p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      You don&apos;t have permission to view this property.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="rounded-full bg-destructive/10 p-4 mb-3">
                      <Building2 className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-sm text-destructive font-medium">
                      {error?.message || "Unable to load property details"}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Image Gallery */}
                {allImages.length > 0 ? (
                  <div className="relative bg-black/95">
                    <div className="aspect-[16/9] md:aspect-[2/1] relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={allImages[currentImageIndex]}
                        alt={property.propertyTitle || "Property"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.webp";
                        }}
                      />

                      {/* Image Navigation */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>

                          {/* Image Counter */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                            {currentImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}

                      {/* Status Badges Overlay */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {property.isVerified && (
                          <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 text-[10px] h-6">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {property.isFeatured && (
                          <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-0 text-[10px] h-6">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {property.isPriceNegotiable && (
                          <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 text-[10px] h-6">
                            <Tag className="h-3 w-3 mr-1" />
                            Negotiable
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                      <div className="flex gap-1 p-2 bg-black/80 overflow-x-auto">
                        {allImages.slice(0, 6).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-all ${
                              currentImageIndex === idx
                                ? "border-primary ring-1 ring-primary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        {allImages.length > 6 && (
                          <div className="flex-shrink-0 w-14 h-10 rounded bg-muted/20 flex items-center justify-center text-white text-xs">
                            +{allImages.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[2/1] bg-muted/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-5">
                  {/* Title & Price Section */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {property.propertyTitle && (
                        <h2 className="text-lg font-semibold leading-tight">
                          {property.propertyTitle}
                        </h2>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {property.propertyCategory}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {property.propertyType?.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            property.listingStatus === "ACTIVE"
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                              : ""
                          }`}
                        >
                          {property.listingStatus?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {formatAddress(property.address)}
                        </span>
                      </p>
                    </div>

                    {/* Price Card */}
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-4 border border-primary/20 min-w-[180px]">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Price
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(property.totalPrice)}
                      </p>
                      {property.rate && property.sizeUnit && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {property.rate.toLocaleString("en-IN")} /{" "}
                          {property.sizeUnit?.toLowerCase().replace("sq_", "sq ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Key Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {property.size && (
                      <SpecCard
                        icon={Ruler}
                        label="Size"
                        value={`${property.size} ${property.sizeUnit?.replace("SQ_", "") || ""}`}
                      />
                    )}
                    {property.bhk && (
                      <SpecCard
                        icon={BedDouble}
                        label="Configuration"
                        value={`${property.bhk} BHK`}
                      />
                    )}
                    {property.washrooms && (
                      <SpecCard
                        icon={Bath}
                        label="Washrooms"
                        value={property.washrooms.toString()}
                      />
                    )}
                    {property.floor && (
                      <SpecCard
                        icon={Layers}
                        label="Floor"
                        value={property.floor}
                      />
                    )}
                    {property.facing && (
                      <SpecCard
                        icon={Compass}
                        label="Facing"
                        value={property.facing.replace(/_/g, " ")}
                      />
                    )}
                    {property.rooms && (
                      <SpecCard
                        icon={Home}
                        label="Rooms"
                        value={property.rooms.toString()}
                      />
                    )}
                    {property.beds && (
                      <SpecCard
                        icon={BedDouble}
                        label="Beds"
                        value={property.beds.toString()}
                      />
                    )}
                    {property.frontRoadWidth && (
                      <SpecCard
                        icon={Ruler}
                        label="Road Width"
                        value={`${property.frontRoadWidth} ft`}
                      />
                    )}
                    {property.projectArea && (
                      <SpecCard
                        icon={Building2}
                        label="Project Area"
                        value={`${property.projectArea} sq ft`}
                      />
                    )}
                    {property.possessionDate && (
                      <SpecCard
                        icon={Calendar}
                        label="Possession"
                        value={format(new Date(property.possessionDate), "MMM yyyy")}
                      />
                    )}
                  </div>

                  {/* Additional Details */}
                  {(property.society ||
                    property.purpose ||
                    property.areaType ||
                    property.plotType ||
                    property.rentalIncome) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Additional Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {property.society && (
                            <DetailRow label="Society" value={property.society} />
                          )}
                          {property.purpose && (
                            <DetailRow label="Purpose" value={property.purpose} />
                          )}
                          {property.areaType && (
                            <DetailRow
                              label="Area Type"
                              value={property.areaType.replace(/_/g, " ")}
                            />
                          )}
                          {property.plotType && (
                            <DetailRow
                              label="Plot Type"
                              value={property.plotType}
                            />
                          )}
                          {property.rentalIncome && (
                            <DetailRow
                              label="Rental Income"
                              value={`₹${property.rentalIncome.min.toLocaleString("en-IN")} - ₹${property.rentalIncome.max.toLocaleString("en-IN")}`}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs py-1.5 px-3 font-normal"
                            >
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Localities */}
                  {property.localities && property.localities.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Nearby Localities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {property.localities.map((locality, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs py-1.5 px-3 font-normal"
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              {locality}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Description */}
                  {property.description && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">About Property</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {property.description}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Footer Info */}
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {property.propertyId && (
                        <span className="bg-muted px-2 py-1 rounded">
                          ID: {property.propertyId}
                        </span>
                      )}
                      <span>
                        Listed: {format(new Date(property.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                    {property.listedBy && (
                      <span>
                        By: {property.listedBy.firstName} {property.listedBy.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Spec Card Component
const SpecCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20 hover:bg-muted/40 transition-colors">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  </div>
);

// Detail Row Component
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

// Get icon for amenity
const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("parking") || amenityLower.includes("car")) {
    return <Car className="h-3 w-3 mr-1.5" />;
  }
  if (amenityLower.includes("gym") || amenityLower.includes("fitness")) {
    return <Dumbbell className="h-3 w-3 mr-1.5" />;
  }
  if (amenityLower.includes("garden") || amenityLower.includes("park")) {
    return <TreePine className="h-3 w-3 mr-1.5" />;
  }
  if (amenityLower.includes("security") || amenityLower.includes("guard")) {
    return <Shield className="h-3 w-3 mr-1.5" />;
  }
  if (amenityLower.includes("wifi") || amenityLower.includes("internet")) {
    return <Wifi className="h-3 w-3 mr-1.5" />;
  }
  if (amenityLower.includes("ac") || amenityLower.includes("air")) {
    return <Wind className="h-3 w-3 mr-1.5" />;
  }
  return null;
};
