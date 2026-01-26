import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Loader2, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { Property } from "@/types/property";
import { BidBoost } from "./_components/BidBoost";
import { SubmitPropertyUseCredits } from "@/components/ui/submit-property-use-credits";
import { useGetRemainingQuota } from "@/hooks/useSubscription";

interface FilteredPropertiesProps {
  isPropertiesLoading: boolean;
  filteredProperties: Property[] | undefined;
  selectedPropertyId: string | null;
  setSelectedPropertyId: Dispatch<SetStateAction<string | null>>;
  setPreviewPropertyId: Dispatch<SetStateAction<string | null>>;
  setIsPreviewOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  isSubmittingExisting: boolean;
  handleExistingSubmit: () => void;
  enquiryId: string;
  onBidChange?: (bidCredits: number | null) => void;
  shouldUseCredits: boolean;
  setShouldUseCredits: Dispatch<SetStateAction<boolean>>;
}

export const FilteredProperties = ({
  isPropertiesLoading,
  filteredProperties,
  selectedPropertyId,
  setSelectedPropertyId,
  setPreviewPropertyId,
  setIsPreviewOpen,
  message,
  setMessage,
  isSubmittingExisting,
  handleExistingSubmit,
  enquiryId,
  onBidChange,
  shouldUseCredits,
  setShouldUseCredits,
}: FilteredPropertiesProps) => {
  const { remaining, isLoading: isQuotaLoading } = useGetRemainingQuota();
  return (
    <div className="flex flex-col md:flex-row h-full min-h-[500px]">
      {/* Property List - Left Side */}
      <div className="flex-1 border-r flex flex-col">
        <div className="p-4 border-b bg-muted/10">
          <h3 className="font-medium text-sm text-muted-foreground">
            Select a Property{" "}
            <Badge className="ml-1" variant={"outline"}>
              {filteredProperties?.length}
            </Badge>
          </h3>
        </div>
        {isPropertiesLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 h-[500px]">
            <div className="p-4 grid grid-cols-1 gap-3">
              {filteredProperties?.map((property) => {
                const isSelected = selectedPropertyId === property._id;
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
                              property.propertyTitle || "Untitled Property"
                            }
                          >
                            {property.propertyCategory +
                              " " +
                              property.propertyType +
                              " in " +
                              property.address?.city}
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
                        <Badge variant="outline" className="text-[10px] h-5">
                          {property.propertyType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {property.propertyCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-sm text-primary">
                          ₹
                          {property.totalPrice?.toLocaleString("en-IN") ||
                            "Price on Request"}
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
              Add a personalized note for the enquirer to stand out.
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

          {/* Boost proposal with bidding */}
          <BidBoost
            enquiryId={enquiryId}
            disabled={isSubmittingExisting}
            onBidChange={onBidChange}
          />
        </div>
        <div className="pt-6 border-t mt-4 flex flex-col gap-4">
          <div className="self-end">
            <SubmitPropertyUseCredits
              shouldUseCredits={shouldUseCredits}
              setShouldUseCredits={setShouldUseCredits}
            />
          </div>
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
            disabled={isSubmittingExisting || isQuotaLoading || (remaining?.submit_property_enquiry === 0 && !shouldUseCredits)}
          >
            {isSubmittingExisting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Proposal
          </Button>
        </div>
      </div>
    </div>
  );
};
