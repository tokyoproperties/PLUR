// Layout.jsx — EarthEye OC constitutional frame
// Georgia serif header whispering the page name, hairline border, night surface.

import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { T, headingStyle, PAGE_PX } from "@/theme";

export default function Layout() {
  const location = useLocation();
  const [title, setTitle] = useState("");

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("home")) setTitle("EarthEye");
    else if (path.includes("species")) setTitle("Species");
    else if (path.includes("trails")) setTitle("Trails");
    else if (path.includes("sky")) setTitle("Sky");
    else if (path.includes("search")) setTitle("Index");
    else if (path.includes("map")) setTitle("Map");
    else if (path.includes("habitats")) setTitle("Habitats");
    else if (path.includes("cycles")) setTitle("Cycles");
    else if (path.includes("constitution")) setTitle("Constitution");
    else if (path.includes("story")) setTitle("Story");
    else if (path.includes("watershed")) setTitle("Watershed");
    else if (path.includes("journal")) setTitle("Journal");
    else if (path.includes("nearme")) setTitle("Nearby");
    else if (path.includes("seasonal")) setTitle("Seasonal");
    else if (path.includes("field")) setTitle("Field Guide");
    else if (path.includes("corridor")) setTitle("Corridors");
    else if (path.includes("biomes")) setTitle("Biomes");
    else if (path.includes("yearbook")) setTitle("Yearbook");
    else if (path.includes("stewardship")) setTitle("Stewardship");
    else if (path.includes("logsighting")) setTitle("Field Notebook");
    else setTitle("EarthEye");
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: T.sans,
      }}
    >
      {/* Header — Georgia serif, never bold */}
      <div
        style={{
          padding: "16px " + PAGE_PX + "px",
          borderBottom: T.border,
          position: "sticky",
          top: 0,
          background: T.bg,
          zIndex: 50,
        }}
      >
        <div style={{ ...headingStyle, fontSize: "18px" }}>{title}</div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
