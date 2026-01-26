"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBookmarks } from "@/hooks/useBookmarks";
import { PropertyCard } from "../_components/propertyCard";
import { EnquiryCard } from "../enquiries/_components/EnquiryCard";
import { useTranslation } from "react-i18next";
import { PageShell, PageHeader, PageGrid } from "@/components/ui/layout";

const BookmarksPage = () => {
  const { t } = useTranslation();
  const { bookmarks, isLoading } = useGetBookmarks();

  const properties = bookmarks?.properties ?? [];
  const enquiries = bookmarks?.enquiries ?? [];

  return (
    <PageShell>
      <PageHeader
        title={t("page_bookmarks_title")}
        description={t("page_bookmarks_subtitle")}
      />

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
            <PageGrid>
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
            </PageGrid>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-center max-w-sm">
                {t("page_bookmarks_empty_properties")}
              </p>
            </div>
          ) : (
            <PageGrid>
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </PageGrid>
          )}
        </TabsContent>

        <TabsContent value="enquiries" className="mt-6">
          {isLoading ? (
            <PageGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
              ))}
            </PageGrid>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-center max-w-sm">
                {t("page_bookmarks_empty_enquiries")}
              </p>
            </div>
          ) : (
            <PageGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry._id} enquiry={enquiry} />
              ))}
            </PageGrid>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
};

export default BookmarksPage;


