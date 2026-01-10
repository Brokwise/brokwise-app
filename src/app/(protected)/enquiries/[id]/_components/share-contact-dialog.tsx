"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useShareContactDetails } from "@/hooks/useEnquiry";
import { toast } from "sonner";

interface ShareContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId: string;
  submissionId: string;
  submitterName?: string; // Optional, to make it more personal
}

export const ShareContactDialog = ({
  isOpen,
  onClose,
  enquiryId,
  submissionId,
  submitterName,
}: ShareContactDialogProps) => {
  const [availability, setAvailability] = useState("");
  const { shareContactDetails, isPending } = useShareContactDetails();

  const handleSubmit = () => {
    console.log("ShareContactDialog: handleSubmit called", {
      enquiryId,
      submissionId,
      availability,
    });

    if (!availability.trim()) {
      console.log("ShareContactDialog: Availability empty");
      toast.error("Please provide your availability for a call");
      return;
    }

    console.log("ShareContactDialog: Invoking mutation");
    shareContactDetails(
      {
        enquiryId,
        submissionId,
        availability,
      },
      {
        onSuccess: () => {
          console.log("ShareContactDialog: Mutation success");
          toast.success("Contact details shared successfully!");
          onClose();
          setAvailability("");
        },
        onError: (error) => {
          console.error("ShareContactDialog: Mutation error", error);
          toast.error(error.message || "Failed to share contact details");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Contact Details</DialogTitle>
          <DialogDescription>
            Share your contact details with the broker
            {submitterName ? ` (${submitterName})` : ""} who submitted this
            property. They will receive your phone number and email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="availability">
              When are you available for a call?
            </Label>
            <Textarea
              id="availability"
              placeholder="e.g., Weekdays after 6 PM, or this Saturday between 10 AM - 2 PM"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !availability.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share Details"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
