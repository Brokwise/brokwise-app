"use client";

import { Property } from "@/types/property";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useSoftDeleteProperty } from "@/hooks/useProperty";
import { useUndoDelete } from "@/context/UndoDeleteContext";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { formatAddress, formatPrice } from "@/utils/helper";
import { PropertyStatusBadge } from "./property-status-badge";
import { useTranslation } from "react-i18next";
import { PROPERTY_DELETION_REASONS } from "@/constants";


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export function PropertyActions({ property }: { property: Property }) {
  const { softDelete, isPending: isDeleting } = useSoftDeleteProperty();
  const { showUndo } = useUndoDelete();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const { t } = useTranslation();

  const isDeleted = property.listingStatus === "DELETED";

  // Validation: reason required, if "OTHER" then details min 10 chars
  const isDeleteValid =
    selectedReason &&
    (selectedReason !== "OTHER" || additionalDetails.length >= 10);

  const handleDelete = () => {
    if (!isDeleteValid) return;

    const reason =
      selectedReason === "OTHER"
        ? additionalDetails
        : t(
          PROPERTY_DELETION_REASONS.find((r) => r.value === selectedReason)
            ?.labelKey || ""
        );

    // Close dialog immediately
    setShowDeleteDialog(false);
    setSelectedReason("");
    setAdditionalDetails("");

    // Perform the soft delete immediately
    softDelete(
      { propertyId: property._id, reason },
      {
        onSuccess: () => {
          // Trigger global undo overlay
          showUndo({
            propertyId: property._id,
            propertyTitle: `${property.propertyCategory} - ${property.propertyType}`,
          });
        },
      }
    );
  };

  return (
    <>
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Property Details
              {isDeleted && (
                <Badge variant="destructive" className="ml-2 uppercase text-[10px] py-0 h-5">
                  Deleted
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>ID: {property.propertyId}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Media Preview */}
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
              {property.featuredMedia ? (
                <Image
                  src={
                    property.featuredMedia.includes("firebasestorage.googleapis.com")
                      ? property.featuredMedia
                      : "/images/placeholder.webp"
                  }
                  alt="Featured"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.webp";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
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
                <PropertyStatusBadge
                  status={property.listingStatus}
                  deletingStatus={property.deletingStatus}
                />
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
            <DialogTitle>{t("request_property_deletion")}</DialogTitle>
            <DialogDescription>
              {t("request_property_deletion_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("deletion_reason_label")}</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_deletion_reason")} />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_DELETION_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {t(reason.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedReason === "OTHER" && (
              <div className="grid gap-2">
                <Label>{t("additional_details_label")}</Label>
                <Textarea
                  placeholder={t("deletion_details_placeholder")}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className={
                    additionalDetails.length > 0 &&
                      additionalDetails.length < 10
                      ? "border-red-500"
                      : ""
                  }
                />
                {additionalDetails.length > 0 &&
                  additionalDetails.length < 10 && (
                    <p className="text-xs text-red-500">
                      {t("additional_details_label")}
                    </p>
                  )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("action_cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || !isDeleteValid}
            >
              {isDeleting ? t("submitting") : t("submit_request")}
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
          {!isDeleted && (
            <>
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>


    </>
  );
}

