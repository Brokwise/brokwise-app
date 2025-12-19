"use client";

import { useState } from "react";
import {
  useGetDashboardStats,
  useGetPropertyDistribution,
  useGetEnquiryAnalytics,
  useGetBrokerPerformance,
  useGetPropertyTrends,
  useGetEnquiryTrends,
  useGetRecentActivity,
  useGetPropertyValueAnalytics,
  TimeFrame,
} from "@/hooks/useCompanyDashboard";
import { DashboardStatsCards } from "./_components/DashboardStats";
import { PropertyDistributionCharts } from "./_components/PropertyDistribution";
import { EnquiryAnalyticsCharts } from "./_components/EnquiryAnalytics";
import { BrokerPerformanceCard } from "./_components/BrokerPerformance";
import { TrendsCharts } from "./_components/TrendsCharts";
import { RecentActivityFeed } from "./_components/RecentActivity";
import { PropertyValueAnalyticsCard } from "./_components/PropertyValueAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  IndianRupee,
  Calendar as CalendarIcon,
  Download,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompanyDashboard() {
  const [brokerTimeFrame, setBrokerTimeFrame] = useState<TimeFrame>("MONTH");
  const [trendsTimeFrame, setTrendsTimeFrame] = useState<TimeFrame>("MONTH");

  // Fetch all dashboard data
  const { data: dashboardStats, isLoading: isLoadingStats } =
    useGetDashboardStats();
  const { data: propertyDistribution, isLoading: isLoadingDistribution } =
    useGetPropertyDistribution();
  const { data: enquiryAnalytics, isLoading: isLoadingEnquiryAnalytics } =
    useGetEnquiryAnalytics();
  const { data: brokerPerformance, isLoading: isLoadingBrokerPerformance } =
    useGetBrokerPerformance(brokerTimeFrame);
  const { data: propertyTrends, isLoading: isLoadingPropertyTrends } =
    useGetPropertyTrends(trendsTimeFrame);
  const { data: enquiryTrends, isLoading: isLoadingEnquiryTrends } =
    useGetEnquiryTrends(trendsTimeFrame);
  const { data: recentActivity, isLoading: isLoadingRecentActivity } =
    useGetRecentActivity(15);
  const { data: propertyValueAnalytics, isLoading: isLoadingValueAnalytics } =
    useGetPropertyValueAnalytics();

  return (
    <div className="min-h-screen bg-background/50">
      <div className="py-8 space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Overview of your company's performance and key metrics
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="hidden sm:flex items-center gap-2 bg-background border rounded-md px-3 py-1.5 shadow-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last 30 Days
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* KPI Stats */}
        <DashboardStatsCards data={dashboardStats} isLoading={isLoadingStats} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent space-x-6">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Properties</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="enquiries"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Enquiries</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="brokers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Brokers</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="value"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  <span>Value</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-2">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Trends (2/3) */}
              <div className="xl:col-span-2 space-y-6">
                <TrendsCharts
                  propertyTrends={propertyTrends}
                  enquiryTrends={enquiryTrends}
                  isLoadingProperty={isLoadingPropertyTrends}
                  isLoadingEnquiry={isLoadingEnquiryTrends}
                  timeFrame={trendsTimeFrame}
                  onTimeFrameChange={setTrendsTimeFrame}
                />
              </div>

              {/* Right Column: Recent Activity (1/3) */}
              <div className="xl:col-span-1">
                <RecentActivityFeed
                  data={recentActivity}
                  isLoading={isLoadingRecentActivity}
                />
              </div>
            </div>

            {/* Bottom Row: Property Distribution (Full Width) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                Distribution Analytics
              </h3>
              <PropertyDistributionCharts
                data={propertyDistribution}
                isLoading={isLoadingDistribution}
              />
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6 pt-2">
            <PropertyDistributionCharts
              data={propertyDistribution}
              isLoading={isLoadingDistribution}
            />
            <PropertyValueAnalyticsCard
              data={propertyValueAnalytics}
              isLoading={isLoadingValueAnalytics}
            />
          </TabsContent>

          {/* Enquiries Tab */}
          <TabsContent value="enquiries" className="space-y-6 pt-2">
            <EnquiryAnalyticsCharts
              data={enquiryAnalytics}
              isLoading={isLoadingEnquiryAnalytics}
            />
            <TrendsCharts
              propertyTrends={propertyTrends}
              enquiryTrends={enquiryTrends}
              isLoadingProperty={isLoadingPropertyTrends}
              isLoadingEnquiry={isLoadingEnquiryTrends}
              timeFrame={trendsTimeFrame}
              onTimeFrameChange={setTrendsTimeFrame}
            />
          </TabsContent>

          {/* Brokers Tab */}
          <TabsContent value="brokers" className="space-y-6 pt-2">
            <BrokerPerformanceCard
              data={brokerPerformance}
              isLoading={isLoadingBrokerPerformance}
              timeFrame={brokerTimeFrame}
              onTimeFrameChange={setBrokerTimeFrame}
            />
          </TabsContent>

          {/* Value Tab */}
          <TabsContent value="value" className="space-y-6 pt-2">
            <PropertyValueAnalyticsCard
              data={propertyValueAnalytics}
              isLoading={isLoadingValueAnalytics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
