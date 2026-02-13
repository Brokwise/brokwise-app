import { ResourceCatalog } from "@/types/resource";

const makeItem = (
  key: string,
  label: string,
  section: "resource" | "tool",
  scope: "common" | "state",
  targetType: "internal" | "external",
  target: string,
  stateCode?: string
) => ({
  _id: `fallback-${key}-${stateCode || "common"}`,
  itemGroupId: `fallback-${key}-${stateCode || "common"}`,
  key,
  label,
  section,
  scope,
  stateCode,
  targetType,
  target,
  openMode: "new_tab" as const,
  icon: undefined,
  description: undefined,
  isActive: true,
  status: "published" as const,
  sortOrder: 100,
  version: 1,
  isLatest: true,
});

export const FALLBACK_RESOURCE_CATALOG: ResourceCatalog = {
  states: [
    { _id: "fallback-RJ", code: "RJ", name: "Rajasthan", isActive: true, sortOrder: 10 },
    { _id: "fallback-HR", code: "HR", name: "Haryana", isActive: true, sortOrder: 20 },
    { _id: "fallback-UP", code: "UP", name: "Uttar Pradesh", isActive: true, sortOrder: 30 },
    { _id: "fallback-DL", code: "DL", name: "Delhi", isActive: true, sortOrder: 40 },
  ],
  selectedState: "RJ",
  tools: [
    makeItem("land-converter", "Land Converter", "tool", "common", "internal", "/resources/land-convertor"),
  ],
  commonResources: [
    makeItem("news", "News", "resource", "common", "internal", "/resources/news"),
  ],
  stateResources: [
    makeItem("rera", "RERA", "resource", "state", "external", "https://rera.rajasthan.gov.in/", "RJ"),
    makeItem("apna-khata", "Apna Khata", "resource", "state", "external", "https://apnakhata.rajasthan.gov.in/", "RJ"),
  ],
};

export const FALLBACK_STATE_RESOURCE_MAP: Record<string, ResourceCatalog["stateResources"]> = {
  RJ: [
    makeItem("all-development-authority", "All Development Authority", "resource", "state", "external", "https://urban.rajasthan.gov.in/home", "RJ"),
    makeItem("rera", "RERA", "resource", "state", "external", "https://rera.rajasthan.gov.in/", "RJ"),
    makeItem("epanjiyan", "E-Panjiyan", "resource", "state", "external", "https://epanjiyan.rajasthan.gov.in/", "RJ"),
    makeItem("bhunaksha", "Bhunaksha", "resource", "state", "external", "https://bhunaksha.rajasthan.gov.in/", "RJ"),
  ],
  HR: [
    makeItem("hrera", "HRERA Panchkula", "resource", "state", "external", "https://haryanarera.gov.in", "HR"),
    makeItem("jamabandi", "Jamabandi Haryana", "resource", "state", "external", "https://jamabandi.nic.in", "HR"),
  ],
  UP: [
    makeItem("up-rera", "UP RERA", "resource", "state", "external", "https://www.up-rera.in/", "UP"),
    makeItem("igrsup", "IGRSUP", "resource", "state", "external", "https://igrsup.gov.in/", "UP"),
  ],
  DL: [
    makeItem("registration-deeds", "Registration/Deeds", "resource", "state", "external", "https://doris.delhigovt.nic.in", "DL"),
    makeItem("rera-projects", "RERA Projects", "resource", "state", "external", "https://rera.delhi.gov.in", "DL"),
  ],
};
