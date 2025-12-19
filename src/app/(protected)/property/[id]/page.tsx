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
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { toast } from "sonner";

const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportedOnLabel, setExportedOnLabel] = useState<string>("");
  const pdfRef = useRef<HTMLDivElement | null>(null);

  const handleExportPdf = useCallback(async () => {
    if (!property) return;
    if (!pdfRef.current) return;

    try {
      setIsExportingPdf(true);
      setExportedOnLabel(format(new Date(), "PPP p"));

      // Ensure latest layout is painted before capture.
      await new Promise((r) => setTimeout(r, 75));

      // Wait for images inside the PDF layout to load (best-effort, with timeout).
      const waitForImages = async (root: HTMLElement, timeoutMs = 2000) => {
        const imgs = Array.from(root.querySelectorAll("img"));
        const pending = imgs.filter((img) => !img.complete);
        if (!pending.length) return;

        await Promise.race([
          Promise.all(
            pending.map(
              (img) =>
                new Promise<void>((resolve) => {
                  const done = () => {
                    img.removeEventListener("load", done);
                    img.removeEventListener("error", done);
                    resolve();
                  };
                  img.addEventListener("load", done);
                  img.addEventListener("error", done);
                })
            )
          ),
          new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
        ]);
      };

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = pdfRef.current;
      await waitForImages(element, 2500);
      await new Promise((r) => setTimeout(r, 50));
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        imageTimeout: 2500,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          pdfWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        heightLeft -= pdfHeight;
      }

      const safeId = (property.propertyId || property._id || "property")
        .toString()
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`Brokwise_Property_${safeId}.pdf`);
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
  const pdfImageUrls = allImages.filter(
    (m) => !!m && !m.toLowerCase().endsWith(".mp4")
  );
  const pdfCoverImage = pdfImageUrls[0] || "/images/placeholder.webp";
  const pdfThumbImages = pdfImageUrls.slice(1, 7);

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
          <ContactSeller property={property} />
          {/* Status Card */}
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
        <div
          ref={pdfRef}
          className="relative p-10 bg-white rounded-2xl border shadow-sm overflow-hidden"
        >
          {/* Top accent */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-neutral-900 via-neutral-500 to-transparent"
          />

          {/* Watermark layer (behind content) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-around"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="select-none text-[96px] font-semibold tracking-widest uppercase"
                style={{
                  opacity: 0.06,
                  transform: "rotate(-28deg)",
                  color: "#000000",
                }}
              >
                Brokwise
              </div>
            ))}
          </div>

          {/* Content layer */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-6 border-b pb-4">
              <div>
                <div className="text-2xl font-bold">Brokwise</div>
                <div className="text-sm text-neutral-600">Property Details</div>
              </div>
              <div className="text-right text-sm text-neutral-700">
                <div>
                  <span className="font-semibold">Property ID:</span>{" "}
                  {property.propertyId || property._id}
                </div>
                <div>
                  <span className="font-semibold">Exported on:</span>{" "}
                  {exportedOnLabel}
                </div>
              </div>
            </div>

            {/* Photos */}
            {pdfImageUrls.length > 0 ? (
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Photos</div>
                  <div className="text-xs text-neutral-600">
                    {pdfImageUrls.length} image
                    {pdfImageUrls.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 auto-rows-[108px]">
                  {/* Hero */}
                  <div className="col-span-2 row-span-2 rounded-xl overflow-hidden border bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pdfCoverImage}
                      alt="Property cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.webp";
                      }}
                    />
                  </div>

                  {pdfThumbImages.slice(0, 4).map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="rounded-xl overflow-hidden border bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Property photo ${idx + 2}`}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        loading="eager"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.webp";
                        }}
                      />
                    </div>
                  ))}
                </div>

                {pdfThumbImages.length > 4 && (
                  <div className="mt-3 text-xs text-neutral-600">
                    + {pdfThumbImages.length - 4} more photo
                    {pdfThumbImages.length - 4 === 1 ? "" : "s"} not shown
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold mb-1">Photos</div>
                <div className="text-sm text-neutral-700">
                  No images available
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Overview</div>
                <div className="text-sm">
                  <div>
                    <span className="font-semibold">Category:</span>{" "}
                    {property.propertyCategory}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span>{" "}
                    {property.propertyType?.replace(/_/g, " ")}
                  </div>
                  <div>
                    <span className="font-semibold">Size:</span>{" "}
                    {property.size
                      ? `${property.size} ${property.sizeUnit || ""}`
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {property.listingStatus?.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Pricing</div>
                <div className="text-sm">
                  <div>
                    <span className="font-semibold">Total Price:</span>{" "}
                    {formatCurrency(property.totalPrice)}
                  </div>
                  <div>
                    <span className="font-semibold">Rate:</span>{" "}
                    {formatCurrency(property.rate)} /{" "}
                    {property.sizeUnit?.toLowerCase().replace("_", " ")}
                  </div>
                  <div>
                    <span className="font-semibold">Negotiable:</span>{" "}
                    {property.isPriceNegotiable ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="text-sm font-semibold mb-2">Address</div>
              <div className="text-sm text-neutral-800">
                {formatAddress(property.address)}
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="text-sm font-semibold mb-2">Description</div>
              <div className="text-sm whitespace-pre-wrap text-neutral-800">
                {property.description || "N/A"}
              </div>
            </div>

            {(property.amenities?.length || property.localities?.length) && (
              <div className="grid grid-cols-2 gap-4">
                {property.amenities?.length ? (
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-semibold mb-2">Amenities</div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {property.amenities.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-semibold mb-2">Amenities</div>
                    <div className="text-sm text-neutral-700">N/A</div>
                  </div>
                )}

                {property.localities?.length ? (
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-semibold mb-2">
                      Nearby Localities
                    </div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {property.localities.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-md border p-4">
                    <div className="text-sm font-semibold mb-2">
                      Nearby Localities
                    </div>
                    <div className="text-sm text-neutral-700">N/A</div>
                  </div>
                )}
              </div>
            )}

            {(property.floorPlans?.length ||
              property.jamabandiUrl ||
              property.khasraPlanUrl) && (
              <div className="rounded-md border p-4">
                <div className="text-sm font-semibold mb-2">Documents</div>
                <div className="text-sm space-y-1">
                  {property.floorPlans?.map((plan, idx) => (
                    <div key={idx}>
                      <span className="font-semibold">
                        Floor Plan {idx + 1}:
                      </span>{" "}
                      {plan}
                    </div>
                  ))}
                  {property.jamabandiUrl && (
                    <div>
                      <span className="font-semibold">Jamabandi:</span>{" "}
                      {property.jamabandiUrl}
                    </div>
                  )}
                  {property.khasraPlanUrl && (
                    <div>
                      <span className="font-semibold">Khasra Plan:</span>{" "}
                      {property.khasraPlanUrl}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-600 border-t pt-4">
              <div>Created: {format(new Date(property.createdAt), "PPP")}</div>
              <div>
                Last Updated: {format(new Date(property.updatedAt), "PPP")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PropertyPage;
