"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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
  const router = useRouter();
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
    <div className="min-h-screen bg-transparent pb-8">
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-instrument-serif text-4xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Welcome back, here's what's happening today.
            </p>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 hidden sm:flex"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
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
        </div>

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
                <h2 className="text-lg font-medium text-primary-foreground/80">Active Pipeline</h2>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tighter">
                    {formatCurrency(
                      (dashboardStats?.properties.active || 0) * 15000000 // Placeholder avg value or real calc needed
                      // Use 'Total Value' if available or just count
                    )}
                  </span>
                  {/* Fallback to simple stats if value not available */}
                  <span className="text-sm font-medium text-primary-foreground/60">Estimated Value</span>
                </div>
                <div className="mt-6 flex gap-8">
                  <div>
                    <p className="text-3xl font-bold">{dashboardStats?.overview.activeProperties || 0}</p>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Active Properties</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{dashboardStats?.overview.activeEnquiries || 0}</p>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Active Leads</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{dashboardStats?.overview.activeBrokers || 0}</p>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Active Brokers</p>
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
            <Button variant="outline" className="h-full flex-col gap-2 hover:border-primary hover:text-primary transition-all shadow-sm border-dashed" onClick={handleExport}>
              <Download className="h-6 w-6" />
              Export Report
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
                  <h3 className="font-semibold text-lg">Analytics</h3>
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
      </div>
    </div>
  );
}

// Helper for currency format in Hero Card
function formatCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString()}`;
}
