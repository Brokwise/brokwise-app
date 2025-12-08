import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetProperty } from "@/hooks/useProperty";
import {
  MapPin,
  Loader2,
  Ruler,
  Home,
  Building2,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatAddress } from "@/utils/helper";

type PropertyPreviewModalProps = {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PropertyPreviewModal: React.FC<PropertyPreviewModalProps> = ({
  propertyId,
  open,
  onOpenChange,
}) => {
  const {
    property,
    isLoading,
    error,
  } = useGetProperty(propertyId ?? "", { enabled: !!propertyId && open });

  const allImages =
    property && (property.featuredMedia || property.images?.length)
      ? [
          ...(property.featuredMedia ? [property.featuredMedia] : []),
          ...(property.images || []),
        ]
      : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Property Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (propertyId) {
                  window.open(`/property/${propertyId}`, "_blank");
                }
              }}
              disabled={!propertyId}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Page
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading property...
              </div>
            ) : error || !property ? (
              <div className="text-sm text-destructive">
                {error?.message || "Unable to load property details."}
              </div>
            ) : (
              <>
                {allImages.length > 0 && (
                  <div className="rounded-lg overflow-hidden border bg-muted/40 aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={allImages[0]}
                      alt={property.propertyTitle || "Property"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.webp";
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{property.propertyCategory}</Badge>
                    <Badge variant="outline">
                      {property.propertyType?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-2xl font-semibold text-primary">
                    {formatCurrency(property.totalPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formatAddress(property.address)}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <InfoTile
                    label="Category"
                    icon={Building2}
                    value={property.propertyCategory}
                  />
                  <InfoTile
                    label="Type"
                    icon={Home}
                    value={property.propertyType?.replace(/_/g, " ")}
                  />
                  <InfoTile
                    label="Size"
                    icon={Ruler}
                    value={
                      property.size
                        ? `${property.size} ${property.sizeUnit?.replace("SQ_", "")}`
                        : "—"
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {property.description || "No description provided."}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const InfoTile = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | number | null;
  icon: React.ElementType;
}) => (
  <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/40">
    <div className="p-2 rounded-full bg-background shadow-sm">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate">
        {value || "—"}
      </p>
    </div>
  </div>
);

