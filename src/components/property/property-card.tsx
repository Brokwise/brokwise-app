import { Property } from "@/types/property";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatAddress, formatPrice } from "@/utils/helper";
import Image from "next/image";
import { PropertyStatusBadge } from "./property-status-badge";
import { PropertyActions } from "./property-actions";
import { MapPin, Maximize2, Home, Building2, User } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
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
              e.currentTarget.src = "/placeholder.webp";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Home className="h-12 w-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <PropertyStatusBadge
            status={property.listingStatus}
            deletingStatus={property.deletingStatus}
            className="shadow-sm"
          />
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          ID: {property.propertyId}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.propertyCategory.replace(/_/g, " ")}{" "}
              <span className="font-normal text-muted-foreground">
                • {property.propertyType.replace(/_/g, " ")}
              </span>
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate" title={formatAddress(property.address)}>
                {property.address.city}, {property.address.state}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-primary">
            {formatPrice(property.totalPrice)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({formatPrice(property.rate)} / {property.sizeUnit?.toLowerCase()})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Maximize2 className="h-4 w-4 mr-2" />
            <span>
              {property.size} {property.sizeUnit}
            </span>
          </div>
          {property.facing && (
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="capitalize">
                {property.facing.toLowerCase().replace(/_/g, " ")} Facing
              </span>
            </div>
          )}
          <div className="col-span-2 flex items-center text-muted-foreground pt-2 border-t mt-2">
            <User className="h-4 w-4 mr-2" />
            <span className="truncate">
              Listed by {property.listedBy.firstName} {property.listedBy.lastName}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t flex justify-between items-center bg-muted/20">
        <div className="text-xs text-muted-foreground">
          Added {new Date(property.createdAt).toLocaleDateString()}
        </div>
        <PropertyActions property={property} />
      </CardFooter>
    </Card>
  );
}

