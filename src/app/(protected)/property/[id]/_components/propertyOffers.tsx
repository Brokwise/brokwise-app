"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, MessageSquare, PhoneCall, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/property";
import { ShareContactDialog } from "./share-contact-dialog";
import { formatCurrency } from "@/utils/helper";
import { format } from "date-fns";
import { useRejectOffer } from "@/hooks/useProperty";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PropertyOffers = ({ property }: { property: Property }) => {
  const { t } = useTranslation();
  const [shareContactOfferId, setShareContactOfferId] = useState<string | null>(
    null
  );
  const [isShareContactOpen, setIsShareContactOpen] = useState(false);
  const [rejectConfirmOffer, setRejectConfirmOffer] = useState<{
    id: string;
    isFinal: boolean;
  } | null>(null);
  const { rejectOffer, isPending: isRejecting } = useRejectOffer();

  const handleRejectOffer = async () => {
    if (!rejectConfirmOffer) return;
    try {
      await rejectOffer({
        propertyId: property._id,
        offerId: rejectConfirmOffer.id,
      });
    } finally {
      setRejectConfirmOffer(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-[10px] h-5 px-1.5">Pending</Badge>;
      case "final_pending":
        return <Badge className="text-[10px] h-5 px-1.5 bg-yellow-500">{t("property_final_offer_label")}</Badge>;
      case "rejected":
      case "final_rejected":
        return <Badge className="text-[10px] h-5 px-1.5 bg-red-500">{t("property_offer_rejected_label")}</Badge>;
      case "accepted":
      case "final_accepted":
        return <Badge className="text-[10px] h-5 px-1.5 bg-green-500">{t("offer_accepted")}</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{status}</Badge>;
    }
  };

  if (!property.offers || property.offers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Received Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No offers have been received yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const canRejectOffer = (status: string) =>
    status === "pending" || status === "final_pending";

  const canShareContact = (status: string) =>
    status === "pending" || status === "final_pending";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Received Offers</CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {property.offers.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {property.offers.map((offer) => (
            <Card
              key={offer._id}
              className="overflow-hidden transition-all hover:shadow-md border-muted"
            >
              <CardHeader className="p-3 bg-muted/30 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Offer Price</span>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(offer.rate)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        /{property.sizeUnit?.toLowerCase().replace("_", " ")}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {offer.createdAt &&
                        format(new Date(offer.createdAt), "PPP p")}
                    </p>
                  </div>
                </div>

                {offer.message && (
                  <div className="flex items-start gap-1.5 p-2 bg-muted/50 rounded-md">
                    <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">{offer.message}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {offer.isContactShared ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 h-7 text-xs text-green-700 bg-green-50 hover:bg-green-100 border-green-200 border"
                      disabled
                    >
                      <CheckCheck className="h-3 w-3 mr-1.5" />
                      Shared
                    </Button>
                  ) : (
                    <>
                      {canShareContact(offer.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs "
                          onClick={() => {
                            if (offer._id) {
                              setShareContactOfferId(offer._id);
                              setIsShareContactOpen(true);
                            }
                          }}
                        >
                          <PhoneCall className="h-3 w-3 mr-1.5" />
                          Share Contact
                        </Button>
                      )}
                      {canRejectOffer(offer.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            if (offer._id) {
                              setRejectConfirmOffer({
                                id: offer._id,
                                isFinal: offer.isFinalOffer,
                              });
                            }
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1.5" />
                          {t("property_reject_offer")}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Share Contact Dialog */}
      {shareContactOfferId && (
        <ShareContactDialog
          isOpen={isShareContactOpen}
          onClose={() => {
            setIsShareContactOpen(false);
            setShareContactOfferId(null);
          }}
          propertyId={property._id}
          offerId={shareContactOfferId}
        />
      )}

      {/* Reject Offer Confirmation Dialog */}
      <AlertDialog
        open={!!rejectConfirmOffer}
        onOpenChange={(open) => {
          if (!open) setRejectConfirmOffer(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("property_reject_offer_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {rejectConfirmOffer?.isFinal
                ? t("property_reject_final_offer_confirm_desc")
                : t("property_reject_offer_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>
              {t("action_cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectOffer}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? t("property_rejecting") : t("property_reject_offer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
