"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PropertyDescriptionProps {
    description: string;
}

export const PropertyDescription = ({ description }: PropertyDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation();
    const maxLength = 300;
    const shouldTruncate = description.length > maxLength;

    const displayDescription = isExpanded ? description : description.slice(0, maxLength);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("label_description")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap ${!isExpanded && shouldTruncate ? "mask-gradient-bottom" : ""}`}>
                    {displayDescription}
                    {!isExpanded && shouldTruncate && "..."}
                </div>

                {shouldTruncate && (
                    <Button
                        variant="link"
                        className="px-0 mt-2 h-auto font-semibold text-primary"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>{t("property_show_less")} <ChevronUp className="ml-1 h-3 w-3" /></>
                        ) : (
                            <>{t("property_read_more")} <ChevronDown className="ml-1 h-3 w-3" /></>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
