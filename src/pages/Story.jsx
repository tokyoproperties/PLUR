// Story.jsx — EarthEye Lite
// Minimal narrative placeholder for EarthEye's world-building layer

export default function Story() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Story
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
          The narrative layer of EarthEye
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
          <div style={{ fontWeight: "bold" }}>Origins</div>
          <div style={{ opacity: 0.7 }}>
            How the landscape formed and why it matters
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
          <div style={{ fontWeight: "bold" }}>People & Place</div>
          <div style={{ opacity: 0.7 }}>
            Human connection to land, water, and movement
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
          <div style={{ fontWeight: "bold" }}>Ecological Threads</div>
          <div style={{ opacity: 0.7 }}>
            The relationships that tie species and habitats together
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
          Story Intelligence (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full narrative engine coming later
        </div>
      </div>
    </div>
  );
}
