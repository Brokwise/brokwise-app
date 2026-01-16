"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Property } from "@/types/property";
import { useOfferPrice, useSubmitFinalOffer } from "@/hooks/useProperty";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/helper";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Gavel,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MakeOfferProps {
  property: Property;
}

export const MakeOffer = ({ property }: MakeOfferProps) => {
  const { brokerData } = useApp();
  const { offerPrice, isPending: isSubmitting } = useOfferPrice();
  const { submitFinalOffer, isPending: isSubmittingFinal } =
    useSubmitFinalOffer();

  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState<string>("");
  const [isFinalOfferMode, setIsFinalOfferMode] = useState(false);

  if (!brokerData) return null; // Only brokers can make offers

  // Check if it's the broker's own property listing
  const isOwnListing =
    typeof property.listedBy === "string"
      ? property.listedBy === brokerData._id
      : property.listedBy?._id === brokerData._id;

  if (isOwnListing) return null;

  // Find existing offer from this broker
  const myOffer = property.offers?.find((offer) => {
    const offerById =
      typeof offer.offerBy === "string"
        ? offer.offerBy
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (offer.offerBy as any)._id;
    return offerById === brokerData._id;
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setRate("");
      setIsFinalOfferMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const offerRate = parseFloat(rate);

    if (isNaN(offerRate) || offerRate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    if (offerRate > property.rate) {
      toast.error("Offer rate cannot be higher than the asking rate");
      return;
    }

    try {
      if (isFinalOfferMode && myOffer) {
        await submitFinalOffer({
          propertyId: property._id,
          offerId: myOffer._id!,
          rate: offerRate,
        });
      } else {
        await offerPrice({
          propertyId: property._id,
          rate: offerRate,
        });
      }
      setOpen(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "final_pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "accepted":
      case "final_accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "rejected":
      case "final_rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderOfferContent = () => {
    if (!myOffer) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t made an offer on this property yet. The asking rate
            is{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(property.rate)}
            </span>
            .
          </p>
          <Button onClick={() => setOpen(true)} className="w-full">
            <Gavel className="mr-2 h-4 w-4" />
            Make an Offer
          </Button>
        </div>
      );
    }

    const { status, rate: offerRate, rejectionReason } = myOffer;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Your Offer Status</span>
          {getStatusBadge(status)}
        </div>

        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Offered Rate:</span>
            <span className="font-semibold">{formatCurrency(offerRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Asking Rate:</span>
            <span>{formatCurrency(property.rate)}</span>
          </div>
        </div>

        {status === "pending" && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Review Pending</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your offer is currently under review by the admin.
            </AlertDescription>
          </Alert>
        )}

        {status === "accepted" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Offer Accepted!</AlertTitle>
            <AlertDescription className="text-green-700">
              Congratulations! Your offer has been accepted. We will contact you
              shortly.
            </AlertDescription>
          </Alert>
        )}

        {status === "rejected" && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Offer Rejected</AlertTitle>
              <AlertDescription>
                Reason: {rejectionReason || "No reason provided."}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                setIsFinalOfferMode(true);
                setOpen(true);
              }}
              className="w-full"
              variant="outline"
            >
              Submit Final Offer (Last Chance)
            </Button>
          </div>
        )}

        {status === "final_pending" && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              Final Review Pending
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your final offer is under review. This is your last attempt.
            </AlertDescription>
          </Alert>
        )}

        {status === "final_accepted" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              Final Offer Accepted!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Congratulations! Your final offer has been accepted.
            </AlertDescription>
          </Alert>
        )}

        {status === "final_rejected" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Final Offer Rejected</AlertTitle>
            <AlertDescription>
              Reason: {rejectionReason || "No reason provided."}
              <div className="mt-2 font-semibold">
                You cannot submit more offers for this property.
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Make an Offer</CardTitle>
        </CardHeader>
        <CardContent>{renderOfferContent()}</CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFinalOfferMode ? "Submit Final Offer" : "Submit Offer"}
            </DialogTitle>
            <DialogDescription>
              {isFinalOfferMode
                ? "This is your last chance to make an offer on this property. If rejected, you won't be able to submit another offer."
                : "Submit your best offer for this property. If rejected, you will have one chance to submit a final offer."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rate">
                Offer Rate (per{" "}
                {property.sizeUnit?.toLowerCase().replace("_", " ")})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="rate"
                  type="number"
                  placeholder={`Max: ${property.rate}`}
                  className="pl-7"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  max={property.rate}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Asking Rate: {formatCurrency(property.rate)}
              </p>
            </div>

            {rate && parseFloat(rate) > property.rate && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Offer cannot be higher than asking rate.
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isSubmittingFinal ||
                  !rate ||
                  parseFloat(rate) > property.rate
                }
              >
                {isSubmitting || isSubmittingFinal
                  ? "Submitting..."
                  : "Submit Offer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
