"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DisclaimerNotice } from "@/components/ui/disclaimer-notice";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

const WebViewContent = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const title = searchParams.get("title");
  const resourceKey = searchParams.get("resourceKey");
  const stateCode = searchParams.get("stateCode");

  const isSafeUrl = (value: string) => {
    if (/^javascript:/i.test(value)) return false;
    return /^https?:\/\//i.test(value);
  };

  if (!url || !isSafeUrl(url)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Invalid or missing URL</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div>
          <h1 className="text-lg font-bold">{title || "External Resource"}</h1>
          {(stateCode || resourceKey) && (
            <p className="text-xs text-muted-foreground">
              {[stateCode, resourceKey].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white bg-primary px-3 py-2 hover:underline"
        >
          Open in new tab
        </a>
      </div>
      <div className="p-3 border-b bg-background">
        <DisclaimerNotice text={DISCLAIMER_TEXT.resourcesExternal} />
      </div>
      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground -z-10 bg-muted/20">
          <p className="mb-2">Loading external content...</p>
          <p className="text-sm">
            If the content does not appear, it may be blocked by the website.
          </p>
        </div>
        <iframe
          src={url}
          className="w-full h-full border-0 bg-background"
          title={title || "External Content"}
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

const WebViewPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <WebViewContent />
    </Suspense>
  );
};

export default WebViewPage;
