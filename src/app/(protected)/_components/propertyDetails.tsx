import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/property";
import React from "react";
import { formatCurrency } from "@/utils/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetails = ({
  property,
  onClose,
}: PropertyDetailsProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Property Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-6">
          <div className="aspect-video w-full relative rounded-lg overflow-hidden bg-muted">
            <Image
              src={
                property.featuredMedia.includes("firebasestorage.googleapis.com")
                  ? property.featuredMedia
                  : "/images/placeholder.webp"
              }
              alt="Property"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-2xl font-bold">
                  {property.propertyCategory}
                </h3>
                <p className="text-muted-foreground">{property.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(property.totalPrice)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rate: {formatCurrency(property.rate)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{property.propertyType}</Badge>
              {property.listingStatus === "ACTIVE" && (
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {property.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-semibold">
                  {property.size} {property.sizeUnit}
                </p>
              </CardContent>
            </Card>
            {property.bhk && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">BHK</p>
                  <p className="font-semibold">{property.bhk}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() => window.open(`/property/${property._id}`, "_blank")}
            >
              View Full Page
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
