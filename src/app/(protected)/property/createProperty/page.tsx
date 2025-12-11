"use client";
import {
  useGetCompanyBrokers,
  useGetCompanyProperties,
  useCreateCompanyProperty,
  useSaveCompanyPropertyDraft,
} from "@/hooks/useCompany";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyFormData } from "@/validators/property";

const CreateProperty = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<PropertyCategory | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Property | null>(null);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const { companyData } = useApp();

  const { data: brokers } = useGetCompanyBrokers("approved");
  const { addProperty: createCompanyProperty } = useCreateCompanyProperty();
  const { savePropertyAsDraft: saveCompanyPropertyDraft } =
    useSaveCompanyPropertyDraft();

  const { myListings, isLoading: isBrokerLoading } = useGetMyListings({
    enabled: !companyData,
  });

  const { data: companyPropertiesData, isLoading: isCompanyLoading } =
    useGetCompanyProperties(
      { listingStatus: "DRAFT", brokerId: selectedBrokerId || undefined },
      { enabled: !!companyData }
    );

  const isLoading = companyData ? isCompanyLoading : isBrokerLoading;

  const drafts = companyData
    ? companyPropertiesData?.properties || []
    : myListings?.filter((p) => p.listingStatus === "DRAFT") || [];

  const handleBrokerSelect = (brokerId: string) => {
    setSelectedBrokerId(brokerId);
  };

  const handleCategorySelect = (category: PropertyCategory) => {
    setSelectedCategory(category);
    setSelectedDraft(null);
  };

  const handleDraftSelect = (draft: Property) => {
    if (companyData && draft.listedBy) {
      setSelectedBrokerId(draft.listedBy);
    }
    setSelectedCategory(draft.propertyCategory);
    setSelectedDraft(draft);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedDraft(null);
    if (companyData) {
      // Only reset broker if we are going back from category selection
      // But actually, the back button is on the wizard page (showing form).
      // So clicking back takes us to Category selection.
      // If we want to go back to Broker selection, we need another Back button or reset here.
      // Let's decide: If we are in category selection (selectedCategory is null), back resets broker?
      // No, UI shows "Back to Categories" when form is shown.
      // If categories are shown, we might want a "Back to Brokers" button if broker is selected.
    }
  };

  const handleResetBroker = () => {
    setSelectedBrokerId(null);
    setSelectedCategory(null);
    setSelectedDraft(null);
  };

  const handleCompanySubmit = (data: PropertyFormData) => {
    if (!selectedBrokerId) return;
    createCompanyProperty({ ...data, brokerId: selectedBrokerId });
  };

  const handleCompanySaveDraft = (data: PropertyFormData) => {
    if (!selectedBrokerId) return;
    saveCompanyPropertyDraft({ ...data, brokerId: selectedBrokerId });
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

  if (companyData && !selectedBrokerId) {
    return (
      <main className="container mx-auto p-6 space-y-6 px-4 md:px-80">
        <H2 text="Select Broker" />
        <p className="text-muted-foreground">
          Select the broker you are creating this property for.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brokers?.map((broker) => (
            <Card
              key={broker._id}
              onClick={() => handleBrokerSelect(broker._id)}
              className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {broker.firstName[0]}
                    {broker.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {broker.firstName} {broker.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {broker.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 space-y-6 px-4 md:px-80">
      {!selectedCategory ? (
        <>
          <div className="flex items-center justify-between">
            <H2 text="Create Property" />
            {companyData && (
              <Button variant="outline" onClick={handleResetBroker}>
                Change Broker
              </Button>
            )}
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

          {/* Drafts Section */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : drafts.length > 0 ? (
            <div className="space-y-4 pt-8 border-t">
              <H2
                text={
                  companyData
                    ? "Continue Drafting (Selected Broker)"
                    : "Continue Drafting"
                }
              />
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
