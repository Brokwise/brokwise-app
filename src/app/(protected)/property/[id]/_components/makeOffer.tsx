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
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface MakeOfferProps {
  property: Property;
}

export const MakeOffer = ({ property }: MakeOfferProps) => {
  const { brokerData, companyData } = useApp();
  const { offerPrice, isPending: isSubmitting } = useOfferPrice();
  const { submitFinalOffer, isPending: isSubmittingFinal } =
    useSubmitFinalOffer();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [perUnitRate, setPerUnitRate] = useState<string>("");
  const [totalRate, setTotalRate] = useState<string>("");
  const [isFinalOfferMode, setIsFinalOfferMode] = useState(false);
  if (!brokerData && !companyData) return null;
  const isOwnListing =
    typeof property.listedBy === "string"
      ? property.listedBy === (brokerData ? brokerData._id : companyData?._id)
      : property.listedBy?._id === (brokerData ? brokerData._id : companyData?._id)


  if (isOwnListing) {
    return <Alert>
      <AlertDescription className="flex gap-2"><Info /> {t("property_your_property")}</AlertDescription>
    </Alert>;
  }
  const myOffer = property.offers?.find((offer) => {
    const offerById =
      typeof offer.offerBy === "string"
        ? offer.offerBy
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (offer.offerBy as any)._id;
    return offerById === (brokerData ? brokerData._id : companyData?._id);
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPerUnitRate("");
      setTotalRate("");
      setIsFinalOfferMode(false);
    }
  };

  const handlePerUnitChange = (value: string) => {
    setPerUnitRate(value);
    const size = Number(property.size) || 0;
    if (!value) {
      setTotalRate("");
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || size <= 0) {
      setTotalRate("");
      return;
    }
    setTotalRate((parsed * size).toString());
  };

  const handleTotalChange = (value: string) => {
    setTotalRate(value);
    const size = Number(property.size) || 0;
    if (!value) {
      setPerUnitRate("");
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || size <= 0) {
      setPerUnitRate("");
      return;
    }
    setPerUnitRate((parsed / size).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const offerValue = parseFloat(perUnitRate);
    const size = Number(property.size) || 0;
    const maxTotal = size ? property.rate * size : property.rate;
    const offerRate = offerValue;

    if (isNaN(offerValue) || offerValue <= 0) {
      toast.error(t("toast_error_invalid_rate"));
      return;
    }

    if (offerRate > property.rate) {
      toast.error(t("toast_error_rate_higher"));
      return;
    }

    if (size && offerRate * size > maxTotal) {
      toast.error(t("toast_error_total_higher"));
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
        return <Badge className="bg-green-500">{t("offer_sent")}</Badge>;
      case "accepted":
      case "final_accepted":
        return <Badge className="bg-green-500">{t("offer_accepted")}</Badge>;
      case "rejected":
      case "final_rejected":
        return <Badge className="bg-red-500">{t("offer_rejected")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderOfferContent = () => {
    if (!myOffer) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("property_no_offer_yet")}{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(property.rate)}
            </span>
            .
          </p>
          <Button onClick={() => setOpen(true)} className="w-full">
            <Gavel className="mr-2 h-4 w-4" />
            {t("action_make_offer")}
          </Button>
        </div>
      );
    }

    const { status, rate: offerRate, rejectionReason } = myOffer;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("property_your_offer_status")}</span>
          {getStatusBadge(status)}
        </div>

        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("property_offered_rate")}:</span>
            <span className="font-semibold">{formatCurrency(offerRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("label_asking_rate")}:</span>
            <span>{formatCurrency(property.rate)}</span>
          </div>
        </div>

        {status === "pending" && (
          <Alert className="bg-green-50 border-green-200">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">{t("property_offer_sent")}</AlertTitle>
            <AlertDescription className="text-green-700">
              {t("property_your_offer_sent")}
            </AlertDescription>
          </Alert>
        )}

        {status === "accepted" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">{t("offer_accepted")}</AlertTitle>
            <AlertDescription className="text-green-700">
              {t("offer_accepted_desc")}
            </AlertDescription>
          </Alert>
        )}

        {status === "rejected" && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>{t("offer_rejected")}</AlertTitle>
              <AlertDescription>
                {t("property_reason")}: {rejectionReason || t("property_no_reason_provided")}
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
              {t("property_submit_final_offer_btn")}
            </Button>
          </div>
        )}

        {status === "final_pending" && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              {t("property_final_review_pending")}
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              {t("property_final_review_pending_desc")}
            </AlertDescription>
          </Alert>
        )}

        {status === "final_accepted" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              {t("property_final_offer_accepted")}
            </AlertTitle>
            <AlertDescription className="text-green-700">
              {t("property_final_offer_accepted_desc")}
            </AlertDescription>
          </Alert>
        )}

        {status === "final_rejected" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>{t("property_final_offer_rejected")}</AlertTitle>
            <AlertDescription>
              {t("property_reason")}: {rejectionReason || t("property_no_reason_provided")}
              <div className="mt-2 font-semibold">
                {t("property_no_more_offers")}
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
          <CardTitle>{t("action_make_offer")}</CardTitle>
        </CardHeader>
        <CardContent>{renderOfferContent()}</CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95%] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {isFinalOfferMode ? t("property_submit_final_offer") : t("action_submit_offer")}
            </DialogTitle>
            <DialogDescription>
              {isFinalOfferMode
                ? t("property_final_offer_warning")
                : t("property_offer_warning")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rate-per-unit">
                  {`${t("property_offer_rate_label")} (per ${property.sizeUnit
                    ?.toLowerCase()
                    .replace("_", " ")})`}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="rate-per-unit"
                    type="number"
                    placeholder={`${t("label_max")}: ${property.rate}`}
                    className="pl-7"
                    value={perUnitRate}
                    onChange={(e) => handlePerUnitChange(e.target.value)}
                    max={property.rate}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate-total">{t("property_offer_total_label")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="rate-total"
                    type="number"
                    placeholder={`${t("label_max")}: ${(Number(property.size) || 0) * property.rate}`}
                    className="pl-7"
                    value={totalRate}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    max={(Number(property.size) || 0) * property.rate}
                    disabled={!property.size}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("label_asking_rate")}: {formatCurrency(property.rate)}
              {property.size ? (
                <>
                  {" "}
                  • {t("property_asking_total")}:{" "}
                  {formatCurrency(property.rate * property.size)}
                </>
              ) : null}
            </p>

            {perUnitRate &&
              (parseFloat(perUnitRate) > property.rate ||
                (Boolean(property.size) &&
                  parseFloat(totalRate || "0") >
                  (Number(property.size) || 0) * property.rate)) && (
                <div className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {property.size &&
                    parseFloat(totalRate || "0") >
                    (Number(property.size) || 0) * property.rate
                    ? t("offer_total_higher_than_asking")
                    : t("offer_higher_than_asking")}
                </div>
              )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("action_cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isSubmittingFinal ||
                  !perUnitRate ||
                  parseFloat(perUnitRate) > property.rate ||
                  (Boolean(property.size) &&
                    parseFloat(totalRate || "0") >
                    (Number(property.size) || 0) * property.rate)
                }
              >
                {isSubmitting || isSubmittingFinal
                  ? t("submitting")
                  : t("action_submit_offer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
