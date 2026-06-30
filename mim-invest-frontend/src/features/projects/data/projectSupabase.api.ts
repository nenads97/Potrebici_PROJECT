import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";
import type { Apartment, ApartmentStatus } from "../types/project.types";
import { apartments as fallbackApartments } from "./herojaPinkija13.data";

const statusMap: Record<string, ApartmentStatus> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

function getApartmentStructure(apartmentNumber: string) {
  const normalizedNumber = Number(apartmentNumber);
  const stackPosition = ((normalizedNumber - 1) % 5) + 1;

  if (stackPosition === 1 || stackPosition === 2) {
    return "Trosoban";
  }

  if (stackPosition === 3) {
    return "Garsonjera";
  }

  if (stackPosition === 4 || stackPosition === 5) {
    return "Dvosoban";
  }

  return null;
}

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
    const apartmentNumber = unit.code.replace(/\D/g, "");
    const fallback =
      fallbackApartments.find((apartment) => apartment.number === apartmentNumber) ?? fallbackApartments[0];
    const area = unit.area_m2 ? `${unit.area_m2} m2` : fallback.size;
    const rooms = getApartmentStructure(apartmentNumber) ?? unit.room_structure ?? fallback.rooms;

    return {
      ...fallback,
      number: unit.code.replace(/^Stan\s*/i, "") || unit.code,
      floor: unit.floor_label ?? fallback.floor,
      floorNumber: unit.floor_number ?? fallback.floorNumber,
      size: area,
      rooms,
      status: statusMap[unit.status] ?? fallback.status,
      orientation: unit.orientation ?? fallback.orientation,
      highlight: unit.short_description ?? fallback.highlight,
      description: unit.full_description ?? fallback.description,
      bathrooms: unit.bathrooms ?? fallback.bathrooms,
      terrace: unit.terrace ?? fallback.terrace,
      heroFloorPlan: fallback.heroFloorPlan,
      projectFloorPlan: fallback.projectFloorPlan,
      plan: [
        { label: "Ukupna povrsina", value: area },
        { label: "Struktura", value: rooms },
        { label: "Kupatila", value: unit.bathrooms ?? fallback.bathrooms },
        { label: "Terasa", value: unit.terrace ?? fallback.terrace },
      ],
      features: Array.isArray(unit.features)
        ? unit.features.filter((item: unknown): item is string => typeof item === "string")
        : fallback.features,
    };
  });
}
