// Settings.jsx
// Plain-English: User-facing settings for the Atlas — simple, calm, and human.

import BottomNav from "./BottomNav";
import { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const toggle = (setter) => setter((v) => !v);

  const items = [
    {
      label: "Dark Mode",
      value: darkMode,
      setter: setDarkMode,
      desc: "Use the deep charcoal palette designed for night vision and calm focus.",
    },
    {
      label: "Notifications",
      value: notifications,
      setter: setNotifications,
      desc: "Receive gentle alerts about nearby species, trail conditions, and seasonal events.",
    },
    {
      label: "Location Services",
      value: locationServices,
      setter: setLocationServices,
      desc: "Allow the Atlas to understand where you are to personalize species and trail data.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Settings
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Settings help shape how the Atlas behaves — its tone, its awareness,
        and the way it responds to your presence.
      </p>

      {items.map((item) => (
        <div
          key={item.label}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>{item.label}</h2>

            <button
              onClick={() => toggle(item.setter)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: item.value ? "#9BC4A5" : "#f0f0f0",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              {item.value ? "On" : "Off"}
            </button>
          </div>

          <p style={{ lineHeight: "1.5", fontSize: "0.9rem", color: "#555" }}>
            {item.desc}
          </p>
        </div>
      ))}

    </div>
  );
}
