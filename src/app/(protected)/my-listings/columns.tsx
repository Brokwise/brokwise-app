"use client";

import { Property, Address } from "@/types/property";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MapPin } from "lucide-react";
import Image from "next/image";
import { formatAddress, formatPrice } from "@/utils/helper";
import { PropertyStatusBadge } from "@/components/property/property-status-badge";
import { PropertyActions } from "@/components/property/property-actions";

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
                e.currentTarget.src = "/images/placeholder.webp";
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
    accessorKey: "propertyType",
    header: "Property Type",
    // Hidden by default since category_type column shows this info. Needed for filtering.
    enableHiding: false, // Don't show in column visibility dropdown
    filterFn: (row, id, value) => {
      return value === "all" || row.getValue(id) === value;
    },
    cell: () => null, // Don't render - only used for filtering
  },
  {
    accessorKey: "category_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category & Type
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
      return (
        <PropertyStatusBadge
          status={row.getValue("listingStatus")}
          deletingStatus={row.original.deletingStatus}
        />
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
      return <PropertyActions property={property} />;
    },
  },
];
