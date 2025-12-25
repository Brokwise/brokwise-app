"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBookmarks } from "@/hooks/useBookmarks";
import { PropertyCard } from "../_components/propertyCard";
import { EnquiryCard } from "../enquiries/_components/EnquiryCard";

const BookmarksPage = () => {
  const { bookmarks, isLoading } = useGetBookmarks();

  const properties = bookmarks?.properties ?? [];
  const enquiries = bookmarks?.enquiries ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-instrument-serif text-foreground tracking-tight">
          Bookmarks
        </h1>
        <p className="text-sm text-muted-foreground">
          Your saved properties and enquiries in one place.
        </p>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="rounded-full">
          <TabsTrigger value="properties" className="rounded-full">
            Saved Properties ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="rounded-full">
            Saved Enquiries ({enquiries.length})
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
                No saved properties yet. Bookmark a listing to find it here later.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property: any) => (
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
                No saved enquiries yet. Bookmark an enquiry to track it here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enquiries.map((enquiry: any) => (
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


