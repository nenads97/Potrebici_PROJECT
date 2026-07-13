import { useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
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
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ContactModalButton } from "../../features/inquiries/components/ContactModal";
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
  const normalizedPathname = normalizePath(location.pathname);
  const isHome = normalizedPathname === "/";
  const shouldShowFooterCta = shouldShowPublicFooterCta(normalizedPathname);
  const currentYear = new Date().getFullYear();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const backFallbackPath = getBackFallbackPath(normalizedPathname);

  const handleBackClick = () => {
    const historyState = window.history.state as { idx?: number } | null;

    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(backFallbackPath);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Preskocite na glavni sadrzaj
      </a>

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
            <HeaderDropdown
              currentPathname={location.pathname}
              isNavigationOpen={isNavOpen}
              label="Kompanija"
              links={companyLinks}
            />
            <HeaderDropdown
              currentPathname={location.pathname}
              isNavigationOpen={isNavOpen}
              label="Projekti"
              links={projectLinks}
            />

            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/kupujemo-placeve"
            >
              Kupujemo placeve
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
              to="/kontakt"
            >
              Kontakt
            </NavLink>
          </nav>

          <ContactModalButton className="site-button site-button--accent site-header__cta">
            <MessageCircle />
            Pisite nam
          </ContactModalButton>
        </div>
      </header>

      {!isHome ? (
        <button
          className="page-back-button"
          type="button"
          aria-label="Nazad na prethodnu stranicu"
          title="Nazad"
          onClick={handleBackClick}
        >
          <ArrowLeft />
        </button>
      ) : null}

      <div id="main-content" className="main-content-anchor" tabIndex={-1}>
        <Outlet />
      </div>

      <footer className="site-footer">
        {shouldShowFooterCta ? (
          <div className="site-footer__cta">
            <div className="site-footer__cta-inner">
              <div>
                <span className="site-footer__eyebrow">Zainteresovani ste za stan?</span>
                <h2>Razgovarajte direktno sa nasim prodajnim timom.</h2>
              </div>

              <ContactModalButton className="site-button site-button--accent">
                <MessageCircle />
                Pisite nam
              </ContactModalButton>
            </div>
          </div>
        ) : null}

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
  currentPathname: string;
  isNavigationOpen: boolean;
  label: string;
  links: HeaderLink[];
};

const HeaderDropdown = ({
  currentPathname,
  isNavigationOpen,
  label,
  links,
}: HeaderDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDropdownActive = links.some((link) => isHeaderLinkActive(link, currentPathname));
  const isExpanded = isNavigationOpen || isMenuOpen;

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && dropdownRef.current?.contains(nextTarget)) {
      return;
    }

    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement && dropdownRef.current?.contains(activeElement)) {
      activeElement.blur();
    }

    setIsMenuOpen(false);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && dropdownRef.current?.contains(nextTarget)) {
      return;
    }

    setIsMenuOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    setIsMenuOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      className={`site-nav__dropdown${isMenuOpen ? " site-nav__dropdown--open" : ""}`}
      ref={dropdownRef}
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsMenuOpen(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        className={`site-nav__trigger${isDropdownActive ? " site-nav__trigger--active" : ""}`}
        ref={triggerRef}
        type="button"
        aria-controls={menuId}
        aria-expanded={isExpanded}
        aria-haspopup="true"
        onClick={() => setIsMenuOpen(true)}
      >
        {label}
        <ChevronDown className="icon-inline" />
      </button>

      <div className="site-nav__menu" id={menuId}>
        <div className="site-nav__panel">
          {links.map((link) => {
            const isLinkActive = isHeaderLinkActive(link, currentPathname);
            const isLinkCurrent = isPathActive(link.to, currentPathname);

            return (
              <div
                className={`site-nav__item${link.children ? " site-nav__item--has-children" : ""}`}
                key={link.to}
              >
                {link.children ? (
                  <Link
                    className={`site-nav__nested-trigger${isLinkActive ? " is-active" : ""}`}
                    to={link.to}
                    aria-current={isLinkCurrent ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="icon-inline" />
                  </Link>
                ) : (
                  <Link
                    className={isLinkActive ? "is-active" : undefined}
                    to={link.to}
                    aria-current={isLinkCurrent ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                  </Link>
                )}

                {link.children ? (
                  <div className="site-nav__submenu">
                    {link.children.map((child) => {
                      const isChildActive = isPathActive(child.to, currentPathname);

                      return (
                        <Link
                          className={isChildActive ? "is-active" : undefined}
                          key={child.to}
                          to={child.to}
                          aria-current={isChildActive ? "page" : undefined}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function isHeaderLinkActive(link: HeaderLink, currentPathname: string) {
  return (
    isPathActive(link.to, currentPathname) ||
    Boolean(link.children?.some((child) => isPathActive(child.to, currentPathname)))
  );
}

function isPathActive(path: string, currentPathname: string) {
  const normalizedPath = normalizePath(path);
  const normalizedCurrentPath = normalizePath(currentPathname);
  const aliases = routeAliases[normalizedPath] ?? [];

  return (
    normalizedCurrentPath === normalizedPath ||
    normalizedCurrentPath.startsWith(`${normalizedPath}/`) ||
    aliases.some((alias) => normalizedCurrentPath === normalizePath(alias))
  );
}

function normalizePath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function getBackFallbackPath(pathname: string) {
  const normalizedPathname = normalizePath(pathname);

  if (isApartmentDetailPath(normalizedPathname)) {
    return "/projekti/heroja-pinkija-13/ponuda-stanova";
  }

  if (normalizedPathname === "/projekti/heroja-pinkija-13/spisak-stanova") {
    return "/projekti/heroja-pinkija-13/ponuda-stanova";
  }

  if (normalizedPathname === "/projekti/heroja-pinkija-13/ponuda-stanova") {
    return "/projekti/heroja-pinkija-13/o-projektu";
  }

  if (
    normalizedPathname === "/projekti/heroja-pinkija-13" ||
    normalizedPathname === "/projekti/heroja-pinkija-13/o-projektu"
  ) {
    return "/";
  }

  return "/";
}

function shouldShowPublicFooterCta(pathname: string) {
  return (
    pathname !== "/kontakt" &&
    pathname !== "/kupujemo-placeve" &&
    !isApartmentDetailPath(pathname)
  );
}

function isApartmentDetailPath(pathname: string) {
  return /^\/projekti\/heroja-pinkija-13\/ponuda-stanova\/[^/]+$/.test(pathname);
}

const routeAliases: Record<string, string[]> = {
  "/projekti/heroja-pinkija-13/o-projektu": ["/projekti/heroja-pinkija-13"],
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
