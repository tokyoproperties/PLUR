// Constitution.jsx
// Plain-English: The constitutional spine of the Atlas — the rules the organism lives by.

import BottomNav from "./BottomNav";

export default function Constitution() {
  const articles = [
    {
      title: "Article I — Presence Over Performance",
      body:
        "The Atlas is not a scoreboard. It rewards attention, not accumulation. " +
        "Every observation is a moment of presence, not a metric.",
    },
    {
      title: "Article II — Land First",
      body:
        "The land is the primary author. The Atlas listens before it speaks, " +
        "and reflects what the land expresses through species, seasons, and movement.",
    },
    {
      title: "Article III — Stewardship, Not Ownership",
      body:
        "Users are stewards, not collectors. The Atlas encourages care, reciprocity, " +
        "and ecological humility.",
    },
    {
      title: "Article IV — Transparency of Engines",
      body:
        "Every engine — Seasonal, Corridor, Habitat, Phenology, Journal, Companion — " +
        "must be understandable, inspectable, and explainable.",
    },
    {
      title: "Article V — Local Truth",
      body:
        "The Atlas prioritizes hyperlocal accuracy. A species is not 'present' " +
        "unless it is truly present here, now, in this biome.",
    },
    {
      title: "Article VI — No Harm",
      body:
        "The Atlas must never encourage behavior that harms wildlife, habitats, " +
        "or ecological processes.",
    },
    {
      title: "Article VII — Human Scale",
      body:
        "The Atlas is designed for the human nervous system — simple, calm, " +
        "and grounded in the rhythms of place.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Constitution
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        The Constitution defines the principles the Atlas must obey. It is the
        backbone of the organism — the rules that ensure the system remains
        ecological, ethical, and human.
      </p>

      {articles.map((a) => (
        <div
          key={a.title}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{a.title}</h2>
          <p style={{ lineHeight: "1.5" }}>{a.body}</p>
        </div>
      ))}

    </div>
  );
}
