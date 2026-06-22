// Habitats.jsx
// Plain-English: The major habitat types of the region — the ecological rooms of the land.

import BottomNav from "./BottomNav";

export default function Habitats() {
  const habitats = [
    {
      name: "Coastal Sage Scrub",
      desc:
        "Low, aromatic shrubs adapted to drought and sun. Home to quail, " +
        "coyotes, wrentits, and coastal specialists.",
    },
    {
      name: "Chaparral",
      desc:
        "Dense, evergreen shrubs built for fire cycles. Mountain lions, " +
        "bobcats, and scrub jays move through these slopes.",
    },
    {
      name: "Riparian Woodland",
      desc:
        "Creekside corridors with willows, sycamores, and cottonwoods. " +
        "High biodiversity and year-round wildlife movement.",
    },
    {
      name: "Oak Woodland",
      desc:
        "Valley and coast live oaks forming rich, shaded understories. " +
        "Acorn woodpeckers, deer, and countless insects thrive here.",
    },
    {
      name: "Grassland",
      desc:
        "Open, sunlit spaces dominated by annual grasses. Hawks, ground " +
        "squirrels, and wildflowers define these areas.",
    },
    {
      name: "Wetlands",
      desc:
        "Seasonal pools, marshes, and seeps. Frogs, herons, and dragonflies " +
        "depend on these rare water-rich habitats.",
    },
    {
      name: "Urban Edge",
      desc:
        "Where human structures meet wild land. Raccoons, opossums, " +
        "songbirds, and adaptable species navigate this boundary.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Habitats
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Habitats are the ecological rooms of the land — each with its own
        structure, species, rhythms, and seasonal expressions. The Atlas uses
        habitats to understand where life occurs and why.
      </p>

      {habitats.map((h) => (
        <div
          key={h.name}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{h.name}</h2>
          <p style={{ lineHeight: "1.5" }}>{h.desc}</p>
        </div>
      ))}

    </div>
  );
}
