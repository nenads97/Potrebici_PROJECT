import { useEffect, useRef, useState } from "react";

const turnstileScriptUrl =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileWidgetOptions = {
  sitekey: string;
  action: string;
  theme: "light" | "dark" | "auto";
  size: "normal" | "compact" | "flexible";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileWidgetOptions) => string | number;
  reset: (widgetId?: string | number) => void;
  remove?: (widgetId?: string | number) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

type TurnstileWidgetProps = {
  action: string;
  resetSignal: number;
  onToken: (token: string) => void;
  onError: () => void;
};

export const TurnstileWidget = ({
  action,
  resetSignal,
  onToken,
  onError,
}: TurnstileWidgetProps) => {
  const siteKey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "").trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unavailable">(
    siteKey ? "loading" : "unavailable",
  );

  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  }, [onError, onToken]);

  useEffect(() => {
    if (!siteKey) {
      onErrorRef.current();
      return undefined;
    }

    let isMounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            setStatus("ready");
            onTokenRef.current(token);
          },
          "expired-callback": () => {
            onTokenRef.current("");
          },
          "timeout-callback": () => {
            onTokenRef.current("");
            onErrorRef.current();
          },
          "error-callback": () => {
            setStatus("error");
            onTokenRef.current("");
            onErrorRef.current();
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
          onErrorRef.current();
        }
      });

    return () => {
      isMounted = false;

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove?.(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [action, siteKey]);

  useEffect(() => {
    if (resetSignal === 0 || !window.turnstile || widgetIdRef.current === null) {
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    onTokenRef.current("");
  }, [resetSignal]);

  return (
    <div
      ref={containerRef}
      className={`turnstile-widget turnstile-widget--${status}`}
      aria-live="polite"
    >
      {status === "loading" ? "Učitavanje sigurnosne provere…" : null}
      {status === "unavailable"
        ? "Sigurnosna provera trenutno nije podešena."
        : null}
      {status === "error"
        ? "Sigurnosna provera nije dostupna. Osvežite stranicu i pokušajte ponovo."
        : null}
    </div>
  );
};

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-mim-turnstile="true"]',
    );
    const script = existingScript ?? document.createElement("script");

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
    const handleLoad = () => {
      cleanup();

      if (window.turnstile) {
        resolve();
      } else {
        reject(new Error("Turnstile API nije dostupna."));
      }
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Turnstile skripta nije učitana."));
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      script.async = true;
      script.defer = true;
      script.dataset.mimTurnstile = "true";
      script.src = turnstileScriptUrl;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}
