"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetEnquiryById } from "@/hooks/useEnquiry";
import { useGetAllProperties } from "@/hooks/useProperty";
import {
  useSubmitPropertyToEnquiry,
  useSubmitFreshProperty,
} from "@/hooks/useEnquiry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Plus,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ResidentialWizard } from "@/app/(protected)/property/createProperty/residentialForm/wizard";
import { CommercialWizard } from "@/app/(protected)/property/createProperty/commercialForm/wizard";
import { PropertyPreviewModal } from "../_components/PropertyPreviewModal";

type View = "select" | "create" | "message";

export default function SubmitEnquiryPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    enquiry,
    isPending: isEnquiryLoading,
    error: enquiryError,
  } = useGetEnquiryById(id as string);

  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [message, setMessage] = useState("");
  const { properties, isLoading: isPropertiesLoading } = useGetAllProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // State for fresh property submission
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

  const { submitPropertyToEnquiry, isPending: isSubmittingExisting } =
    useSubmitPropertyToEnquiry();

  const { submitFreshProperty, isPending: isSubmittingFresh } =
    useSubmitFreshProperty();

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
    if (!selectedPropertyId) return;

    const trimmedMessage = message.trim();

    submitPropertyToEnquiry(
      {
        enquiryId: enquiry._id,
        propertyId: selectedPropertyId as string,
        privateMessage: trimmedMessage || undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedPropertyId(null);
          toast.success("Property submitted successfully");
          router.push(`/enquiries/${id}`);
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
    if (!freshPropertyData) return;

    const trimmedMessage = message.trim();

    submitFreshProperty(
      {
        enquiryId: enquiry._id,
        payload: {
          ...freshPropertyData,
          privateMessage: trimmedMessage || undefined,
        },
      },
      {
        onSuccess: () => {
          setMessage("");
          setFreshPropertyData(null);
          toast.success("New property created and submitted successfully");
          router.push(`/enquiries/${id}`);
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

  const filteredProperties = properties?.filter(
    (property) =>
      property.listingStatus.toLowerCase() === "active" &&
      property.propertyCategory.toLowerCase() ===
        enquiry.enquiryCategory.toLowerCase() &&
      property.propertyType.toLowerCase() === enquiry.enquiryType.toLowerCase()
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
    };

    switch (enquiry.enquiryCategory) {
      case "RESIDENTIAL":
        return <ResidentialWizard {...commonProps} />;
      case "COMMERCIAL":
        return <CommercialWizard {...commonProps} />;
      case "INDUSTRIAL":
        return (
          <div className="p-4 text-center">
            <p className="mb-4">
              Creating fresh Industrial properties during submission is not
              fully supported yet.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("existing")}>
              Go back
            </Button>
          </div>
        );
      case "AGRICULTURAL":
        return (
          <div className="p-4 text-center">
            <p className="mb-4">
              Creating fresh Agricultural properties during submission is not
              fully supported yet.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("existing")}>
              Go back
            </Button>
          </div>
        );
      case "RESORT":
        return (
          <div className="p-4 text-center">
            <p className="mb-4">
              Creating fresh Resort properties during submission is not fully
              supported yet.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("existing")}>
              Go back
            </Button>
          </div>
        );
      case "FARM_HOUSE":
        return (
          <div className="p-4 text-center">
            <p className="mb-4">
              Creating fresh Farm House properties during submission is not
              fully supported yet.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("existing")}>
              Go back
            </Button>
          </div>
        );
      default:
        return <div>Unsupported category</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
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
          {view === "message" ? "Back to Selection" : "Back to Enquiry"}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Submit Proposal</h1>
          <p className="text-sm text-muted-foreground">
            For{" "}
            <span className="font-medium text-foreground">
              {enquiry.enquiryType}
            </span>{" "}
            in{" "}
            <span className="font-medium text-foreground">{enquiry.city}</span>
          </p>
        </div>
      </div>

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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setView("select")}
                disabled={isSubmittingFresh}
              >
                Back
              </Button>
              <Button
                onClick={handleFreshPropertySubmit}
                disabled={isSubmittingFresh}
                size="lg"
              >
                {isSubmittingFresh && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create & Submit Proposal
              </Button>
            </div>
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
                  <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                    {/* Property List - Left Side */}
                    <div className="flex-1 border-r flex flex-col">
                      <div className="p-4 border-b bg-muted/10">
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Select a Property
                        </h3>
                      </div>
                      {isPropertiesLoading ? (
                        <div className="flex items-center justify-center flex-1">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <ScrollArea className="flex-1 h-[500px]">
                          <div className="p-4 grid grid-cols-1 gap-3">
                            {filteredProperties.map((property) => {
                              const isSelected =
                                selectedPropertyId === property._id;
                              return (
                                <div
                                  key={property._id}
                                  onClick={() =>
                                    setSelectedPropertyId((prev) =>
                                      prev === property._id ? null : property._id
                                    )
                                  }
                                  className={cn(
                                    "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 text-left",
                                    isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                      : "bg-card shadow-sm border-muted"
                                  )}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h4
                                          className="font-semibold leading-tight line-clamp-1"
                                          title={
                                            property.propertyTitle ||
                                            "Untitled Property"
                                          }
                                        >
                                          {property.propertyTitle ||
                                            "Untitled Property"}
                                        </h4>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                          <MapPin className="h-3 w-3" />
                                          <span className="truncate">
                                            {property.address?.city || "Unknown City"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="secondary"
                                          size="icon"
                                          className="h-8 w-8 rounded-full shadow-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewPropertyId(property._id);
                                            setIsPreviewOpen(true);
                                          }}
                                          title="Quick preview"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                        {isSelected && (
                                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                                            <Check className="h-3 w-3" />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5"
                                      >
                                        {property.propertyType}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5"
                                      >
                                        {property.propertyCategory}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="font-medium text-sm text-primary">
                                        ₹
                                        {property.totalPrice?.toLocaleString(
                                          "en-IN"
                                        ) || "Price on Request"}
                                      </div>
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full shadow-sm md:hidden"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewPropertyId(property._id);
                                          setIsPreviewOpen(true);
                                        }}
                                        title="Quick preview"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Message Area - Right Side */}
                    <div className="w-full md:w-[400px] flex flex-col p-6 bg-muted/10">
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">Proposal Message</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Optional
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">
                            Add a personalized note for the enquirer to stand
                            out.
                          </p>
                          <Textarea
                            placeholder="Describe why this property is a perfect match..."
                            value={message}
                            maxLength={1000}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none min-h-[200px] bg-background"
                          />
                          <p className="text-xs text-muted-foreground text-right mt-1">
                            {message.length}/1000
                          </p>
                        </div>
                      </div>
                      <div className="pt-6 border-t mt-4">
                        <Button
                          type="button"
                          className={cn(
                            "w-full",
                            !selectedPropertyId && !isSubmittingExisting
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          )}
                          size="lg"
                          onClick={handleExistingSubmit}
                          disabled={isSubmittingExisting}
                        >
                          {isSubmittingExisting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit Proposal
                        </Button>
                      </div>
                    </div>
                  </div>
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
