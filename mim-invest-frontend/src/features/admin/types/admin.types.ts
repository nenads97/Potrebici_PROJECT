export type AdminWorkflowStatus = "new" | "contacted" | "closed";

export type AdminUnitStatus = "available" | "reserved" | "sold";

export type AdminTimelineState = "done" | "active" | "upcoming";

export type AdminInquiryAttachment = {
  path: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
};

export type AdminInquiry = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  inquiryType: "general" | "unit" | "viewing" | "availability";
  projectSlug: string;
  unitCode?: string;
  sourcePage: string;
  adminStatus: AdminWorkflowStatus;
  adminNote: string;
  attachment?: AdminInquiryAttachment;
  createdAt: string;
};

export type AdminLandOffer = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  plotAreaM2: number;
  details: string;
  sourcePage: string;
  adminStatus: AdminWorkflowStatus;
  adminNote: string;
  attachment?: AdminInquiryAttachment;
  createdAt: string;
};

export type AdminUnit = {
  id: string;
  unitCode: string;
  unitType: "apartment" | "commercial_space" | "business_apartment";
  floorLabel: string;
  areaM2: string;
  roomStructure: string;
  status: AdminUnitStatus;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
  publicPath?: string;
  planVariant?: string;
  floorPlanPath?: string;
  isPublished: boolean;
};

export type AdminProjectDraft = {
  id: string;
  name: string;
  address: string;
  statusLabel: string;
  shortDescription: string;
  fullDescription: string;
  locationDescription: string;
  floorStructure: string;
  constructionStartDate: string;
  constructionEndDate: string;
  heroImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  projectStatus: "planned" | "active" | "completed" | "hidden";
};

export type AdminConstructionUpdate = {
  id: string;
  title: string;
  tag: string;
  statusLabel: string;
  shortDescription: string;
  updateDate: string;
  timelineState: AdminTimelineState;
  sortOrder: number;
  isPublished: boolean;
};

export type AdminMediaItem = {
  id: string;
  projectId?: string;
  unitId?: string;
  title: string;
  mediaType:
    | "project_image"
    | "unit_image"
    | "apartment_floor_plan_pdf"
    | "building_floor_plan_pdf"
    | "garage_plan_pdf"
    | "storage_plan_pdf"
    | "general_brochure_pdf"
    | "construction_update_image";
  filePath: string;
  altText: string;
  isPublished: boolean;
};
