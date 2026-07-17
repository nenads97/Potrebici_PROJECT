import { Component, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { BrandLogo } from "./BrandLogo";

type ErrorBoundaryVariant = "public" | "admin";

type AppErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
  variant: ErrorBoundaryVariant;
};

type AppErrorBoundarystate = {
  error: Error | null;
};

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundarystate
> {
  state: AppErrorBoundarystate = {
    error: null,
  };

  static getDerivedstateFromError(error: Error) {
    return { error };
  }

  componentDidCatch() {
    // Reserved for a future monitoring hook. Keep UI recovery local for v1.
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback onReset={this.reset} variant={this.props.variant} />
      );
    }

    return this.props.children;
  }
}

type ErrorFallbackProps = {
  onReset: () => void;
  variant: ErrorBoundaryVariant;
};

const ErrorFallback = ({ onReset, variant }: ErrorFallbackProps) => {
  const isAdmin = variant === "admin";

  return (
    <main
      className={`app-error-fallback app-error-fallback--${variant}`}
      role="alert"
      aria-live="assertive"
    >
      <section className="app-error-fallback__card">
        <BrandLogo />
        <p className="section-eyebrow">
          {isAdmin ? "Admin panel" : "Privremena greska"}
        </p>
        <h1>Stranica se nije učitala kako treba.</h1>
        <p>
          {isAdmin
            ? "Podaci nisu izgubljeni. Osvežite prikaz ili se vratite na početak admin panela."
            : "Izgleda da je doslo do privremenog problema u prikazu. Možete pokusati ponovo ili se vratiti na početnu stranicu."}
        </p>
        <div className="app-error-fallback__actions">
          <button
            className="site-button site-button--accent"
            type="button"
            onClick={onReset}
          >
            Pokusaj ponovo
          </button>
          <Link
            className="site-button site-button--outline"
            to={isAdmin ? "/admin" : "/"}
            onClick={onReset}
          >
            {isAdmin ? "Nazad na admin" : "Nazad na pocetnu"}
          </Link>
        </div>
      </section>
    </main>
  );
};

type RouteErrorBoundaryProps = {
  children: ReactNode;
};

export const RouteErrorBoundary = ({ children }: RouteErrorBoundaryProps) => {
  const location = useLocation();
  const variant: ErrorBoundaryVariant = location.pathname.startsWith("/admin")
    ? "admin"
    : "public";

  return (
    <AppErrorBoundary resetKey={location.pathname} variant={variant}>
      {children}
    </AppErrorBoundary>
  );
};
