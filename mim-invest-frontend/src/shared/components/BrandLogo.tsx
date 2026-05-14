type BrandLogoProps = {
  showText?: boolean;
};

export const BrandLogo = ({ showText = true }: BrandLogoProps) => {
  return (
    <span className="brand-logo">
      <span className="brand-logo__mark">
        <img src="/images/TRADE.png" alt="M & M Gradnja" />
      </span>

      {showText ? (
        <span className="brand-logo__text">
          <span className="brand-logo__name">M & M</span>
          <span className="brand-logo__sub">Gradnja</span>
        </span>
      ) : null}
    </span>
  );
};
