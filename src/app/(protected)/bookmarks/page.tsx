"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBookmarks } from "@/hooks/useBookmarks";
import { PropertyCard } from "../_components/propertyCard";
import { EnquiryCard } from "../enquiries/_components/EnquiryCard";
import { useTranslation } from "react-i18next";

const BookmarksPage = () => {
  const { t } = useTranslation();
  const { bookmarks, isLoading } = useGetBookmarks();

  const properties = bookmarks?.properties ?? [];
  const enquiries = bookmarks?.enquiries ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-instrument-serif text-foreground tracking-tight">
          {t("page_bookmarks_title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("page_bookmarks_subtitle")}
        </p>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="rounded-full">
          <TabsTrigger value="properties" className="rounded-full">
            {t("page_bookmarks_saved_properties")} ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="rounded-full">
            {t("page_bookmarks_saved_enquiries")} ({enquiries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-center max-w-sm">
                {t("page_bookmarks_empty_properties")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enquiries" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-center max-w-sm">
                {t("page_bookmarks_empty_enquiries")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry._id} enquiry={enquiry} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookmarksPage;


