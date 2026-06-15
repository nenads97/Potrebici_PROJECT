import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { contactEmail, contactPhone } from "../../features/projects/data/herojaPinkija13.data";
import { BrandLogo } from "../../shared/components/BrandLogo";

const companyLinks = [
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
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const currentYear = new Date().getFullYear();
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header-wrap">
        <div className="site-header">
          <Link className="site-header__brand" to="/" aria-label="M & M Gradnja pocetna">
            <BrandLogo />
          </Link>

          <button
            className="site-header__menu-toggle"
            type="button"
            aria-label={isNavOpen ? "Zatvori navigaciju" : "Otvori navigaciju"}
            aria-expanded={isNavOpen}
            aria-controls="site-navigation"
            onClick={() => setIsNavOpen((isOpen) => !isOpen)}
          >
            {isNavOpen ? <X /> : <Menu />}
          </button>

          <nav
            className={`site-nav${isNavOpen ? " site-nav--open" : ""}`}
            id="site-navigation"
            aria-label="Glavna navigacija"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a")) {
                setIsNavOpen(false);
              }
            }}
          >
            <HeaderDropdown label="Kompanija" links={companyLinks} />
            <HeaderDropdown label="Projekti" links={projectLinks} />

            <Link className="site-nav__link" to="/kupujemo-placeve">
              Kupujemo placeve
            </Link>

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
        <button
          className="page-back-button"
          type="button"
          aria-label="Nazad na prethodnu stranicu"
          title="Nazad"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </button>
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && dropdownRef.current?.contains(nextTarget)) {
      return;
    }

    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement && dropdownRef.current?.contains(activeElement)) {
      activeElement.blur();
    }
  };

  return (
    <div className="site-nav__dropdown" ref={dropdownRef} onMouseLeave={handleMouseLeave}>
      <button className="site-nav__trigger" type="button">
        {label}
        <ChevronDown className="icon-inline" />
      </button>

      <div className="site-nav__menu">
        <div className="site-nav__panel">
          {links.map((link) => (
            <div
              className={`site-nav__item${link.children ? " site-nav__item--has-children" : ""}`}
              key={link.to}
            >
              {link.children ? (
                <button className="site-nav__nested-trigger" type="button">
                  <span>{link.label}</span>
                  <ChevronRight className="icon-inline" />
                </button>
              ) : (
                <Link to={link.to}>
                  <span>{link.label}</span>
                </Link>
              )}

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
