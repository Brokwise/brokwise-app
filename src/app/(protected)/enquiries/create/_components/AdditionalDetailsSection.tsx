
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileText, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreateEnquiryFormValues } from "@/models/schemas/enquirySchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useGetCreditPrices } from "@/hooks/useCredits";
import useAxios from "@/hooks/useAxios";

const AdditionalDetailsSection = () => {
    const { t } = useTranslation();
    const { control, setValue, getValues } = useFormContext<CreateEnquiryFormValues>();
    const [generating, setGenerating] = useState(false);
    const { prices } = useGetCreditPrices();
    const api = useAxios()
    const handleGenerateDescription = async () => {
        try {
            setGenerating(true);
            const formValues = getValues();
            if (!formValues.enquiryType || !formValues.address) {
                toast.error(t("toast_error_select_property_location"));
                return;
            }

            const response = await api.post("/utils/ai", { data: formValues, type: "enquiry" });

            if (!response.status) throw new Error("Failed to generate");

            const data = await response.data;
            setValue("description", data.description, { shouldValidate: true, shouldDirty: true });
            toast.success(t("toast_description_generated"));
        } catch (error) {
            console.error(error);
            toast.error(t("toast_error_description_generate"));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {t("form_additional_details")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 md:px-6 space-y-6">
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>{t("form_description")} <span className="text-destructive">*</span></FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateDescription}
                                    disabled={generating}
                                    className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                                >
                                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    {t("form_generate_description")}
                                </Button>
                            </div>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder={t("form_description_placeholder")}
                                    className="min-h-[120px] resize-y text-base p-4"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-between border border-primary/20 bg-primary/5 p-4 rounded-xl">
                    <FormField
                        control={control}
                        name="urgent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between w-full space-y-0">
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Zap className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold">{t("form_mark_as_urgent")}</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            {t("form_urgent_description")}
                                            {prices.MARK_ENQUIRY_AS_URGENT + " credits required"}
                                        </div>
                                    </div>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default AdditionalDetailsSection;
