"use client";

import { Property } from "@/types/property";
import { Typography } from "@/components/ui/typography";
import {
    Bed,
    Bath,
    Maximize2,
    Home,
    ArrowUpDownIcon,
    RulerDimensionLine,
    Building,
    Calendar,
    Layers,
    IndianRupee
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/helper";
import { useTranslation } from "react-i18next";
import { getPlotTypeLabel } from "@/lib/plotType";

interface PropertyFactsProps {
    property: Property;
}

export const PropertyFacts = ({ property }: PropertyFactsProps) => {
    const { t } = useTranslation();

    const items = [
        {
            label: t("property_category"),
            value: property.propertyCategory,
            icon: Building,
            show: true,
        },
        {
            label: t("property_property_type"),
            value: property.propertyType.replace(/_/g, " "),
            icon: Home,
            show: true,
        },
        {
            label: t("property_plot_type"),
            value: getPlotTypeLabel(t, property.plotType, "verbose"),
            icon: Layers,
            show: !!property.plotType,
        },
        {
            label: t("label_size"),
            value: `${property.size} ${property.sizeUnit?.replace("SQ_", "")}`,
            icon: Maximize2,
            show: !!property.size,
        },
        {
            label: t("property_bedrooms"),
            value: `${property.bhk} BHK`,
            icon: Bed,
            show: !!property.bhk,
        },
        {
            label: t("property_bathrooms"),
            value: property.washrooms,
            icon: Bath,
            show: !!property.washrooms,
        },
        {
            label: t("property_front_facing"),
            value: property.facing,
            icon: Home,
            show: !!property.facing,
        },
        {
            label: t("property_side_facing"),
            value: property.sideFacing,
            icon: ArrowUpDownIcon,
            show: !!property.sideFacing,
        },
        {
            label: t("property_front_road"),
            value: property.frontRoadWidth ? `${property.frontRoadWidth} ${property.roadWidthUnit?.toLowerCase() || 'ft'}` : null,
            icon: RulerDimensionLine,
            show: !!property.frontRoadWidth,
        },
        {
            label: t("property_side_road"),
            value: property.sideRoadWidth ? `${property.sideRoadWidth} ${property.roadWidthUnit?.toLowerCase() || 'ft'}` : null,
            icon: RulerDimensionLine,
            show: !!property.sideRoadWidth,
        },
        {
            label: t("property_possession"),
            value: property.possessionDate ? format(new Date(property.possessionDate), "MMM yyyy") : null,
            icon: Calendar,
            show: !!property.possessionDate,
        },
        {
            label: t("property_project_area"),
            value: property.projectArea ? `${property.projectArea} sq ft` : null,
            icon: Maximize2,
            show: !!property.projectArea
        },
        {
            label: t("property_society"),
            value: property.society,
            icon: Building,
            show: !!property.society
        },
        {
            label: t("property_rental_income"),
            value: property.rentalIncome
                ? `${formatCurrency(property.rentalIncome.min || 0)} - ${formatCurrency(
                    property.rentalIncome.max || 0
                )}`
                : null,
            icon: IndianRupee,
            show:
                !!property.rentalIncome &&
                ((property.rentalIncome.min || 0) > 0 ||
                    (property.rentalIncome.max || 0) > 0),
        }
    ];

    const visibleItems = items.filter((item) => item.show && item.value);

    return (
        <div className="space-y-4">
            <Typography variant="h3">{t("property_key_facts")}</Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleItems.map((item, index) => (
                    <div key={index} className="flex flex-col p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon className="h-4 w-4 text-primary/70" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                        </div>
                        <p
                            className="font-medium text-sm leading-snug whitespace-normal break-words"
                            title={String(item.value)}
                        >
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
