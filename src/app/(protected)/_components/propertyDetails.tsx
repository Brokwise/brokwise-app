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
        <div className="p-4 space-y-6">
          {/* Image */}
          <div className="aspect-video w-full relative rounded-lg overflow-hidden bg-muted border">
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
              className="object-cover"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className="bg-background/90 text-foreground hover:bg-background/100 backdrop-blur shadow-sm">
                {property.propertyCategory}
              </Badge>
            </div>
          </div>

          {/* Title & Price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">
                  {property.propertyCategory}
                </p>
                <h3 className="text-xl text-foreground leading-tight">
                  {property.bhk ? `${property.bhk} BHK ` : ""}{property.propertyType.replace(/_/g, " ")}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-accent/60" />
                  <span className="line-clamp-1">{formatAddress(property.address)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl text-accent">
                  {formatCurrency(property.totalPrice)}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatCurrency(property.rate)}/sqft
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Badge
                variant={
                  property.listingStatus === "ACTIVE" ? "default" : "secondary"
                }
                className={
                  property.listingStatus === "ACTIVE" ? "bg-emerald-600/90 text-white border-none" : ""
                }
              >
                {property.listingStatus.replace(/_/g, " ")}
              </Badge>
              {property.isVerified && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 p-3 rounded-xl text-center space-y-1 border border-border/30">
              <Move className="h-4 w-4 mx-auto text-accent/80 mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Size</p>
              <p className="font-semibold text-sm text-foreground">
                {property.size} {property.sizeUnit?.replace("SQ_", "")}
              </p>
            </div>
            {property.bhk ? (
              <div className="bg-muted/30 p-3 rounded-xl text-center space-y-1 border border-border/30">
                <BedDouble className="h-4 w-4 mx-auto text-accent/80 mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Beds</p>
                <p className="font-semibold text-sm text-foreground">{property.bhk} BHK</p>
              </div>
            ) : (
              <div className="bg-muted/30 p-3 rounded-xl text-center space-y-1 border border-border/30">
                <Building2 className="h-4 w-4 mx-auto text-accent/80 mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                <p className="font-semibold text-sm text-foreground truncate px-1">
                  {property.propertyType.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {property.washrooms !== undefined && (
              <div className="bg-muted/30 p-3 rounded-xl text-center space-y-1 border border-border/30">
                <Bath className="h-4 w-4 mx-auto text-accent/80 mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Baths</p>
                <p className="font-semibold text-sm text-foreground">{property.washrooms}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Description
            </h4>
            <p className="text-sm text-foreground leading-relaxed line-clamp-6">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 5).map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="font-normal"
                  >
                    {amenity}
                  </Badge>
                ))}
                {property.amenities.length > 5 && (
                  <Badge variant="outline" className="font-normal">
                    +{property.amenities.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-muted/5 mt-auto">
        <Button className="w-full gap-2 shadow-sm" asChild>
          <Link href={`/property/${property._id}`} target="_blank">
            View Full Details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
