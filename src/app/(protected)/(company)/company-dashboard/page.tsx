"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  useGetDashboardStats,
  useGetPropertyDistribution,
  useGetEnquiryAnalytics,
  useGetPropertyTrends,
  useGetEnquiryTrends,
  useGetRecentActivity,
  useGetPropertyValueAnalytics,
  TimeFrame,
} from "@/hooks/useCompanyDashboard";
import { DashboardStatsCards } from "./_components/DashboardStats";
import { PropertyDistributionCharts } from "./_components/PropertyDistribution";
import { TrendsCharts } from "./_components/TrendsCharts";
import { RecentActivityFeed } from "./_components/RecentActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import {
  Building2,
  MessageSquare,
  Users,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";

export default function CompanyDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].startsWith("company-"),
  });

  const [trendsTimeFrame, setTrendsTimeFrame] = useState<TimeFrame>("MONTH");

  // Fetch all dashboard data
  const { data: dashboardStats, isLoading: isLoadingStats } =
    useGetDashboardStats();
  const { data: propertyDistribution, isLoading: isLoadingDistribution } =
    useGetPropertyDistribution();
  useGetEnquiryAnalytics();
  const { data: propertyTrends, isLoading: isLoadingPropertyTrends } =
    useGetPropertyTrends(trendsTimeFrame);
  const { data: enquiryTrends, isLoading: isLoadingEnquiryTrends } =
    useGetEnquiryTrends(trendsTimeFrame);
  const { data: recentActivity, isLoading: isLoadingRecentActivity } =
    useGetRecentActivity(15);
  useGetPropertyValueAnalytics();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("company-"),
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back, here's what's happening today."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9"
            onClick={handleRefresh}
            disabled={isFetching > 0}
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching > 0 ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </PageHeader>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
        {/* Hero Card: Active Pipeline (Span 4) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 h-full flex flex-col justify-between shadow-lg ring-1 ring-white/10 group">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />

            <div className="relative z-10">
              <Typography variant="h2" className="text-primary-foreground/80">Active Pipeline</Typography>
              <div className="mt-4 flex items-baseline gap-2">
                <Typography variant="value" className="text-5xl tracking-tighter">
                  {formatCurrency(
                    (dashboardStats?.properties.active || 0) * 15000000 // Placeholder avg value or real calc needed
                    // Use 'Total Value' if available or just count
                  )}
                </Typography>
                {/* Fallback to simple stats if value not available */}
                <Typography variant="small" className="text-primary-foreground/60">Estimated Value</Typography>
              </div>
              <div className="mt-6 flex gap-8">
                <div>
                  <Typography variant="value" className="text-3xl">{dashboardStats?.overview.activeProperties || 0}</Typography>
                  <Typography variant="muted" className="text-primary-foreground/60 uppercase tracking-wider mt-1">Active Properties</Typography>
                </div>
                <div>
                  <Typography variant="value" className="text-3xl">{dashboardStats?.overview.activeEnquiries || 0}</Typography>
                  <Typography variant="muted" className="text-primary-foreground/60 uppercase tracking-wider mt-1">Active Leads</Typography>
                </div>
                <div>
                  <Typography variant="value" className="text-3xl">{dashboardStats?.overview.activeBrokers || 0}</Typography>
                  <Typography variant="muted" className="text-primary-foreground/60 uppercase tracking-wider mt-1">Active Brokers</Typography>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions (Span 2) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2 grid grid-cols-2 gap-4 h-full"
        >
          <Button variant="outline" className="h-full flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm border-dashed" onClick={() => router.push('/property/createProperty')}>
            <Building2 className="h-6 w-6" />
            Add Property
          </Button>
          <Button variant="outline" className="h-full flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm border-dashed" onClick={() => router.push('/company-brokers')}>
            <Users className="h-6 w-6" />
            Manage Brokers
          </Button>
          <Button variant="outline" className="h-full flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm border-dashed" onClick={() => router.push('/company-enquiries')}>
            <MessageSquare className="h-6 w-6" />
            View Enquiries
          </Button>
        </motion.div>

        {/* Main Content Area (Span 4) - Tabs for Charts */}
        <div className="xl:col-span-4 space-y-6">
          {/* Secondary Stats Row */}
          <DashboardStatsCards data={dashboardStats} isLoading={isLoadingStats} />

          {/* Charts Tabs */}
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <Tabs defaultValue="overview" className="w-full">
              <div className="px-6 pt-6 flex items-center justify-between">
                <Typography variant="h3">Analytics</Typography>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 pt-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <TrendsCharts
                    propertyTrends={propertyTrends}
                    enquiryTrends={enquiryTrends}
                    isLoadingProperty={isLoadingPropertyTrends}
                    isLoadingEnquiry={isLoadingEnquiryTrends}
                    timeFrame={trendsTimeFrame}
                    onTimeFrameChange={setTrendsTimeFrame}
                  />
                </TabsContent>
                <TabsContent value="distribution" className="mt-0 space-y-4">
                  <PropertyDistributionCharts
                    data={propertyDistribution}
                    isLoading={isLoadingDistribution}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar Feed (Span 2) */}
        <div className="xl:col-span-2">
          <RecentActivityFeed
            data={recentActivity}
            isLoading={isLoadingRecentActivity}
          />
        </div>
      </div>
    </PageShell>
  );
}

// Helper for currency format in Hero Card
function formatCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString()}`;
}
