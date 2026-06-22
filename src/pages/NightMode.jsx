// NightMode.jsx
// Plain-English: The nighttime personality of the Atlas — how the organism behaves after dark.

import BottomNav from "./BottomNav";

export default function NightMode() {
  const features = [
    {
      name: "Low-Light Palette",
      desc:
        "The interface shifts to deep charcoal, muted greens, and soft contrast to match the physiology of night vision.",
    },
    {
      name: "Nocturnal Species Priority",
      desc:
        "Owls, bats, moths, nightjars, and other nocturnal species rise to the top of recommendations and nearby alerts.",
    },
    {
      name: "Sky Awareness",
      desc:
        "Moon phase, cloud cover, and astronomical visibility influence what the Atlas highlights at night.",
    },
    {
      name: "Quiet Mode",
      desc:
        "Notifications soften. The Atlas becomes calmer, slower, and more reflective — matching the tone of the land.",
    },
    {
      name: "Thermal Rhythm",
      desc:
        "Temperature drops shift animal behavior. The Atlas adjusts likelihood models for movement and sound.",
    },
    {
      name: "Trail Safety Layer",
      desc:
        "NightMode emphasizes safe, open, and familiar routes. High-risk or closed trails are deprioritized.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Night Mode
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        After sunset, the Atlas becomes a different organism. It listens to
        nocturnal rhythms, adjusts its tone, and shifts its priorities to match
        the land at night.
      </p>

      {features.map((f) => (
        <div
          key={f.name}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{f.name}</h2>
          <p style={{ lineHeight: "1.5" }}>{f.desc}</p>
        </div>
      ))}

    </div>
  );
}
