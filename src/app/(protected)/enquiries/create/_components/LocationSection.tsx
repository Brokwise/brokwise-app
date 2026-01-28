
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    AddressAutocomplete,
    type AddressSuggestion,
} from "@/components/ui/address-autocomplete";
import { CreateEnquiryFormValues } from "@/models/schemas/enquirySchema";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";

const MAX_LOCATIONS = 3;

const LocationSection = ({ isPending }: { isPending: boolean }) => {
    const { t } = useTranslation();
    const { control, watch, setValue } = useFormContext<CreateEnquiryFormValues>();
    const locationMode = watch("locationMode");
    const preferredLocations = watch("preferredLocations") ?? [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: "preferredLocations",
    });

    const deriveCityAndLocality = (item: AddressSuggestion) => {
        const ctx = item.context ?? [];
        const pickCtx = (prefixes: string[]) =>
            ctx.find((c) => prefixes.some((p) => c.id.startsWith(p)))?.text?.trim() ?? "";
        const parts = item.place_name.split(",").map((p) => p.trim()).filter(Boolean);
        const cityFromCtx = pickCtx(["place"]);
        const localityFromCtx = pickCtx(["locality", "neighborhood"]);
        const fallbackCity = (parts.length >= 3 ? parts[parts.length - 3] : "") || parts[1] || parts[0] || "";
        const fallbackLocality = (parts.length >= 4 ? parts[parts.length - 4] : "") || "";
        const cityRaw = cityFromCtx || fallbackCity;
        const localityRaw = localityFromCtx || fallbackLocality || cityRaw;
        return { city: cityRaw.slice(0, 50), locality: localityRaw.slice(0, 100) };
    };

    const handleAddLocation = () => {
        if (fields.length >= MAX_LOCATIONS) return;
        append({ address: "", placeId: "", city: "", locality: "" });
    };

    const handleRemoveLocation = (index: number) => {
        if (index === 0) return; // Cannot remove primary location
        remove(index);
    };

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {t("form_location")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    You can add up to 3 preferred locations
                </p>
            </CardHeader>
            <CardContent className="px-0 md:px-6 space-y-4">
                {locationMode === "search" && fields.map((field, index) => (
                    <div key={field.id} className="relative">
                        <FormField
                            control={control}
                            name={`preferredLocations.${index}.placeId`}
                            render={({ field: formField }) => (
                                <FormItem className="relative">
                                    <FormLabel className="flex items-center gap-2">
                                        <span>
                                            {index === 0
                                                ? t("form_search_area_city")
                                                : `Preferred Location ${index + 1}`}
                                        </span>
                                        {index === 0 && <span className="text-destructive">*</span>}
                                        {index > 0 && (
                                            <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                        )}
                                    </FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <AddressAutocomplete
                                                valueLabel={preferredLocations[index]?.address ?? ""}
                                                valueId={formField.value ?? ""}
                                                disabled={isPending}
                                                className="bg-background h-12 text-base flex-1"
                                                onSearchError={(msg) => {
                                                    toast.error(msg);
                                                    if (index === 0) {
                                                        setValue("locationMode", "manual");
                                                    }
                                                }}
                                                onSelect={(item) => {
                                                    const derived = deriveCityAndLocality(item);
                                                    setValue(`preferredLocations.${index}.address`, item.place_name, { shouldValidate: true });
                                                    setValue(`preferredLocations.${index}.city`, derived.city, { shouldValidate: true });
                                                    setValue(`preferredLocations.${index}.locality`, derived.locality, { shouldValidate: true });
                                                    formField.onChange(item.id);

                                                    // Also set legacy fields from first location
                                                    if (index === 0) {
                                                        setValue("address", item.place_name, { shouldValidate: true });
                                                        setValue("city", derived.city, { shouldValidate: true });
                                                        setValue("localities", [derived.locality], { shouldValidate: true });
                                                    }
                                                }}
                                                onClear={() => {
                                                    setValue(`preferredLocations.${index}.address`, "", { shouldValidate: true });
                                                    setValue(`preferredLocations.${index}.placeId`, "", { shouldValidate: true });
                                                    setValue(`preferredLocations.${index}.city`, "", { shouldValidate: true });
                                                    setValue(`preferredLocations.${index}.locality`, "", { shouldValidate: true });
                                                    formField.onChange("");

                                                    if (index === 0) {
                                                        setValue("address", "", { shouldValidate: true });
                                                        setValue("city", "", { shouldValidate: true });
                                                        setValue("localities", [], { shouldValidate: true });
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 h-12 w-12 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveLocation(index)}
                                                disabled={isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                ))}

                {locationMode === "search" && fields.length < MAX_LOCATIONS && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 text-muted-foreground"
                        onClick={handleAddLocation}
                        disabled={isPending}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add another preferred location
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default LocationSection;
