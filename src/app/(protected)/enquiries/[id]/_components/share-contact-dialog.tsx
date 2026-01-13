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
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useShareContactDetails } from "@/hooks/useEnquiry";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShareContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId: string;
  submissionId: string;
  submitterName?: string; // Optional, to make it more personal
}

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
];

export const ShareContactDialog = ({
  isOpen,
  onClose,
  enquiryId,
  submissionId,
  submitterName,
}: ShareContactDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { shareContactDetails, isPending } = useShareContactDetails();

  const handleSubmit = () => {
    if (!date || !selectedTime) {
      toast.error("Please select both a date and a time slot");
      return;
    }

    const formattedDate = format(date, "EEE, MMM d, yyyy");
    const availability = `${formattedDate} at ${selectedTime}`;

    console.log("ShareContactDialog: handleSubmit called", {
      enquiryId,
      submissionId,
      availability,
    });

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
          setSelectedTime("");
          setDate(new Date());
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Contact Details</DialogTitle>
          <DialogDescription>
            Share your contact details with the broker
            {submitterName ? ` (${submitterName})` : ""} who submitted this
            property. Pick a time when you are available for a call.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label>Select Date</Label>
            <div className="border rounded-md p-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                className="rounded-md"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <Label>Select Time</Label>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={cn(
                      "w-full justify-center",
                      selectedTime === time &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !date || !selectedTime}
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
