import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { isCurrentUserAdmin } from "../data/adminAuth.api";
import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";

type AuthState = "checking" | "allowed" | "denied";

export const RequireAdminAuth = () => {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>(
    isSupabaseConfigured ? "checking" : "denied",
  );

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setAuthState("denied");
          return;
        }

        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN" && event !== "USER_UPDATED") {
          return;
        }

        window.setTimeout(() => {
          void isCurrentUserAdmin(session.user.id).then((canAccessAdmin) => {
            if (isMounted) {
              setAuthState(canAccessAdmin ? "allowed" : "denied");
            }
          });
        }, 0);
      });

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
