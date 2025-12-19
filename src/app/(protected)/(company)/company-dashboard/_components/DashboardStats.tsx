"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/hooks/useCompanyDashboard";
import {
  Building2,
  Users,
  MessageSquare,
  TrendingUp,
  Home,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStatsCardsProps {
  data: DashboardStats | undefined;
  isLoading: boolean;
}

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export function DashboardStatsCards({
  data,
  isLoading,
}: DashboardStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Total Properties",
      value: data.overview.totalProperties,
      subtitle: `${data.overview.activeProperties} active`,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Listings",
      value: data.properties.active,
      subtitle: `${data.properties.draft} drafts`,
      icon: Home,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Brokers",
      value: data.overview.totalBrokers,
      subtitle: `${data.overview.activeBrokers} active`,
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Total Enquiries",
      value: data.overview.totalEnquiries,
      subtitle: `${data.overview.activeEnquiries} active`,
      icon: MessageSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Properties Sold",
      value: data.properties.sold,
      subtitle: `${data.properties.rented} rented`,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Completed Enquiries",
      value: data.enquiries.completed,
      subtitle: `of ${data.enquiries.total} total`,
      icon: FileText,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "New Properties (30d)",
      value: data.recentActivity.propertiesLast30Days,
      subtitle: "Last 30 days",
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "New Enquiries (30d)",
      value: data.recentActivity.enquiriesLast30Days,
      subtitle: "Last 30 days",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          custom={i}
          initial="hidden"
          animate="visible"
          //   variants={statCardVariants}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
