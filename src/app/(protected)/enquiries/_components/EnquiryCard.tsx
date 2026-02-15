import React from "react";
import { Enquiry, MarketplaceEnquiry } from "@/models/types/enquiry";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { useApp } from "@/context/AppContext";
import {
  MapPin,
  BedDouble,
  Bath,
  Building2,
  ArrowRight,
  Clock,
  MessageSquare,
  Flame,
  Ruler,
  Compass,
  ArrowLeftRight,
  Layers,
  Hotel,
  Target,
  Map,
  LayoutGrid,
  Home,
  IndianRupee,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { formatCurrencyEnquiry, formatEnquiryLocation, getEnquiryLocationCount } from "@/utils/helper";
import { cn } from "@/lib/utils";
import { useGetMyEnquiries } from "@/hooks/useEnquiry";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
import ShinyText from "@/components/ui/shinnytext";
import { getPlotTypeLabel } from "@/lib/plotType";

interface EnquiryCardProps {
  enquiry: Enquiry | MarketplaceEnquiry;
  isSameCity?: boolean;
}

export const EnquiryCard = ({
  enquiry,
  isSameCity = false,
}: EnquiryCardProps) => {
  const router = useRouter();
  const { userData } = useApp();
  const { t } = useTranslation();

  const isCompany = userData?.userType === "company";
  const locationTitle = formatEnquiryLocation(enquiry);
  const locationCount = getEnquiryLocationCount(enquiry);
  const { myEnquiries, isLoading } = useGetMyEnquiries();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: t("label_active"),
          className:
            "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      case "closed":
        return {
          label: t("label_closed"),
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
        };
      case "expired":
        return {
          label: t("label_expired"),
          className:
            "bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      default:
        return {
          label: status,
          className:
            "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200",
        };
    }
  };

  const statusConfig = getStatusConfig(enquiry.status);

  const submissionCount =
    "submissionCount" in enquiry ? enquiry.submissionCount ?? 0 : 0;
  if (isLoading) {
    return <div>loading...</div>;
  }
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col",
        enquiry.urgent
          ? "border-red-200  dark:bg-red-950/10 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 shadow-sm"
          : "border-border/50 bg-card dark:bg-card hover:border-primary/20"
      )}
      onClick={() => {
        if (isCompany)
          router.push(`/company-enquiries/marketplace/detail?id=${enquiry._id}`);
        else router.push(`/enquiries/detail?id=${enquiry._id}`);
      }}
    >
      <CardHeader className="p-4 md:p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isSameCity && (
              <Badge className="rounded-md px-2.5 py-0.5 font-medium text-xs bg-blue-600/90 text-white border-none">
                <MapPin className="h-3 w-3 mr-1" />
                {t("label_same_city")}
              </Badge>
            )}
            {enquiry.urgent && (
              <Badge
                variant="outline"
                className="rounded-md px-2.5 py-0.5 font-medium text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse"
              >
                <Flame className="h-3 w-3 mr-1 fill-red-600 text-red-600 dark:fill-red-400 dark:text-red-400" />
                <ShinyText text="Urgent" />

              </Badge>
            )}
            <Badge
              variant="outline"
              className="rounded-md px-2.5 py-0.5 font-normal text-xs uppercase tracking-wider bg-background"
            >
              {enquiry.enquiryType}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "border px-2.5 py-0.5 font-medium capitalize",
              statusConfig.className
            )}
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {enquiry.status}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
              {t("label_enquiry_id")}:
            </span>
            <Badge
              variant="secondary"
              title={enquiry.enquiryId || enquiry._id}
              className="h-5 px-2 max-w-full font-mono text-[11px] sm:text-xs truncate"
            >
              {enquiry.enquiryId || enquiry._id}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {locationTitle || t("label_location_not_specified")}
            </span>
            {locationCount > 1 && (
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5 shrink-0">
                +{locationCount - 1} more
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5 flex-grow">
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight">
              {formatCurrencyEnquiry(enquiry.budget.min)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {t("label_to")}
            </span>
            <span className="text-xl font-bold tracking-tight">
              {formatCurrencyEnquiry(enquiry.budget.max)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium pl-0.5">
            {t("label_estimated_budget")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="font-medium capitalize text-xs">
              {enquiry.enquiryCategory.toLowerCase()}
            </span>
          </div>
          {enquiry.size && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Ruler className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">
                {enquiry.size.min} - {enquiry.size.max} {enquiry.size.unit.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
          )}
          {enquiry.bhk && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.bhk} BHK</span>
            </div>
          )}
          {enquiry.washrooms && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Bath className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">
                {enquiry.washrooms} {t("label_bath")}
              </span>
            </div>
          )}
          {enquiry.preferredFloor && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.preferredFloor}</span>
            </div>
          )}
          {enquiry.society && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Home className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.society}</span>
            </div>
          )}
          {enquiry.plotType && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{getPlotTypeLabel(t, enquiry.plotType)}</span>
            </div>
          )}
          {enquiry.facing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Compass className="h-3.5 w-3.5" />
              <span className="font-medium text-xs capitalize">{enquiry.facing.replace(/_/g, " ").toLowerCase()}</span>
            </div>
          )}
          {enquiry.frontRoadWidth && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.frontRoadWidth} ft road</span>
            </div>
          )}
          {enquiry.rooms && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Hotel className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.rooms} Rooms</span>
            </div>
          )}
          {enquiry.beds && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">{enquiry.beds} Beds</span>
            </div>
          )}
          {enquiry.rentalIncome && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <IndianRupee className="h-3.5 w-3.5" />
              <span className="font-medium text-xs">
                {formatCurrencyEnquiry(enquiry.rentalIncome.min || 0)} -{" "}
                {formatCurrencyEnquiry(enquiry.rentalIncome.max || 0)} rent
              </span>
            </div>
          )}
          {enquiry.purpose && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Target className="h-3.5 w-3.5" />
              <span className="font-medium text-xs line-clamp-1">{enquiry.purpose}</span>
            </div>
          )}
          {enquiry.areaType && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
              <Map className="h-3.5 w-3.5" />
              <span className="font-medium text-xs capitalize">{enquiry.areaType.replace(/_/g, " ").toLowerCase()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 md:p-5 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(enquiry.createdAt), {
              addSuffix: true,
            })}
          </div>
          {/* Responses Indicator */}
          {submissionCount > 0 &&
            myEnquiries?.find((e) => e._id == enquiry._id) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-sm">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{submissionCount}</span>
              </div>
            )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
        >
          {t("action_view_details")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
