import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { isCurrentUserAdmin } from "../data/adminAuth.api";
import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";

type AuthState = "checking" | "allowed" | "denied";

export const RequireAdminAuth = () => {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!isSupabaseConfigured || !supabase) {
        setAuthState("denied");
        return;
      }

      const canAccessAdmin = await isCurrentUserAdmin();

      if (!isMounted) {
        return;
      }

      setAuthState(canAccessAdmin ? "allowed" : "denied");
    }

    verifySession();

    const { data } =
      supabase?.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setAuthState("denied");
          return;
        }

        isCurrentUserAdmin().then((canAccessAdmin) => {
          setAuthState(canAccessAdmin ? "allowed" : "denied");
        });
      }) ?? {};

    return () => {
      isMounted = false;
      data?.subscription.unsubscribe();
    };
  }, []);

  if (authState === "checking") {
    return (
      <main className="admin-login">
        <section className="admin-login__card" aria-live="polite">
          <p className="section-eyebrow">Admin pristup</p>
          <h1>Provera sesije.</h1>
          <p>Proveravamo Supabase Auth sesiju pre otvaranja admin panela.</p>
        </section>
      </main>
    );
  }

  if (authState === "denied") {
    return <Navigate to="/admin/prijava" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
