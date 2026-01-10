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
import { useSharePropertyContact } from "@/hooks/useProperty";
import { toast } from "sonner";

interface ShareContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  offerId: string;
}

export const ShareContactDialog = ({
  isOpen,
  onClose,
  propertyId,
  offerId,
}: ShareContactDialogProps) => {
  const [availability, setAvailability] = useState("");
  const { sharePropertyContact, isPending } = useSharePropertyContact();

  const handleSubmit = () => {
    if (!availability.trim()) {
      toast.error("Please provide your availability for a call");
      return;
    }

    sharePropertyContact(
      {
        propertyId,
        offerId,
        availability,
      },
      {
        onSuccess: () => {
          toast.success("Contact details shared successfully!");
          onClose();
          setAvailability("");
        },
        onError: (error) => {
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
            Share your contact details with the user who made the offer. They
            will receive your phone number and email.
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
