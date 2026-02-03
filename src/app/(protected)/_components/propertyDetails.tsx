import { Property } from "@/types/property";
import React from "react";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Move,
  Building2,
  ArrowUpRight,
  Compass,
  Layers,
  Home,
  Route,
  IndianRupee,
  Star,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetails = ({
  property,
  onClose,
}: PropertyDetailsProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl text-foreground">Property Details</h2>
          <p className="text-[10px] text-muted-foreground/70 font-mono tracking-wider mt-0.5">
            {property.propertyId}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <Link
          href={`/property/detail?id=${property._id}`}
          target="_blank"
          className="block p-4 space-y-4 cursor-pointer hover:bg-muted/30 transition-colors group"
        >
          {/* Compact Image with Badges */}
          <div className="aspect-[16/9] w-full relative rounded-lg overflow-hidden bg-muted border">
            <Image
              src={
                property.featuredMedia &&
                property.featuredMedia.includes(
                  "firebasestorage.googleapis.com"
                )
                  ? property.featuredMedia
                  : "/images/placeholder.webp"
              }
              alt="Property"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
              <Badge className="bg-background/90 text-foreground hover:bg-background/100 backdrop-blur shadow-sm text-[10px]">
                {property.propertyCategory}
              </Badge>
              {property.isFeatured && (
                <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 backdrop-blur shadow-sm text-[10px]">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-accent/95 text-accent-foreground hover:bg-accent backdrop-blur shadow-sm font-semibold">
                {formatCurrency(property.totalPrice)}
              </Badge>
            </div>
          </div>

          {/* Title & Location */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
                  {property.propertyCategory} • {property.propertyType.replace(/_/g, " ")}
                </p>
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {property.bhk ? `${property.bhk} BHK ` : ""}{property.propertyType.replace(/_/g, " ")}
                  {property.society && ` in ${property.society}`}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground font-medium">
                  {formatCurrency(property.rate)}/sqft
                </p>
                {property.isPriceNegotiable && (
                  <p className="text-[10px] text-emerald-600 font-medium">Negotiable</p>
                )}
              </div>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-accent/60" />
              <span className="line-clamp-1">{formatAddress(property.address)}</span>
            </div>

            {/* Status Badges */}
            <div className="flex gap-1.5 flex-wrap">
              <Badge
                variant={property.listingStatus === "ACTIVE" ? "default" : "secondary"}
                className={property.listingStatus === "ACTIVE" ? "bg-emerald-600/90 text-white border-none text-[10px]" : "text-[10px]"}
              >
                {property.listingStatus.replace(/_/g, " ")}
              </Badge>
              {property.isVerified && (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {property.propertyStatus && (
                <Badge variant="outline" className="text-[10px]">
                  {property.propertyStatus}
                </Badge>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Key Stats Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            {/* Size */}
            <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
              <Move className="h-4 w-4 text-accent/80 shrink-0" />
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Size</p>
                <p className="font-semibold text-sm text-foreground">
                  {property.size} {property.sizeUnit?.replace("SQ_", "").replace("_", " ")}
                </p>
              </div>
            </div>

            {/* BHK or Type */}
            {property.bhk ? (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <BedDouble className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Config</p>
                  <p className="font-semibold text-sm text-foreground">{property.bhk} BHK</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Building2 className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Type</p>
                  <p className="font-semibold text-sm text-foreground truncate">
                    {property.propertyType.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            )}

            {/* Washrooms */}
            {property.washrooms !== undefined && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Bath className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Baths</p>
                  <p className="font-semibold text-sm text-foreground">{property.washrooms}</p>
                </div>
              </div>
            )}

            {/* Facing */}
            {property.facing && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Compass className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Facing</p>
                  <p className="font-semibold text-sm text-foreground">{property.facing.replace(/_/g, " ")}</p>
                </div>
              </div>
            )}

            {/* Floor */}
            {property.floor && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Layers className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Floor</p>
                  <p className="font-semibold text-sm text-foreground">{property.floor}</p>
                </div>
              </div>
            )}

            {/* Plot Type */}
            {property.plotType && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Home className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Plot Type</p>
                  <p className="font-semibold text-sm text-foreground">{property.plotType}</p>
                </div>
              </div>
            )}

            {/* Road Width */}
            {property.frontRoadWidth && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Route className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Road Width</p>
                  <p className="font-semibold text-sm text-foreground">
                    {property.frontRoadWidth} {property.roadWidthUnit?.toLowerCase() || "ft"}
                  </p>
                </div>
              </div>
            )}

            {/* Possession */}
            {property.possessionDate && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <Calendar className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Possession</p>
                  <p className="font-semibold text-sm text-foreground">
                    {new Date(property.possessionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}

            {/* Rental Income */}
            {property.rentalIncome && (property.rentalIncome.min > 0 || property.rentalIncome.max > 0) && (
              <div className="bg-muted/30 p-2.5 rounded-lg flex items-center gap-2 border border-border/30">
                <IndianRupee className="h-4 w-4 text-accent/80 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Rental</p>
                  <p className="font-semibold text-sm text-foreground">
                    {formatCurrency(property.rentalIncome.min)}-{formatCurrency(property.rentalIncome.max)}/mo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description - more compact */}
          {property.description && (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Description
              </h4>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities - more compact */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.slice(0, 6).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="font-normal text-[10px]">
                    {amenity}
                  </Badge>
                ))}
                {property.amenities.length > 6 && (
                  <Badge variant="outline" className="font-normal text-[10px]">
                    +{property.amenities.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Listed By */}
          <div className="text-[10px] text-muted-foreground pt-1">
            Listed by: <span className="font-medium text-foreground">{property.listedBy?.firstName} {property.listedBy?.lastName}</span>
            {property.listedByType && <span className="text-accent"> ({property.listedByType})</span>}
          </div>
        </Link>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-muted/5 mt-auto">
        <Button className="w-full gap-2 shadow-sm" asChild>
          <Link href={`/property/detail?id=${property._id}`} target="_blank">
            View Full Details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
