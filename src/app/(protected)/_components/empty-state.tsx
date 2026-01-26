"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
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
      <Typography variant="h3" className="mb-2">
        {t("empty_no_properties")}
      </Typography>
      <Typography variant="muted" className="max-w-sm">
        {t("empty_no_properties_desc")}
      </Typography>
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
      <Typography variant="h3" className="mb-2">
        {t("empty_no_enquiries")}
      </Typography>
      <Typography variant="muted" className="max-w-sm">
        {t("empty_no_enquiries_desc")}
      </Typography>
    </div>
  );
};

export const EmptyListingsState = () => {
  const { t } = useTranslation();

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
        <Building2 className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <Typography variant="h3" className="mb-2">
        {t("empty_no_listings")}
      </Typography>
      <Typography variant="muted" className="max-w-sm">
        {t("empty_no_listings_desc")}
      </Typography>
      <Button asChild className="mt-6">
        <Link href="/property/createProperty">
          <Plus className="h-4 w-4 mr-2" />
          {t("action_add_first_property")}
        </Link>
      </Button>
    </div>
  );
};
