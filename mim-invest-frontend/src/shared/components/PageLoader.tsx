import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

type PageLoaderProps = {
  label?: string;
  tone?: "page" | "panel";
};

export const PageLoader = ({ label = "Ucitavanje", tone = "page" }: PageLoaderProps) => {
  return (
    <div className={`page-loader page-loader--${tone}`} role="status" aria-live="polite">
      <div className="page-loader__card">
        <span className="page-loader__mark" aria-hidden="true">
          <span />
        </span>
        <span className="page-loader__content">
          <span className="page-loader__eyebrow">M &amp; M Gradnja</span>
          <span className="page-loader__label">{label}</span>
        </span>
      </div>
    </div>
  );
};

type LazySectionProps = {
  children?: ReactNode;
  label?: string;
};

export const LazySectionLoader = ({ children, label = "Ucitavanje sadrzaja" }: LazySectionProps) => {
  return (
    <div className="lazy-section-loader">
      {children ?? <PageLoader label={label} tone="panel" />}
    </div>
  );
};

export const RouteTransitionLoader = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsTransitioning(true);
    const timeoutId = window.setTimeout(() => setIsTransitioning(false), 420);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  if (!isTransitioning) {
    return null;
  }

  return (
    <div className="route-transition-loader" aria-hidden="true">
      <div className="route-transition-loader__bar" />
    </div>
  );
};
