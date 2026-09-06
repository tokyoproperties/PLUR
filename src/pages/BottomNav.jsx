// BottomNav.jsx — EarthEye OC constitutional navigation
// Five items, hairline SVG glyphs, label only on active. No emoji, no color
// shifts — active is carried by ink weight alone.

import { Link, useLocation } from "react-router-dom";

const INK_ACTIVE = "rgba(255,255,255,0.90)";
const INK_INACTIVE = "rgba(255,255,255,0.30)";

function Glyph({ kind, color }) {
  const common = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  };
  const paths = {
    home: (
      <>
        <path d="M4 11.5 L12 5 L20 11.5" {...common} />
        <path d="M6.5 11 L6.5 19 L17.5 19 L17.5 11" {...common} />
      </>
    ),
    leaf: (
      <>
        <path d="M12 20 C 5 16 5 8 12 4 C 19 8 19 16 12 20 Z" {...common} />
        <path d="M12 19 L12 6" {...common} />
      </>
    ),
    boot: (
      <>
        <path d="M7 4 C 7 10 5 13 5 16 C 5 18.5 8 19.5 12 19.5 L 18 19.5 C 19.5 19.5 19.5 17.5 18 17 L 12 15.5 C 9.5 15 9 13 9.5 10 L 10 4 Z" {...common} />
      </>
    ),
    sky: (
      <>
        <path d="M5 17 A 8 8 0 0 1 19 17" {...common} />
        <path d="M12 5 L12 6.5" {...common} />
        <path d="M6.3 8 L7.4 9" {...common} />
        <path d="M17.7 8 L16.6 9" {...common} />
      </>
    ),
    index: (
      <>
        <path d="M6 4 L6 20 M10 4 L10 20 M14 5.5 C 16 4.5 18 5 18 6 L18 18 C 18 17 16 16.5 14 17.5 Z" {...common} />
      </>
    ),
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/home", glyph: "home" },
    { label: "Species", path: "/species", glyph: "leaf" },
    { label: "Trails", path: "/trails", glyph: "boot" },
    { label: "Sky", path: "/sky", glyph: "sky" },
    { label: "Index", path: "/search", glyph: "index" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: T_BG,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        const ink = active ? INK_ACTIVE : INK_INACTIVE;
        return (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              minHeight: "56px",
              minWidth: "64px",
              textDecoration: "none",
              paddingTop: "8px",
              paddingBottom: "8px",
            }}
          >
            <span style={{ display: "flex" }}>
              <Glyph kind={item.glyph} color={ink} />
            </span>
            {active && (
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: ink,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

const T_BG = "#0F0F0D";
