import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";

export type ContactInquiryPayload = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
  projectSlug?: string;
  unitCode?: string;
  inquiryType?: "general" | "unit" | "viewing" | "availability";
  sourcePage: string;
  consentAccepted: boolean;
  website?: string;
};

export type LandOfferPayload = {
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  plotAreaM2: string;
  details: string;
  sourcePage: string;
  consentAccepted: boolean;
  website?: string;
};

export async function submitContactInquiry(payload: ContactInquiryPayload) {
  return invokeInquiryFunction("submit-contact-inquiry", payload);
}

export async function submitLandOffer(payload: LandOfferPayload) {
  return invokeInquiryFunction("submit-land-offer", payload);
}

async function invokeInquiryFunction(
  functionName: string,
  payload: ContactInquiryPayload | LandOfferPayload,
) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase nije konfigurisan. Proverite .env.local.");
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String(data.error));
  }

  return data;
}
