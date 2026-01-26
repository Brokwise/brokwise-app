"use client";
import {
  useGetCompanyProperties,
  useCreateCompanyProperty,
  useSaveCompanyPropertyDraft,
} from "@/hooks/useCompany";
import { Button as MovingBorderCard } from "@/components/ui/moving-border";
import { ArrowLeft, Sparkles, FileText, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { PropertyFormData } from "@/validators/property";
import { useApp } from "@/context/AppContext";
import { Property, PropertyCategory } from "@/types/property";
import { useState, useEffect } from "react";
import { useGetMyListings, useGetProperty } from "@/hooks/useProperty";
import { ResortWizard } from "./resortForm/wizard";
import { FarmHouseWizard } from "./farmhouseForm/wizard";
import { AgriculturalWizard } from "./agriculturalForm/wizard";
import { IndustrialWizard } from "./industrialForm/wizard";
import { CommercialWizard } from "./commercialForm/wizard";
import { ResidentialWizard } from "./residentialForm/wizard";
import { Button } from "@/components/ui/button";
import { propertyCategories } from "@/constants";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to map category keys to translation keys
const getCategoryTranslationKey = (key: PropertyCategory): string => {
  const map: Record<PropertyCategory, string> = {
    RESIDENTIAL: "category_residential",
    COMMERCIAL: "category_commercial",
    INDUSTRIAL: "category_industrial",
    AGRICULTURAL: "category_agricultural",
    RESORT: "category_resort",
    FARM_HOUSE: "category_farmhouse",
  };
  return map[key];
};

const getCategoryDescTranslationKey = (key: PropertyCategory): string => {
  const map: Record<PropertyCategory, string> = {
    RESIDENTIAL: "category_residential_desc",
    COMMERCIAL: "category_commercial_desc",
    INDUSTRIAL: "category_industrial_desc",
    AGRICULTURAL: "category_agricultural_desc",
    RESORT: "category_resort_desc",
    FARM_HOUSE: "category_farmhouse_desc",
  };
  return map[key];
};

const CreateProperty = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Property | null>(null);
  const { companyData } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get draft info from URL params (when coming from drafts page)
  const draftIdFromUrl = searchParams.get("draftId");
  const categoryFromUrl = searchParams.get("category") as PropertyCategory;

  const {
    addPropertyAsync: createCompanyPropertyAsync,
    isLoading: isCreatingCompanyProperty,
  } = useCreateCompanyProperty();
  const { savePropertyAsDraft: saveCompanyPropertyDraft } =
    useSaveCompanyPropertyDraft();

  const { myListings } = useGetMyListings({
    enabled: !companyData,
  });

  const { data: companyPropertiesData } = useGetCompanyProperties(
    { listingStatus: "DRAFT" },
    { enabled: !!companyData }
  );

  // Fetch specific draft if coming from drafts page
  const { property: draftProperty } = useGetProperty(draftIdFromUrl || "", {
    enabled: !!draftIdFromUrl,
  });

  const drafts = companyData
    ? companyPropertiesData?.properties || []
    : myListings?.filter((p) => p.listingStatus === "DRAFT") || [];

  const draftsCount = drafts.length;

  // Handle URL params for draft selection
  useEffect(() => {
    if (draftIdFromUrl && categoryFromUrl && draftProperty) {
      setSelectedCategory(categoryFromUrl);
      setSelectedDraft(draftProperty);
    }
  }, [draftIdFromUrl, categoryFromUrl, draftProperty]);

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
    setSelectedDraft(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedDraft(null);
    // Clear URL params when going back
    if (draftIdFromUrl) {
      router.replace("/property/createProperty");
    }
  };

  const handleCompanySubmit = async (data: PropertyFormData) => {
    try {
      await createCompanyPropertyAsync({ ...data });
      // Reset state and navigate to success page after successful submission
      setSelectedCategory(null);
      setSelectedDraft(null);
      router.replace("/property/createProperty/success");
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error(t("toast_error_property_create"));
    }
  };

  const handleCompanySaveDraft = (data: PropertyFormData) => {
    saveCompanyPropertyDraft({ ...data });
  };

  const renderCategoryForm = () => {
    const props = {
      onBack: handleBack,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialData: selectedDraft ? (selectedDraft as any) : undefined,
      onSubmit: companyData ? handleCompanySubmit : undefined,
      onSaveDraft: companyData ? handleCompanySaveDraft : undefined,
      externalIsLoading: companyData ? isCreatingCompanyProperty : undefined,
      draftCount: draftsCount,
      isEditingDraft: !!selectedDraft,
    };

    switch (selectedCategory) {
      case "RESIDENTIAL":
        return <ResidentialWizard {...props} />;
      case "COMMERCIAL":
        return <CommercialWizard {...props} />;
      case "INDUSTRIAL":
        return <IndustrialWizard {...props} />;
      case "AGRICULTURAL":
        return <AgriculturalWizard {...props} />;
      case "RESORT":
        return <ResortWizard {...props} />;
      case "FARM_HOUSE":
        return <FarmHouseWizard {...props} />;
      default:
        return null;
    }
  };

  return (
    <PageShell>
      {!selectedCategory ? (
        <>
          <PageHeader
            title={t("page_create_property_title")}
            description={t("page_create_property_subtitle")}
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Drafts Summary Banner */}
            {draftsCount > 0 && (
              <motion.div
                variants={itemVariants}
                className="group bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl p-4 cursor-pointer hover:border-yellow-500/40 transition-all duration-200 hover:shadow-sm"
                onClick={() => router.push("/property/drafts")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push("/property/drafts");
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                          {draftsCount === 1
                            ? t("page_create_property_incomplete", { count: draftsCount })
                            : t("page_create_property_incomplete_plural", { count: draftsCount })}
                        </h1>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-5 bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                        >
                          {t("label_draft")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("page_create_property_continue_desc")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-500/10 group-hover:bg-yellow-500/10"
                  >
                    {t("page_create_property_view_drafts")}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Categories Grid */}
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="w-4 h-4" />
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("label_property_categories")}
                </h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {propertyCategories.map((category) => (
                  <MovingBorderCard
                    key={category.key}
                    duration={3000}
                    borderRadius="0.75rem"
                    rx="12px"
                    ry="12px"
                    as={motion.div}
                    variants={itemVariants}
                    onClick={() => handleCategorySelect(category.key)}
                    containerClassName="h-40 w-full overflow-hidden bg-transparent p-[2px]"
                    className="bg-transparent border-none p-0 items-start justify-start"
                    borderClassName="h-24 w-24 opacity-100 bg-[radial-gradient(#3b82f6_30%,#06b6d4_50%,transparent_70%)]"
                  >
                    <div className="relative w-full h-full group cursor-pointer overflow-hidden rounded-xl">
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="absolute inset-0 p-3 flex flex-col justify-end">
                        <div className="transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                            {t(getCategoryTranslationKey(category.key))}
                          </h1>
                          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                            <span className="text-white/80 text-[11px] line-clamp-1">
                              {t(getCategoryDescTranslationKey(category.key))}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-accent" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </MovingBorderCard>
                ))}
              </div>
            </section>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between pb-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="group pl-0 hover:pl-2 transition-all hover:bg-transparent hover:text-accent"
              >
                <ArrowLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                {t("label_back_to_categories")}
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-2xl text-foreground font-bold">
                {t("page_create_property_create")}{" "}
                {selectedCategory && t(getCategoryTranslationKey(selectedCategory))}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("label_step_of", { current: 1, total: 4 })}
              </p>
            </div>
          </div>
          {renderCategoryForm()}
        </motion.div>
      )}
    </PageShell>
  );
};

export default CreateProperty;
