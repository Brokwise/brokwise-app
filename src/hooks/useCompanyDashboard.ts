import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

// Type definitions for KPI responses
export type TimeFrame = "WEEK" | "MONTH" | "YEAR";

export interface DashboardStats {
  overview: {
    totalBrokers: number;
    activeBrokers: number;
    totalProperties: number;
    activeProperties: number;
    totalEnquiries: number;
    activeEnquiries: number;
  };
  properties: {
    total: number;
    active: number;
    draft: number;
    sold: number;
    rented: number;
    expired: number;
    statusBreakdown: Record<string, number>;
  };
  enquiries: {
    total: number;
    active: number;
    completed: number;
    statusBreakdown: Record<string, number>;
  };
  recentActivity: {
    propertiesLast30Days: number;
    enquiriesLast30Days: number;
  };
}

export interface PropertyDistribution {
  byCategoryAndType: Array<{
    _id: {
      category: string;
      type: string;
    };
    total: number;
    avgPrice: number;
    totalValue: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  }>;
  byCity: Array<{
    _id: string;
    count: number;
    avgPrice: number;
    activeCount: number;
  }>;
  byPriceRange: Array<{
    range: string;
    count: number;
  }>;
}

export interface EnquiryAnalytics {
  bySource: Array<{
    _id: string;
    total: number;
    statusBreakdown: Array<{ status: string; count: number }>;
  }>;
  byType: Array<{
    _id: string;
    count: number;
    activeCount: number;
    completedCount: number;
  }>;
  conversion: {
    rate: string;
    completed: number;
    cancelled: number;
    active: number;
    total: number;
  };
  responseTime: {
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
  } | null;
}

export interface BrokerPerformance {
  timeFrame: string;
  brokers: Array<{
    brokerId: string;
    brokerName: string;
    status: string;
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    totalPropertyValue: number;
    totalEnquiries: number;
  }>;
  topPerformers: Array<{
    brokerId: string;
    brokerName: string;
    status: string;
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    totalPropertyValue: number;
    totalEnquiries: number;
  }>;
  summary: {
    totalBrokers: number;
    activeBrokers: number;
    avgPropertiesPerBroker: number | string;
  };
}

export interface TrendData {
  timeFrame: TimeFrame;
  period: {
    start: string;
    end: string;
  };
  trends: Array<{
    _id: string;
    total: number;
    breakdown: Array<{ status: string; count: number }>;
  }>;
}

export interface RecentActivity {
  type: "property" | "enquiry";
  id: string;
  status: string;
  createdAt: string;
  // Property fields
  category?: string;
  propertyType?: string;
  address?: {
    city?: string;
    state?: string;
  };
  price?: number;
  listedBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  // Enquiry fields
  enquiryType?: string;
  name?: string;
  broker?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface PropertyValueAnalytics {
  byCategory: Array<{
    _id: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalValue: number;
    count: number;
  }>;
  overall: {
    totalValue: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalProperties: number;
  };
  topValuedProperties: Array<{
    propertyCategory: string;
    propertyType: string;
    address: {
      city?: string;
      state?: string;
    };
    totalPrice: number;
    listingStatus: string;
  }>;
}

// Hooks for each KPI endpoint
export const useGetDashboardStats = () => {
  const api = useAxios();
  return useQuery<DashboardStats>({
    queryKey: ["company-dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/company/kpi/dashboard-stats");
      return response.data.data;
    },
  });
};

export const useGetPropertyDistribution = () => {
  const api = useAxios();
  return useQuery<PropertyDistribution>({
    queryKey: ["company-property-distribution"],
    queryFn: async () => {
      const response = await api.get("/company/kpi/property-distribution");
      return response.data.data;
    },
  });
};

export const useGetEnquiryAnalytics = () => {
  const api = useAxios();
  return useQuery<EnquiryAnalytics>({
    queryKey: ["company-enquiry-analytics"],
    queryFn: async () => {
      const response = await api.get("/company/kpi/enquiry-analytics");
      return response.data.data;
    },
  });
};

export const useGetBrokerPerformance = (timeFrame: TimeFrame = "MONTH") => {
  const api = useAxios();
  return useQuery<BrokerPerformance>({
    queryKey: ["company-broker-performance", timeFrame],
    queryFn: async () => {
      const response = await api.get(
        `/company/kpi/broker-performance?timeFrame=${timeFrame}`
      );
      return response.data.data;
    },
  });
};

export const useGetPropertyTrends = (timeFrame: TimeFrame = "MONTH") => {
  const api = useAxios();
  return useQuery<TrendData>({
    queryKey: ["company-property-trends", timeFrame],
    queryFn: async () => {
      const response = await api.get(
        `/company/kpi/property-trends?timeFrame=${timeFrame}`
      );
      return response.data.data;
    },
  });
};

export const useGetEnquiryTrends = (timeFrame: TimeFrame = "MONTH") => {
  const api = useAxios();
  return useQuery<TrendData>({
    queryKey: ["company-enquiry-trends", timeFrame],
    queryFn: async () => {
      const response = await api.get(
        `/company/kpi/enquiry-trends?timeFrame=${timeFrame}`
      );
      return response.data.data;
    },
  });
};

export const useGetRecentActivity = (limit: number = 10) => {
  const api = useAxios();
  return useQuery<RecentActivity[]>({
    queryKey: ["company-recent-activity", limit],
    queryFn: async () => {
      const response = await api.get(
        `/company/kpi/recent-activity?limit=${limit}`
      );
      return response.data.data;
    },
  });
};

export const useGetPropertyValueAnalytics = () => {
  const api = useAxios();
  return useQuery<PropertyValueAnalytics>({
    queryKey: ["company-property-value-analytics"],
    queryFn: async () => {
      const response = await api.get("/company/kpi/property-value-analytics");
      return response.data.data;
    },
  });
};
