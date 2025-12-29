"use client";

import React from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSitePlanProps {
  url: string;
}

export const ProjectSitePlan = ({ url }: ProjectSitePlanProps) => {
  if (!url) return null;

  return (
    <div className="w-full h-[600px] bg-background rounded-lg overflow-hidden border flex flex-col shadow-sm">
      <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="h-4 w-4" />
          Site Plan
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={() => window.open(url, "_blank")}
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </Button>
      </div>
      <div className="flex-1 w-full bg-neutral-100 relative">
        <object
          data={url}
          type="application/pdf"
          className="w-full h-full absolute inset-0"
        >
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="mb-4">
              Unable to display PDF directly in your browser.
            </p>
            <Button onClick={() => window.open(url, "_blank")}>
              Open PDF in New Tab
            </Button>
          </div>
        </object>
      </div>
    </div>
  );
};
