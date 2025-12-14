"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Eye, Trash } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/utils/helper";
import { Enquiry, EnquiryStatus } from "@/models/types/enquiry";
import {
  useHardDeleteCompanyEnquiry,
  useSoftDeleteBrokerEnquiry,
} from "@/hooks/useCompany";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

// Extended type for company view
export type CompanyEnquiry = Enquiry & {
  creator: {
    _id: string;
    email: string;
    // Company user fields
    name?: string;
    // Broker fields
    firstName?: string;
    lastName?: string;
    brokerId?: string;
  };
};

const getCreatorName = (creator: CompanyEnquiry["creator"]) => {
  if (creator.name) return creator.name;
  if (creator.firstName || creator.lastName) {
    return `${creator.firstName || ""} ${creator.lastName || ""}`.trim();
  }
  return "Unknown";
};

const getStatusBadge = (status: EnquiryStatus) => {
  const variants: Record<
    EnquiryStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      className?: string;
    }
  > = {
    active: {
      variant: "default",
      label: "Active",
      className: "bg-green-600 hover:bg-green-700",
    },
    closed: {
      variant: "secondary",
      label: "Closed",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    expired: {
      variant: "outline",
      label: "Expired",
      className: "text-gray-500",
    },
  };
  const config = variants[status] || { variant: "outline", label: status };

  return (
    <Badge
      variant={config.variant}
      className={`capitalize ${config.className || ""}`}
    >
      {config.label}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const columns: ColumnDef<CompanyEnquiry>[] = [
  {
    accessorKey: "enquiryId",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("enquiryId")}</div>
    ),
  },
  {
    accessorKey: "creator",
    header: "Created By",
    cell: ({ row }) => {
      const creator = row.original.creator;
      if (!creator) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{getCreatorName(creator)}</span>
          <span className="text-xs text-muted-foreground">{creator.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (row) => `${row.enquiryCategory} ${row.enquiryType}`,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {row.original.enquiryCategory?.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {row.original.enquiryType?.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    accessorFn: (row) => `${row.city} ${row.localities.join(" ")}`,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium text-sm">{row.original.city}</span>
          <span
            className="text-xs text-muted-foreground truncate"
            title={row.original.localities.join(", ")}
          >
            {row.original.localities.join(", ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const budget = row.original.budget;
      return (
        <div className="text-sm font-medium">
          {formatPrice(budget.min)} - {formatPrice(budget.max)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return getStatusBadge(row.getValue("status"));
    },
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
        <div className="text-xs text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const enquiry = row.original;
      return <ActionCell enquiry={enquiry} />;
    },
  },
];

function ActionCell({ enquiry }: { enquiry: CompanyEnquiry }) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const { softDeleteBrokerEnquiry, isPending: isSoftDeleting } =
    useSoftDeleteBrokerEnquiry();
  const { hardDeleteCompanyEnquiry, isPending: isHardDeleting } =
    useHardDeleteCompanyEnquiry();

  const isBrokerEnquiry = enquiry.source === "broker";

  const handleDelete = () => {
    if (isBrokerEnquiry) {
      softDeleteBrokerEnquiry(
        { enquiryId: enquiry._id, reason: deleteReason },
        {
          onSuccess: () => {
            setShowDeleteDialog(false);
            setDeleteReason("");
          },
        }
      );
    } else {
      hardDeleteCompanyEnquiry(
        { enquiryId: enquiry._id },
        {
          onSuccess: () => {
            setShowDeleteDialog(false);
          },
        }
      );
    }
  };

  return (
    <>
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>ID: {enquiry.enquiryId}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Budget
                </h4>
                <p className="text-lg font-bold">
                  {formatPrice(enquiry.budget.min)} -{" "}
                  {formatPrice(enquiry.budget.max)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Status
                </h4>
                {getStatusBadge(enquiry.status)}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-sm">{enquiry.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Category
                </h4>
                <p className="text-sm">{enquiry.enquiryCategory}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Type
                </h4>
                <p className="text-sm">{enquiry.enquiryType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  BHK
                </h4>
                <p className="text-sm">{enquiry.bhk || "-"}</p>
              </div>
              {enquiry.size && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Size Range
                  </h4>
                  <p className="text-sm">
                    {enquiry.size.min} - {enquiry.size.max} {enquiry.size.unit}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-sm font-medium">{enquiry.city}</p>
              {enquiry.localities && enquiry.localities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {enquiry.localities.map((loc, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {loc}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Creator Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {getCreatorName(enquiry.creator)}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {enquiry.creator.email}
                </div>
                {enquiry.creator.brokerId && (
                  <div>
                    <span className="text-muted-foreground">Broker ID:</span>{" "}
                    {enquiry.creator.brokerId}
                  </div>
                )}
                <div className="capitalize">
                  <span className="text-muted-foreground">Source:</span>{" "}
                  {enquiry.source}
                </div>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(enquiry.createdAt)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBrokerEnquiry ? "Delete Broker Enquiry" : "Delete Enquiry"}
            </DialogTitle>
            <DialogDescription>
              {isBrokerEnquiry
                ? "This action will soft delete the enquiry. The broker will be notified."
                : "This action cannot be undone. This will permanently delete the enquiry."}
            </DialogDescription>
          </DialogHeader>

          {isBrokerEnquiry && (
            <div className="space-y-2 py-4">
              <Label>Reason for deletion</Label>
              <Textarea
                placeholder="Enter reason for deleting this enquiry..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSoftDeleting || isHardDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSoftDeleting || isHardDeleting}
            >
              {isSoftDeleting || isHardDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
