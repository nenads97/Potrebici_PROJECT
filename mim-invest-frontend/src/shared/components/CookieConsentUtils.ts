const cookieConsentStorageKey = "mim_cookie_consent_v1";
export const cookieConsentChangeEvent = "mim-cookie-consent-change";
export const cookieSettingsEvent = "mim-cookie-settings-open";

export type CookieConsentValue = "accepted" | "rejected";

export const getCookieConsent = (): CookieConsentValue | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(cookieConsentStorageKey);
    return storedValue === "accepted" || storedValue === "rejected"
      ? storedValue
      : null;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (value: CookieConsentValue) => {
  try {
    window.localStorage.setItem(cookieConsentStorageKey, value);
  } catch {
    // Consent remains active for the current page even if storage is blocked.
  }
  window.dispatchEvent(new Event(cookieConsentChangeEvent));
};

export const openCookieSettings = () => {
  window.dispatchEvent(new Event(cookieSettingsEvent));
};
