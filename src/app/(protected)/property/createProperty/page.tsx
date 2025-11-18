"use client";
import { H1 } from "@/components/text/h1";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { ResidentialWizard } from "./residentialForm/wizard";
import { ResidentialForm } from "./residentialForm";
import { CommercialWizard } from "./commercialForm/wizard";
import { CommercialForm } from "./commercialForm";
import { IndustrialWizard } from "./industrialForm/wizard";
import { IndustrialForm } from "./industrialForm";
import { AgriculturalWizard } from "./agriculturalForm/wizard";
import { AgriculturalForm } from "./agriculturalForm";
import { ResortWizard } from "./resortForm/wizard";
import { ResortForm } from "./resortForm";
import { FarmHouseWizard } from "./farmhouseForm/wizard";
import { FarmHouseForm } from "./farmhouseForm";
import { Button } from "@/components/ui/button";
import { PropertyCategory } from "@/types/property";
import { propertyCategories } from "@/constants";

const CreateProperty = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory | null>(null);
  const [useWizard, setUseWizard] = useState(true);
  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const renderCategoryForm = () => {
    switch (selectedCategory) {
      case "RESIDENTIAL":
        return useWizard ? (
          <ResidentialWizard onBack={handleBack} />
        ) : (
          <ResidentialForm onBack={handleBack} />
        );
      case "COMMERCIAL":
        return useWizard ? (
          <CommercialWizard onBack={handleBack} />
        ) : (
          <CommercialForm onBack={handleBack} />
        );
      case "INDUSTRIAL":
        return useWizard ? (
          <IndustrialWizard onBack={handleBack} />
        ) : (
          <IndustrialForm onBack={handleBack} />
        );
      case "AGRICULTURAL":
        return useWizard ? (
          <AgriculturalWizard onBack={handleBack} />
        ) : (
          <AgriculturalForm onBack={handleBack} />
        );
      case "RESORT":
        return useWizard ? (
          <ResortWizard onBack={handleBack} />
        ) : (
          <ResortForm onBack={handleBack} />
        );
      case "FARM_HOUSE":
        return useWizard ? (
          <FarmHouseWizard onBack={handleBack} />
        ) : (
          <FarmHouseForm onBack={handleBack} />
        );
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto p-6 space-y-6">
      {!selectedCategory ? (
        <>
          <H1 text="Create Property" />
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

            {/* Wizard Toggle - Available for all property categories */}
            {selectedCategory && (
              <div className="flex items-center gap-2">
                <Button
                  variant={useWizard ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseWizard(true)}
                  type="button"
                >
                  Step-by-Step
                </Button>
                <Button
                  variant={!useWizard ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseWizard(false)}
                  type="button"
                >
                  Single Form
                </Button>
              </div>
            )}
          </div>
          {renderCategoryForm()}
        </div>
      )}
    </main>
  );
};

export default CreateProperty;
