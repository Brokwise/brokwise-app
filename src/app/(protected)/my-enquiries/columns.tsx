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
import { formatEnquiryLocation } from "@/utils/helper";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

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

const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return (
                <Badge
                    variant="default"
                    className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-500/25"
                >
                    Active
                </Badge>
            );
        case "closed":
            return (
                <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200"
                >
                    Closed
                </Badge>
            );
        case "expired":
            return (
                <Badge
                    variant="destructive"
                    className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-500/25"
                >
                    Expired
                </Badge>
            );
        default:
            return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};

export const columns: ColumnDef<Enquiry>[] = [
    {
        accessorKey: "enquiryType", // Using this for ID/Type combined view nicely? Or just standard Type
        header: "Type",
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
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{row.getValue("enquiryCategory")}</span>
            </div>
        ),
    },
    {
        accessorKey: "budget",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Budget
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
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
        header: "Location",
        cell: ({ row }) => {
            const loc = formatEnquiryLocation(row.original);
            return (
                <div className="max-w-[200px] truncate text-sm flex items-center" title={loc}>
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                    <span className="truncate">{loc}</span>
                </div>
            );
        },
    },
    {
        id: "specs",
        header: "Specs",
        cell: ({ row }) => {
            const enquiry = row.original;
            return (
                <div className="flex gap-2 text-xs text-muted-foreground">
                    {enquiry.bhk && (
                        <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                            <BedDouble className="h-3 w-3" /> {enquiry.bhk} BHK
                        </span>
                    )}
                    {enquiry.washrooms && (
                        <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
                            <Bath className="h-3 w-3" /> {enquiry.washrooms} Bath
                        </span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "submissionCount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Responses
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
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
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => {
            return value === "all" || row.getValue(id) === value;
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => router.push(`/enquiries/${enquiry._id}`)}
                    className="cursor-pointer"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
