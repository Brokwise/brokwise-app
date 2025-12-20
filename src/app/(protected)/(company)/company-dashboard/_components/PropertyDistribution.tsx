"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyDistribution } from "@/hooks/useCompanyDashboard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

interface PropertyDistributionChartsProps {
  data: PropertyDistribution | undefined;
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
];

const categoryChartConfig: ChartConfig = {
  count: {
    label: "Properties",
  },
  RESIDENTIAL: {
    label: "Residential",
    color: "hsl(var(--chart-1))",
  },
  COMMERCIAL: {
    label: "Commercial",
    color: "hsl(var(--chart-2))",
  },
  INDUSTRIAL: {
    label: "Industrial",
    color: "hsl(var(--chart-3))",
  },
  AGRICULTURAL: {
    label: "Agricultural",
    color: "hsl(var(--chart-4))",
  },
  FARMHOUSE: {
    label: "Farmhouse",
    color: "hsl(var(--chart-5))",
  },
  RESORT: {
    label: "Resort",
    color: "hsl(220, 70%, 50%)",
  },
};

const priceRangeConfig: ChartConfig = {
  count: {
    label: "Properties",
    color: "hsl(var(--primary))",
  },
};

const cityConfig: ChartConfig = {
  count: {
    label: "Properties",
    color: "hsl(var(--chart-2))",
  },
};

export function PropertyDistributionCharts({
  data,
  isLoading,
}: PropertyDistributionChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Process category data for pie chart
  const categoryData = data.byCategoryAndType.reduce((acc, item) => {
    const category = item._id.category;
    const existing = acc.find((a) => a.name === category);
    if (existing) {
      existing.value += item.total;
    } else {
      acc.push({ name: category, value: item.total });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Process city data for bar chart
  const cityData = data.byCity.slice(0, 6).map((city) => ({
    name: city._id || "Unknown",
    count: city.count,
    avgPrice: city.avgPrice,
  }));

  // Price range data
  const priceRangeData = data.byPriceRange.map((range) => ({
    name: range.range,
    count: range.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Category Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Property Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ChartContainer
                config={categoryChartConfig}
                className="mx-auto aspect-square h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <span className="capitalize">
                            {String(name).toLowerCase()}: {value}
                          </span>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {item.name.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* City Distribution Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Top Cities</CardTitle>
            <CardDescription>Properties by city</CardDescription>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ChartContainer config={cityConfig} className="h-[250px]">
                <BarChart
                  data={cityData}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={70}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Price Range Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Price Range</CardTitle>
            <CardDescription>Properties by price bracket</CardDescription>
          </CardHeader>
          <CardContent>
            {priceRangeData.some((d) => d.count > 0) ? (
              <ChartContainer config={priceRangeConfig} className="h-[250px]">
                <BarChart data={priceRangeData} margin={{ bottom: 20 }}>
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
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
