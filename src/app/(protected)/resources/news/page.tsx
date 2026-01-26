"use client";

import React, { useState, useMemo } from "react";
import { useGetNews, useGetFeaturedNews } from "@/hooks/useNews";
import { NewsArticle } from "@/models/types/news";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  Clock,
  ExternalLink,
  Newspaper,
  TrendingUp,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { format, formatDistanceToNow } from "date-fns";
import { PageShell, PageHeader } from "@/components/ui/layout";

// Category options for filtering
const CATEGORIES = [
  { id: "all", label: "All News", icon: Newspaper },
  { id: "real estate", label: "Real Estate", icon: Building2 },
  { id: "property", label: "Property", icon: TrendingUp },
  { id: "housing", label: "Housing", icon: Building2 },
  { id: "infrastructure", label: "Infrastructure", icon: Building2 },
] as const;

// Helper function to format date
const formatPublishedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (diffInHours < 48) {
      return "Yesterday";
    }
    return format(date, "MMM d, yyyy");
  } catch {
    return "";
  }
};

// Get sentiment color
const getSentimentColor = (polarity?: string): string => {
  switch (polarity) {
    case "positive":
      return "text-emerald-600 dark:text-emerald-400";
    case "negative":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-amber-600 dark:text-amber-400";
  }
};

// Featured News Card Component
const FeaturedNewsCard = ({
  article,
  isMain = false,
}: {
  article: NewsArticle;
  isMain?: boolean;
}) => {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10",
        isMain ? "h-[280px] md:h-[320px]" : "h-[140px] md:h-[152px]"
      )}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        {/* Featured Badge */}
        {article.isFeatured && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
        )}

        {/* Title */}
        <h3
          className={cn(
            "font-semibold text-white transition-colors group-hover:text-primary-foreground",
            isMain
              ? "text-xl md:text-2xl lg:text-3xl leading-tight"
              : "text-base md:text-lg leading-snug line-clamp-2"
          )}
        >
          {article.title}
        </h3>

        {/* Description - only on main card */}
        {isMain && article.description && (
          <p className="mt-2 text-sm text-slate-300 line-clamp-2 md:line-clamp-3">
            {article.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            {article.source.name}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-500" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatPublishedDate(article.publishedAt)}
          </span>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute right-4 top-4 rounded-full bg-white/10 p-2 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4 text-white" />
      </div>
    </a>
  );
};

// News Card Component
const NewsCard = ({ article }: { article: NewsArticle }) => {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 pt-4">
          {/* Categories & Sentiment */}
          <div className="flex flex-wrap items-center gap-1.5">
            {article.sentiment && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-medium",
                  getSentimentColor(article.sentiment.overall.polarity)
                )}
              >
                {article.sentiment.overall.polarity}
              </Badge>
            )}
            {article.categories &&
              article.categories.slice(0, 2).map((cat, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-full border-border/50 bg-muted/50 px-2 py-0 text-[10px] font-normal text-muted-foreground"
                >
                  {cat.name}
                </Badge>
              ))}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {article.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80 truncate max-w-[120px]">
                {article.source.name}
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-border" />
              <span className="flex shrink-0 items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatPublishedDate(article.publishedAt)}
              </span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

// Loading Skeleton for Featured
const FeaturedSkeleton = ({ isMain = false }: { isMain?: boolean }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl bg-muted",
      isMain ? "h-[280px] md:h-[320px]" : "h-[140px] md:h-[152px]"
    )}
  >
    <Skeleton className="h-full w-full" />
    <div className="absolute bottom-0 left-0 right-0 space-y-3 p-4 md:p-6">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className={cn("h-6", isMain ? "w-4/5" : "w-3/4")} />
      {isMain && <Skeleton className="h-4 w-2/3" />}
      <div className="flex gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

// Loading Skeleton for News Card
const NewsCardSkeleton = () => (
  <Card className="overflow-hidden border-border/50">
    <CardContent className="space-y-3 p-4">
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-4" />
      </div>
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = ({ search }: { search?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-6 rounded-full bg-muted p-6">
      <Newspaper className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold text-foreground">No news found</h3>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
      {search
        ? `We couldn't find any news matching "${search}". Try adjusting your search or filters.`
        : "No news articles are available at the moment. Please check back later."}
    </p>
  </div>
);

// Main NewsPage Component
const NewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch featured news
  const { featuredNews, isLoading: isFeaturedLoading } = useGetFeaturedNews(4);

  // Fetch paginated news with filters
  const { news, pagination, isLoading, isFetching } = useGetNews({
    page: currentPage,
    limit: itemsPerPage,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    search: debouncedSearch || undefined,
  });

  // Combine featured and regular news, avoiding duplicates in the main grid
  const displayNews = useMemo(() => {
    const featuredIds = new Set(featuredNews.map((n) => n._id));
    return news.filter((n) => !featuredIds.has(n._id));
  }, [news, featuredNews]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <PageShell>
      <PageHeader
        title="Real Estate News"
        description="Stay updated with the latest real estate news, market trends, and property insights."
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Filter */}
        <ScrollArea className="w-full md:w-auto">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "shrink-0 gap-1.5 rounded-full transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border/50 bg-background hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category.label}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={handleSearch}
            className="h-10 pl-9 rounded-full border-border/50 bg-background"
          />
        </div>
      </div>

      {/* Featured News Section - Only show when not searching and on first page */}
      {!debouncedSearch && selectedCategory === "all" && currentPage === 1 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Featured Stories
            </h2>
          </div>

          {isFeaturedLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FeaturedSkeleton isMain />
              <div className="grid gap-4">
                <FeaturedSkeleton />
                <FeaturedSkeleton />
              </div>
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Main Featured */}
              <FeaturedNewsCard article={featuredNews[0]} isMain />

              {/* Side Featured */}
              <div className="grid gap-4">
                {featuredNews.slice(1, 3).map((article) => (
                  <FeaturedNewsCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* News Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {debouncedSearch
              ? `Search results for "${debouncedSearch}"`
              : selectedCategory !== "all"
                ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
                "News"
                }`
                : "Latest News"}
          </h2>
          {pagination.total > 0 && (
            <p className="text-sm text-muted-foreground">
              {pagination.total}{" "}
              {pagination.total === 1 ? "article" : "articles"}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        ) : displayNews.length > 0 ? (
          <>
            <div
              className={cn(
                "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-300",
                isFetching && "opacity-60"
              )}
            >
              {displayNews.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isFetching}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-4">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={isFetching}
                          className={cn(
                            "h-8 w-8 rounded-full p-0",
                            currentPage === pageNum && "pointer-events-none"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages || isFetching}
                  className="rounded-full"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState search={debouncedSearch} />
        )}
      </section>
    </PageShell>
  );
};

export default NewsPage;
