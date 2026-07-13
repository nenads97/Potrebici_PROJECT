export type ApartmentStatus = "Available" | "Reserved" | "Sold";

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

export type Apartment = {
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
  plan: ApartmentPlanItem[];
  roomAreas: ApartmentRoomArea[];
  planVariant?: "stack-1-6-11" | "stack-2-7-12" | "stack-3-8-13" | "stack-4-9-14" | "stack-5-10-15";
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
  constructionStart: string;
  plannedCompletion: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  heroImage?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type ProjectStat = {
  value: string;
  label: string;
  detail: string;
};

export type ConstructionUpdate = {
  id: string;
  date: string;
  tag: string;
  title: string;
  body: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  tag: string;
  meta: string;
  variant: "facade" | "site" | "plan" | "location" | "interior" | "parking";
};

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  statusLabel?: string;
  state: "done" | "active" | "upcoming";
};

export type BuildingLevel = {
  level: string;
  title: string;
  items: string[];
};
