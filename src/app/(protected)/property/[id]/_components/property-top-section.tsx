import { Property } from "@/types/property";
import { formatCurrency } from "@/utils/helper";
import { Button } from "@/components/ui/button";
import { CalendarClock, ArrowRight } from "lucide-react";

interface PropertyTopSectionProps {
    property: Property;
    scrollToOffer: () => void;
    scrollToCalendar?: () => void;
}

export const PropertyTopSection = ({
    property,
    scrollToOffer,
    scrollToCalendar,
}: PropertyTopSectionProps) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-6">
            <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                        {formatCurrency(property.totalPrice)}
                    </h2>
                    <span className="text-lg text-muted-foreground font-medium">
                        ({formatCurrency(property.rate)} / {property.sizeUnit?.toLowerCase().replace("_", " ")})
                    </span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                    {property.propertyCategory} • {property.propertyType.replace(/_/g, " ")} • {property.size} {property.sizeUnit?.replace("SQ_", "")}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" onClick={scrollToOffer}>
                    Make an Offer
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {scrollToCalendar && (
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={scrollToCalendar}>
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Schedule Visit
                    </Button>
                )}
            </div>
        </div>
    );
};
