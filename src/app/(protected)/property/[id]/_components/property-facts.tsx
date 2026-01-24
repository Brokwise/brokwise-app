import { Property } from "@/types/property";
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
    IndianRupee // Assuming this might be needed or generic Money icon
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/helper";

interface PropertyFactsProps {
    property: Property;
}

export const PropertyFacts = ({ property }: PropertyFactsProps) => {
    const items = [
        {
            label: "Category",
            value: property.propertyCategory,
            icon: Building,
            show: true,
        },
        {
            label: "Property Type",
            value: property.propertyType.replace(/_/g, " "),
            icon: Home,
            show: true,
        },
        {
            label: "Plot Type",
            value: property.plotType,
            icon: Layers,
            show: !!property.plotType,
        },
        {
            label: "Size",
            value: `${property.size} ${property.sizeUnit?.replace("SQ_", "")}`,
            icon: Maximize2,
            show: !!property.size,
        },
        {
            label: "Bedrooms",
            value: `${property.bhk} BHK`,
            icon: Bed,
            show: !!property.bhk,
        },
        {
            label: "Bathrooms",
            value: property.washrooms,
            icon: Bath,
            show: !!property.washrooms,
        },
        {
            label: "Front Facing",
            value: property.facing,
            icon: Home,
            show: !!property.facing,
        },
        {
            label: "Side Facing",
            value: property.sideFacing,
            icon: ArrowUpDownIcon,
            show: !!property.sideFacing,
        },
        {
            label: "Front Road",
            value: property.frontRoadWidth ? `${property.frontRoadWidth} ${property.roadWidthUnit?.toLowerCase() || 'ft'}` : null,
            icon: RulerDimensionLine,
            show: !!property.frontRoadWidth,
        },
        {
            label: "Side Road",
            value: property.sideRoadWidth ? `${property.sideRoadWidth} ${property.roadWidthUnit?.toLowerCase() || 'ft'}` : null,
            icon: RulerDimensionLine,
            show: !!property.sideRoadWidth,
        },
        {
            label: "Possession",
            value: property.possessionDate ? format(new Date(property.possessionDate), "MMM yyyy") : null,
            icon: Calendar,
            show: !!property.possessionDate,
        },
        {
            label: "Project Area",
            value: property.projectArea ? `${property.projectArea} sq ft` : null,
            icon: Maximize2, // Or generic area icon
            show: !!property.projectArea
        },
        {
            label: "Society",
            value: property.society,
            icon: Building,
            show: !!property.society
        },
        {
            label: "Rental Income",
            value: property.rentalIncome ? `${formatCurrency(property.rentalIncome.min)} - ${formatCurrency(property.rentalIncome.max)}` : null,
            icon: IndianRupee,
            show: !!property.rentalIncome
        }
    ];

    const visibleItems = items.filter((item) => item.show && item.value);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Property Facts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleItems.map((item, index) => (
                    <div key={index} className="flex flex-col p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon className="h-4 w-4 text-primary/70" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                        </div>
                        <p className="font-medium text-sm truncate" title={String(item.value)}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
