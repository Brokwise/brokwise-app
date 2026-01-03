export interface Project {
  _id: string;
  name: string;
  developerId:
    | string
    | { _id: string; firstName: string; lastName: string; email: string };
  reraNumber: string;
  projectType: "land";
  projectUse: "residential" | "commercial" | "agricultural";
  legalStatus: "clear_title" | "pending_conversion" | "encumbrance_note";
  numberOfPlots: number;
  address: {
    state: string;
    city: string;
    address: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  possessionDate: string; // Date string
  description: string;
  approvalDocuments: string[];
  sitePlan?: string;
  images: string[];
  amenities: string[];
  developmentStatus:
    | "ready-to-develop"
    | "ready-to-move"
    | "under-development"
    | "phase-info";
  projectStatus: "draft" | "active" | "delisted" | "completed";
  projectId: string;
  totalArea?: number;
  totalAreaUnit?:
    | "SQ_FT"
    | "SQ_METER"
    | "SQ_YARDS"
    | "ACRES"
    | "HECTARE"
    | "BIGHA";
  priceRange?: {
    min?: number;
    max?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Plot {
  _id: string;
  projectId: string;
  blockId: {
    _id: string;
    name: string;
  };
  plotNumber: string;
  area: number;
  areaUnit: "SQ_FT" | "SQ_METER" | "SQ_YARDS" | "ACRES";
  dimensions?: {
    length?: number;
    width?: number;
    unit?: "FEET" | "METER";
  };
  price: number;
  pricePerUnit: number;
  facing:
    | "NORTH"
    | "SOUTH"
    | "EAST"
    | "WEST"
    | "NORTH_EAST"
    | "NORTH_WEST"
    | "SOUTH_EAST"
    | "SOUTH_WEST";
  plotType: "CORNER" | "ROAD" | "REGULAR";
  frontRoadWidth?: number;
  status: "available" | "booked" | "reserved" | "sold" | "on_hold";
  canvasPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  boundaries?: {
    type: "Polygon";
    coordinates: number[][][];
  };
  bookedBy?: string;
  bookingDate?: string;
  soldDate?: string;
  createdAt: string;
  holdExpiresAt?: string;
  updatedAt: string;
}

export interface ProjectStats {
  available: number;
  booked: number;
  reserved: number;
  sold: number;
}

export interface ProjectDetailsResponse {
  project: Project;
  plotStats: ProjectStats;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPlotsResponse {
  plots: Plot[];
  pagination: Pagination;
}

export interface PaginatedProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}
