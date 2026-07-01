// Stewardship.jsx — EarthEye Lite
// Minimal placeholder for care, responsibility, and community action

export default function Stewardship() {
  return (
    <div style={{ padding: "1.5rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Stewardship
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
          Caring for land, water, and community
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
          <div style={{ fontWeight: "bold" }}>Local Actions</div>
          <div style={{ opacity: 0.7 }}>
            Small steps that strengthen ecosystems
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
          <div style={{ fontWeight: "bold" }}>Community</div>
          <div style={{ opacity: 0.7 }}>
            Working together to protect shared spaces
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
          <div style={{ fontWeight: "bold" }}>Responsibility</div>
          <div style={{ opacity: 0.7 }}>
            Acting with intention and long‑term awareness
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
          Stewardship (Lite)
        </div>
        <div style={{ opacity: 0.7 }}>
          Full stewardship engine coming later
        </div>
      </div>
    </div>
  );
}
