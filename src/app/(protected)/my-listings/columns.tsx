"use client";

import { ListingStatus, Property, Address } from "@/types/property";
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
import {
  ArrowUpDown,
  MapPin,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRequestDeleteProperty } from "@/hooks/useProperty";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { formatAddress, formatPrice } from "@/utils/helper";

const getStatusBadge = (status: ListingStatus, deletingStatus?: string | null) => {
  if (deletingStatus === "pending") {
    return (
      <Badge
        variant="destructive"
        className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"
      >
        Deletion Pending
      </Badge>
    );
  }
  if (deletingStatus === "approved") {
    return (
      <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
        Deletion Approved
      </Badge>
    );
  }
  if (deletingStatus === "rejected") {
    return (
      <Badge
        variant="destructive"
        className="bg-red-100 text-red-800 hover:bg-red-200"
      >
        Deletion Rejected
      </Badge>
    );
  }

  const variants: Record<
    ListingStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      className?: string;
    }
  > = {
    ACTIVE: {
      variant: "default",
      label: "Active",
      className: "bg-green-600 hover:bg-green-700",
    },
    PENDING_APPROVAL: {
      variant: "secondary",
      label: "Pending Approval",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    DRAFT: { variant: "outline", label: "Draft" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    SOLD: {
      variant: "secondary",
      label: "Sold",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    RENTED: {
      variant: "secondary",
      label: "Rented",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    EXPIRED: {
      variant: "outline",
      label: "Expired",
      className: "text-gray-500",
    },
    DELISTED: {
      variant: "destructive",
      label: "Delisted",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    ENQUIRY_ONLY: {
      variant: "secondary",
      label: "Enquiry Only",
      className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
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

// formatPrice is imported from utils


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const columns: ColumnDef<Property>[] = [
  {
    accessorKey: "featuredMedia",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("featuredMedia") as string;
      return (
        <div className="relative h-10 w-16 overflow-hidden rounded-md">
          {image ? (
            <Image
              src={
                image.includes("firebasestorage.googleapis.com")
                  ? image
                  : "/images/placeholder.webp"
              }
              alt="Property"
              fill
              className="object-cover"
              sizes="64px"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.webp";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No Img
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "propertyId",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("propertyId")}</div>
    ),
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
    accessorFn: (row) => `${row.propertyCategory} ${row.propertyType}`,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {row.original.propertyCategory.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {row.original.propertyType.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("totalPrice"));
      return <div className="font-medium">{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.getValue("address") as Address;
      const formattedAddress = formatAddress(address);
      return (
        <div
          className="max-w-[200px] truncate text-sm"
          title={formattedAddress}
        >
          <MapPin className="mr-1 inline-block h-3 w-3 text-muted-foreground" />
          {formattedAddress}
        </div>
      );
    },
  },
  {
    accessorKey: "listingStatus",
    header: "Status",
    cell: ({ row }) => {
      return getStatusBadge(
        row.getValue("listingStatus"),
        row.original.deletingStatus
      );
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
      const property = row.original;
      return <ActionCell property={property} />;
    },
  },
];

function ActionCell({ property }: { property: Property }) {
  const { requestDelete, isPending: isDeleting } = useRequestDeleteProperty();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const handleDelete = () => {
    if (deleteReason.length < 10) return;

    requestDelete(
      { propertyId: property._id, reason: deleteReason },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setDeleteReason("");
        },
      }
    );
  };

  return (
    <>
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
            <DialogDescription>ID: {property.propertyId}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Media Preview */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              {property.featuredMedia ? (
                <Image
                  src={property.featuredMedia}
                  alt="Featured"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  No Image
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Price
                </h4>
                <p className="text-lg font-bold">
                  {formatPrice(property.totalPrice)}
                </p>
                {property.isPriceNegotiable && (
                  <Badge variant="outline" className="mt-1">
                    Negotiable
                  </Badge>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Rate
                </h4>
                <p>
                  {formatPrice(property.rate)} / {property.sizeUnit || "unit"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-sm">{property.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Category
                </h4>
                <p className="text-sm">{property.propertyCategory}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Type
                </h4>
                <p className="text-sm">{property.propertyType}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Size
                </h4>
                <p className="text-sm">
                  {property.size} {property.sizeUnit}
                </p>
              </div>
              {property.facing && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Facing
                  </h4>
                  <p className="text-sm">{property.facing}</p>
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-sm">{formatAddress(property.address)}</p>
              {property.localities && property.localities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {property.localities.map((loc, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {loc}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Broker Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {property.listedBy.firstName} {property.listedBy.lastName}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {property.listedBy.email}
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>{" "}
                  {property.listedBy.mobile}
                </div>
                <div>
                  <span className="text-muted-foreground">Broker ID:</span>{" "}
                  {property.listedBy.brokerId}
                </div>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-2">Status</h4>
              <div className="flex items-center gap-4">
                {getStatusBadge(
                  property.listingStatus,
                  property.deletingStatus
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(property.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Property Deletion</DialogTitle>
            <DialogDescription>
              Please provide a reason for deleting property{" "}
              <span className="font-semibold">{property.propertyId}</span>. This
              request will be sent to the admin for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (min 10 characters)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className={
                  deleteReason.length > 0 && deleteReason.length < 10
                    ? "border-red-500"
                    : ""
                }
              />
              {deleteReason.length > 0 && deleteReason.length < 10 && (
                <p className="text-xs text-red-500">
                  Reason must be at least 10 characters.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || deleteReason.length < 10}
            >
              {isDeleting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
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
          <DropdownMenuItem asChild>
            <Link href={`/property/edit/${property._id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
            disabled={property.deletingStatus === "pending"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {property.deletingStatus === "pending"
              ? "Deletion Pending"
              : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
