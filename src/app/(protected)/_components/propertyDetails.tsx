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
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
        <div>
          <h2 className="text-lg font-bold">Property Details</h2>
          <p className="text-xs text-muted-foreground font-mono">
            {property.propertyId}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
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
              <div>
                <h3 className="text-xl font-bold leading-tight">
                  {property.propertyType.replace(/_/g, " ")}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                  <span>{formatAddress(property.address)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(property.totalPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(property.rate)}/sqft
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Badge
                variant={
                  property.listingStatus === "ACTIVE" ? "default" : "secondary"
                }
                className={
                  property.listingStatus === "ACTIVE" ? "bg-green-500" : ""
                }
              >
                {property.listingStatus.replace(/_/g, " ")}
              </Badge>
              {property.isVerified && (
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-600"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 p-3 rounded-lg text-center space-y-1">
              <Move className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="font-semibold text-sm">
                {property.size} {property.sizeUnit?.replace("SQ_", "")}
              </p>
            </div>
            {property.bhk ? (
              <div className="bg-muted/40 p-3 rounded-lg text-center space-y-1">
                <BedDouble className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Bedrooms</p>
                <p className="font-semibold text-sm">{property.bhk} BHK</p>
              </div>
            ) : (
              <div className="bg-muted/40 p-3 rounded-lg text-center space-y-1">
                <Building2 className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-semibold text-sm truncate px-1">
                  {property.propertyType.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {property.washrooms !== undefined && (
              <div className="bg-muted/40 p-3 rounded-lg text-center space-y-1">
                <Bath className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Bathrooms</p>
                <p className="font-semibold text-sm">{property.washrooms}</p>
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

      <div className="p-4 border-t bg-muted/10 mt-auto">
        <Button className="w-full gap-2" asChild>
          <Link href={`/property/${property._id}`} target="_blank">
            View Full Page
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
