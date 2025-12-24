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
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
      case "closed":
        return "bg-muted text-muted-foreground";
      case "expired":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-accent/10 text-accent";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-none shadow-sm bg-card h-full flex flex-col rounded-xl">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs font-semibold text-accent border-accent/20 uppercase tracking-wider bg-accent/5"
              >
                {enquiry.enquiryType}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                #{enquiry.enquiryId?.slice(-6) || "ID"}
              </span>
            </div>
            <h3
              className="font-semibold text-lg line-clamp-1 text-foreground"
              title={enquiry.description}
            >
              {enquiry.description}
            </h3>
          </div>
          <Badge className={`${getStatusColor(enquiry.status)} border-0 px-2 py-0.5 capitalize shadow-none`}>
            {enquiry.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-5 flex-grow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-accent" /> Budget
            </p>
            <p className="font-medium text-foreground">
              {formatCurrency(enquiry.budget.min)} -{" "}
              {formatCurrency(enquiry.budget.max)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Location
            </p>
            <p className="font-medium text-foreground line-clamp-1" title={locationTitle}>
              {locationTitle || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {enquiry.bhk && (
            <Badge variant="secondary" className="bg-muted/50 hover:bg-muted text-muted-foreground font-normal rounded-md border-0">
              {enquiry.bhk} BHK
            </Badge>
          )}
          {enquiry.washrooms && (
            <Badge variant="secondary" className="bg-muted/50 hover:bg-muted text-muted-foreground font-normal rounded-md border-0">
              {enquiry.washrooms} Bath
            </Badge>
          )}
          <Badge variant="secondary" className="bg-muted/50 hover:bg-muted text-muted-foreground font-normal rounded-md border-0 capitalize">
            {enquiry.enquiryCategory.toLowerCase()}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-5 pb-5 flex justify-between items-center text-xs text-muted-foreground mt-auto">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {formatDistanceToNow(new Date(enquiry.createdAt))} ago
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 group-hover:border-primary/50 group-hover:text-primary transition-all rounded-lg text-xs h-8"
          onClick={() => {
            router.push(`/enquiries/${enquiry._id}`);
          }}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};
