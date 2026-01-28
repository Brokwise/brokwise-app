import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const typographyVariants = cva("text-foreground font-sans", {
    variants: {
        variant: {
            h1: "scroll-m-20 text-3xl font-bold tracking-tight lg:text-3xl",
            h2: "scroll-m-20 text-2xl font-semibold tracking-tight",
            h3: "scroll-m-20 text-xl font-semibold tracking-tight",
            // h4 is not explicitly requested in the new strict rules, but keeping for compatibility if needed, mapped to p style or removed? 
            // User said: "All page titles → h1, Section headers → h2, Card titles → h3, Labels/metadata → small, Body text → p, Muted → muted"
            // I will strictly implement the requested ones and maybe keep a generic 'large' or 'h4' as fallback if absolutely necessary, but goal is "Typography Enforcement".
            // Let's stick to the list: h1, h2, h3, small, p, muted. 
            // I'll keep the others for now but maybe mark deprecated or just map them to closest allowed if strictly enforcing.
            // For now, I will update the definitions to match the "Goal" perfectly.
            h1: "text-3xl font-bold tracking-tight", 
            h2: "text-2xl font-semibold tracking-tight", 
            h3: "text-xl font-semibold tracking-tight",
            p: "text-base leading-7",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground",
            // Keeping these for potential backward compat but they should be phased out
            h4: "text-lg font-medium",
            blockquote: "mt-6 border-l-2 pl-6 italic",
            list: "my-6 ml-6 list-disc [&>li]:mt-2",
            lead: "text-xl text-muted-foreground",
            large: "text-lg font-semibold",
        },
    },
    defaultVariants: {
        variant: "p",
    },
});

type VariantPropType = VariantProps<typeof typographyVariants>;

const variantElementMap: Record<
    NonNullable<VariantPropType["variant"]>,
    React.ElementType
> = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    p: "p",
    blockquote: "blockquote",
    list: "ul",
    lead: "p",
    large: "div",
    small: "small",
    muted: "p",
};

export interface TypographyProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
    as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ className, variant, as, ...props }, ref) => {
        const Component = as ?? variantElementMap[variant || "p"] ?? "p";
        return (
            <Component
                className={cn(typographyVariants({ variant, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
