"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    // Simple logic to try and simulate bullet points if they exist or just formatting
    // Ideally, we'd have structured data, but we'll specific CSS for readability.

    return (
        <Card className="border-none shadow-none bg-transparent p-0">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
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
