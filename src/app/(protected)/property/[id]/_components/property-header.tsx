import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreVertical, ShieldX } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Property } from "@/types/property";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { Edit } from "lucide-react";

interface PropertyHeaderProps {
    property: Property;
    onFlag: () => void;
}

export const PropertyHeader = ({
    property,
    onFlag,
}: PropertyHeaderProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { brokerData } = useApp();

    const isOwner = property.listedBy?._id === brokerData?._id;

    return (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
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
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-muted/50 rounded-lg border">
                            <span className="text-sm font-medium text-muted-foreground">#{property.propertyId || "N/A"}</span>
                        </div>
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
                        {isOwner && (
                            <Badge variant="outline" className="text-xs">
                                Edits: {property.editCount || 0}/3
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {property.deletingStatus && (
                        <Badge variant="destructive" className="hidden sm:inline-flex">
                            {t("label_pending_removal")}
                        </Badge>
                    )}
                    {property.listingStatus !== "DELETED" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-2">
                                    <MoreVertical className="h-5 w-5" />
                                    <span className="sr-only">{t("action_open_actions")}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isOwner && (property.editCount || 0) < 3 && (
                                    <DropdownMenuItem onClick={() => router.push(`/property/edit/${property._id}`)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        {t("action_edit") || "Edit Property"}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={onFlag} className="text-destructive">
                                    <ShieldX className="mr-2 h-4 w-4" />
                                    {t("property_report_property")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </div>
    );
};
