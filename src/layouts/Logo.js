import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuLogoPng from '../assets/images/logos/vc2.png';

const Logo = ({ size = '50px', svgSrc }) => {
  const [svgFailed, setSvgFailed] = useState(false);

  const resolvedSvgSrc = useMemo(() => {
    if (svgSrc) return svgSrc;
    return `${process.env.PUBLIC_URL}/vc2.svg`;
  }, [svgSrc]);

  useEffect(() => {
    // Probe SVG existence without rendering a broken <img>.
    const probe = new Image();
    probe.onload = () => setSvgFailed(false);
    probe.onerror = () => setSvgFailed(true);
    probe.src = resolvedSvgSrc;
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [resolvedSvgSrc]);

  const logoSrc = svgFailed ? MenuLogoPng : resolvedSvgSrc;

  return (
    <div className="sidebar-brand">
      <Link to="/" className="sidebar-brand-link">
        <span className="sidebar-brand-mark" aria-hidden="true">
          <span
            className="sidebar-brand-logo"
            style={{ width: size, height: size, ['--brand-logo-url']: `url(${logoSrc})` }}
            aria-hidden="true"
          />
          <img src={MenuLogoPng} alt="Logo" className="sidebar-brand-img-fallback" style={{ height: size }} />
        </span>
        <span className="sidebar-brand-text">VetCare</span>
      </Link>
    </div>
  );
};

export default Logo;
