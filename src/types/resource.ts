export type ResourceSection = "resource" | "tool";
export type ResourceScope = "common" | "state";
export type ResourceTargetType = "internal" | "external";
export type ResourceOpenMode = "webview" | "new_tab";
export type ResourceStatus = "draft" | "published" | "archived";

export interface ResourceState {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ResourceItem {
  _id: string;
  itemGroupId: string;
  key: string;
  label: string;
  section: ResourceSection;
  scope: ResourceScope;
  stateCode?: string;
  targetType: ResourceTargetType;
  target: string;
  openMode: ResourceOpenMode;
  icon?: string;
  description?: string;
  isActive: boolean;
  status: ResourceStatus;
  sortOrder: number;
  version: number;
  isLatest: boolean;
}

export interface ResourceCatalog {
  states: ResourceState[];
  selectedState?: string;
  tools: ResourceItem[];
  commonResources: ResourceItem[];
  stateResources: ResourceItem[];
}
