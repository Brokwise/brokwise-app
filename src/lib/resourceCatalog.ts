import {
  Calculator,
  ExternalLink,
  FileText,
  Gavel,
  Globe,
  LandPlot,
  LucideIcon,
  Map,
  NewspaperIcon,
} from "lucide-react";
import { ResourceItem } from "@/types/resource";

export const RESOURCE_ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  FileText,
  Gavel,
  Map,
  NewspaperIcon,
  LandPlot,
};

export const resolveResourceIcon = (item: ResourceItem): LucideIcon => {
  if (item.icon && RESOURCE_ICON_MAP[item.icon]) {
    return RESOURCE_ICON_MAP[item.icon];
  }

  if (item.targetType === "external") {
    return Globe;
  }

  if (item.section === "tool") {
    return Calculator;
  }

  return FileText;
};

export const buildResourceHref = (item: ResourceItem, stateCode?: string): string => {
  if (item.targetType === "internal") {
    return item.target;
  }

  if (item.openMode === "new_tab") {
    return item.target;
  }

  const params = new URLSearchParams({
    url: item.target,
    title: item.label,
    resourceKey: item.key,
    openMode: item.openMode,
  });

  if (stateCode) {
    params.set("stateCode", stateCode);
  }

  return `/resources/webview?${params.toString()}`;
};

export const isResourceActive = (
  item: ResourceItem,
  pathname: string,
  currentResourceKey?: string
): boolean => {
  if (currentResourceKey && currentResourceKey === item.key) {
    return true;
  }

  if (item.targetType === "internal") {
    return pathname === item.target;
  }

  if (item.openMode === "webview") {
    return pathname === "/resources/webview";
  }

  return false;
};

export const opensInNewTab = (item: ResourceItem) =>
  item.targetType === "external" && item.openMode === "new_tab";

export const ExternalIndicatorIcon = ExternalLink;
