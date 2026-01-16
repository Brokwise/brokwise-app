import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import React from "react";

export const EmptyState = ({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center">
    <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
      <Building2 className="h-7 w-7 text-muted-foreground/60" />
    </div>
    <h3 className="text-2xl font-instrument-serif text-foreground mb-2">
      No properties found
    </h3>
    <p className="text-muted-foreground max-w-sm font-light">
      We couldn&apos;t find any properties matching your criteria. Try adjusting
      your filters.
    </p>
    <Button
      type="button"
      variant="link"
      className="mt-4 text-accent"
      onClick={onClearFilters}
    >
      Clear all filters
    </Button>
  </div>
);

export const EmptyEnquiriesState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center">
    <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
      <Building2 className="h-7 w-7 text-muted-foreground/60" />
    </div>
    <h3 className="text-2xl font-instrument-serif text-foreground mb-2">
      No enquiries found
    </h3>
    <p className="text-muted-foreground max-w-sm font-light">
      We couldn&apos;t find any enquiries matching your search.
    </p>
  </div>
);
