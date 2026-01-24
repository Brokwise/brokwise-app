"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PropertyDescriptionProps {
    description: string;
}

export const PropertyDescription = ({ description }: PropertyDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 300;
    const shouldTruncate = description.length > maxLength;

    const displayDescription = isExpanded ? description : description.slice(0, maxLength);

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
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
                            <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                        ) : (
                            <>Read More <ChevronDown className="ml-1 h-3 w-3" /></>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
