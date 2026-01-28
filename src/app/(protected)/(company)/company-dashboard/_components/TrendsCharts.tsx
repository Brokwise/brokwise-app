"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendData, TimeFrame } from "@/hooks/useCompanyDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  Building2,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface TrendsChartsProps {
  propertyTrends: TrendData | undefined;
  enquiryTrends: TrendData | undefined;
  isLoadingProperty: boolean;
  isLoadingEnquiry: boolean;
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const propertyChartConfig: ChartConfig = {
  total: {
    label: "Properties",
    color: "hsl(var(--chart-1))",
  },
};

const enquiryChartConfig: ChartConfig = {
  total: {
    label: "Enquiries",
    color: "hsl(var(--chart-2))",
  },
};

function formatDate(dateStr: string, timeFrame: TimeFrame): string {
  try {
    if (timeFrame === "YEAR") {
      // Format: 2024-01
      const [year, month] = dateStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, "MMM yy");
    } else {
      // Format: 2024-01-15
      const date = parseISO(dateStr);
      return format(date, "dd MMM");
    }
  } catch {
    return dateStr;
  }
}

function calculateGrowth(data: Array<{ total: number }>): {
  trend: "up" | "down" | "neutral";
  percentage: number;
} {
  if (data.length < 2) return { trend: "neutral", percentage: 0 };

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstSum = firstHalf.reduce((sum, d) => sum + d.total, 0);
  const secondSum = secondHalf.reduce((sum, d) => sum + d.total, 0);

  if (firstSum === 0) {
    return secondSum > 0
      ? { trend: "up", percentage: 100 }
      : { trend: "neutral", percentage: 0 };
  }

  const percentage = ((secondSum - firstSum) / firstSum) * 100;
  return {
    trend: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral",
    percentage: Math.abs(percentage),
  };
}

export function TrendsCharts({
  propertyTrends,
  enquiryTrends,
  isLoadingProperty,
  isLoadingEnquiry,
  timeFrame,
  onTimeFrameChange,
}: TrendsChartsProps) {
  const isLoading = isLoadingProperty || isLoadingEnquiry;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56 mt-2" />
            </div>
            <Skeleton className="h-9 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process property trends data
  const propertyData =
    propertyTrends?.trends.map((t) => ({
      date: formatDate(t._id, timeFrame),
      rawDate: t._id,
      total: t.total,
    })) || [];

  // Process enquiry trends data
  const enquiryData =
    enquiryTrends?.trends.map((t) => ({
      date: formatDate(t._id, timeFrame),
      rawDate: t._id,
      total: t.total,
    })) || [];

  const propertyGrowth = calculateGrowth(propertyData);
  const enquiryGrowth = calculateGrowth(enquiryData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
                Activity Trends
              </CardTitle>
              <CardDescription>
                Properties and enquiries over time
              </CardDescription>
            </div>
            <Tabs
              value={timeFrame}
              onValueChange={(v) => onTimeFrameChange(v as TimeFrame)}
            >
              <TabsList>
                <TabsTrigger value="WEEK">Week</TabsTrigger>
                <TabsTrigger value="MONTH">Month</TabsTrigger>
                <TabsTrigger value="YEAR">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Trends */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <Typography variant="p" className="font-medium">Properties</Typography>
                </div>
                {propertyGrowth.trend !== "neutral" && (
                  <Typography
                    variant="small"
                    className={
                      propertyGrowth.trend === "up"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {propertyGrowth.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 inline mr-1" />
                    )}
                    {propertyGrowth.percentage.toFixed(1)}%
                  </Typography>
                )}
              </div>
              {propertyData.length > 0 ? (
                <ChartContainer
                  config={propertyChartConfig}
                  className="h-[250px]"
                >
                  <AreaChart
                    data={propertyData}
                    margin={{ left: 0, right: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="propertyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--chart-1))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--chart-1))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#propertyGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground border rounded-lg">
                  No data for selected period
                </div>
              )}
            </div>

            {/* Enquiry Trends */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                  </div>
                  <Typography variant="p" className="font-medium">Enquiries</Typography>
                </div>
                {enquiryGrowth.trend !== "neutral" && (
                  <Typography
                    variant="small"
                    className={
                      enquiryGrowth.trend === "up"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {enquiryGrowth.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 inline mr-1" />
                    )}
                    {enquiryGrowth.percentage.toFixed(1)}%
                  </Typography>
                )}
              </div>
              {enquiryData.length > 0 ? (
                <ChartContainer
                  config={enquiryChartConfig}
                  className="h-[250px]"
                >
                  <AreaChart data={enquiryData} margin={{ left: 0, right: 10 }}>
                    <defs>
                      <linearGradient
                        id="enquiryGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--chart-2))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      fill="url(#enquiryGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground border rounded-lg">
                  No data for selected period
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
