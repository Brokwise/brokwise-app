import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const typographyVariants = cva("text-foreground", {
    variants: {
        variant: {
            h1: "text-3xl font-bold tracking-tight",
            h2: "text-2xl font-semibold tracking-tight",
            h3: "text-xl font-semibold tracking-tight",
            h4: "text-lg font-medium",
            p: "text-base leading-7",
            small: "text-sm font-medium leading-none",
            muted: "text-sm text-muted-foreground",
            value: "text-2xl font-bold tracking-tight",
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
    value: "span",
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
