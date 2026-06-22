// Layout.jsx
// Plain-English: The global frame of the app — header, routing outlet, and bottom navigation.

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path.includes("home")) setTitle("Home");
    else if (path.includes("species")) setTitle("Species");
    else if (path.includes("trails")) setTitle("Trails");
    else if (path.includes("sky")) setTitle("Sky");
    else if (path.includes("index")) setTitle("Index");
    else if (path.includes("map")) setTitle("Map");
    else if (path.includes("habitats")) setTitle("Habitats");
    else if (path.includes("cycles")) setTitle("Cycles");
    else if (path.includes("constitution")) setTitle("Constitution");
    else if (path.includes("story")) setTitle("Story");
    else if (path.includes("journal")) setTitle("Journal");
    else if (path.includes("search")) setTitle("Search");
    else if (path.includes("nearme")) setTitle("Near Me");
    else if (path.includes("seasonal")) setTitle("Seasonal");
    else if (path.includes("field")) setTitle("Field Guide");
    else if (path.includes("corridor")) setTitle("Corridors");
    else if (path.includes("watershed")) setTitle("Watershed");
    else setTitle("EarthEye");
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F0F0D",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: "1.25rem",
          fontWeight: "bold",
        }}
      >
        {title}
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
