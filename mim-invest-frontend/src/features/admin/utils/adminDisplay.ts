import type {
  AdminMediaItem,
  AdminUnit,
  AdminWorkflowStatus,
} from "../types/admin.types";

export type AdminUnitContentDraft = {
  fullDescription: string;
  seoTitle: string;
  seoDescription: string;
};

export function filterWorkflowItems<
  T extends { fullName: string; phone: string; email: string; adminStatus: AdminWorkflowStatus },
>(
  items: T[],
  query: string,
  statusFilter: "all" | AdminWorkflowStatus,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.adminStatus === statusFilter;
    const searchable = Object.values(item).join(" ").toLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getApartmentPublicPath(unitCode: string) {
  const apartmentNumber = unitCode.match(/\d+/)?.[0];

  if (/lokal/i.test(unitCode) && apartmentNumber) {
    return `/projekti/heroja-pinkija-13/ponuda-stanova/lokal-${apartmentNumber}`;
  }

  return apartmentNumber
    ? `/projekti/heroja-pinkija-13/ponuda-stanova/${apartmentNumber}`
    : "/projekti/heroja-pinkija-13/ponuda-stanova";
}

export function getSafeAdminSourceHref(sourcePage: string) {
  const trimmedSource = sourcePage.trim();

  if (!trimmedSource || !trimmedSource.startsWith("/") || trimmedSource.startsWith("//")) {
    return null;
  }

  return trimmedSource;
}

export function getSortNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function formatUnitType(unitType: AdminUnit["unitType"]) {
  switch (unitType) {
    case "apartment":
      return "Stan";
    case "business_apartment":
      return "Apartman za poslovanje";
    case "commercial_space":
      return "Lokal";
    default:
      return "Jedinica";
  }
}

export function createUnitContentDraft(unit: AdminUnit): AdminUnitContentDraft {
  return {
    fullDescription: unit.fullDescription,
    seoTitle: unit.seoTitle,
    seoDescription: unit.seoDescription,
  };
}

export function formatPlanVariant(planVariant: string) {
  return planVariant
    .replace("stack-", "Vertikala ")
    .replace(/-/g, " / ");
}

export function isImagePath(filePath: string) {
  return /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i.test(filePath);
}

export function isImageMedia(item: AdminMediaItem) {
  return (
    item.mediaType === "project_image" ||
    item.mediaType === "unit_image" ||
    item.mediaType === "construction_update_image" ||
    isImagePath(item.filePath)
  );
}

export function hasMissingImageAltText(item: AdminMediaItem) {
  return isImageMedia(item) && !item.altText.trim();
}

export const maxStandardUploadSizeBytes = 6 * 1024 * 1024;

export function getMediaFileAccept(item: Pick<AdminMediaItem, "mediaType">) {
  if (isPdfMediaType(item.mediaType)) {
    return "application/pdf,.pdf";
  }

  return "image/png,image/jpeg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif";
}

export function isAllowedMediaFile(item: Pick<AdminMediaItem, "mediaType">, file: File) {
  const fileName = file.name.toLowerCase();

  if (isPdfMediaType(item.mediaType)) {
    return file.type === "application/pdf" || fileName.endsWith(".pdf");
  }

  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|avif)$/i.test(fileName)
  );
}

export function isPdfMediaType(mediaType: AdminMediaItem["mediaType"]) {
  return mediaType.endsWith("_pdf");
}

export function getMediaFileTypeError(item: Pick<AdminMediaItem, "mediaType">) {
  return isPdfMediaType(item.mediaType)
    ? "Za ovaj tip medija uploadujte PDF fajl."
    : "Za ovaj tip medija uploadujte sliku: PNG, JPG, WebP ili AVIF.";
}

export function isImageMediaDraft(item: Pick<AdminMediaItem, "mediaType">) {
  return (
    item.mediaType === "project_image" ||
    item.mediaType === "unit_image" ||
    item.mediaType === "construction_update_image"
  );
}

export function getFileExtension(filePath: string) {
  const fileName = filePath.split("?")[0] ?? "";
  const extension = fileName.match(/\.([a-z0-9]+)$/i)?.[1];

  return extension ? extension.toUpperCase() : "FAJL";
}

export function getMediaKindLabel(item: AdminMediaItem) {
  if (isImageMedia(item)) {
    return "Slika";
  }

  if (/\.pdf(\?.*)?$/i.test(item.filePath) || item.mediaType.includes("_pdf")) {
    return "PDF dokument";
  }

  return "Fajl";
}

export function getMediaUsageLabel(item: AdminMediaItem) {
  switch (item.mediaType) {
    case "project_image":
      return "Javna stranica projekta";
    case "unit_image":
      return "Tlocrt/prikaz stana";
    case "apartment_floor_plan_pdf":
      return "PDF tlocrt stana";
    case "building_floor_plan_pdf":
      return "PDF osnova objekta";
    case "garage_plan_pdf":
      return "PDF garaznih mesta";
    case "storage_plan_pdf":
      return "PDF ostava";
    case "general_brochure_pdf":
      return "Opsta prodajna brosura";
    case "construction_update_image":
      return "Status radova";
    default:
      return "Javni media fajl";
  }
}

export function getUploadTitle(fileName: string) {
  const cleanName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

  return cleanName || "Uploadovan fajl";
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return "Doslo je do greske pri komunikaciji sa Supabase bazom.";
}
