import { Button } from "@/components/ui/button";
import { Download, Share2, Bookmark } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PropertyActionsBarProps {
    onExportPdf: () => void;
    isExportingPdf: boolean;
    onShare: () => void;
    onBookmark: () => void;
}

export const PropertyActionsBar = ({
    onExportPdf,
    isExportingPdf,
    onShare,
    onBookmark,
}: PropertyActionsBarProps) => {
    return (
        <div className="flex items-center justify-end gap-2 py-4">
            <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
            </Button>
            <Button variant="outline" size="sm" onClick={onBookmark} className="gap-2">
                <Bookmark className="h-4 w-4" />
                Save
            </Button>
            <Button variant="default" size="sm" onClick={onExportPdf} disabled={isExportingPdf} className="gap-2">
                {isExportingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                Download Brochure
            </Button>
        </div>
    );
};
