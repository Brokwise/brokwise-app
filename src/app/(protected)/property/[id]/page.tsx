"use client";

import React, { useCallback, useRef, useState } from "react";
import { useGetProperty } from "@/hooks/useProperty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldX,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Components
import { PropertyHeader } from "./_components/property-header";
import { PropertyActionsBar } from "./_components/property-actions-bar";
import { MediaCarousel } from "./_components/media-carousel";
import { PropertyFacts } from "./_components/property-facts";
import { PropertyDescription } from "./_components/property-description";
import { DocumentsList } from "./_components/documents-list";
import { PropertySidebar } from "./_components/property-sidebar";

import { PropertyPdfLayout } from "@/components/property-pdf/property-pdf-layout";
import { exportElementAsPdf, makeSafeFilePart } from "@/utils/pdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


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
  const pdfRef = useRef<HTMLDivElement | null>(null);

  // const offerSectionRef = useRef<HTMLDivElement>(null);
  // const calendarSectionRef = useRef<HTMLDivElement>(null);

  // const scrollToOffer = () => {
  //   offerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  // };

  // const scrollToCalendar = () => {
  //   // Placeholder if we add scheduling later, or just scroll to sidebar where contact buttons might form
  // };


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

  return (
    <main className="min-h-screen pb-10">
      {/* Sticky Header */}
      <PropertyHeader
        property={property}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onFlag={() => setIsFlagDialogOpen(true)}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Section: Actions Bar */}
        <PropertyActionsBar
          onExportPdf={handleExportPdf}
          isExportingPdf={isExportingPdf}
          onShare={() => {
            toast.success("Link copied to clipboard!");
            navigator.clipboard.writeText(window.location.href);
          }}
          onBookmark={() => toast.success("Property saved to bookmarks!")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mt-2">
          {/* Left Column (Main Content) - 70% width roughly (7/10 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Visuals */}
            <MediaCarousel images={allImages} property={property} />

            {/* Property Facts Grid */}
            <PropertyFacts property={property} />

            {/* Description */}
            <PropertyDescription description={property.description} />

            {/* Localities (if needed inline) */}
            {property.localities && property.localities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Nearby Localities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.localities.map((locality, index) => (
                    <div key={index} className="px-3 py-1 bg-muted/50 rounded-full text-sm flex items-center gap-1.5 border border-border/50">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {locality}
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Documents */}
            <DocumentsList property={property} />

          </div>

          {/* Right Column (Sticky Sidebar) - 30% width roughly (3/10 cols) */}
          <div className="lg:col-span-3">
            <div>
              <PropertySidebar property={property} />
            </div>
          </div>
        </div>
      </div>

      {/* Flag Dialog - Kept from original */}
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


      {/* Hidden PDF layout */}
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
