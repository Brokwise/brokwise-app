"use client";

import { useGetCompanyProperties } from "@/hooks/useCompany";
import { useGetMyListings } from "@/hooks/useProperty";
import { useApp } from "@/context/AppContext";
import { Property, PropertyCategory } from "@/types/property";
import { propertyCategories } from "@/constants";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const DraftPropertyPage = () => {
  const { companyData } = useApp();
  const router = useRouter();
  const { t } = useTranslation();

  const { myListings, isLoading: isBrokerLoading } = useGetMyListings({
    enabled: !companyData,
  });

  const { data: companyPropertiesData, isLoading: isCompanyLoading } =
    useGetCompanyProperties(
      { listingStatus: "DRAFT" },
      { enabled: !!companyData }
    );

  const isLoading = companyData ? isCompanyLoading : isBrokerLoading;

  const drafts = companyData
    ? companyPropertiesData?.properties || []
    : myListings?.filter((p) => p.listingStatus === "DRAFT") || [];

  const handleDraftSelect = (draft: Property) => {
    // Navigate to create property page with draft data
    router.push(
      `/property/createProperty?draftId=${draft._id}&category=${draft.propertyCategory}`
    );
  };

  const getCategoryLabel = (category: PropertyCategory) => {
    return (
      propertyCategories.find((c) => c.key === category)?.label || category
    );
  };

  return (
    <PageShell>
      <PageHeader
        title={t("page_property_drafts_title")}
        description={t("page_property_drafts_subtitle")}
      >
        {drafts.length > 0 && (
          <Badge
            variant="secondary"
            className="rounded-full text-sm px-3 py-0.5"
          >
            {drafts.length}
          </Badge>
        )}
      </PageHeader>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Inbox className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-medium text-foreground">
              No drafts found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You don&apos;t have any property drafts. Start creating a new
              property listing.
            </p>
          </div>
          <Button
            onClick={() => router.push("/property/createProperty")}
            className="mt-2"
          >
            Create New Property
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {drafts.map((draft) => {
            const lastEdited = draft.updatedAt
              ? formatDistanceToNow(new Date(draft.updatedAt), {
                addSuffix: true,
              })
              : "recently";

            return (
              <motion.div
                key={draft._id}
                variants={itemVariants}
                className="group bg-card hover:bg-muted/40 border border-border/60 rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col gap-3 relative overflow-hidden hover:border-accent/30"
                onClick={() => handleDraftSelect(draft)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDraftSelect(draft);
                  }
                }}
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-accent/5 text-accent border-accent/20"
                  >
                    {getCategoryLabel(draft.propertyCategory)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-5 bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                  >
                    Draft
                  </Badge>
                </div>

                {/* Property Info */}
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium text-base text-foreground leading-tight line-clamp-1">
                    {draft.propertyTitle ||
                      getCategoryLabel(draft.propertyCategory)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {draft.address?.city
                      ? `${draft.address.city}, ${draft.address.state}`
                      : "Location not set"}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
                  <span className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">
                    {lastEdited}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-xs hover:bg-accent/10 hover:text-accent group-hover:bg-accent/10 group-hover:text-accent transition-colors"
                  >
                    Resume <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageShell>
  );
};

export default DraftPropertyPage;
