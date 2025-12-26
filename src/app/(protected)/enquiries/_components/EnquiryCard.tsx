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
  IndianRupee,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { formatEnquiryLocation } from "@/utils/helper";
import { cn } from "@/lib/utils";

interface EnquiryCardProps {
  enquiry: Enquiry | MarketplaceEnquiry;
}

export const EnquiryCard = ({ enquiry }: EnquiryCardProps) => {
  const router = useRouter();
  // const { userData } = useApp();

  // const isCompany = userData?.userType === "company";
  const locationTitle = formatEnquiryLocation(enquiry);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    }
    return amount.toLocaleString("en-IN");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          className:
            "bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      case "closed":
        return {
          label: "Closed",
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200",
        };
      case "expired":
        return {
          label: "Expired",
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

  return (
    <Card
      className="group relative overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer"
      onClick={() => router.push(`/enquiries/${enquiry._id}`)}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
          <Badge
            variant="outline"
            className="rounded-md px-2.5 py-0.5 font-normal text-xs uppercase tracking-wider bg-background"
          >
            {enquiry.enquiryType}
          </Badge>
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
          <h3 className="font-semibold text-lg leading-tight tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {enquiry.description || "Untitled Enquiry"}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {locationTitle || "Location not specified"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 pb-4">
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              {formatCurrency(enquiry.budget.min)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              to
            </span>
            <span className="text-xl font-bold tracking-tight">
              {formatCurrency(enquiry.budget.max)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium pl-0.5">
            Estimated Budget
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="font-medium capitalize text-xs">
              {enquiry.enquiryCategory.toLowerCase()}
            </span>
          </div>
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
                {enquiry.washrooms} Bath
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(enquiry.createdAt), {
            addSuffix: true,
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10 -mr-2"
        >
          Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
