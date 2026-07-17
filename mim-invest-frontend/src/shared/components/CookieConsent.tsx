import { useEffect, useState } from "react";

import {
  cookieConsentChangeEvent,
  cookieSettingsEvent,
  getCookieConsent,
  openCookieSettings,
  saveCookieConsent,
  type CookieConsentValue,
} from "./CookieConsentUtils";

export const CookieConsentBanner = () => {
  const [consent, setConsent] = useState<CookieConsentValue | null>(() =>
    getCookieConsent(),
  );

  useEffect(() => {
    const updateConsent = () => setConsent(getCookieConsent());
    const openSettings = () => setConsent(null);

    window.addEventListener(cookieConsentChangeEvent, updateConsent);
    window.addEventListener(cookieSettingsEvent, openSettings);

    return () => {
      window.removeEventListener(cookieConsentChangeEvent, updateConsent);
      window.removeEventListener(cookieSettingsEvent, openSettings);
    };
  }, []);

  if (consent) {
    return null;
  }

  return (
    <aside
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="cookie-consent__copy">
        <p className="cookie-consent__eyebrow">Privatnost</p>
        <h2 id="cookie-consent-title">Vaša privatnost je važna.</h2>
        <p id="cookie-consent-description">
          Sajt koristi neophodne tehničke mehanizme za rad formi i zaštitu od
          spam-a. Interaktivna Google mapa, kao sadržaj treće strane, učitava se
          samo ako to dozvolite.
        </p>
      </div>
      <div className="cookie-consent__actions">
        <button
          className="cookie-consent__button cookie-consent__button--secondary"
          type="button"
          onClick={() => {
            saveCookieConsent("rejected");
            setConsent("rejected");
          }}
        >
          Odbij
        </button>
        <button
          className="cookie-consent__button cookie-consent__button--primary"
          type="button"
          onClick={() => {
            saveCookieConsent("accepted");
            setConsent("accepted");
          }}
        >
          Prihvati opcioni sadržaj
        </button>
      </div>
    </aside>
  );
};

export const CookiePreferencesButton = () => (
  <button
    className="site-footer__privacy-button"
    type="button"
    onClick={openCookieSettings}
  >
    Podešavanja privatnosti
  </button>
);
