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
  Building2,
  MessageSquare,
  Clock,
  MapPin,
  IndianRupee,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentActivityFeedProps {
  data: RecentActivity[] | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString()}`;
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
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest properties and enquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Clock className="h-12 w-12 mb-2 opacity-20" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest properties and enquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {data.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      activity.type === "property"
                        ? "bg-blue-500/10"
                        : "bg-amber-500/10"
                    }`}
                  >
                    {activity.type === "property" ? (
                      <Building2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-amber-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {activity.type === "property" ? (
                            <>
                              <span className="capitalize">
                                {activity.category?.toLowerCase()}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {activity.propertyType?.toLowerCase()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>{activity.name || "Enquiry"}</span>{" "}
                              <span className="text-muted-foreground text-xs">
                                ({activity.enquiryType})
                              </span>
                            </>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {activity.type === "property" && activity.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.address.city}
                              {activity.address.state &&
                                `, ${activity.address.state}`}
                            </span>
                          )}
                          {activity.type === "property" && activity.price && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {formatCurrency(activity.price)}
                            </span>
                          )}
                          {activity.type === "property" &&
                            activity.listedBy && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.listedBy.firstName}{" "}
                                {activity.listedBy.lastName}
                              </span>
                            )}
                          {activity.type === "enquiry" && activity.broker && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.broker.firstName}{" "}
                              {activity.broker.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.status}
                      </Badge>
                    </div>

                    {/* Time */}
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
