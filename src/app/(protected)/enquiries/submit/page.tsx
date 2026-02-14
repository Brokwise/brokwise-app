"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetEnquiryById } from "@/hooks/useEnquiry";
import { useGetMyListings } from "@/hooks/useProperty";
import {
  useSubmitPropertyToEnquiry,
  useSubmitFreshProperty,
} from "@/hooks/useEnquiry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { ArrowLeft, Loader2, Plus, LayoutGrid, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ResidentialWizard } from "@/app/(protected)/property/createProperty/residentialForm/wizard";
import { CommercialWizard } from "@/app/(protected)/property/createProperty/commercialForm/wizard";
import { IndustrialWizard } from "@/app/(protected)/property/createProperty/industrialForm/wizard";
import { AgriculturalWizard } from "@/app/(protected)/property/createProperty/agriculturalForm/wizard";
import { ResortWizard } from "@/app/(protected)/property/createProperty/resortForm/wizard";
import { FarmHouseWizard } from "@/app/(protected)/property/createProperty/farmhouseForm/wizard";
import { PropertyPreviewModal } from "../[id]/_components/PropertyPreviewModal";
import { formatEnquiryLocation } from "@/utils/helper";
import { FilteredProperties } from "../[id]/submit/filteredProperties";
import { Property } from "@/types/property";
import { DisclaimerAcknowledge } from "@/components/ui/disclaimer-acknowledge";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";


type View = "select" | "create" | "message";

function SubmitEnquiryPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();
  const {
    enquiry,
    isPending: isEnquiryLoading,
    error: enquiryError,
  } = useGetEnquiryById(id);

  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [message, setMessage] = useState("");
  const { myListings, isLoading: isPropertiesLoading } = useGetMyListings();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  const [freshPropertyData, setFreshPropertyData] = useState<Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  > | null>(null);
  const [view, setView] = useState<View>("select");
  const [previewPropertyId, setPreviewPropertyId] = useState<string | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [bidCredits, setBidCredits] = useState<number | null>(null);
  const [shouldUseCredits, setShouldUseCredits] = useState(false);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);
  const [isExistingProposalDisclaimerAccepted, setIsExistingProposalDisclaimerAccepted] =
    useState(false);
  const [isFreshProposalDisclaimerAccepted, setIsFreshProposalDisclaimerAccepted] =
    useState(false);

  const hasMultipleLocations =
    (enquiry?.preferredLocations?.length ?? 0) > 1;

  const { submitPropertyToEnquiry, isPending: isSubmittingExisting } =
    useSubmitPropertyToEnquiry();

  const { submitFreshProperty, isPending: isSubmittingFresh } =
    useSubmitFreshProperty();

  if (!id) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] text-destructive gap-4">
        <p>No enquiry ID provided.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (isEnquiryLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (enquiryError || !enquiry) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] text-destructive gap-4">
        <p>Error loading enquiry details or enquiry not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  const handleExistingSubmit = async () => {
    if (!selectedPropertyId || !isExistingProposalDisclaimerAccepted) return;

    const trimmedMessage = message.trim();

    submitPropertyToEnquiry(
      {
        enquiryId: enquiry._id,
        propertyId: selectedPropertyId as string,
        privateMessage: trimmedMessage || undefined,
        bidCredits: bidCredits ?? undefined,
        shouldUseCredits,
        enquiryDisclaimerAccepted: isExistingProposalDisclaimerAccepted,
        preferredLocationIndex: hasMultipleLocations ? selectedLocationIndex : undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedPropertyId(null);
          setBidCredits(null);
          setShouldUseCredits(false);
          setIsExistingProposalDisclaimerAccepted(false);
          toast.success("Property submitted successfully");
          router.push(`/enquiries/detail?id=${id}`);
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<{ message: string }>;
          toast.error(
            axiosError.response?.data?.message || "Failed to submit property"
          );
        },
      }
    );
  };

  const handleFreshPropertySubmit = async () => {
    if (!freshPropertyData || !isFreshProposalDisclaimerAccepted) return;

    const trimmedMessage = message.trim();

    submitFreshProperty(
      {
        enquiryId: enquiry._id,
        payload: {
          ...freshPropertyData,
          privateMessage: trimmedMessage || undefined,
          enquiryDisclaimerAccepted: isFreshProposalDisclaimerAccepted,
          preferredLocationIndex: hasMultipleLocations ? selectedLocationIndex : undefined,
        },
        bidCredits: bidCredits ?? undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setFreshPropertyData(null);
          setBidCredits(null);
          setIsFreshProposalDisclaimerAccepted(false);
          toast.success("New property created and submitted successfully");
          router.push(`/enquiries/detail?id=${id}`);
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<{ message: string }>;
          toast.error(
            axiosError.response?.data?.message ||
            "Failed to create and submit property"
          );
        },
      }
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWizardSubmit = (data: Record<string, any>) => {
    setFreshPropertyData(data);
    setView("message");
  };
  console.log(myListings);

  const filteredProperties = myListings?.filter(
    (property) =>
      property.listingStatus.toLowerCase() === "active" &&
      property.propertyCategory.toLowerCase() ===
      enquiry.enquiryCategory.toLowerCase() &&
      property.propertyType.toLowerCase() ===
      enquiry.enquiryType.toLowerCase() &&
      !property.deletingStatus
  );

  const renderWizard = () => {
    const commonProps = {
      onBack: () => setActiveTab("existing"),
      initialData: {
        propertyCategory: enquiry.enquiryCategory,
        propertyType: enquiry.enquiryType,
      } as Record<string, string>,
      onSubmit: handleWizardSubmit,
      submitLabel: "Proceed to Message",
      enquiry: enquiry,
    };

    switch (enquiry.enquiryCategory) {
      case "RESIDENTIAL":
        return <ResidentialWizard {...commonProps} enquiry={enquiry} />;
      case "COMMERCIAL":
        return <CommercialWizard {...commonProps} enquiry={enquiry} />;
      case "INDUSTRIAL":
        return <IndustrialWizard {...commonProps} enquiry={enquiry} />;
      case "AGRICULTURAL":
        return <AgriculturalWizard {...commonProps} enquiry={enquiry} />;
      case "RESORT":
        return <ResortWizard {...commonProps} enquiry={enquiry} />;
      case "FARM_HOUSE":
        return <FarmHouseWizard {...commonProps} enquiry={enquiry} />;
      default:
        return <div>Unsupported category</div>;
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-start gap-4 flex-col md:flex-row justify-start">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (view === "message") {
              setView("select");
            } else {
              router.back();
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {view === "message" ? "Back to Selection" : "Back"}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Submit Proposal</h1>
          <p className="text-sm text-muted-foreground">
            For{" "}
            <span className="font-medium text-foreground">
              {enquiry.enquiryType}
            </span>{" "}
            in{" "}
            <span className="font-medium text-foreground">
              {formatEnquiryLocation(enquiry) || "—"}
            </span>
          </p>
        </div>
      </div>

      {/* Location Selector - shown when enquiry has multiple preferred locations */}
      {hasMultipleLocations && enquiry.preferredLocations && (
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">
                  Which location is this property for?
                </Label>
              </div>
              <RadioGroup
                value={String(selectedLocationIndex)}
                onValueChange={(v) => setSelectedLocationIndex(Number(v))}
                className="space-y-2"
              >
                {enquiry.preferredLocations.map((loc, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={String(i)} id={`location-${i}`} />
                    <Label
                      htmlFor={`location-${i}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{loc.address}</span>
                      {i === 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex flex-col min-h-[600px]">
        {view === "message" ? (
          <CardContent className="p-6 flex flex-col gap-6 flex-1">
            <div className="bg-muted/30 p-6 rounded-xl border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" /> Confirm Submission Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Property Type
                  </p>
                  <p className="font-medium mt-1">
                    {freshPropertyData?.propertyType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Location
                  </p>
                  <p className="font-medium mt-1">
                    {freshPropertyData?.address?.city || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Price
                  </p>
                  <p className="font-medium mt-1 text-primary">
                    ₹{freshPropertyData?.totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm">Proposal Message</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Add a personalized note for the enquirer to stand out.
              </p>
              <Textarea
                placeholder="Add a note about why this property is a good fit..."
                value={message}
                maxLength={1000}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none flex-1 min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/1000
              </p>
            </div>

            {/* Boost proposal with bidding */}


            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setView("select");
                  setIsFreshProposalDisclaimerAccepted(false);
                }}
                disabled={isSubmittingFresh}
              >
                Back
              </Button>
              <Button
                onClick={handleFreshPropertySubmit}
                disabled={isSubmittingFresh || !isFreshProposalDisclaimerAccepted}
                size="lg"
              >
                {isSubmittingFresh && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create & Submit Proposal
              </Button>
            </div>
            <DisclaimerAcknowledge
              text={DISCLAIMER_TEXT.enquiryProposal}
              checked={isFreshProposalDisclaimerAccepted}
              onCheckedChange={setIsFreshProposalDisclaimerAccepted}
              checkboxLabel={DISCLAIMER_TEXT.acknowledgeLabel}
              showRequiredMessage
            />
          </CardContent>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "existing" | "new")}
            className="flex-1 flex flex-col"
          >
            <CardHeader className="border-b px-6 py-4">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-transparent">
                <TabsTrigger value="existing">Select Existing</TabsTrigger>
                <TabsTrigger value="new">Create New</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="existing" className="flex-1 p-0 m-0">
              <div className="flex flex-col h-full">
                {filteredProperties && filteredProperties.length > 0 ? (
                  <FilteredProperties
                    isPropertiesLoading={isPropertiesLoading}
                    filteredProperties={filteredProperties as Property[]}
                    selectedPropertyId={selectedPropertyId}
                    setSelectedPropertyId={setSelectedPropertyId}
                    setPreviewPropertyId={setPreviewPropertyId}
                    setIsPreviewOpen={setIsPreviewOpen}
                    message={message}
                    setMessage={setMessage}
                    isSubmittingExisting={isSubmittingExisting}
                    handleExistingSubmit={handleExistingSubmit}
                    enquiryId={enquiry._id}
                    onBidChange={setBidCredits}
                    shouldUseCredits={shouldUseCredits}
                    setShouldUseCredits={setShouldUseCredits}
                    enquiryDisclaimerAccepted={isExistingProposalDisclaimerAccepted}
                    setEnquiryDisclaimerAccepted={setIsExistingProposalDisclaimerAccepted}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                    <Empty>
                      <EmptyTitle>No matching properties found</EmptyTitle>
                      <EmptyDescription>
                        You don&apos;t have any active properties that match
                        this enquiry.
                        <br />
                        Try creating a new one!
                      </EmptyDescription>
                    </Empty>
                    <Button
                      variant="default"
                      className="mt-6"
                      onClick={() => setActiveTab("new")}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create New Property
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="new" className="flex-1 p-6 m-0 min-h-0">
              {renderWizard()}
            </TabsContent>
          </Tabs>
        )}

      </Card>
      <PropertyPreviewModal
        propertyId={previewPropertyId}
        open={isPreviewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewPropertyId(null);
          }
          setIsPreviewOpen(open);
        }}
      />
    </div>
  );
}

export default function SubmitEnquiryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SubmitEnquiryPageContent />
    </Suspense>
  );
}
