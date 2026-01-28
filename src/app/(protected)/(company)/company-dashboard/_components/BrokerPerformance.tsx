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
import { BrokerPerformance, TimeFrame } from "@/hooks/useCompanyDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Trophy,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BrokerPerformanceProps {
  data: BrokerPerformance | undefined;
  isLoading: boolean;
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const chartConfig: ChartConfig = {
  totalProperties: {
    label: "Total Properties",
    color: "hsl(var(--chart-1))",
  },
  activeProperties: {
    label: "Active",
    color: "hsl(var(--chart-2))",
  },
  soldProperties: {
    label: "Sold",
    color: "hsl(var(--chart-3))",
  },
};

function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString()}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BrokerPerformanceCard({
  data,
  isLoading,
  timeFrame,
  onTimeFrameChange,
}: BrokerPerformanceProps) {
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
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Prepare data for the chart (top 10 brokers)
  const chartData = data.brokers.slice(0, 10).map((broker) => ({
    name:
      broker.brokerName.length > 12
        ? broker.brokerName.slice(0, 12) + "..."
        : broker.brokerName,
    fullName: broker.brokerName,
    totalProperties: broker.totalProperties,
    activeProperties: broker.activeProperties,
    soldProperties: broker.soldProperties,
    totalValue: broker.totalPropertyValue,
    totalEnquiries: broker.totalEnquiries,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Users className="h-5 w-5 text-primary" />
                Broker Performance
              </CardTitle>
              <CardDescription>
                Property and enquiry metrics by broker
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
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Users className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <Typography variant="muted">Total Brokers</Typography>
                <Typography variant="large">
                  {data.summary.totalBrokers}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <Typography variant="muted">Active Brokers</Typography>
                <Typography variant="large">
                  {data.summary.activeBrokers}
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <Typography variant="muted">Avg Properties</Typography>
                <Typography variant="large">
                  {data.summary.avgPropertiesPerBroker}
                </Typography>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          {data.topPerformers.length > 0 && (
            <div>
              <Typography variant="h4" className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top Performers
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.topPerformers.slice(0, 3).map((broker, index) => (
                  <div
                    key={broker.brokerId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={
                            index === 0
                              ? "bg-amber-500/20 text-amber-600"
                              : index === 1
                                ? "bg-slate-400/20 text-slate-600"
                                : "bg-orange-400/20 text-orange-600"
                          }
                        >
                          {getInitials(broker.brokerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                          ? "bg-amber-500 text-white"
                          : index === 1
                            ? "bg-slate-400 text-white"
                            : "bg-orange-400 text-white"
                          }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography variant="p" className="font-medium truncate">
                        {broker.brokerName}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Typography variant="small" className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {broker.totalProperties}
                        </Typography>
                        <Typography variant="small" className="text-muted-foreground flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(broker.totalPropertyValue)}
                        </Typography>
                      </div>
                    </div>
                    <Badge
                      variant={
                        broker.status === "approved" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {broker.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Chart */}
          {chartData.length > 0 ? (
            <div>
              <Typography variant="h4" className="mb-3">
                Property Distribution
              </Typography>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullName;
                          }
                          return "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="totalProperties"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    name="Total"
                  />
                  <Bar
                    dataKey="activeProperties"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                    name="Active"
                  />
                  <Bar
                    dataKey="soldProperties"
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                    name="Sold"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No broker data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
