import { useGetReceivedProperties } from "@/hooks/useEnquiry";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
export const ReceivedProperties = ({
  id,
  isMyEnquiry,
}: {
  id: string;
  isMyEnquiry: boolean;
}) => {
  const router = useRouter();

  const { receivedProperties, isPending, error } = useGetReceivedProperties(
    id as string,
    isMyEnquiry
  );
  console.log(receivedProperties);
  if (!isMyEnquiry) return null;

  if (isPending) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive py-2">
        Error loading received properties. {error.message}
      </div>
    );
  }

  if (!receivedProperties || receivedProperties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
        No properties have been proposed yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Received Proposals</h3>
        <Badge variant="secondary" className="rounded-full">
          {receivedProperties.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {receivedProperties.map(({ property, receivedAt, submissionId }) => (
          <Card
            key={submissionId}
            className="overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="p-3 bg-muted/30 pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-sm font-medium line-clamp-1 leading-tight flex items-center gap-2 justify-between">
                  {`${property.propertyCategory} ${property.propertyType} at ${
                    property?.address?.city || "Unknown Location"
                  }`}
                  <span className="text-xs text-muted-foreground">
                    {format(receivedAt, "dd MMM yyyy, hh:mm a")}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {property?.address?.city || "Unknown Location"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs mt-1 ml-auto"
                  onClick={() => router.push(`/property/${property?._id}`)}
                  disabled={!property?._id}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  View Property
                </Button>
              </div>

              {/* {submission.privateMessage && (
                <div className="bg-muted/20 p-2 rounded text-xs text-muted-foreground italic">
                  &quot;{submission.privateMessage}&quot;
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
