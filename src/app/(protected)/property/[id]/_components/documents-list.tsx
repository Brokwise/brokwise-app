"use client";

import { FileText } from "lucide-react";
import { Property } from "@/types/property";
import { useTranslation } from "react-i18next";

interface DocumentsListProps {
    property: Property;
}

export const DocumentsList = ({ property }: DocumentsListProps) => {
    const { t } = useTranslation();

    if (property.listingStatus === "DELETED") return null;

    const documents = [
        ...(property.floorPlans?.map((url, i) => ({
            name: `${t("property_floor_plan")} ${i + 1}`,
            url,
            type: t("property_floor_plan_type"),
        })) || []),
        ...(property.jamabandiUrl
            ? [{ name: t("label_jamabandi_document"), url: property.jamabandiUrl, type: t("property_legal_type") }]
            : []),
        ...(property.khasraPlanUrl
            ? [{ name: t("label_khasra_plan"), url: property.khasraPlanUrl, type: t("property_legal_type") }]
            : []),
    ];

    if (documents.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("label_documents")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, index) => (
                    <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                    >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
