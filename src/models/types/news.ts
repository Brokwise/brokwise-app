// News Types for the broker app

export interface NewsSource {
  domain: string;
  url: string;
  name: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

export interface NewsAuthor {
  name?: string;
}

export interface NewsCategory {
  name: string;
}

export interface NewsSentiment {
  overall: {
    polarity: "positive" | "negative" | "neutral";
    score: number;
  };
}

export interface NewsArticle {
  _id: string;
  externalId: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: NewsSource;
  author?: NewsAuthor;
  categories?: NewsCategory[];
  sentiment?: NewsSentiment;
  keywords?: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  pagination: NewsPagination;
}

export interface SingleNewsResponse {
  success: boolean;
  data: NewsArticle;
}

export interface NewsFilters {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
