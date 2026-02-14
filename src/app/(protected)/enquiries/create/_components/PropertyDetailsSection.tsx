
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { CreateEnquiryFormValues, CATEGORY_TYPE_MAP } from "@/models/schemas/enquirySchema";
import { PropertyCategory } from "@/models/types/property";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Factory, Tractor, Palmtree } from "lucide-react";
import { getCategoryLabelKey } from "@/lib/i18nKeys";

const FACING_OPTIONS = [
    "NORTH", "SOUTH", "EAST", "WEST",
    "NORTH_EAST", "NORTH_WEST", "SOUTH_EAST", "SOUTH_WEST"
];

const AREA_TYPE_OPTIONS = ["NEAR_RING_ROAD", "RIICO_AREA", "SEZ"];
const SIZE_UNIT_OPTIONS = ["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES", "HECTARE", "BIGHA"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    RESIDENTIAL: Home,
    COMMERCIAL: Building2,
    INDUSTRIAL: Factory,
    AGRICULTURAL: Tractor,
    RESORT: Palmtree,
    FARM_HOUSE: Home, // Fallback
};

const PropertyDetailsSection = () => {
    const { control, watch } = useFormContext<CreateEnquiryFormValues>();
    const { t } = useTranslation();
    const category = watch("enquiryCategory");
    const type = watch("enquiryType");

    const Icon = category && CATEGORY_ICONS[category] ? CATEGORY_ICONS[category] : Home;

    // Derived state for available types
    const availableTypes = category ? CATEGORY_TYPE_MAP[category as PropertyCategory] || [] : [];

    // Feature Flags
    const isFlat = category === "RESIDENTIAL" && type === "FLAT";
    const isHotel = category === "COMMERCIAL" && type === "HOTEL";
    const isHostel = category === "COMMERCIAL" && type === "HOSTEL";
    const isIndustrial = category === "INDUSTRIAL";
    const isLandType = ["LAND", "VILLA", "INDUSTRIAL_LAND", "AGRICULTURAL_LAND", "FARM_HOUSE", "INDIVIDUAL"].includes(type);

    // Types that require size
    const requiresSize = [
        "LAND", "VILLA", "WAREHOUSE",
        "INDUSTRIAL_LAND", "AGRICULTURAL_LAND",
        "SHOWROOM", "SHOP", "OFFICE_SPACE", "FARM_HOUSE", "INDUSTRIAL_PARK"
    ].includes(type);

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {t("form_property_details")}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- Category --- */}
                    <FormField
                        control={control}
                        name="enquiryCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("form_category")} <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={t("form_select_category")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.keys(CATEGORY_TYPE_MAP).map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {t(getCategoryLabelKey(cat))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- Type --- */}
                    <FormField
                        control={control}
                        name="enquiryType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("form_property_type")} <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!category}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={t("form_select_type")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableTypes.map((typeKey) => (
                                            <SelectItem key={typeKey} value={typeKey}>
                                                {t("type_" + typeKey.toLowerCase())}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- Conditional Fields --- */}
                    {isFlat && (
                        <>
                            <FormField
                                control={control}
                                name="bhk"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form_bhk")} <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <NumberInput {...field} className="h-11" placeholder="e.g. 3" min={1} max={20} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="washrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form_washrooms")}</FormLabel>
                                        <FormControl>
                                            <NumberInput {...field} className="h-11" placeholder="e.g. 2" min={1} max={20} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="preferredFloor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form_preferred_floor")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-11" placeholder="e.g. Ground, 1-5, Top" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="society"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form_preferred_society")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-11" placeholder="e.g. Green Meadows" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {isHotel && (
                        <FormField
                            control={control}
                            name="rooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form_rooms")} <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <NumberInput {...field} className="h-11" placeholder="Total rooms" min={1} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {isHostel && (
                        <FormField
                            control={control}
                            name="beds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("form_beds")} <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <NumberInput {...field} className="h-11" placeholder="Total beds" min={1} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {isIndustrial && (
                        <>
                            <FormField
                                control={control}
                                name="purpose"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2">
                                        <FormLabel>{t("form_purpose")} <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-11" placeholder="Describe intended use (min 5 chars)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="areaType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("form_area_type")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11"><SelectValue placeholder={t("form_select_area_type")} /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {AREA_TYPE_OPTIONS.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ")}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {requiresSize && (
                        <div className="col-span-1 md:col-span-2 bg-muted/30 p-4 rounded-xl space-y-4">
                            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <span className="h-4 w-1 bg-primary rounded-full" />
                                {t("form_size_requirement")} <span className="text-destructive">*</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={control}
                                    name="size.min"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_min_size")}</FormLabel>
                                            <FormControl>
                                                <NumberInput {...field} className="h-11 bg-background" placeholder="Min" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="size.max"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_max_size")}</FormLabel>
                                            <FormControl>
                                                <NumberInput {...field} className="h-11 bg-background" placeholder="Max" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="size.unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_unit")}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-background"><SelectValue placeholder={t("form_unit")} /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SIZE_UNIT_OPTIONS.map(u => (
                                                        <SelectItem key={u} value={u}>{u.replace(/_/g, " ")}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {isLandType && (
                        <div className="col-span-1 md:col-span-2 bg-muted/30 p-4 rounded-xl space-y-4">
                            <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                <span className="h-4 w-1 bg-primary rounded-full" />
                                {t("form_plot_details")}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={control}
                                    name="facing"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_facing")}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-background"><SelectValue placeholder={t("form_select_facing")} /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {FACING_OPTIONS.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ")}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="plotType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_plot_type")}</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-background"><SelectValue placeholder={t("form_select_plot_type")} /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ROAD">{t("plot_type_road_compact")}</SelectItem>
                                                    <SelectItem value="CORNER">{t("plot_type_corner_compact")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="frontRoadWidth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">{t("form_front_road_width")}</FormLabel>
                                            <FormControl>
                                                <NumberInput {...field} className="h-11 bg-background" placeholder="e.g. 30" min={1} max={500} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PropertyDetailsSection;
