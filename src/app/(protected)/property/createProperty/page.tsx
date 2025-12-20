"use client";
import {
  useGetCompanyProperties,
  useCreateCompanyProperty,
  useSaveCompanyPropertyDraft,
} from "@/hooks/useCompany";
import { Loader2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { H2 } from "@/components/text/h2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { propertyCategories } from "@/constants";
import { H1 } from "@/components/text/h1";

const CreateProperty = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Property | null>(null);
  const { companyData } = useApp();
  const router = useRouter();

  const { addPropertyAsync: createCompanyPropertyAsync } = useCreateCompanyProperty();
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
      // Error is already handled by the hook's onError callback
      console.error("Error creating property:", error);
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
    <main className="container mx-auto p-6 space-y-6 px-4 md:px-28 xl:px-80">
      {!selectedCategory ? (
        <>
          <div className="flex items-center justify-between">
            <H2 text="Create Property" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyCategories.map((category) => (
              <Card
                key={category.key}
                onClick={() => handleCategorySelect(category.key)}
                className="cursor-pointer transition-all duration-500 h-52  hover:scale-95 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${category.image})`,
                }}
              >
                <CardHeader>
                  <CardTitle className="text-3xl text-white font-bold">
                    {category.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-white">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : drafts.length > 0 ? (
            <div className="space-y-4 pt-8 border-t">
              <H2 text="Continue Drafting" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((draft) => (
                  <Card key={draft._id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {propertyCategories.find(
                          (c) => c.key === draft.propertyCategory
                        )?.label || draft.propertyCategory}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {draft.address?.city
                          ? `${draft.address.city}, ${draft.address.state}`
                          : "Location not set"}
                      </p>
                      <Button
                        onClick={() => handleDraftSelect(draft)}
                        className="w-full"
                        variant="secondary"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Continue Editing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack}>
                ← Back to Categories
              </Button>
              <H1
                text={`Create ${
                  propertyCategories.find((cat) => cat.key === selectedCategory)
                    ?.label
                } Property`}
              />
            </div>
          </div>
          {renderCategoryForm()}
        </div>
      )}
    </main>
  );
};

export default CreateProperty;
