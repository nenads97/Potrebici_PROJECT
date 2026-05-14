import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "../../views/layout/MainLayout";
import { AboutPage } from "../../views/pages/AboutPage";
import { ContactPage } from "../../views/pages/ContactPage";
import { HomePage } from "../../views/pages/HomePage";
import { LandBuyPage } from "../../views/pages/LandBuyPage";
import { LocationPage } from "../../views/pages/LocationPage";
import { PrivacyPolicyPage } from "../../views/pages/PrivacyPolicyPage";
import { ApartmentDetailsPage } from "../../views/pages/projects/HerojaPinkija13/ApartmentDetailsPage";
import { ApartmentsPage } from "../../views/pages/projects/HerojaPinkija13/ApartmentsPage";
import { HerojaPinkija13Page } from "../../views/pages/projects/HerojaPinkija13/HerojaPinkija13Page";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/kupujemo-placeve" element={<LandBuyPage />} />
          <Route path="/o-nama" element={<AboutPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/lokacija" element={<LocationPage />} />
          <Route path="/politika-privatnosti" element={<PrivacyPolicyPage />} />
          <Route path="/apartmani/:apartmentNumber" element={<ApartmentDetailsPage />} />
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
            path="/projekti/heroja-pinkija-13/spisak-stanova"
            element={<ApartmentsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
