import React, { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cities } from "@/constants/cities";
import { LocationPicker } from "@/app/(protected)/property/createProperty/_components/locationPicker";
import { useTranslation } from "react-i18next";

interface Step3Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
}

export const Step3: React.FC<Step3Props> = ({ form }) => {
    const { t } = useTranslation();
    const [openCity, setOpenCity] = useState(false);
    const [cityQuery, setCityQuery] = useState("");
    const [officeCoordinates, setOfficeCoordinates] = useState<[number, number]>([0, 0]);

    return (
        <div className="space-y-5">
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("onboarding_city")}
                        </FormLabel>
                        <Popover open={openCity} onOpenChange={setOpenCity}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCity}
                                        className={cn(
                                            "w-full justify-between h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value
                                            ? field.value
                                            : t("onboarding_select_city")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder={t("onboarding_search_city")}
                                        onValueChange={setCityQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <p className="p-2 text-sm text-muted-foreground">
                                                {t("onboarding_no_city_found")}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-auto p-2 text-sm"
                                                onClick={() => {
                                                    field.onChange(cityQuery);
                                                    setOpenCity(false);
                                                }}
                                            >
                                                {t("onboarding_use_city")} &quot;{cityQuery}&quot;
                                            </Button>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {cities.map((city) => (
                                                <CommandItem
                                                    key={city}
                                                    value={city}
                                                    onSelect={(currentValue) => {
                                                        field.onChange(
                                                            currentValue === field.value
                                                                ? ""
                                                                : currentValue
                                                        );
                                                        setOpenCity(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value?.toLowerCase() ===
                                                                city.toLowerCase()
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {city}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="officeAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("onboarding_office_address")}
                        </FormLabel>
                        <FormControl>
                            <LocationPicker
                                className="overflow-x-hidden"
                                value={officeCoordinates}
                                inputValue={field.value}
                                onChange={(coords) => setOfficeCoordinates(coords)}
                                onLocationSelect={(details) => {
                                    field.onChange(details.placeName);
                                    setOfficeCoordinates(details.coordinates);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
