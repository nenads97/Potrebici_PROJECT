import {
  Building2,
  FileText,
  Home,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPinned,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { BrandLogo } from "../../shared/components/BrandLogo";
import { supabase } from "../../shared/supabase/client";

const adminLinks = [
  { to: "/admin", label: "Pregled", icon: LayoutDashboard },
  { to: "/admin/upiti-stanovi", label: "Upiti za stanove", icon: Inbox },
  { to: "/admin/upiti-placevi", label: "Upiti za placeve", icon: MapPinned },
  { to: "/admin/stanovi", label: "stanovi i statusi", icon: Home },
  { to: "/admin/projekat", label: "Projekat", icon: Building2 },
  { to: "/admin/fajlovi", label: "Slike i PDF fajlovi", icon: Images },
];

export const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    navigate("/admin/prijava", { replace: true });
  };

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main-content">
        Preskocite na admin sadržaj
      </a>

      <aside className="admin-sidebar" aria-label="Admin navigacija">
        <div className="admin-sidebar__brand">
          <BrandLogo />
          <span>Admin panel</span>
        </div>

        <nav className="admin-sidebar__nav">
          {adminLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? " admin-nav-link--active" : ""}`
                }
                key={link.to}
                to={link.to}
              >
                <Icon />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__meta">
          <FileText />
          <span>v1 panel za prodaju i sadržaj projekta Heroja Pinkija 13.</span>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Heroja Pinkija 13</span>
            <strong>M & M Gradnja</strong>
          </div>
          <button className="admin-topbar__logout" type="button" onClick={handleLogout}>
            <LogOut />
            Odjava
          </button>
        </header>

        <div id="admin-main-content" className="main-content-anchor" tabIndex={-1}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
