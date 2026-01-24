"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/types/property";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { format } from "date-fns";
import { MakeOffer } from "./makeOffer";
import { PropertyOffers } from "./propertyOffers";
import { MapPin, ExternalLink, CalendarClock } from "lucide-react";
import { MapBox } from "./mapBox";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface PropertySidebarProps {
    property: Property;
}

export const PropertySidebar = ({ property }: PropertySidebarProps) => {
    const { brokerData } = useApp();
    const router = useRouter();
    const { t } = useTranslation();

    const isOwner = property.listedBy?._id === brokerData?._id;

    return (
        <div className="space-y-6 sticky top-24">
            {/* Price & Info Section */}
            <Card className="shadow-md border-primary/10 overflow-hidden">
                <div className="bg-primary/5 p-5 border-b border-primary/10">
                    <div className="flex flex-col gap-2">
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">{t("property_asking_price")}</span>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span className="text-3xl font-bold text-primary">{formatCurrency(property.totalPrice)}</span>
                                {property.rate && property.sizeUnit && (
                                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                        ({formatCurrency(property.rate)} / {property.sizeUnit.toLowerCase().replace("_", " ")})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Property Abstract Info */}
                        <div className="text-sm font-medium text-foreground py-1">
                            {property.propertyCategory} • {property.propertyType.replace(/_/g, " ")} • {property.size} {property.sizeUnit?.replace("SQ_", "")}
                        </div>
                    </div>
                </div>
                <CardContent className="p-5 space-y-5">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("property_status")}</span>
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
                        <span>{t("property_updated")}</span>
                        <span>{format(new Date(property.updatedAt), "PPP")}</span>
                    </div>

                    <Separator />

                    {isOwner && property.listingStatus === "ENQUIRY_ONLY" && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                            {t("property_submitted_for_enquiry")}: {" "}
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
                        <div className="space-y-3">
                            <MakeOffer property={property} />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    // Create a Google Calendar event URL
                                    const eventTitle = encodeURIComponent(
                                        `Property Visit: ${property.bhk ? `${property.bhk} BHK ` : ""}${property.propertyType.replace(/_/g, " ")}`
                                    );
                                    const eventDetails = encodeURIComponent(
                                        `Property Visit\n\nProperty ID: ${property.propertyId || property._id}\nPrice: ${formatCurrency(property.totalPrice)}\nSize: ${property.size} ${property.sizeUnit?.replace("SQ_", "")}\nAddress: ${formatAddress(property.address)}\n\nView Property: ${typeof window !== "undefined" ? window.location.href : ""}`
                                    );
                                    const eventLocation = encodeURIComponent(formatAddress(property.address));

                                    // Schedule for tomorrow at 10am, 1 hour duration
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    tomorrow.setHours(10, 0, 0, 0);
                                    const endTime = new Date(tomorrow);
                                    endTime.setHours(11, 0, 0, 0);

                                    // Format dates for Google Calendar (YYYYMMDDTHHMMSS format)
                                    const formatDate = (date: Date) =>
                                        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

                                    const startDate = formatDate(tomorrow);
                                    const endDate = formatDate(endTime);

                                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${startDate}/${endDate}`;

                                    window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
                                }}
                            >
                                <CalendarClock className="mr-2 h-4 w-4" />
                                {t("property_schedule_visit")}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t("label_location")}
                    </h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${property.location?.coordinates[1]},${property.location?.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("property_open_maps")} <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                </div>
                <CardContent className="p-0">
                    <MapBox property={property} variant="minimal" height="300px" className="rounded-none border-none" />
                </CardContent>
                <div className="p-3 text-xs border-t bg-muted/10 text-muted-foreground">
                    {formatAddress(property.address)}
                </div>
            </Card>
        </div>
    );
};
