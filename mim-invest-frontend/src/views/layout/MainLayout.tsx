import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
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
    to: "/projekti/heroja-pinkija-13/o-projektu",
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
        <div className="site-footer__cta">
          <div className="site-footer__cta-inner">
            <div>
              <span className="site-footer__eyebrow">Zainteresovani ste za stan?</span>
              <h2>Razgovarajte direktno sa nasim prodajnim timom.</h2>
            </div>

            <Link className="site-button site-button--accent" to="/kontakt">
              <MessageCircle />
              Posaljite upit
            </Link>
          </div>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <BrandLogo showText={false} />
            <div className="site-footer__brand-copy">
              <strong>M & M Gradnja</strong>
              <p>
                Gradimo pazljivo osmisljene prostore za savremen i udoban zivot u
                Novom Sadu.
              </p>
              <Link className="site-footer__inline-link" to="/o-nama">
                Upoznajte kompaniju
                <ArrowUpRight />
              </Link>
            </div>
          </div>

          <FooterColumn
            id="footer-company"
            title="Kompanija"
            links={[
              { to: "/", label: "Pocetna" },
              { to: "/o-nama", label: "O nama" },
              { to: "/kupujemo-placeve", label: "Kupujemo placeve" },
              { to: "/lokacija", label: "Lokacija" },
            ]}
          />

          <FooterColumn
            id="footer-project"
            title="Aktuelni projekat"
            links={[
              {
                to: "/projekti/heroja-pinkija-13/o-projektu",
                label: "Heroja Pinkija 13",
              },
              {
                to: "/projekti/heroja-pinkija-13/ponuda-stanova",
                label: "Ponuda stanova",
              },
              {
                to: "/projekti/heroja-pinkija-13/spisak-stanova",
                label: "Spisak stanova",
              },
            ]}
          />

          <address className="site-footer__contact" aria-labelledby="footer-contact">
            <h2 id="footer-contact">Kontakt</h2>
            <div className="site-footer__contact-list">
              <a href={`tel:${contactPhone}`}>
                <Phone />
                <span>
                  <small>Telefon prodaje</small>
                  <strong>{contactPhone}</strong>
                </span>
              </a>
              <a href={`mailto:${contactEmail}`}>
                <Mail />
                <span>
                  <small>Email</small>
                  <strong>{contactEmail}</strong>
                </span>
              </a>
              <Link to="/lokacija">
                <MapPin />
                <span>
                  <small>Adresa projekta</small>
                  <strong>Heroja Pinkija 13, Novi Sad</strong>
                </span>
              </Link>
            </div>
          </address>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__bottom-inner">
            <span>(c) {currentYear} M & M Gradnja. Sva prava zadrzana.</span>
            <div className="site-footer__legal">
              <Link to="/politika-privatnosti">Politika privatnosti</Link>
              <Link to="/kontakt">Kontakt</Link>
            </div>
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
                <Link className="site-nav__nested-trigger" to={link.to}>
                  <span>{link.label}</span>
                  <ChevronRight className="icon-inline" />
                </Link>
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
  id: string;
  title: string;
  links: Array<{ to: string; label: string }>;
};

const FooterColumn = ({ id, title, links }: FooterColumnProps) => {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <div className="site-footer__links">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
