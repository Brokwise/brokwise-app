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
import {
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  Building2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { formatEnquiryLocation } from "@/utils/helper";

interface EnquiryCardProps {
  enquiry: Enquiry | MarketplaceEnquiry;
}

export const EnquiryCard = ({ enquiry }: EnquiryCardProps) => {
  const router = useRouter();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs font-medium uppercase tracking-wider"
              >
                {enquiry.enquiryType}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                #{enquiry.enquiryId}
              </span>
            </div>
            <h3
              className="font-semibold text-lg line-clamp-1"
              title={enquiry.description}
            >
              {enquiry.description}
            </h3>
          </div>
          <Badge className={`${getStatusColor(enquiry.status)} border-0`}>
            {enquiry.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Budget
            </p>
            <p className="font-medium">
              {formatCurrency(enquiry.budget.min)} -{" "}
              {formatCurrency(enquiry.budget.max)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="font-medium line-clamp-1" title={locationTitle}>
              {locationTitle || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
          {enquiry.bhk && (
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-primary" />
              <span>{enquiry.bhk} BHK</span>
            </div>
          )}
          {enquiry.washrooms && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-primary" />
              <span>{enquiry.washrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="capitalize">
              {enquiry.enquiryCategory.toLowerCase()}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Posted {formatDistanceToNow(new Date(enquiry.createdAt))} ago
          </span>
        </div>
        <Button
          size="sm"
          className="gap-2 group-hover:translate-x-1 transition-transform"
          onClick={() => {
            router.push(`/enquiries/${enquiry._id}`);
          }}
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
