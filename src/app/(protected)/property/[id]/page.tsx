"use client";

import React, { useCallback, useRef, useState } from "react";
import { useGetProperty } from "@/hooks/useProperty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Building2,
  Ruler,
  Home,
  ShieldX,
  Download,
} from "lucide-react";

import { format } from "date-fns";
import { MapBox } from "./_components/mapBox";
import { KeyFeatures } from "./_components/keyFeatures";
import { AdditionalDetails } from "./_components/additionalDetails";
import { ContactSeller } from "./_components/contactSeller";
import { MakeOffer } from "./_components/makeOffer";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart } from "@/utils/pdf";
import { useApp } from "@/context/AppContext";

const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportedOnLabel, setExportedOnLabel] = useState<string>("");
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const { brokerData } = useApp();
  const handleExportPdf = useCallback(async () => {
    if (!property) return;
    if (!pdfRef.current) return;

    try {
      setIsExportingPdf(true);
      setExportedOnLabel(format(new Date(), "PPP p"));

      // Ensure latest layout is painted before capture.
      await new Promise((r) => setTimeout(r, 75));

      const safeId = makeSafeFilePart(
        property.propertyId || property._id || "property"
      );
      await exportElementAsPdf({
        element: pdfRef.current,
        fileName: `Brokwise_Property_${safeId}.pdf`,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  }, [property]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    // Check if it's a 403 Forbidden error
    const is403 = (error as AxiosError)?.response?.status === 403;

    if (is403) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldX className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You don&apos;t have permission to view this property. This
                property may be private or you may not be associated with it.
              </p>
              <Button className="w-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error?.message || "Property not found"}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages = [
    ...(property.featuredMedia ? [property.featuredMedia] : []),
    ...property.images,
  ];
  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Property Details
              <span className="text-muted-foreground font-normal text-sm bg-muted px-2 py-1 rounded-md">
                ID: {property.propertyId || "N/A"}
              </span>
            </h1>
          </div>
        </div>

        <Button
          onClick={handleExportPdf}
          disabled={isExportingPdf}
          className="w-full sm:w-auto"
        >
          {isExportingPdf ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export as PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="rounded-xl overflow-hidden bg-muted aspect-video relative border">
            {allImages.length > 0 ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full">
                  {allImages.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {image.endsWith(".mp4") ? (
                          <video
                            src={image}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/images/placeholder.webp";
                            }}
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {allImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No images available
              </div>
            )}
          </div>

          {/* Overview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-baseline justify-between border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(property.totalPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Rate</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(property.rate)} /{" "}
                    {property.sizeUnit?.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm">
                      {property.propertyCategory}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <Home className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm">
                      {property.propertyType.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Size</p>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                    <Ruler className="h-5 w-5 mb-2 text-primary" />
                    <span className="font-semibold text-sm">
                      {property.size} {property.sizeUnit?.replace("SQ_", "")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </CardContent>
          </Card>

          <KeyFeatures property={property} />
          <AdditionalDetails property={property} />

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Localities */}
          {property.localities && property.localities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Localities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.localities.map((locality, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {locality}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(property.floorPlans?.length ||
            property.jamabandiUrl ||
            property.khasraPlanUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.floorPlans?.map((plan, index) => (
                  <a
                    key={index}
                    href={plan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Floor Plan {index + 1}
                  </a>
                ))}
                {property.jamabandiUrl && (
                  <a
                    href={property.jamabandiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Jamabandi Document
                  </a>
                )}
                {property.khasraPlanUrl && (
                  <a
                    href={property.khasraPlanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Khasra Plan
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Map */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatAddress(property.address)}
              </p>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              <MapBox property={property} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {property.listedBy._id !== brokerData?._id && (
            <ContactSeller property={property} />
          )}

          <MakeOffer property={property} />

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Status
                </span>
                <Badge
                  variant={
                    property.listingStatus === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    property.listingStatus === "ACTIVE"
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  {property.listingStatus.replace("_", " ")}
                </Badge>
              </div>

              <Separator />
              <div className="text-xs text-muted-foreground">
                Created: {format(new Date(property.createdAt), "PPP")}
              </div>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="font-semibold">
                  {format(new Date(property.updatedAt), "PPP")}
                </p>
              </div>
              {property.verifiedBy && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Verified By
                    </p>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {property.verifiedBy}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden PDF layout (captured via html2canvas) */}
      <div className="fixed left-[-10000px] top-0 w-[794px] bg-white text-black">
        <PropertyPdfLayout
          ref={pdfRef}
          property={property}
          exportedOnLabel={exportedOnLabel}
        />
      </div>
    </main>
  );
};

export default PropertyPage;
