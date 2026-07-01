// BottomNav.jsx — EarthEye Lite
// Minimal bottom navigation for A3-Lite

import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/PLUR" },
    { label: "Sky", path: "/PLUR/sky" },
    { label: "Seasonal", path: "/PLUR/seasonal" },
    { label: "Field", path: "/PLUR/field" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1a1a18",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "0.75rem 0",
        zIndex: 100,
      }}
    >
      {navItems.map((item) => {
        const active = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: active ? "bold" : "normal",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
