import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreVertical, Download, ShieldX, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Property } from "@/types/property";

interface PropertyHeaderProps {
    property: Property;
    onExportPdf: () => void;
    isExportingPdf: boolean;
    onFlag: () => void;
}

export const PropertyHeader = ({
    property,
    onExportPdf,
    isExportingPdf,
    onFlag,
}: PropertyHeaderProps) => {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="shrink-0 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold leading-none">
                                Property #{property.propertyId || "N/A"}
                            </h1>
                            <Badge
                                variant={
                                    property.listingStatus === "ACTIVE" ? "default" : "secondary"
                                }
                                className={
                                    property.listingStatus === "ACTIVE"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : ""
                                }
                            >
                                {property.listingStatus ? property.listingStatus.replace("_", " ") : "Unknown"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {property.deletingStatus && (
                        <Badge variant="destructive" className="hidden sm:inline-flex">
                            Pending removal
                        </Badge>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="h-5 w-5" />
                                <span className="sr-only">Open actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onExportPdf} disabled={isExportingPdf}>
                                {isExportingPdf ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onFlag} className="text-destructive">
                                <ShieldX className="mr-2 h-4 w-4" />
                                Report Property
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
