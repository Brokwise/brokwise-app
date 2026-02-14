"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/types/property";
import { formatCurrency, formatAddress } from "@/utils/helper";
import { format } from "date-fns";
import { MakeOffer } from "./makeOffer";
import { MapPin, ExternalLink, CalendarClock, Info, Coins, Loader2 } from "lucide-react";
import { useEditProperty } from "@/hooks/useProperty";
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
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapBox } from "./mapBox";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useCredits, { useGetCreditPrices } from "@/hooks/useCredits";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckContactRequestStatus, useCreateContactRequest } from "@/hooks/useContactRequest";
import { DisclaimerAcknowledge } from "@/components/ui/disclaimer-acknowledge";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

interface PropertySidebarProps {
    property: Property;
}

export const PropertySidebar = ({ property }: PropertySidebarProps) => {
    const { brokerData } = useApp();
    const { balance, isLoading: isCreditsLoading } = useCredits()
    const { prices } = useGetCreditPrices()
    const router = useRouter();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { editProperty, isPending: isEditPending } = useEditProperty();
    const FEATURED_COST = prices.MARK_PROPERTY_AS_FEATURED;
    const hasSufficientCredits = (balance || 0) >= FEATURED_COST;
    const [showFeatureDialog, setShowFeatureDialog] = useState(false);
    const [showContactRequestDialog, setShowContactRequestDialog] = useState(false);
    const [isContactRequestDisclaimerAccepted, setIsContactRequestDisclaimerAccepted] = useState(false);

    // Contact request hooks
    const { createContactRequest, isPending: isCreatingContactRequest } = useCreateContactRequest();
    const {
        hasExistingRequest,
        isPending: hasPendingRequest,
        isAccepted: hasAcceptedRequest,
        isLoading: isCheckingRequestStatus,
    } = useCheckContactRequestStatus(property._id);

    const isOwner = property.listedBy?._id === brokerData?._id;
    const canRequestContact = balance >= prices.REQUEST_CONTACT && !hasExistingRequest;

    return (
        <div className="space-y-6 sticky top-24">
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

                    {isOwner && (
                        <div className="space-y-3">
                            {isCreditsLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Checking credit balance...
                                </div>
                            ) : property.isFeatured ? (
                                <div className="space-y-1 leading-none flex-1">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Property is featured
                                    </label>
                                </div>
                            ) : (
                                <div className="rounded-md border bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">Feature this property</p>
                                            <p className="text-xs text-muted-foreground">
                                                Promote for {FEATURED_COST} credits.
                                            </p>
                                            {!hasSufficientCredits && (
                                                <p className="text-[10px] text-destructive font-medium mt-1">
                                                    Insufficient credits ({balance})
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => setShowFeatureDialog(true)}
                                            disabled={!hasSufficientCredits || isEditPending}
                                        >
                                            {isEditPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    Processing
                                                </>
                                            ) : (
                                                "Use credits"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Mark Property as Featured?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will deduct {FEATURED_COST} credits from your balance. Are you sure you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    editProperty({
                                        propertyId: property._id,
                                        isFeatured: true
                                    });
                                    queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
                                    setShowFeatureDialog(false);
                                }}>
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

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
                    {!isOwner && property.listingStatus !== "DELETED" && (
                        <div className="bg-muted/30 rounded-lg p-4 space-y-4 border border-border">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Contact Owner</span>
                                {!hasExistingRequest && (
                                    <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1">
                                        <Coins className="h-3.5 w-3.5 text-primary" />
                                        <span className="font-medium">{prices.REQUEST_CONTACT} Credits</span>
                                    </Badge>
                                )}
                            </div>

                            {!hasExistingRequest && (
                                <Alert className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 py-3">
                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <AlertDescription className="text-xs text-blue-700 dark:text-blue-300 ml-2">
                                        100% refund of credits if property doesn&apos;t respond within 48 hours
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                {isCheckingRequestStatus ? (
                                    <Button className="w-full font-medium" size="lg" disabled>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking status...
                                    </Button>
                                ) : hasAcceptedRequest ? (
                                    <Alert className="bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50">
                                        <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <AlertDescription className="text-sm text-green-700 dark:text-green-300 ml-2">
                                            Contact details have been shared! Check your contacts.
                                        </AlertDescription>
                                    </Alert>
                                ) : hasPendingRequest ? (
                                    <Alert className="bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/50">
                                        <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                        <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300 ml-2">
                                            Contact request pending. Waiting for owner response.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <>
                                        <Button
                                            className="w-full font-medium"
                                            size="lg"
                                            disabled={!canRequestContact || isCreatingContactRequest}
                                            onClick={() => {
                                                setIsContactRequestDisclaimerAccepted(false);
                                                setShowContactRequestDialog(true);
                                            }}
                                        >
                                            {isCreatingContactRequest && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Request Contact Details
                                        </Button>
                                        {balance < prices.REQUEST_CONTACT && (
                                            <p className="text-xs text-center text-destructive font-medium">
                                                Insufficient credits to perform this action
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <AlertDialog open={showContactRequestDialog} onOpenChange={setShowContactRequestDialog}>
                        <AlertDialogContent className="mx-auto max-w-[95%] md:max-w-full rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Request Contact Details?</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                    <p>
                                        This will deduct <strong>{prices.REQUEST_CONTACT} credits</strong> from your balance.
                                    </p>
                                    <p className="text-muted-foreground">
                                        If the property owner doesn&apos;t respond within 48 hours, your credits will be automatically refunded.
                                    </p>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <DisclaimerAcknowledge
                                text={DISCLAIMER_TEXT.contactSharing}
                                checked={isContactRequestDisclaimerAccepted}
                                onCheckedChange={setIsContactRequestDisclaimerAccepted}
                                checkboxLabel={DISCLAIMER_TEXT.acknowledgeLabel}
                                showRequiredMessage
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={!isContactRequestDisclaimerAccepted}
                                    onClick={() => {
                                        createContactRequest({
                                            propertyId: property._id,
                                            disclaimerAccepted: true,
                                        });
                                        setShowContactRequestDialog(false);
                                        setIsContactRequestDisclaimerAccepted(false);
                                    }}
                                >
                                    Confirm Request
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>


                    {!property.deletingStatus && property.listingStatus !== "ENQUIRY_ONLY" && property.listingStatus !== "DELETED" && (
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
