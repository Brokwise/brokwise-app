import React, { useState } from "react";
import { Enquiry } from "@/models/types/enquiry";
import {
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  Dialog,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetAllProperties } from "@/hooks/useProperty";
import { Textarea } from "@/components/ui/textarea";
import {
  useSubmitPropertyToEnquiry,
  useSubmitFreshProperty,
} from "@/hooks/useEnquiry";
import { cn } from "@/lib/utils";
import { Check, Loader2, MapPin, Plus, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResidentialWizard } from "@/app/(protected)/property/createProperty/residentialForm/wizard";
import { CommercialWizard } from "@/app/(protected)/property/createProperty/commercialForm/wizard";
import { PropertyPreviewModal } from "./PropertyPreviewModal";

type View = "select" | "create" | "message";

export const SubmitEnquiry = ({ enquiry }: { enquiry: Enquiry }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [message, setMessage] = useState("");
  const { properties, isLoading } = useGetAllProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // State for fresh property submission
  const [freshPropertyData, setFreshPropertyData] = useState<Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  > | null>(null);
  const [view, setView] = useState<View>("select"); // 'select' includes 'create' wizard view when tab is 'new'
  const [previewPropertyId, setPreviewPropertyId] = useState<string | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { submitPropertyToEnquiry, isPending: isSubmittingExisting } =
    useSubmitPropertyToEnquiry();

  const { submitFreshProperty, isPending: isSubmittingFresh } =
    useSubmitFreshProperty();

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
          setOpen(false);
          setMessage("");
          setSelectedPropertyId(null);
          toast.success("Property submitted successfully");
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
          setOpen(false);
          setMessage("");
          setFreshPropertyData(null);
          setView("select");
          setActiveTab("existing");
          toast.success("New property created and submitted successfully");
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
        // Note: IndustrialWizard needs to be updated to accept onSubmit and submitLabel to work correctly
        // For now, it will likely submit to DB directly if not updated.
        // Assuming I updated it or user accepts limitation for now.
        // I will stick to Residential/Commercial guaranteed working.
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
      // To be safe, let's only enable for updated wizards.
      // return <IndustrialWizard {...commonProps} />;
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
      // return <AgriculturalWizard {...commonProps} />;
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
      // return <ResortWizard {...commonProps} />;
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setView("select");
          setMessage("");
          setFreshPropertyData(null);
          setSelectedPropertyId(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Submit Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>
            Submit a property for this enquiry:{" "}
            <span className="font-semibold">{enquiry.enquiryCategory}</span> -{" "}
            <span className="font-semibold">{enquiry.enquiryType}</span>
          </DialogDescription>
        </DialogHeader>

        {view === "message" ? (
          <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Confirm Submission</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You are about to create a new property and submit it to this
                enquiry.
              </p>
              <div className="text-sm">
                <p>
                  <strong>Type:</strong> {freshPropertyData?.propertyType}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {freshPropertyData?.address?.city || "Unknown"}
                </p>
                <p>
                  <strong>Price:</strong> ₹
                  {freshPropertyData?.totalPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Proposal Message</label>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Add a personalized note for the enquirer.
              </p>
              <Textarea
                placeholder="Add a note about why this property is a good fit..."
                value={message}
                maxLength={1000}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {message.length}/1000
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-auto">
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
              >
                {isSubmittingFresh && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create & Submit
              </Button>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "existing" | "new")}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-6 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Select Existing</TabsTrigger>
                <TabsTrigger value="new">Create New</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="existing"
              className="flex-1 flex flex-col min-h-0 p-6 gap-4 m-0"
            >
              {filteredProperties && filteredProperties.length > 0 ? (
                <>
                  <div className="flex-1 min-h-0 flex flex-col">
                    <h3 className="text-sm font-medium mb-2">
                      Select Property
                    </h3>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ScrollArea className="flex-1 border rounded-md p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                  <div className="">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium">
                        Proposal Message
                      </label>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Optional
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add a personalized note for the enquirer.
                    </p>
                    <Textarea
                      placeholder="Add a note about why this property is a good fit..."
                      value={message}
                      maxLength={1000}
                      onChange={(e) => setMessage(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {message.length}/1000
                    </p>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleExistingSubmit}
                      disabled={!selectedPropertyId || isSubmittingExisting}
                    >
                      {isSubmittingExisting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Proposal
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Empty>
                    <EmptyTitle>No matching properties</EmptyTitle>
                    <EmptyDescription>
                      You don&apos;t have any active properties that match this
                      enquiry.
                      <br />
                      Try creating a new one!
                    </EmptyDescription>
                  </Empty>
                  <Button
                    variant="default"
                    className="mt-4"
                    onClick={() => setActiveTab("new")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Property
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="new"
              className="flex-1 overflow-y-auto p-6 m-0 min-h-0"
            >
              {renderWizard()}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
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
    </Dialog>
  );
};
