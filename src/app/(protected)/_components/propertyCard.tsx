import React from "react";
import { Property } from "@/types/property";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Move, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col h-full">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={
            property.featuredMedia.includes("firebasestorage.googleapis.com")
              ? property.featuredMedia
              : "/images/placeholder.webp"
          }
          alt={property.description || "Property Image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm font-medium"
          >
            {property.propertyCategory}
          </Badge>
          <Badge
            variant={
              property.listingStatus === "ACTIVE" ? "default" : "secondary"
            }
            className={
              property.listingStatus === "ACTIVE"
                ? "bg-green-500 hover:bg-green-600"
                : ""
            }
          >
            {property.listingStatus}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
          <p className="text-white font-bold text-lg">
            {formatPrice(property.totalPrice)}
          </p>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.bhk ? `${property.bhk} BHK ` : ""}
              {property.propertyType}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="line-clamp-1">{property.address}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-b py-3 my-2">
          {property.bhk !== undefined && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span>{property.bhk} Beds</span>
            </div>
          )}
          {property.washrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.washrooms} Baths</span>
            </div>
          )}
          {property.size !== undefined && (
            <div className="flex items-center gap-1">
              <Move className="h-4 w-4" />
              <span>
                {property.size}{" "}
                {property.sizeUnit?.toLowerCase().replace("_", " ")}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={`/property/${property._id}`} className="w-full">
          <Button
            className="w-full group-hover:bg-primary/90"
            variant="outline"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
