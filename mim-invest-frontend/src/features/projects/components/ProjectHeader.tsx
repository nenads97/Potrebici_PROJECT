type ProjectHeaderProps = {
  basePath?: string;
};

const navItems = [
  { label: "Informacije", href: "#informacije" },
  { label: "Galerija", href: "#galerija" },
  { label: "Stanovi", href: "#stanovi" },
  { label: "Lokacija", href: "#lokacija" },
  { label: "Kontakt", href: "#kontakt" },
];

export const ProjectHeader = ({ basePath = "" }: ProjectHeaderProps) => {
  return (
    <header className="site-header">
      <a className="site-header__brand" href={basePath || "/"}>
        <img src="/images/TRADE.png" alt="M & M Gradnja logo" />
        <span>M & M Gradnja</span>
      </a>

      <nav className="site-header__nav" aria-label="Glavna navigacija">
        {navItems.map((item) => (
          <a key={item.href} href={`${basePath}${item.href}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="site-header__cta" href={`${basePath}#kontakt`}>
        Posalji upit
      </a>
    </header>
  );
};
