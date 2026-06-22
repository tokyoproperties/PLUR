// BottomNav.jsx
// Plain-English: The persistent navigation bar that anchors the organism.

import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { key: "home", label: "Home", path: "/home", icon: "🏠" },
    { key: "species", label: "Species", path: "/species", icon: "🌿" },
    { key: "trails", label: "Trails", path: "/trails", icon: "🥾" },
    { key: "sky", label: "Sky", path: "/sky", icon: "🌤️" },
    { key: "index", label: "Index", path: "/index", icon: "📚" },
  ];

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "#0F0F0D",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.path);

        return (
          <div
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              color: active
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.28)",
              fontSize: "0.75rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "6px",
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "2px" }}>
              {tab.icon}
            </div>

            <div
              style={{
                opacity: active ? 1 : 0.22,
                fontSize: "0.7rem",
                marginBottom: active ? "2px" : "4px",
              }}
            >
              {tab.label}
            </div>

            {active && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#9BC4A5", // sage green
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
