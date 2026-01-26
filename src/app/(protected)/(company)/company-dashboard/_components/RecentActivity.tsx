"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivity } from "@/hooks/useCompanyDashboard";
import { motion } from "framer-motion";
import {
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentActivityFeedProps {
  data: RecentActivity[] | undefined;
  isLoading: boolean;
}



function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    DRAFT: "bg-slate-500/10 text-slate-600 border-slate-200",
    SOLD: "bg-blue-500/10 text-blue-600 border-blue-200",
    RENTED: "bg-purple-500/10 text-purple-600 border-purple-200",
    EXPIRED: "bg-red-500/10 text-red-600 border-red-200",
    COMPLETED: "bg-green-500/10 text-green-600 border-green-200",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-200",
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-200",
  };
  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-200";
}

export function RecentActivityFeed({
  data,
  isLoading,
}: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates from your team</CardDescription>
        </CardHeader>
        <CardContent className="px-0 flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/30 rounded-xl">
          <Clock className="h-10 w-10 mb-3 opacity-20" />
          <p>No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">
          Recent Activity
        </h3>
        <p className="text-sm text-muted-foreground">
          Real-time updates
        </p>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
          {data.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-8"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[9px] top-1 p-1 rounded-full border-4 border-background ${activity.type === "property"
                  ? "bg-blue-500"
                  : "bg-amber-500"
                  }`}
              >
                {/* Inner dot handled by bg color */}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {activity.type === "property" ? (
                    <p className="text-sm font-medium text-foreground">
                      {activity.listedBy?.firstName} updated {activity.category?.toLowerCase() || 'property'}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      New enquiry from {activity.name || activity.enquiryType}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md mt-1">
                    {activity.type === 'property'
                      ? `${activity.propertyType} in ${activity.address?.city}`
                      : `Enquiry for ${activity.enquiryType} from ${activity.name || 'Unknown Client'}`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
