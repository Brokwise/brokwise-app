import React from "react";
import { Property } from "@/types/property";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BedDouble,
  Bath,
  Move,
  ArrowRight,
  Home,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatAddress } from "@/utils/helper";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Link
          href={`/property/${property._id}`}
          className="block w-full h-full"
        >
          <Image
            src={
              property.featuredMedia &&
              property.featuredMedia.includes("firebasestorage.googleapis.com")
                ? property.featuredMedia
                : "/images/placeholder.webp"
            }
            alt={property.description || "Property Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-md shadow-sm font-medium text-xs"
          >
            {property.propertyCategory}
          </Badge>
          <Badge
            variant={
              property.listingStatus === "ACTIVE" ? "default" : "secondary"
            }
            className={`text-xs shadow-sm ${
              property.listingStatus === "ACTIVE"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-background/90 backdrop-blur-md"
            }`}
          >
            {property.listingStatus.replace("_", " ")}
          </Badge>
        </div>

        {/* Price Badge (Bottom Right Overlay or in Content) - Moving to content for cleaner look */}
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex-grow flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 text-card-foreground">
              {property.bhk ? `${property.bhk} BHK ` : ""}
              {property.propertyType.replace(/_/g, " ")}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="line-clamp-1">
                {formatAddress(property.address)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(property.totalPrice)}
            </p>
            {property.rate && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(property.rate)}/sqft
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-border/50 my-1" />

        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/30">
            {property.propertyCategory === "RESIDENTIAL" && property.bhk ? (
              <>
                <BedDouble className="h-4 w-4 mb-0.5" />
                <span className="text-xs font-medium">{property.bhk} Beds</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mb-0.5" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyCategory}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/30">
            {property.washrooms ? (
              <>
                <Bath className="h-4 w-4 mb-0.5" />
                <span className="text-xs font-medium">
                  {property.washrooms} Baths
                </span>
              </>
            ) : (
              <>
                <Home className="h-4 w-4 mb-0.5" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyType.replace(/_/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/30">
            <Move className="h-4 w-4 mb-0.5" />
            <span className="text-xs font-medium">
              {property.size} {property.sizeUnit?.replace("SQ_", "")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          variant="outline"
          className="w-full group-hover:border-primary/50 group-hover:text-primary transition-colors"
        >
          <Link href={`/property/${property._id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
