
import React from "react";
import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import { formatPriceShort } from "@/utils/helper";
import { CreateEnquiryFormValues, RENT_MIN, RENT_MAX } from "@/models/schemas/enquirySchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Calendar, Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const RentalBudgetSection = () => {
    const { control, watch } = useFormContext<CreateEnquiryFormValues>();
    const possessionType = watch("possessionType");

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-none md:border md:shadow-sm">
                <CardHeader className="px-0 md:px-6">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Monthly Rent Range
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 md:px-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <FormField
                            control={control}
                            name="monthlyRentBudget.min"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-full">
                                    <FormLabel>Min Rent (₹) <span className="text-destructive">*</span></FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                        <FormControl>
                                            <NumberInput
                                                {...field}
                                                className="pl-8 h-12 text-lg"
                                                placeholder="Min Rent"
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
                            name="monthlyRentBudget.max"
                            render={({ field }) => (
                                <FormItem className="flex-1 w-full">
                                    <FormLabel>Max Rent (₹) <span className="text-destructive">*</span></FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                        <FormControl>
                                            <NumberInput
                                                {...field}
                                                className="pl-8 h-12 text-lg"
                                                placeholder="Max Rent"
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
                    <p className="text-xs text-muted-foreground">
                        Range: {formatPriceShort(RENT_MIN)} to {formatPriceShort(RENT_MAX)}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-none md:border md:shadow-sm">
                <CardHeader className="px-0 md:px-6">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Possession & Tenant Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 md:px-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="possessionType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Possession Preference</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select possession type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                                            <SelectItem value="SPECIFIC_DATE">Specific Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {possessionType === "SPECIFIC_DATE" && (
                            <FormField
                                control={control}
                                name="possessionDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Possession Date <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                className="h-11"
                                                value={field.value ? String(field.value).split("T")[0] : ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <FormField
                        control={control}
                        name="tenantDetails"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Tenant Type
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Who will be the tenant?" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="FAMILY">Family</SelectItem>
                                        <SelectItem value="BACHELORS_MEN">Bachelors (Men)</SelectItem>
                                        <SelectItem value="BACHELORS_WOMEN">Bachelors (Women)</SelectItem>
                                        <SelectItem value="COMPANY_LEASE">Company Lease</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default RentalBudgetSection;
