// WatershedStory.jsx — EarthEye Lite
// Minimal placeholder for watershed narrative and flow awareness

export default function WatershedStory() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Watershed Story
      </h1>

      <div
        style={{
          background: "#1a1a18",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ opacity: 0.8, marginBottom: "1rem" }}>
          How water shapes land, life, and movement
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Headwaters</div>
          <div style={{ opacity: 0.7 }}>
            Where the story begins — high slopes, springs, and snowmelt
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Channels</div>
          <div style={{ opacity: 0.7 }}>
            Streams and creeks carving paths through the land
          </div>
        </div>

        <div
          style={{
            padding: "1rem",
            background: "#22221f",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Confluence</div>
          <div style={{ opacity: 0.7 }}>
            Where waters meet, mix, and carry stories forward
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "1rem",
          background: "#1a1a18",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          Watershed Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full hydrology engine coming later
        </div>
      </div>
    </div>
  );
}
