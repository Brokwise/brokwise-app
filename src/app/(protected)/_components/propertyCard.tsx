"use client";
import React, { useState } from "react";
import { Property } from "@/types/property";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  BedDouble,
  Bath,
  Move,
  Home,
  Building2,
  Share2,
  Link2,
  Download,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { toast } from "sonner";
import { createRoot } from "react-dom/client";
import { format } from "date-fns";
import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart } from "@/utils/pdf";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const propertyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/property/${property._id}`
    : `/property/${property._id}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(propertyUrl);
      toast.success("Link copied to clipboard!", {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareNative = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: `${property.bhk ? `${property.bhk} BHK ` : ""}${property.propertyType.replace(/_/g, " ")}`,
      text: `Check out this property: ${formatAddress(property.address)} - ${formatCurrency(property.totalPrice)}`,
      url: propertyUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed - do nothing
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyLink(e);
    }
  };

  const handleExportPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExportingPdf) return;

    let host: HTMLDivElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;

    const toastId = toast.loading("Generating PDF…");

    try {
      setIsExportingPdf(true);

      const exportedOnLabel = format(new Date(), "PPP p");

      host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-10000px";
      host.style.top = "0";
      host.style.zIndex = "2147483647";
      document.body.appendChild(host);

      root = createRoot(host);
      root.render(
        <div className="w-[794px] bg-white text-black">
          <PropertyPdfLayout property={property} exportedOnLabel={exportedOnLabel} />
        </div>
      );

      // Ensure layout is painted before capture.
      await new Promise((r) => setTimeout(r, 75));

      const element = host.querySelector("[data-property-pdf]") as HTMLElement | null;
      if (!element) {
        throw new Error("PDF layout failed to render");
      }

      const safeId = makeSafeFilePart(property.propertyId || property._id || "property");
      await exportElementAsPdf({
        element,
        fileName: `Brokwise_Property_${safeId}.pdf`,
      });

      toast.success("PDF downloaded", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF. Please try again.", { id: toastId });
    } finally {
      try {
        root?.unmount();
      } catch {
        // no-op
      }
      host?.remove();
      setIsExportingPdf(false);
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card h-full flex flex-col rounded-xl">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Link
          href={`/property/${property._id}`}
          className="block w-full h-full"
        >
          <Image
            src={
              (property.featuredMedia &&
                property.featuredMedia.includes(
                  "firebasestorage.googleapis.com"
                )) ||
                property.featuredMedia?.includes("picsum.photos")
                ? property.featuredMedia
                : "/images/placeholder.webp"
            }
            alt={property.description || "Property Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </Link>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <Badge
            className={`shadow-sm backdrop-blur-md border-none ${property.listingStatus === "ACTIVE"
              ? "bg-emerald-600/90 text-white"
              : "bg-background/80 text-foreground"
              }`}
          >
            {property.listingStatus.replace("_", " ")}
          </Badge>
        </div>

        {/* Share Button with Dropdown */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="h-4 w-4 text-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                <Link2 className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareNative} className="cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                Share Property
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="cursor-pointer"
              >
                {isExportingPdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isExportingPdf ? "Exporting…" : "Export as PDF"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price Tag Overlay (Luxurious Touch) */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-background/95 backdrop-blur shadow-md px-3 py-1.5 rounded-lg border border-accent/10">
            <p className="text-lg font-bold text-accent">
              {formatCurrency(property.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex-grow flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wider">
              {property.propertyCategory}
            </div>
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground leading-tight">
              {property.bhk ? `${property.bhk} BHK ` : ""}
              {property.propertyType.replace(/_/g, " ")}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-accent/70" />
              <span className="line-clamp-1">
                {formatAddress(property.address)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/40 my-1" />

        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-center gap-1.5">
            {property.propertyCategory === "RESIDENTIAL" && property.bhk ? (
              <>
                <BedDouble className="h-4 w-4" />
                <span className="text-xs font-medium">{property.bhk} Beds</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyCategory}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 border-l border-border/40">
            {property.washrooms ? (
              <>
                <Bath className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {property.washrooms} Baths
                </span>
              </>
            ) : (
              <>
                <Home className="h-4 w-4" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {property.propertyType.replace(/_/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 border-l border-border/40">
            <Move className="h-4 w-4" />
            <span className="text-xs font-medium">
              {property.size} {property.sizeUnit?.replace("SQ_", "")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Link href={`/property/${property._id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
