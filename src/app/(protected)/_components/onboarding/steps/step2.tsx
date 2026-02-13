import React from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { RequiredLabel } from "@/components/ui/required-label";

interface Step2Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
}

export const Step2: React.FC<Step2Props> = ({ form }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-5">
            <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("onboarding_company_name")}{" "}
                            <span className="text-slate-400 text-xs ml-1 font-normal">
                                {t("onboarding_optional")}
                            </span>
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                placeholder="Your agency name"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            <RequiredLabel>{t("onboarding_experience")}</RequiredLabel>
                        </FormLabel>
                        <FormControl>
                            <Select
                                onValueChange={(e) =>
                                    field.onChange(parseInt(e))
                                }
                                value={
                                    field.value !== undefined
                                        ? field.value.toString()
                                        : undefined
                                }
                            >
                                <SelectTrigger className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all">
                                    <SelectValue placeholder={t("onboarding_years")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(16)].map((_, index) => (
                                        <SelectItem
                                            key={index}
                                            value={index.toString()}
                                        >
                                            {index === 15 ? "15+" : index}{" "}
                                            {index === 1 ? t("onboarding_year") : t("onboarding_years_plural")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t("onboarding_gstin")}{" "}
                                <span className="text-slate-400 text-xs ml-1 font-normal">
                                    {t("onboarding_optional")}
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    maxLength={15}
                                    className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all uppercase placeholder:normal-case"
                                    placeholder={t("onboarding_gstin_number")}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .toUpperCase()
                                            .slice(0, 15);
                                        field.onChange(value);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reraNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t("onboarding_rera_number")}{" "}
                                <span className="text-slate-400 text-xs ml-1 font-normal">
                                    {t("onboarding_optional")}
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    maxLength={50}
                                    className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                    placeholder={t("onboarding_rera_id")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </div>
        </div>
    );
}
