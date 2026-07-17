import { lazy, Suspense, useEffect } from "react";
import type { ComponentType } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import { ContactModalProvider } from "../../features/inquiries/components/ContactModal";
import { RouteErrorBoundary } from "../../shared/components/ErrorBoundary";
import { LazySectionLoader, PageLoader, RouteTransitionLoader } from "../../shared/components/PageLoader";

const lazyNamed = <TProps extends object>(
  loader: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string,
) =>
  lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });

const RequireAdminAuth = lazyNamed(
  () => import("../../features/admin/components/RequireAdminAuth"),
  "RequireAdminAuth",
);
const AdminLayout = lazyNamed(() => import("../../views/layout/AdminLayout"), "AdminLayout");
const MainLayout = lazyNamed(() => import("../../views/layout/MainLayout"), "MainLayout");
const AdminDashboardPage = lazyNamed(
  () => import("../../views/pages/admin/AdminDashboardPage"),
  "AdminDashboardPage",
);
const AdminLoginPage = lazyNamed(
  () => import("../../views/pages/admin/AdminLoginPage"),
  "AdminLoginPage",
);
const AboutPage = lazyNamed(() => import("../../views/pages/AboutPage"), "AboutPage");
const ContactPage = lazyNamed(() => import("../../views/pages/ContactPage"), "ContactPage");
const HomePage = lazyNamed(() => import("../../views/pages/HomePage"), "HomePage");
const LandBuyPage = lazyNamed(() => import("../../views/pages/LandBuyPage"), "LandBuyPage");
const LocationPage = lazyNamed(() => import("../../views/pages/LocationPage"), "LocationPage");
const NotFoundPage = lazyNamed(() => import("../../views/pages/NotFoundPage"), "NotFoundPage");
const PrivacyPolicyPage = lazyNamed(
  () => import("../../views/pages/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);
const ApartmentDetailsPage = lazyNamed(
  () => import("../../views/pages/projects/HerojaPinkija13/ApartmentDetailsPage"),
  "ApartmentDetailsPage",
);
const ApartmentsPage = lazyNamed(
  () => import("../../views/pages/projects/HerojaPinkija13/ApartmentsPage"),
  "ApartmentsPage",
);
const ApartmentsTablePage = lazyNamed(
  () => import("../../views/pages/projects/HerojaPinkija13/ApartmentsPage"),
  "ApartmentsTablePage",
);
const HerojaPinkija13Page = lazyNamed(
  () => import("../../views/pages/projects/HerojaPinkija13/HerojaPinkija13Page"),
  "HerojaPinkija13Page",
);

const ScrollToTop = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [hash, pathname]);

  return null;
};

const LegacyApartmentRedirect = () => {
  const { apartmentNumber } = useParams();

  return (
    <Navigate
      replace
      to={`/projekti/heroja-pinkija-13/ponuda-stanova/${apartmentNumber ?? ""}`}
    />
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ContactModalProvider>
        <ScrollToTop />
        <RouteTransitionLoader />
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoader label="Učitavanje stranice" />}>
            <Routes>
              <Route path="/admin/prijava" element={<AdminLoginPage />} />
              <Route element={<RequireAdminAuth />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route
                    index
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="overview" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="upiti-stanovi"
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="inquiries" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="upiti-placevi"
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="land" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="stanovi"
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="units" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="projekat"
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="project" />
                      </Suspense>
                    }
                  />
                  <Route
                    path="fajlovi"
                    element={
                      <Suspense fallback={<LazySectionLoader />}>
                        <AdminDashboardPage section="media" />
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<Navigate replace to="/admin" />} />
                </Route>
              </Route>

              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/kupujemo-placeve" element={<LandBuyPage />} />
                <Route path="/o-nama" element={<AboutPage />} />
                <Route path="/kontakt" element={<ContactPage />} />
                <Route path="/lokacija" element={<LocationPage />} />
                <Route path="/politika-privatnosti" element={<PrivacyPolicyPage />} />
                <Route path="/apartmani/:apartmentNumber" element={<LegacyApartmentRedirect />} />
                <Route
                  path="/projekti"
                  element={<Navigate replace to="/projekti/heroja-pinkija-13/o-projektu" />}
                />
                <Route path="/projekti/heroja-pinkija-13" element={<HerojaPinkija13Page />} />
                <Route
                  path="/projekti/heroja-pinkija-13/o-projektu"
                  element={<HerojaPinkija13Page />}
                />
                <Route
                  path="/projekti/heroja-pinkija-13/ponuda-stanova"
                  element={<ApartmentsPage />}
                />
                <Route
                  path="/projekti/heroja-pinkija-13/ponuda-stanova/:apartmentNumber"
                  element={<ApartmentDetailsPage />}
                />
                <Route
                  path="/projekti/heroja-pinkija-13/spisak-stanova"
                  element={<ApartmentsTablePage />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </ContactModalProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
