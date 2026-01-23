"use client";

import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export const EmptyState = ({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
        <Building2 className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <h3 className="text-2xl font-instrument-serif text-foreground mb-2">
        {t("empty_no_properties")}
      </h3>
      <p className="text-muted-foreground max-w-sm font-light">
        {t("empty_no_properties_desc")}
      </p>
      <Button
        type="button"
        variant="link"
        className="mt-4 text-accent"
        onClick={onClearFilters}
      >
        {t("action_clear_filters")}
      </Button>
    </div>
  );
};

export const EmptyEnquiriesState = () => {
  const { t } = useTranslation();
  
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
        <Building2 className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <h3 className="text-2xl font-instrument-serif text-foreground mb-2">
        {t("empty_no_enquiries")}
      </h3>
      <p className="text-muted-foreground max-w-sm font-light">
        {t("empty_no_enquiries_desc")}
      </p>
    </div>
  );
};
