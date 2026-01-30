"use client";

import { Enquiry } from "@/models/types/enquiry";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowUpDown,
    MapPin,
    MoreHorizontal,
    Eye,
    Building2,
    BedDouble,
    Bath,
    MessageSquare,
} from "lucide-react";
import { formatEnquiryLocation, getEnquiryLocationCount } from "@/utils/helper";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// Helper for Budget Formatting (matching EnquiryCard)
const formatBudget = (amount: number) => {
    if (amount >= 10000000) {
        return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
        return `${(amount / 100000).toFixed(2)} L`;
    }
    return amount.toLocaleString("en-IN");
};

// Helper component for translated status badge
const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();

    switch (status) {
        case "active":
            return (
                <Badge
                    variant="default"
                    className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-500/25"
                >
                    {t("label_active")}
                </Badge>
            );
        case "closed":
            return (
                <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200"
                >
                    {t("label_closed")}
                </Badge>
            );
        case "expired":
            return (
                <Badge
                    variant="destructive"
                    className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-500/25"
                >
                    {t("label_expired")}
                </Badge>
            );
        default:
            return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

// Header components that use translation
const TypeHeader = () => {
    const { t } = useTranslation();
    return <span>{t("table_col_type")}</span>;
};

const CategoryHeader = ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => string | boolean } }) => {
    const { t } = useTranslation();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {t("table_col_category")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

const BudgetHeader = ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => string | boolean } }) => {
    const { t } = useTranslation();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {t("table_col_budget")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

const LocationHeader = () => {
    const { t } = useTranslation();
    return <span>{t("table_col_location")}</span>;
};

const SpecsHeader = () => {
    const { t } = useTranslation();
    return <span>{t("table_col_specs")}</span>;
};

const ResponsesHeader = ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => string | boolean } }) => {
    const { t } = useTranslation();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {t("table_col_responses")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

const StatusHeader = () => {
    const { t } = useTranslation();
    return <span>{t("table_col_status")}</span>;
};

const CreatedHeader = ({ column }: { column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => string | boolean } }) => {
    const { t } = useTranslation();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {t("table_col_created")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

// Specs cell component
const SpecsCell = ({ enquiry }: { enquiry: Enquiry }) => {
    const { t } = useTranslation();
    return (
        <div className="flex gap-2 text-xs text-muted-foreground">
            {enquiry.bhk && (
                <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                    <BedDouble className="h-3 w-3" /> {enquiry.bhk} {t("label_bhk")}
                </span>
            )}
            {enquiry.washrooms && (
                <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                    <Bath className="h-3 w-3" /> {enquiry.washrooms} {t("label_bath")}
                </span>
            )}
        </div>
    );
};

export const columns: ColumnDef<Enquiry>[] = [
    {
        accessorKey: "enquiryType",
        header: () => <TypeHeader />,
        cell: ({ row }) => {
            const type = row.getValue("enquiryType") as string;
            return (
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "enquiryCategory",
        header: ({ column }) => <CategoryHeader column={column} />,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{row.getValue("enquiryCategory")}</span>
            </div>
        ),
    },
    {
        accessorKey: "budget",
        header: ({ column }) => <BudgetHeader column={column} />,
        cell: ({ row }) => {
            const budget = row.original.budget;
            return (
                <div className="font-medium whitespace-nowrap">
                    {formatBudget(budget.min)} - {formatBudget(budget.max)}
                </div>
            );
        },
        sortingFn: (rowA, rowB) => {
            return rowA.original.budget.min - rowB.original.budget.min;
        }
    },
    {
        id: "location",
        header: () => <LocationHeader />,
        cell: ({ row }) => {
            const loc = formatEnquiryLocation(row.original);
            const count = getEnquiryLocationCount(row.original);
            return (
                <div className="max-w-[200px] truncate text-sm flex items-center gap-1" title={loc}>
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                    <span className="truncate">{loc}</span>
                    {count > 1 && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 shrink-0">
                            +{count - 1}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: "specs",
        header: () => <SpecsHeader />,
        cell: ({ row }) => <SpecsCell enquiry={row.original} />,
    },
    {
        accessorKey: "submissionCount",
        header: ({ column }) => <ResponsesHeader column={column} />,
        cell: ({ row }) => {
            const count = row.getValue("submissionCount") as number;
            return (
                <div className="flex items-center gap-2 pl-4">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{count || 0}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => <StatusHeader />,
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        filterFn: (row, id, value) => {
            return value === "all" || row.getValue(id) === value;
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <CreatedHeader column={column} />,
        cell: ({ row }) => {
            return (
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell enquiry={row.original} />,
    },
];

const ActionCell = ({ enquiry }: { enquiry: Enquiry }) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("table_open_menu")}</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("table_actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => router.push(`/enquiries/detail?id=${enquiry._id}`)}
                    className="cursor-pointer"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    {t("table_view_details")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
