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
  MoreVertical,
} from "lucide-react";

import { format } from "date-fns";
import { MapBox } from "./_components/mapBox";
import { KeyFeatures } from "./_components/keyFeatures";
import { AdditionalDetails } from "./_components/additionalDetails";

import { MakeOffer } from "./_components/makeOffer";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart } from "@/utils/pdf";
import { useApp } from "@/context/AppContext";
import { PropertyOffers } from "./_components/propertyOffers";
import Image from "next/image";

const PropertyPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { property, isLoading, error } = useGetProperty(id);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportedOnLabel, setExportedOnLabel] = useState<string>("");
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagNotes, setFlagNotes] = useState("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  const handleSubmitFlag = useCallback(async () => {
    if (!flagReason || !property) return;
    setIsSubmittingFlag(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success("Thanks for reporting. We'll review this property soon.");
      setIsFlagDialogOpen(false);
      setFlagReason("");
      setFlagNotes("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingFlag(false);
    }
  }, [flagReason, property]);

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
  const imageGallery = allImages.filter((media) => !media.endsWith(".mp4"));
  const handleOpenGallery = (imageUrl: string) => {
    if (imageGallery.length === 0) return;
    const imageIndex = imageGallery.indexOf(imageUrl);
    setActiveImageIndex(imageIndex >= 0 ? imageIndex : 0);
    setIsGalleryOpen(true);
  };
  return (
    <main className="">
      <div className="flex flex-col gap-4 mb-2 sm:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-semibold">
                  Property Details
                </h1>
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
                  {property.listingStatus
                    ? property.listingStatus.replace("_", " ")
                    : "Status Unknown"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground justify-between">
                <span className="bg-muted px-2 py-1 rounded-md">
                  ID: {property.propertyId || "N/A"}
                </span>
                {property.deletingStatus && (
                  <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                    Pending removal
                  </Badge>
                )}
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                      >
                        {isExportingPdf ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Download property
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsFlagDialogOpen(true)}
                      >
                        <ShieldX className="mr-2 h-4 w-4" />
                        Flag as inappropriate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {property.deletingStatus && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This property is scheduled to be removed from the platform soon.
          </div>
        )}

        <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag this property</DialogTitle>
              <DialogDescription>
                Tell us what seems wrong so we can review this listing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="flag-reason">Reason</Label>
                <Select value={flagReason} onValueChange={setFlagReason}>
                  <SelectTrigger id="flag-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MISLEADING_INFORMATION">
                      Misleading information
                    </SelectItem>
                    <SelectItem value="INCORRECT_PRICING">
                      Incorrect pricing
                    </SelectItem>
                    <SelectItem value="DUPLICATE_LISTING">
                      Duplicate listing
                    </SelectItem>
                    <SelectItem value="SCAM_OR_FRAUD">Scam or fraud</SelectItem>
                    <SelectItem value="SPAM">Spam or promotional</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag-notes">Additional details</Label>
                <Textarea
                  id="flag-notes"
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Share any details that help us investigate."
                  className="min-h-[96px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsFlagDialogOpen(false)}
                disabled={isSubmittingFlag}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFlag}
                disabled={!flagReason || isSubmittingFlag}
              >
                {isSubmittingFlag ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                          <button
                            type="button"
                            onClick={() => handleOpenGallery(image)}
                            className="w-full h-full cursor-zoom-in"
                          >
                            <Image
                              width={500}
                              height={500}
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-fill"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/placeholder.webp";
                              }}
                            />
                          </button>
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
          {imageGallery.length > 0 && (
            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
              <DialogContent className="w-[95vw] max-w-6xl h-[90vh] p-0">
                <div className="flex h-full flex-col">
                  <div className="relative h-[85%] w-full bg-black">
                    {imageGallery[activeImageIndex] ? (
                      <Image
                        src={imageGallery[activeImageIndex]}
                        alt={`Property ${activeImageIndex + 1}`}
                        fill
                        sizes="95vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        No image selected
                      </div>
                    )}
                    {imageGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={() =>
                            setActiveImageIndex(
                              (activeImageIndex - 1 + imageGallery.length) %
                              imageGallery.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() =>
                            setActiveImageIndex(
                              (activeImageIndex + 1) % imageGallery.length
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                        >
                          <ArrowLeft className="h-5 w-5 rotate-180" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="h-[15%] w-full border-t bg-muted/30">
                    <div className="flex h-full items-center gap-2 overflow-x-auto px-4">
                      {imageGallery.map((image, index) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md"
                        >
                          <Image
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="120px"
                            className={`object-cover ${index === activeImageIndex
                              ? "ring-2 ring-primary"
                              : "ring-1 ring-muted-foreground/30"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

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

        <div className="lg:col-span-1 space-y-6">
          {property.listedBy?._id === brokerData?._id &&
            property.listingStatus === "ENQUIRY_ONLY" && (
              <div>
                <h1>
                  This property was submitted{" "}
                  <Button
                    onClick={() => {
                      router.push(
                        "/enquiries/" + property.submittedForEnquiryId?._id
                      );
                    }}
                  >
                    {property.submittedForEnquiryId?.enquiryId}
                  </Button>
                </h1>
              </div>
            )}
          {property.listedBy?._id === brokerData?._id &&
            property.listingStatus !== "ENQUIRY_ONLY" && (
              <PropertyOffers property={property} />
            )}

          {(!property.deletingStatus &&
            property.listingStatus !== "ENQUIRY_ONLY") &&
            <MakeOffer property={property} />
          }

          <Card className="hidden md:block">
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
