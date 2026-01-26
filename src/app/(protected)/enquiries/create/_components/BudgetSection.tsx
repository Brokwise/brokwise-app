
import React from "react";
import { useFormContext } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import { formatPriceShort } from "@/utils/helper";
import { BUDGET_MIN, BUDGET_MAX, CreateEnquiryFormValues } from "@/models/schemas/enquirySchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

// Discrete steps for slider
const BUDGET_OPTIONS: number[] = [
    // Lakhs
    500000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
    6000000, 7500000, 9000000,
    // Crores
    10000000, 12500000, 15000000, 17500000, 20000000, 25000000, 30000000,
    40000000, 50000000, 60000000, 75000000, 100000000, 125000000, 150000000,
    200000000, 250000000, 300000000, 400000000, 500000000, 600000000, 750000000,
    1000000000, 1250000000, 1500000000, 2000000000, 2500000000, 3000000000,
    4000000000, 5000000000, 6000000000, 7500000000, 10000000000,
];

const findNearestBudgetIndex = (value: number) => {
    const exact = BUDGET_OPTIONS.indexOf(value);
    if (exact !== -1) return exact;
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < BUDGET_OPTIONS.length; i++) {
        const diff = Math.abs(BUDGET_OPTIONS[i] - value);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = i;
        }
    }
    return bestIdx;
};

const BudgetSection = () => {
    const { t } = useTranslation();
    const { control, watch, setValue } = useFormContext<CreateEnquiryFormValues>();
    const minBudget = watch("budget.min");
    const maxBudget = watch("budget.max");

    // Keep slider values in sync with indices
    const minIndex = findNearestBudgetIndex(minBudget);
    const maxIndex = findNearestBudgetIndex(maxBudget);

    const handleSliderChange = (values: number[]) => {
        const [minIdx, maxIdx] = values;
        const newMin = BUDGET_OPTIONS[minIdx];
        const newMax = BUDGET_OPTIONS[maxIdx];

        setValue("budget.min", newMin, { shouldValidate: true });
        setValue("budget.max", newMax, { shouldValidate: true });
    };

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    {t("label_budget_range")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 md:px-6 space-y-8">

                {/* Slider Visual */}
                <div className="pt-6 pb-2 px-1">
                    <Slider
                        min={0}
                        max={BUDGET_OPTIONS.length - 1}
                        step={1}
                        value={[minIndex, maxIndex]}
                        onValueChange={handleSliderChange}
                        className="w-full cursor-pointer"
                        minStepsBetweenThumbs={0}
                    />
                    <div className="flex justify-between mt-3 text-sm font-semibold text-muted-foreground w-full">
                        <span className="bg-muted/50 px-2 py-1 rounded">{formatPriceShort(BUDGET_MIN)}</span>
                        <span className="bg-muted/50 px-2 py-1 rounded">{formatPriceShort(BUDGET_MAX)}</span>
                    </div>
                </div>

                {/* Inputs */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <FormField
                        control={control}
                        name="budget.min"
                        render={({ field }) => (
                            <FormItem className="flex-1 w-full">
                                <FormLabel>{t("form_min_budget")}</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                    <FormControl>
                                        <NumberInput
                                            {...field}
                                            className="pl-8 h-12 text-lg"
                                            placeholder="Min Budget"
                                            onChange={(val) => field.onChange(val)}
                                        />
                                    </FormControl>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full pointer-events-none">
                                        {formatPriceShort(field.value || 0).replace("₹", "")}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <span className="hidden sm:block text-muted-foreground font-medium text-xl">-</span>

                    <FormField
                        control={control}
                        name="budget.max"
                        render={({ field }) => (
                            <FormItem className="flex-1 w-full">
                                <FormLabel>{t("form_max_budget")}</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                    <FormControl>
                                        <NumberInput
                                            {...field}
                                            className="pl-8 h-12 text-lg"
                                            placeholder="Max Budget"
                                            onChange={(val) => field.onChange(val)}
                                        />
                                    </FormControl>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full pointer-events-none">
                                        {formatPriceShort(field.value || 0).replace("₹", "")}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

            </CardContent>
        </Card>
    );
};

export default BudgetSection;
