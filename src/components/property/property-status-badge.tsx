import { Badge } from "@/components/ui/badge";
import { ListingStatus } from "@/types/property";

interface PropertyStatusBadgeProps {
  status: ListingStatus;
  deletingStatus?: string | null;
  className?: string;
}

export function PropertyStatusBadge({
  status,
  deletingStatus,
  className,
}: PropertyStatusBadgeProps) {
  if (deletingStatus === "pending") {
    return (
      <Badge
        variant="destructive"
        className={`bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 ${className}`}
      >
        Deletion Pending
      </Badge>
    );
  }
  if (deletingStatus === "approved") {
    return (
      <Badge
        variant="destructive"
        className={`bg-red-600 hover:bg-red-700 ${className}`}
      >
        Deletion Approved
      </Badge>
    );
  }
  if (deletingStatus === "rejected") {
    return (
      <Badge
        variant="destructive"
        className={`bg-red-100 text-red-800 hover:bg-red-200 ${className}`}
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
    DELETED_BY_COMPANY: {
      variant: "destructive",
      label: "Delisted",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    DELETED: {
      variant: "destructive",
      label: "Deleted",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
  };

  const config = variants[status] || { variant: "outline", label: status };

  return (
    <Badge
      variant={config.variant}
      className={`capitalize ${config.className || ""} ${className}`}
    >
      {config.label}
    </Badge>
  );
}

