export type ApartmentStatus = "Available" | "Reserved" | "Sold";

export type ProjectUnitType =
  | "apartment"
  | "commercial_space"
  | "business_apartment";

export type ApartmentImage = {
  src: string;
  alt: string;
};

export type ApartmentPlanItem = {
  label: string;
  value: string;
};

export type ApartmentRoomArea = {
  id: string;
  number?: string;
  label: string;
  area: string;
};

export type ApartmentPlanVariant =
  | "stack-1-6-11"
  | "stack-2-7-12"
  | "stack-3-8-13"
  | "stack-4-9-14"
  | "stack-5-10-15"
  | "commercial-lokal-1"
  | "commercial-lokal-2";

export type Apartment = {
  unitType?: ProjectUnitType;
  slug?: string;
  sortOrder?: number;
  number: string;
  floor: string;
  floorNumber: number;
  size: string;
  rooms: string;
  status: ApartmentStatus;
  orientation: string;
  highlight: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  priceRange: string;
  availabilityNote: string;
  bathrooms: string;
  terrace: string;
  parking: string;
  storage: string;
  ceilingHeight: string;
  heroFloorPlan: ApartmentImage;
  projectFloorPlan: ApartmentImage;
  floorPlanPdfUrl?: string;
  plan: ApartmentPlanItem[];
  roomAreas: ApartmentRoomArea[];
  planVariant?: ApartmentPlanVariant;
  features: string[];
};

export type ProjectInfo = {
  name: string;
  address: string;
  city: string;
  district: string;
  status: string;
  lead: string;
  description: string;
  locationDescription?: string;
  floorStructure: string;
  plannedCompletion: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  heroImage?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  statusLabel?: string;
  state: "done" | "active" | "upcoming";
};

export type ProjectMediaItem = {
  id: string;
  title: string;
  mediaType: "project_image" | "construction_update_image";
  filePath: string;
  altText?: string;
  description?: string;
  sortOrder: number;
};
