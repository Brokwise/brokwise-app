import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/property";
import React from "react";
import { formatCurrency } from "@/utils/helper";
import { Badge } from "@/components/ui/badge";

export const AdditionalDetails = ({ property }: { property: Property }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {property.society && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Society</p>
            <p className="font-semibold">{property.society}</p>
          </div>
        )}
        {property.projectArea && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Project Area</p>
            <p className="font-semibold">{property.projectArea} sq ft</p>
          </div>
        )}
        {property.isPenthouse && (
          <div>
            <Badge variant="secondary">Penthouse</Badge>
          </div>
        )}
        {property.plotType && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Plot Type</p>
            <p className="font-semibold">{property.plotType}</p>
          </div>
        )}
        {property.frontRoadWidth && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Front Road Width
            </p>
            <p className="font-semibold">{property.frontRoadWidth} meters</p>
          </div>
        )}
        {property.purpose && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Purpose</p>
            <p className="font-semibold">{property.purpose}</p>
          </div>
        )}
        {property.areaType && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Area Type</p>
            <p className="font-semibold">{property.areaType}</p>
          </div>
        )}
        {property.propertyStatus && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="font-semibold">{property.propertyStatus}</p>
          </div>
        )}
        {property.propertyTitle && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Title</p>
            <p className="font-semibold">{property.propertyTitle}</p>
          </div>
        )}
        {property.rooms && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Rooms</p>
            <p className="font-semibold">{property.rooms}</p>
          </div>
        )}
        {property.beds && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Beds</p>
            <p className="font-semibold">{property.beds}</p>
          </div>
        )}
        {property.rentalIncome && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Rental Income</p>
            <p className="font-semibold">
              {formatCurrency(property.rentalIncome.amount)} /{" "}
              {property.rentalIncome.period}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
