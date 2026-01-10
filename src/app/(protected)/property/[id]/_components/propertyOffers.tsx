"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, PhoneCall, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/property";
import { ShareContactDialog } from "./share-contact-dialog";
import { formatCurrency } from "@/utils/helper";
import { format } from "date-fns";

export const PropertyOffers = ({ property }: { property: Property }) => {
  const [shareContactOfferId, setShareContactOfferId] = useState<string | null>(
    null
  );
  const [isShareContactOpen, setIsShareContactOpen] = useState(false);

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
                  <Badge
                    variant={offer.status === "pending" ? "outline" : "default"}
                    className="text-[10px] h-5 px-1.5"
                  >
                    {offer.status}
                  </Badge>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
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
    </div>
  );
};
