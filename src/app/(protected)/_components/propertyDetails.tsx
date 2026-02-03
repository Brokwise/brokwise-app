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
  Compass,
  Layers,
  Home,
  Route,
  IndianRupee,
  Star,
  CheckCircle2,
  Calendar,
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
    <div className="flex flex-col bg-background overflow-hidden max-h-full h-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-md z-10 shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg text-foreground">Property Details</h2>
          <p className="text-[10px] text-muted-foreground/70 font-mono tracking-wider">
            {property.propertyId}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-muted/50 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-hidden min-h-0">
        <Link
          href={`/property/detail?id=${property._id}`}
          target="_blank"
          className="block p-3 space-y-1.5 cursor-pointer hover:bg-muted/30 transition-colors group overflow-hidden"
        >
          {/* Compact Image with Price & Badges */}
          <div className="aspect-[2.5/1] w-full relative rounded-lg overflow-hidden bg-muted border">
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
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              <Badge className="bg-background/90 text-foreground hover:bg-background/100 backdrop-blur shadow-sm text-[9px] py-0.5">
                {property.propertyCategory}
              </Badge>
              {property.isFeatured && (
                <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 backdrop-blur shadow-sm text-[9px] py-0.5">
                  <Star className="h-2.5 w-2.5 mr-0.5" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
              <div>
                <p className="text-white text-xl font-bold drop-shadow-lg">
                  {formatCurrency(property.totalPrice)}
                </p>
                <p className="text-white/80 text-[10px] font-medium drop-shadow">
                  {formatCurrency(property.rate)}/sqft
                  {property.isPriceNegotiable && <span className="text-emerald-300 ml-1">• Negotiable</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Title & Location - Compact */}
          <div className="space-y-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
              {property.bhk ? `${property.bhk} BHK ` : ""}{property.propertyType.replace(/_/g, " ")}
              {property.society && ` in ${property.society}`}
            </h3>
            <div className="flex items-center text-muted-foreground text-xs overflow-hidden">
              <MapPin className="h-3 w-3 mr-1 shrink-0 text-accent/60" />
              <span className="line-clamp-2 block">{formatAddress(property.address)}</span>
            </div>

            {/* Status Badges - Inline */}
            <div className="flex gap-1 flex-wrap">
              <Badge
                variant={property.listingStatus === "ACTIVE" ? "default" : "secondary"}
                className={property.listingStatus === "ACTIVE" ? "bg-emerald-600/90 text-white border-none text-[10px] py-0" : "text-[10px] py-0"}
              >
                {property.listingStatus.replace(/_/g, " ")}
              </Badge>
              {property.isVerified && (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 text-[10px] py-0">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Key Stats Grid - Compact 3 columns */}
          <div className="grid grid-cols-3 gap-1 w-full min-w-0">
            {/* Size */}
            <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
              <Move className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
              <p className="font-bold text-lg text-foreground truncate leading-none">
                {property.size} {property.sizeUnit?.replace("SQ_", "").replace("_", " ")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Size</p>
            </div>

            {/* BHK or Type */}
            {/* BHK or Type */}
            {property.bhk ? (
              <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
                <BedDouble className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
                <p className="font-bold text-lg text-foreground leading-none">{property.bhk} BHK</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Config</p>
              </div>
            ) : (
              <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
                <Building2 className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
                <p className="font-bold text-lg text-foreground truncate leading-none">
                  {property.propertyType.replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Type</p>
              </div>
            )}

            {/* Washrooms or Facing */}
            {property.washrooms !== undefined ? (
              <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
                <Bath className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
                <p className="font-bold text-lg text-foreground leading-none">{property.washrooms}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Baths</p>
              </div>
            ) : property.facing ? (
              <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
                <Compass className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
                <p className="font-bold text-lg text-foreground truncate leading-none">{property.facing.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Facing</p>
              </div>
            ) : (
              <div className="bg-muted/40 p-1.5 py-2 rounded-md text-center border border-border/30 overflow-hidden min-w-0">
                <Building2 className="h-3 w-3 mx-auto text-accent/80 mb-0.5" />
                <p className="font-bold text-lg text-foreground truncate leading-none">
                  {property.propertyCategory}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Category</p>
              </div>
            )}
          </div>

          {/* Additional Details - Compact List */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs overflow-hidden">
            {property.facing && property.washrooms !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Compass className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate"><span className="text-foreground font-medium">{property.facing.replace(/_/g, " ")}</span> Facing</span>
              </div>
            )}
            {property.floor && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Layers className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate">Floor: <span className="text-foreground font-medium">{property.floor}</span></span>
              </div>
            )}
            {property.plotType && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Home className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate"><span className="text-foreground font-medium">{property.plotType}</span> Plot</span>
              </div>
            )}
            {property.frontRoadWidth && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Route className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate">Road: <span className="text-foreground font-medium">{property.frontRoadWidth}{property.roadWidthUnit?.toLowerCase() || "ft"}</span></span>
              </div>
            )}
            {property.possessionDate && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Calendar className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate">Possession: <span className="text-foreground font-medium">
                  {new Date(property.possessionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span></span>
              </div>
            )}
            {property.rentalIncome && (property.rentalIncome.min > 0 || property.rentalIncome.max > 0) && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <IndianRupee className="h-2.5 w-2.5 text-accent/70 shrink-0" />
                <span className="truncate">Rent: <span className="text-foreground font-medium">
                  {formatCurrency(property.rentalIncome.min)}-{formatCurrency(property.rentalIncome.max)}
                </span></span>
              </div>
            )}
          </div>

          {/* Amenities - Inline compact */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <Badge key={index} variant="secondary" className="font-normal text-[10px] py-0">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge variant="outline" className="font-normal text-[10px] py-0">
                  +{property.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}

        </Link >
      </ScrollArea >

      <div className="p-3 border-t border-border/50 bg-muted/5">
        <Button className="w-full gap-2 shadow-sm h-9" asChild>
          <Link href={`/property/detail?id=${property._id}`} target="_blank">
            View Full Details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div >
  );
};
