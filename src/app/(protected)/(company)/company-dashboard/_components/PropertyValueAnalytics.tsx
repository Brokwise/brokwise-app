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
import { PropertyValueAnalytics } from "@/hooks/useCompanyDashboard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { motion } from "framer-motion";
import {
  IndianRupee,
  TrendingUp,
  Building2,
  ArrowUpRight,
  Gem,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyValueAnalyticsProps {
  data: PropertyValueAnalytics | undefined;
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  avgPrice: {
    label: "Avg Price",
    color: "hsl(var(--chart-4))",
  },
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  return `₹${value.toLocaleString()}`;
}

function formatCurrencyShort(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(1)}L`;
  }
  return value.toLocaleString();
}

export function PropertyValueAnalyticsCard({
  data,
  isLoading,
}: PropertyValueAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Prepare category data for chart
  const categoryData = data.byCategory.map((cat) => ({
    name: cat._id || "Unknown",
    avgPrice: cat.avgPrice,
    totalValue: cat.totalValue,
    count: cat.count,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <IndianRupee className="h-5 w-5 text-primary" />
            Property Value Analytics
          </CardTitle>
          <CardDescription>
            Portfolio value breakdown and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <Typography variant="small" className="text-muted-foreground">
                  Total Portfolio
                </Typography>
              </div>
              <Typography variant="value" className="text-emerald-600">
                {formatCurrency(data.overall.totalValue)}
              </Typography>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <Typography variant="small" className="text-muted-foreground">Avg Price</Typography>
              </div>
              <Typography variant="value" className="text-blue-600">
                {formatCurrency(data.overall.avgPrice)}
              </Typography>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-violet-600" />
                <Typography variant="small" className="text-muted-foreground">Max Price</Typography>
              </div>
              <Typography variant="value" className="text-violet-600">
                {formatCurrency(data.overall.maxPrice)}
              </Typography>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-amber-600" />
                <Typography variant="small" className="text-muted-foreground">
                  Total Properties
                </Typography>
              </div>
              <Typography variant="value" className="text-amber-600">
                {data.overall.totalProperties}
              </Typography>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Price by Category Chart */}
            <div>
              <Typography variant="h4" className="mb-3">
                Average Price by Category
              </Typography>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[220px]">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCurrencyShort(v)}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v.length > 10 ? v.slice(0, 10) + "..." : v
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar dataKey="avgPrice" radius={[0, 4, 4, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground border rounded-lg">
                  No data available
                </div>
              )}
            </div>

            {/* Top Valued Properties */}
            <div>
              <Typography variant="h4" className="flex items-center gap-2 mb-3">
                <Gem className="h-4 w-4 text-amber-500" />
                Top Valued Properties
              </Typography>
              <div className="space-y-3">
                {data.topValuedProperties.length > 0 ? (
                  data.topValuedProperties.map((property, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                          ? "bg-amber-500/20 text-amber-600"
                          : index === 1
                            ? "bg-slate-400/20 text-slate-600"
                            : index === 2
                              ? "bg-orange-400/20 text-orange-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography variant="p" className="font-medium truncate capitalize">
                          {property.propertyCategory?.toLowerCase()}{" "}
                          <Typography variant="muted" as="span">
                            {property.propertyType?.toLowerCase()}
                          </Typography>
                        </Typography>
                        <Typography variant="small" className="text-muted-foreground truncate">
                          {property.address?.city}
                          {property.address?.state &&
                            `, ${property.address.state}`}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="p" className="font-semibold text-emerald-600">
                          {formatCurrency(property.totalPrice)}
                        </Typography>
                        <Badge variant="outline" className="text-xs mt-1">
                          {property.listingStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-[180px] text-muted-foreground border rounded-lg">
                    No properties found
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
