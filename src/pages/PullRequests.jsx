// PullRequests.jsx
// Plain-English: Internal dashboard for tracking conceptual “pull requests” to the Atlas.

import BottomNav from "./BottomNav";

export default function PullRequests() {
  const prs = [
    {
      title: "Improve Seasonal Engine",
      desc:
        "Refine bloom timing and migration curves using new observations. " +
        "Adjust thresholds for early-season anomalies.",
      status: "Open",
    },
    {
      title: "Add New Habitat Cards",
      desc:
        "Expand habitat descriptions with updated field notes and new species associations.",
      status: "In Review",
    },
    {
      title: "Refactor Trail Metadata",
      desc:
        "Normalize region names, fix elevation inconsistencies, and clean up hero images.",
      status: "Merged",
    },
    {
      title: "NightMode Enhancements",
      desc:
        "Improve nocturnal species weighting and add moon-phase awareness.",
      status: "Open",
    },
    {
      title: "Observation Validation Rules",
      desc:
        "Add new heuristics for detecting misidentifications and low-quality images.",
      status: "In Review",
    },
  ];

  const statusColor = {
    Open: "#FFD27F",
    "In Review": "#9BC4A5",
    Merged: "#7FB3FF",
  };

  return (
    <div style={{ padding: "2rem", paddingBottom: "5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Pull Requests
      </h1>

      <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
        These are conceptual pull requests — proposed improvements to the
        Atlas’s engines, data structures, and ecological logic. They represent
        the ongoing evolution of the organism.
      </p>

      {prs.map((pr) => (
        <div
          key={pr.title}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>{pr.title}</h2>
          <p style={{ lineHeight: "1.5", marginBottom: "0.75rem" }}>
            {pr.desc}
          </p>

          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              background: statusColor[pr.status] || "#ccc",
              color: "#0F0F0D",
              fontSize: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {pr.status}
          </span>
        </div>
      ))}

    </div>
  );
}
