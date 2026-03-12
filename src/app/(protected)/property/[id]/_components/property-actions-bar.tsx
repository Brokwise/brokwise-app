"use client";

import { Button } from "@/components/ui/button";
import { Share2, Bookmark, BookmarkCheck, Link2, FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Property } from "@/types/property";
import { DocumentsList } from "./documents-list";

interface PropertyActionsBarProps {
    isBookmarked: boolean;
    isBookmarkPending?: boolean;
    onToggleBookmark: () => void;
    shareUrl: string;
    propertyTitle?: string;
    isDeleted?: boolean;
    property?: Property;
}

export const PropertyActionsBar = ({
    isBookmarked,
    isBookmarkPending = false,
    onToggleBookmark,
    shareUrl,
    propertyTitle = "Property",
    isDeleted = false,
    property,
}: PropertyActionsBarProps) => {
    const { t } = useTranslation();

    const hasDocuments = property && (
        (property.floorPlans && property.floorPlans.length > 0) ||
        !!property.jamabandiUrl ||
        !!property.khasraPlanUrl
    );

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(t("toast_link_copied"));
        } catch {
            toast.error(t("toast_error_copy_link"));
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: propertyTitle,
                    text: `Check out this property: ${propertyTitle}`,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or share failed silently
                console.log("Share cancelled or failed", err);
            }
        } else {
            // Fallback to copy link if native share not supported
            await handleCopyLink();
        }
    };

    if (isDeleted) return null;

    return (
        <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("action_share")}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink}>
                        <Link2 className="mr-2 h-4 w-4" />
                        {t("property_copy_link")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNativeShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {t("property_share_property")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {hasDocuments && property && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">{t("label_documents", "Documents")}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("label_documents", "Documents")}</DialogTitle>
                        </DialogHeader>
                        <DocumentsList property={property} hideHeader />
                    </DialogContent>
                </Dialog>
            )}

            <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={onToggleBookmark}
                disabled={isBookmarkPending}
                className={`gap-2 ${isBookmarked ? "bg-primary text-primary-foreground" : ""}`}
            >
                {isBookmarkPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                ) : (
                    <Bookmark className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isBookmarked ? t("property_saved") : t("action_save")}</span>
            </Button>
        </div>
    );
};
