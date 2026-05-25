export type AdminWorkflowStatus = "new" | "contacted" | "closed";

export type AdminUnitStatus = "available" | "reserved" | "sold";

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
  isPublished: boolean;
};

export type AdminProjectDraft = {
  id: string;
  name: string;
  address: string;
  shortDescription: string;
  locationDescription: string;
  floorStructure: string;
  constructionStartDate: string;
  constructionEndDate: string;
  projectStatus: "planned" | "active" | "completed" | "hidden";
};

export type AdminMediaItem = {
  id: string;
  title: string;
  mediaType:
    | "project_image"
    | "unit_image"
    | "apartment_floor_plan_pdf"
    | "building_floor_plan_pdf"
    | "general_brochure_pdf"
    | "construction_update_image";
  filePath: string;
  altText: string;
  isPublished: boolean;
};
