import { cn } from "@/lib/utils";
import React from "react";
import { Typography } from "./typography";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    as?: React.ElementType;
}

const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
    ({ children, className, as: Component = "div", ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(
                    "flex flex-col flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8",
                    className
                )}
                {...props}
            >
                {children}
            </Component>
        );
    }
);
PageShell.displayName = "PageShell";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    children?: React.ReactNode; // For actions or custom content
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
    ({ title, description, children, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                    className
                )}
                {...props}
            >
                {(title || description) && (
                    <div className="space-y-1.5 bg-background/50 backdrop-blur-sm">
                        {title && <Typography variant="h1">{title}</Typography>}
                        {description && (
                            <Typography variant="muted" className="text-base">
                                {description}
                            </Typography>
                        )}
                    </div>
                )}
                {children && <div className="flex items-center gap-2">{children}</div>}
            </div>
        );
    }
);
PageHeader.displayName = "PageHeader";

interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const PageGrid = React.forwardRef<HTMLDivElement, PageGridProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
PageGrid.displayName = "PageGrid";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
    ({ title, action, children, className, ...props }, ref) => {
        return (
            <section ref={ref} className={cn("space-y-4", className)} {...props}>
                {(title || action) && (
                    <div className="flex items-center justify-between">
                        {title && <Typography variant="h3">{title}</Typography>}
                        {action}
                    </div>
                )}
                {children}
            </section>
        );
    }
);
Section.displayName = "Section";

export { PageShell, PageHeader, PageGrid, Section };
