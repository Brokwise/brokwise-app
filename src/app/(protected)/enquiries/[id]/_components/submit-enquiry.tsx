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
import { useSubmitPropertyToEnquiry } from "@/hooks/useEnquiry";
import { cn } from "@/lib/utils";
import { Check, Home, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const SubmitEnquiry = ({ enquiry }: { enquiry: Enquiry }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { properties, isLoading, error } = useGetAllProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const {
    submitPropertyToEnquiry,
    isPending,
    error: submitError,
  } = useSubmitPropertyToEnquiry();

  const handleSubmit = async () => {
    if (!selectedPropertyId) return;

    await submitPropertyToEnquiry(
      {
        enquiryId: enquiry._id,
        propertyId: selectedPropertyId as string,
        privateMessage: message,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setMessage("");
          setSelectedPropertyId(null);
        },
      }
    );
  };

  // Filter properties compatible with enquiry (optional, but good UX)
  // For now, showing all, but user can filter visually.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Submit Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>
            Select one of your properties to propose for this enquiry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <h3 className="text-sm font-medium mb-2">Select Property</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties && properties.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4 border rounded-md p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {properties.map((property) => {
                    const isSelected = selectedPropertyId === property._id;
                    return (
                      <div
                        key={property._id}
                        onClick={() => setSelectedPropertyId(property._id)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "bg-card shadow-sm border-muted"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between pr-6">
                            <h4
                              className="font-semibold leading-tight line-clamp-1"
                              title={
                                property.propertyTitle || "Untitled Property"
                              }
                            >
                              {property.propertyTitle || "Untitled Property"}
                            </h4>
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
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {property.address?.city || "Unknown City"}
                            </span>
                          </div>
                          <div className="font-medium text-sm text-primary">
                            ₹
                            {property.totalPrice?.toLocaleString("en-IN") ||
                              "Price on Request"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-10 text-muted-foreground border rounded-md bg-muted/5">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No properties found.</p>
                <Button variant="link" className="mt-2">
                  Add New Property
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Private Message (Optional)
            </label>
            <Textarea
              placeholder="Add a note about why this property is a good fit..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedPropertyId || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
