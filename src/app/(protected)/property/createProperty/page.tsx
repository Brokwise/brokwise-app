"use client";
import {
  useGetCompanyProperties,
  useCreateCompanyProperty,
  useSaveCompanyPropertyDraft,
} from "@/hooks/useCompany";
import { Loader2, ArrowLeft, Sparkles, FileText, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    <main className="container mx-auto px-4 md:px-8 lg:px-12 py-8 min-h-screen">
      {!selectedCategory ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-instrument-serif text-foreground">
              List a new property
            </h1>
            <p className="text-muted-foreground font-inter text-lg font-light max-w-2xl">
              Select a category to begin listing your premium property on the
              market.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xl font-instrument-serif font-medium">
                Property Categories
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {propertyCategories.map((category) => (
                <motion.div
                  key={category.key}
                  variants={itemVariants}
                  onClick={() => handleCategorySelect(category.key)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[3/4] hover:shadow-2xl transition-all duration-500 ease-out"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${category.image})` }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Border Highlight on Hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-2xl transition-colors duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-instrument-serif text-white mb-2">
                      {category.label}
                    </h3>
                    <p className="text-white/80 text-sm font-inter line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {category.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <span>Start Listing</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Drafts Section */}
          <div className="space-y-6 pt-8 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-2xl font-instrument-serif text-foreground">
                  Continue Drafting
                </h2>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : drafts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((draft) => (
                  <motion.div
                    key={draft._id}
                    variants={itemVariants}
                    className="group bg-card hover:bg-muted/50 border border-border/50 rounded-xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col gap-4"
                    onClick={() => handleDraftSelect(draft)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-instrument-serif text-lg text-foreground">
                          {propertyCategories.find(
                            (c) => c.key === draft.propertyCategory
                          )?.label || draft.propertyCategory}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 font-inter">
                          {draft.address?.city
                            ? `${draft.address.city}, ${draft.address.state}`
                            : "Location not set"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20"
                      >
                        Draft
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-xs text-muted-foreground/60 font-inter">
                        Click to resume
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-accent hover:text-accent hover:bg-accent/10 p-0 h-auto font-medium"
                      >
                        Resume <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No drafts found
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  You don&apos;t have any pending property listings. Start a new one
                  from the categories above.
                </p>
              </div>
            )}
          </div>
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
