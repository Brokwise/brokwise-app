import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Property } from "@/types/property";
import { ArrowUpDownIcon, Bath, Bed, Building, Calendar, Home, Maximize2, RulerDimensionLine } from "lucide-react";
import { format } from "date-fns";
import React from "react";

export const KeyFeatures = ({ property }: { property: Property }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {property.bhk && (
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="font-semibold">{property.bhk} BHK</p>
              </div>
            </div>
          )}
          {property.washrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="font-semibold">{property.washrooms}</p>
              </div>
            </div>
          )}
          {property.size && (
            <div className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-semibold">
                  {property.size} {property.sizeUnit}
                </p>
              </div>
            </div>
          )}
          {property.facing && (
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Front Facing</p>
                <p className="font-semibold">{property.facing}</p>
              </div>
            </div>
          )}

          {property.sideFacing && (
            <div className="flex items-center gap-2">
              <ArrowUpDownIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Side Direction</p>
                <p className="font-semibold">{property.sideFacing}</p>
              </div>
            </div>
          )}
          {property.frontRoadWidth && (
            <div className="flex items-center gap-2">
              <RulerDimensionLine className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{`Front road width (${property.roadWidthUnit?.toLowerCase() ?? "feet"})`}</p>
                <p className="font-semibold">{property.frontRoadWidth}</p>
              </div>
            </div>
          )}
          {property.sideRoadWidth && (
            <div className="flex items-center gap-2">
              <RulerDimensionLine className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{`Side road width (${property.roadWidthUnit?.toLowerCase() ?? "feet"})`}</p>
                <p className="font-semibold">{property.sideRoadWidth}</p>
              </div>
            </div>
          )}
          {property.floor && (
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Floor</p>
                <p className="font-semibold">{property.floor}</p>
              </div>
            </div>
          )}
          {property.possessionDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Possession</p>
                <p className="font-semibold">
                  {format(new Date(property.possessionDate), "MMM yyyy")}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
