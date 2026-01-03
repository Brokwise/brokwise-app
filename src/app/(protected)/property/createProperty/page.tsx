"use client";
import {
  useGetCompanyProperties,
  useCreateCompanyProperty,
  useSaveCompanyPropertyDraft,
} from "@/hooks/useCompany";
import { Button as MovingBorderCard } from "@/components/ui/moving-border";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { PropertyFormData } from "@/validators/property";
import { useApp } from "@/context/AppContext";
import { Property, PropertyCategory } from "@/types/property";
import { useState } from "react";
import { useGetMyListings } from "@/hooks/useProperty";
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

const CreateProperty = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Property | null>(null);
  const { companyData } = useApp();
  const router = useRouter();

  const {
    addPropertyAsync: createCompanyPropertyAsync,
    isLoading: isCreatingCompanyProperty,
  } = useCreateCompanyProperty();
  const { savePropertyAsDraft: saveCompanyPropertyDraft } =
    useSaveCompanyPropertyDraft();

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

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
    setSelectedDraft(null);
  };

  const handleDraftSelect = (draft: Property) => {
    setSelectedCategory(draft.propertyCategory);
    setSelectedDraft(draft);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedDraft(null);
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
      toast.error("Failed to create property. Please try again.");
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
    <main className="container mx-auto px-4 md:px-8 lg:px-12 py-2.5 md:py-2.5 min-h-screen">
      {!selectedCategory ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-instrument-serif text-foreground tracking-tight">
              List a new property
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-light max-w-2xl">
              Select a category to begin listing your premium property on the
              market.
            </p>
          </div>

          {/* Continue Drafting - Always on top */}
          {drafts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-lg font-instrument-serif text-foreground tracking-tight">
                    Continue Drafting
                  </h2>
                </div>
                {drafts.length > 0 && (
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {drafts.length}
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : drafts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                        className="group bg-card hover:bg-muted/40 border border-border/60 rounded-xl p-3 transition-all duration-200 hover:shadow-sm cursor-pointer flex flex-col gap-2 relative overflow-hidden"
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
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
                          >
                            Draft
                          </Badge>
                        </div>

                        <div className="space-y-0.5 pr-12">
                          <h3 className="font-medium text-sm text-foreground leading-tight">
                            {propertyCategories.find(
                              (c) => c.key === draft.propertyCategory
                            )?.label || draft.propertyCategory}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {draft.address?.city
                              ? `${draft.address.city}, ${draft.address.state}`
                              : "Location not set"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                            {lastEdited}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs hover:bg-accent/10 hover:text-accent"
                          >
                            Resume <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          )}

          {/* Categories Grid */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-lg font-instrument-serif font-medium tracking-tight">
                Property Categories
              </h2>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 p-3 flex flex-col justify-end">
                      <div className="transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                        <h3 className="text-base font-instrument-serif text-white leading-tight">
                          {category.label}
                        </h3>
                        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                          <span className="text-white/80 text-[11px] line-clamp-1">
                            {category.description}
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
                Back to Categories
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-instrument-serif text-foreground">
                Create{" "}
                {
                  propertyCategories.find((cat) => cat.key === selectedCategory)
                    ?.label
                }
              </h1>
              <p className="text-sm text-muted-foreground">step 1 of 4</p>
            </div>
          </div>
          {renderCategoryForm()}
        </motion.div>
      )}
    </main>
  );
};

export default CreateProperty;
