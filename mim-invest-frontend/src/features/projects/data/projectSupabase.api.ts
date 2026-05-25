import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";
import type { Apartment, ApartmentStatus } from "../types/project.types";
import { apartments as fallbackApartments } from "./herojaPinkija13.data";

const statusMap: Record<string, ApartmentStatus> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export async function fetchApartments() {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackApartments;
  }

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("unit_type", "apartment")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map<Apartment>((unit) => {
    const fallback =
      fallbackApartments.find((apartment) => apartment.number === unit.code.replace(/\D/g, "")) ??
      fallbackApartments[0];
    const area = unit.area_m2 ? `${unit.area_m2} m2` : fallback.size;

    return {
      ...fallback,
      number: unit.code.replace(/^Stan\s*/i, "") || unit.code,
      floor: unit.floor_label ?? fallback.floor,
      floorNumber: unit.floor_number ?? fallback.floorNumber,
      size: area,
      rooms: unit.room_structure ?? fallback.rooms,
      status: statusMap[unit.status] ?? fallback.status,
      orientation: unit.orientation ?? fallback.orientation,
      highlight: unit.short_description ?? fallback.highlight,
      description: unit.full_description ?? fallback.description,
      bathrooms: unit.bathrooms ?? fallback.bathrooms,
      terrace: unit.terrace ?? fallback.terrace,
      images: unit.gallery_images && Array.isArray(unit.gallery_images) ? fallback.images : fallback.images,
      plan: [
        { label: "Ukupna povrsina", value: area },
        { label: "Struktura", value: unit.room_structure ?? fallback.rooms },
        { label: "Kupatila", value: unit.bathrooms ?? fallback.bathrooms },
        { label: "Terasa", value: unit.terrace ?? fallback.terrace },
      ],
      features: Array.isArray(unit.features)
        ? unit.features.filter((item: unknown): item is string => typeof item === "string")
        : fallback.features,
    };
  });
}
