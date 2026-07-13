import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { isCurrentUserAdmin } from "../../../features/admin/data/adminAuth.api";
import { BrandLogo } from "../../../shared/components/BrandLogo";
import { PageMeta } from "../../../shared/components/PageMeta";
import { isSupabaseConfigured, supabase } from "../../../shared/supabase/client";

const adminLoginSubmitTimeoutMs = 5000;

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function redirectIfSignedIn() {
      if (!supabase) {
        return;
      }

      const canAccessAdmin = await isCurrentUserAdmin();

      if (isMounted && canAccessAdmin) {
        navigate(from ?? "/admin/upiti-stanovi", { replace: true });
      }
    }

    redirectIfSignedIn();

    return () => {
      isMounted = false;
    };
  }, [from, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase env nije podesen. Proverite .env.local fajl.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await withAdminLoginTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
      );

      if (error) {
        setMessage("Prijava nije uspela. Proverite email, lozinku i admin profil.");
        return;
      }

      const canAccessAdmin = await isCurrentUserAdmin();

      if (!canAccessAdmin) {
        await supabase.auth.signOut();
        setMessage("Nalog postoji, ali nije dodat u admin_profiles.");
        return;
      }

      navigate(from ?? "/admin/upiti-stanovi", { replace: true });
    } catch {
      setMessage("Prijava nije stigla na vreme. Proverite konekciju i pokusajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Admin prijava | M & M Gradnja"
        description="Privatna prijava za M & M Gradnja administratore."
        canonicalPath="/admin/prijava"
        robots="noindex,nofollow"
      />
      <a className="skip-link" href="#main-content">
        Preskoci na prijavu
      </a>
      <main id="main-content" className="admin-login main-content-anchor" tabIndex={-1}>
        <section className="admin-login__card" aria-labelledby="admin-login-title">
          <BrandLogo />
          <div>
            <p className="section-eyebrow">Admin pristup</p>
            <h1 id="admin-login-title">Prijava u panel.</h1>
            <p>
              Prijavite se admin nalogom koji je dodat u Supabase Auth i povezan sa
              admin profilom.
            </p>
          </div>

          <form className="admin-login__form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <label className="form-field" htmlFor="admin-login-email">
              <span className="form-label">Email</span>
              <span className="admin-input-wrap">
                <Mail />
                <input
                  id="admin-login-email"
                  className="form-input"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@mimgradnja.rs"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>

            <label className="form-field" htmlFor="admin-login-password">
              <span className="form-label">Lozinka</span>
              <span className="admin-input-wrap">
                <LockKeyhole />
                <input
                  id="admin-login-password"
                  className="form-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Unesite lozinku"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </span>
            </label>

            {message ? (
              <p className="admin-form-message" role="alert">
                {message}
              </p>
            ) : null}

            <button className="site-button site-button--dark" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Provera pristupa..." : "Udji u admin panel"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

function withAdminLoginTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Supabase login provera je istekla."));
    }, adminLoginSubmitTimeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}
