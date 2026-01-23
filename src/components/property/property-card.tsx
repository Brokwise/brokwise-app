import { Property } from "@/types/property";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatAddress, formatPrice } from "@/utils/helper";
import Image from "next/image";
import { PropertyStatusBadge } from "./property-status-badge";
import { PropertyActions } from "./property-actions";
import { MapPin, Maximize2, Home, Compass } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const sizeDisplay = property.size
    ? `${property.size} ${property.sizeUnit?.replace(/_/g, " ") || ""}`
    : null;

  const rateDisplay =
    property.rate && property.sizeUnit
      ? `${formatPrice(property.rate)}/${property.sizeUnit.toLowerCase().replace(/_/g, " ")}`
      : null;

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {property.featuredMedia ? (
          <Image
            src={
              property.featuredMedia.includes("firebasestorage.googleapis.com")
                ? property.featuredMedia
                : "/images/placeholder.webp"
            }
            alt={`${property.propertyCategory} ${property.propertyType}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.webp";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Home className="h-8 w-8 opacity-20" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-mono">
          {property.propertyId}
        </div>
      </div>

      {/* Header - Category/Type & Location */}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base leading-tight">
                {property.propertyCategory.replace(/_/g, " ")}{" "}
                <span className="font-normal text-muted-foreground text-sm">
                  • {property.propertyType.replace(/_/g, " ")}
                </span>
              </h3>
              <div className="mt-1">
                <PropertyStatusBadge
                  status={property.listingStatus}
                  deletingStatus={property.deletingStatus}
                  className="shadow-sm text-xs px-2 py-0.5"
                />
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate" title={formatAddress(property.address)}>
                {property.address.city}, {property.address.state}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content - Price & Details */}
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(property.totalPrice)}
          </span>
          {rateDisplay && (
            <span className="text-xs text-muted-foreground">({rateDisplay})</span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {sizeDisplay && (
            <div className="flex items-center">
              <Maximize2 className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>{sizeDisplay}</span>
            </div>
          )}
          {property.facing && (
            <div className="flex items-center">
              <Compass className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="capitalize">
                {property.facing.toLowerCase().replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Date & Actions */}
      <CardFooter className="p-4 pt-3 border-t flex justify-between items-center bg-muted/30">
        <div className="text-xs text-muted-foreground">
          {new Date(property.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <PropertyActions property={property} />
      </CardFooter>
    </Card>
  );
}
