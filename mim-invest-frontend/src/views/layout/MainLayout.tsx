import { ArrowLeft, ArrowUp, ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { BrandLogo } from "../../shared/components/BrandLogo";

const companyLinks = [
  { to: "/kupujemo-placeve", label: "Kupujemo placeve" },
  { to: "/o-nama", label: "O Nama" },
  { to: "/politika-privatnosti", label: "Politika privatnosti" },
];

const projectLinks = [
  {
    to: "/projekti/heroja-pinkija-13",
    label: "Heroja Pinkija 13",
    children: [
      {
        to: "/projekti/heroja-pinkija-13/o-projektu",
        label: "O projektu",
      },
      {
        to: "/projekti/heroja-pinkija-13/ponuda-stanova",
        label: "Ponuda stanova",
      },
      {
        to: "/projekti/heroja-pinkija-13/spisak-stanova",
        label: "Spisak stanova",
      },
    ],
  },
];

export const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const currentYear = new Date().getFullYear();

  return (
    <div className="site-shell">
      <header className="site-header-wrap">
        <div className="site-header">
          <Link className="site-header__brand" to="/" aria-label="M & M Gradnja pocetna">
            <BrandLogo />
          </Link>

          <nav className="site-nav" aria-label="Glavna navigacija">
            <Link className="site-nav__link" to="/kupujemo-placeve">
              Kupujemo placeve
            </Link>

            <HeaderDropdown label="Kompanija" links={companyLinks} />
            <HeaderDropdown label="Projekti" links={projectLinks} />

            <Link className="site-nav__link" to="/kontakt">
              Kontakt
            </Link>
          </nav>

          <Link className="site-button site-button--accent site-header__cta" to="/kontakt">
            <MessageCircle />
            Pisite nam
          </Link>
        </div>
      </header>

      {!isHome ? (
        <section className="back-home" aria-label="Povratak na pocetnu">
          <div className="back-home__inner">
            <Link className="site-button site-button--light" to="/">
              <ArrowLeft />
              Nazad na pocetnu stranicu
            </Link>
          </div>
        </section>
      ) : null}

      <Outlet />

      <footer className="site-footer">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <BrandLogo showText={false} />
            <p>
              Heroja Pinkija 13 je novi stambeni projekat na pocetku Telepa sa 15
              stanova, garazom, ostavama i liftom do svih spratova.
            </p>
          </div>

          <FooterColumn title="Kompanija" links={companyLinks} />

          <FooterColumn
            title="Projekat"
            links={[
              { to: "/projekti/heroja-pinkija-13", label: "Heroja Pinkija 13" },
              {
                to: "/projekti/heroja-pinkija-13/ponuda-stanova",
                label: "Ponuda stanova",
              },
              { to: "/kontakt", label: "Kontakt" },
            ]}
          />

          <div>
            <h2>Kontakt</h2>
            <div className="site-footer__links">
              <a href={`tel:${contactPhone}`}>{contactPhone}</a>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              <span>Heroja Pinkija 13, Novi Sad</span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__bottom-inner">
            <span>(c) {currentYear} M & M Gradnja. Sva prava zadrzana.</span>
            <Link to="/politika-privatnosti">Politika privatnosti</Link>
          </div>
        </div>
      </footer>

      <button
        className="back-to-top"
        type="button"
        aria-label="Nazad na vrh stranice"
        title="Nazad na vrh"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp />
      </button>
    </div>
  );
};

type HeaderLink = {
  to: string;
  label: string;
  children?: HeaderLink[];
};

type HeaderDropdownProps = {
  label: string;
  links: HeaderLink[];
};

const HeaderDropdown = ({ label, links }: HeaderDropdownProps) => {
  return (
    <div className="site-nav__dropdown">
      <button className="site-nav__trigger" type="button">
        {label}
        <ChevronDown className="icon-inline" />
      </button>

      <div className="site-nav__menu">
        <div className="site-nav__panel">
          {links.map((link) => (
            <div key={link.to}>
              <Link to={link.to}>
                <span>{link.label}</span>
                {link.children ? <ChevronRight className="icon-inline" /> : null}
              </Link>
              {link.children ? (
                <div className="site-nav__submenu">
                  {link.children.map((child) => (
                    <Link key={child.to} to={child.to}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type FooterColumnProps = {
  title: string;
  links: Array<{ to: string; label: string }>;
};

const FooterColumn = ({ title, links }: FooterColumnProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <div className="site-footer__links">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
