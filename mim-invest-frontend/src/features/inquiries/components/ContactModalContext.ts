import { createContext, useContext } from "react";

import type { ContactInquiryPayload } from "../api/inquiryFunctions.api";

type ContactInquiryType = NonNullable<ContactInquiryPayload["inquiryType"]>;

export type ContactModalDetail = {
  label: string;
  value: string;
};

export type ContactModalOptions = {
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  reassuranceText?: string;
  successMessage?: string;
  inquiryType?: ContactInquiryType;
  projectSlug?: string;
  unitCode?: string;
  details?: ContactModalDetail[];
  messagePlaceholder?: string;
  sourcePage?: string;
};

export type ContactModalContextValue = {
  openContactModal: (options?: ContactModalOptions) => void;
  closeContactModal: () => void;
};

export const defaultModalOptions: Required<
  Pick<
    ContactModalOptions,
    | "eyebrow"
    | "title"
    | "description"
    | "submitLabel"
    | "reassuranceText"
    | "successMessage"
    | "inquiryType"
    | "projectSlug"
  >
> &
  Pick<ContactModalOptions, "details" | "messagePlaceholder" | "sourcePage" | "unitCode"> = {
  eyebrow: "Pisite nam",
  title: "Kontaktirajte prodaju",
  description:
    "Ostavite podatke i napisite sta vas zanima. Prodajni tim ce vam se javiti sa informacijama o dostupnosti, ceni i narednim koracima.",
  submitLabel: "Posaljite upit",
  reassuranceText: "Odgovaramo u najkracem roku. Slanje upita vas ne obavezuje na kupovinu.",
  successMessage: "Hvala. Upit je poslat i prodajni tim ce vas kontaktirati.",
  inquiryType: "general",
  projectSlug: "heroja-pinkija-13",
  details: [],
  messagePlaceholder: "Napisite koji stan, kvadratura ili termin obilaska vas zanima.",
  sourcePage: undefined,
  unitCode: undefined,
};

export const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export const useContactModal = () => {
  const context = useContext(ContactModalContext);

  if (!context) {
    throw new Error("useContactModal mora biti koriscen unutar ContactModalProvider.");
  }

  return context;
};
