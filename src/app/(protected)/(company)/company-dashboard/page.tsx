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
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  IndianRupee,
  Download,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CompanyDashboard() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].startsWith("company-"),
  });

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

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("company-"),
    });
  };

  const handleExport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Company Dashboard Report", 14, 22);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let yPos = 40;

    // Overview Section
    if (dashboardStats) {
      doc.setFontSize(14);
      doc.text("Overview Stats", 14, yPos);
      yPos += 10;

      const statsData = [
        ["Total Brokers", dashboardStats.overview.totalBrokers],
        ["Active Brokers", dashboardStats.overview.activeBrokers],
        ["Total Properties", dashboardStats.overview.totalProperties],
        ["Active Properties", dashboardStats.overview.activeProperties],
        ["Total Enquiries", dashboardStats.overview.totalEnquiries],
        ["Active Enquiries", dashboardStats.overview.activeEnquiries],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: statsData,
        theme: "striped",
        headStyles: { fillColor: [66, 66, 66] },
      });

      // @ts-expect-error - jsPDF autotable types are incomplete
      yPos = doc.lastAutoTable.finalY + 20;
    }

    // Broker Performance Section
    if (brokerPerformance && brokerPerformance.brokers.length > 0) {
      doc.setFontSize(14);
      doc.text("Broker Performance", 14, yPos);
      yPos += 10;

      const brokerData = brokerPerformance.brokers.map((broker) => [
        broker.brokerName,
        broker.totalProperties,
        broker.soldProperties,
        broker.totalEnquiries,
        broker.status,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          ["Broker Name", "Total Properties", "Sold", "Enquiries", "Status"],
        ],
        body: brokerData,
        theme: "striped",
        headStyles: { fillColor: [66, 66, 66] },
      });

      // @ts-expect-error - jsPDF autotable types are incomplete
      yPos = doc.lastAutoTable.finalY + 20;
    }

    // Recent Activity Section
    if (recentActivity && recentActivity.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Recent Activity", 14, yPos);
      yPos += 10;

      const activityData = recentActivity.map((activity) => [
        activity.type === "property" ? "Property" : "Enquiry",
        activity.status,
        new Date(activity.createdAt).toLocaleDateString(),
        activity.type === "property"
          ? activity.propertyType || "-"
          : activity.enquiryType || "-",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Type", "Status", "Date", "Details"]],
        body: activityData,
        theme: "striped",
        headStyles: { fillColor: [66, 66, 66] },
      });
    }

    doc.save(`company-dashboard-${new Date().toISOString().split("T")[0]}.pdf`);
  };

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
              Overview of your company&apos;s performance and key metrics
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleRefresh}
              disabled={isFetching > 0}
            >
              <RefreshCcw
                className={`h-4 w-4 ${isFetching > 0 ? "animate-spin" : ""}`}
              />
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
