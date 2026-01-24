"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/types/property";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { format } from "date-fns";
import { MakeOffer } from "./makeOffer";
import { PropertyOffers } from "./propertyOffers";
import { MapPin, ExternalLink } from "lucide-react";
import { MapBox } from "./mapBox";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

interface PropertySidebarProps {
    property: Property;
}

export const PropertySidebar = ({ property }: PropertySidebarProps) => {
    const { brokerData } = useApp();
    const router = useRouter();

    const isOwner = property.listedBy?._id === brokerData?._id;

    return (
        <div className="space-y-6 sticky top-24">
            {/* Price & Offer Section */}
            <Card className="shadow-md border-primary/10 overflow-hidden">
                <div className="bg-primary/5 p-4 border-b border-primary/10">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Asking Price</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">{formatCurrency(property.totalPrice)}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            {formatCurrency(property.rate)} / {property.sizeUnit?.toLowerCase().replace("_", " ")}
                        </span>
                    </div>
                </div>
                <CardContent className="p-4 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge
                            variant={
                                property.listingStatus === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                            }
                            className={
                                property.listingStatus === "ACTIVE"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : ""
                            }
                        >
                            {property.listingStatus ? property.listingStatus.replace("_", " ") : "Unknown"}
                        </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                        <span>Updated</span>
                        <span>{format(new Date(property.updatedAt), "PPP")}</span>
                    </div>

                    <Separator />

                    {isOwner && property.listingStatus === "ENQUIRY_ONLY" && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                            Submitted for Enquiry: {" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={() => router.push("/enquiries/" + property.submittedForEnquiryId?._id)}
                            >
                                {property.submittedForEnquiryId?.enquiryId}
                            </Button>
                        </div>
                    )}

                    {isOwner && property.listingStatus !== "ENQUIRY_ONLY" && (
                        <PropertyOffers property={property} />
                    )}

                    {!property.deletingStatus && property.listingStatus !== "ENQUIRY_ONLY" && (
                        <MakeOffer property={property} />
                    )}
                </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="overflow-hidden shadow-sm">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${property.location?.coordinates[1]},${property.location?.coordinates[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Maps <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-[250px] relative">
                    <MapBox property={property} />
                    {/* Address Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-background/90 backdrop-blur p-2 text-xs border-t text-muted-foreground">
                        {formatAddress(property.address)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
