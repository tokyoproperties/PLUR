// Cycles.jsx
// Plain-English: The repeating rhythms of the land — daily, seasonal, lunar, ecological.

import BottomNav from "./BottomNav";

export default function Cycles() {
  const cycles = [
    {
      name: "Daily Cycle",
      desc:
        "Light, temperature, wind, and animal activity shift across the day. " +
        "Dawn chorus, midday stillness, golden hour, nocturnal emergence.",
    },
    {
      name: "Seasonal Cycle",
      desc:
        "Bloom, migration, molt, breeding, drying, greening. " +
        "The land expresses itself differently in each season.",
    },
    {
      name: "Lunar Cycle",
      desc:
        "Tides, nocturnal behavior, predator-prey dynamics, and navigation " +
        "shift with the moon’s phases.",
    },
    {
      name: "Hydrological Cycle",
      desc:
        "Rain, runoff, infiltration, evaporation. " +
        "Creeks pulse, soils breathe, and habitats transform.",
    },
    {
      name: "Phenological Cycle",
      desc:
        "First bloom, first call, first arrival, first hatch. " +
        "The timing of life events across species.",
    },
    {
      name: "Fire Cycle",
      desc:
        "Chaparral and coastal sage scrub are fire-adapted. " +
        "Recovery, succession, and renewal follow disturbance.",
    },
    {
      name: "Human Cycle",
      desc:
        "Our own rhythms — school years, work weeks, holidays, routines — " +
        "shape how we encounter the land.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Cycles
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        The land moves in rhythms — some fast, some slow, some ancient. The
        Atlas listens to these cycles and uses them to understand what is
        happening now, what is emerging, and what is fading.
      </p>

      {cycles.map((c) => (
        <div
          key={c.name}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{c.name}</h2>
          <p style={{ lineHeight: "1.5" }}>{c.desc}</p>
        </div>
      ))}

    </div>
  );
}
