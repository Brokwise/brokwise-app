"use client";

import { Button } from "@/components/ui/button";
import { Share2, Bookmark, BookmarkCheck, Link2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PropertyActionsBarProps {
    isBookmarked: boolean;
    isBookmarkPending?: boolean;
    onToggleBookmark: () => void;
    shareUrl: string;
    propertyTitle?: string;
    isDeleted?: boolean;
}

export const PropertyActionsBar = ({
    isBookmarked,
    isBookmarkPending = false,
    onToggleBookmark,
    shareUrl,
    propertyTitle = "Property",
    isDeleted = false,
}: PropertyActionsBarProps) => {
    const { t } = useTranslation();

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success(t("toast_link_copied"));
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
            handleCopyLink();
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
