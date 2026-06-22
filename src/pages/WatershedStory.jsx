// WatershedStory.jsx
// Plain-English: The story of water — how it shapes the land, species, and seasons.

import BottomNav from "./BottomNav";

export default function WatershedStory() {
  const sections = [
    {
      title: "The Spine of the Land",
      body:
        "Every watershed begins as a faint line on a ridge — a divide where a single raindrop " +
        "chooses its direction. These divides shape the entire movement of water, soil, seeds, " +
        "and life across the region.",
    },
    {
      title: "Seasonal Pulse",
      body:
        "In winter, creeks awaken. In summer, they retreat underground. This pulse defines " +
        "migration, bloom timing, amphibian cycles, and the entire rhythm of the land.",
    },
    {
      title: "Riparian Highways",
      body:
        "Creeks form the most biodiverse corridors in the region. Willows, sycamores, frogs, " +
        "dragonflies, herons, and mammals all depend on these shaded arteries.",
    },
    {
      title: "Sediment and Story",
      body:
        "Water carries memory. Every storm moves sand, silt, and organic matter downstream, " +
        "reshaping habitats and feeding wetlands and estuaries.",
    },
    {
      title: "Human Interruption",
      body:
        "Concrete channels, dams, and diversions fracture the natural flow. Yet even in altered " +
        "watersheds, life adapts — finding pockets of refuge and new pathways.",
    },
    {
      title: "Return to the Sea",
      body:
        "All watersheds end in the same place: the ocean. Estuaries become nurseries for fish, " +
        "birds, and invertebrates — the final mixing zone of fresh and salt.",
    },
  ];

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Watershed Story
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Water is the quiet architect of the land. It carves, nourishes, connects, and transforms.
        This page tells the story of how watersheds shape the ecological identity of the region.
      </p>

      {sections.map((s) => (
        <div
          key={s.title}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{s.title}</h2>
          <p style={{ lineHeight: "1.5" }}>{s.body}</p>
        </div>
      ))}

    </div>
  );
}
