
import React from "react";
import { useFormContext } from "react-hook-form";
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
import { MapPin } from "lucide-react";

const LocationSection = ({ isPending }: { isPending: boolean }) => {
    const { control, watch, setValue } = useFormContext<CreateEnquiryFormValues>();
    const locationMode = watch("locationMode");
    const address = watch("address");

    // Helper logic remains same...
    const deriveCityAndLocalities = (item: AddressSuggestion) => {
        // ... (same as before, keeping clean for brevity in display)
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
        return { city: cityRaw.slice(0, 50), localities: [localityRaw.slice(0, 100)] };
    };

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location Preference
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
                {locationMode === "search" && (
                    <FormField
                        control={control}
                        name="addressPlaceId"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <FormLabel>Search Area or City <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <AddressAutocomplete
                                        valueLabel={address}
                                        valueId={field.value ?? ""}
                                        disabled={isPending}
                                        className="bg-background h-12 text-base"
                                        onSearchError={(msg) => {
                                            toast.error(msg);
                                            setValue("locationMode", "manual");
                                            setValue("addressPlaceId", "");
                                        }}
                                        onSelect={(item) => {
                                            const derived = deriveCityAndLocalities(item);
                                            setValue("address", item.place_name, { shouldValidate: true });
                                            setValue("city", derived.city, { shouldValidate: true });
                                            setValue("localities", derived.localities, { shouldValidate: true });
                                            field.onChange(item.id);
                                        }}
                                        onClear={() => {
                                            setValue("address", "", { shouldValidate: true });
                                            setValue("city", "", { shouldValidate: true });
                                            setValue("localities", [], { shouldValidate: true });
                                            field.onChange("");
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default LocationSection;
