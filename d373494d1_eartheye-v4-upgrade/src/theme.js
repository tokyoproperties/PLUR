// theme.js — EarthEye OC design tokens
// Constitutional design language, locked May 3 2026.
// Night field guide: near-black organic surface, dark cards, Georgia serif,
// whisper labels, one sage accent. No shadows, no elevation, no glow.

export const T = {
  // Surfaces
  bg: "#0F0F0D",
  card: "#1A1A17",
  inset: "rgba(255,255,255,0.04)",
  hover: "rgba(255,255,255,0.06)",
  fallback: "#1C3A2A", // image fallback slot ONLY — never a content card
  border: "1px solid rgba(255,255,255,0.07)",
  radius: 12,
  radiusSm: 8,

  // Type
  serif: "Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",

  // Ink
  ink: "rgba(255,255,255,0.90)",
  ink2: "rgba(255,255,255,0.70)",
  inkMuted: "rgba(255,255,255,0.55)",
  inkGhost: "rgba(255,255,255,0.35)",
  inkFaint: "rgba(255,255,255,0.12)",

  // Content accents (content only — never chrome)
  sage: "#7AB87A",
  rose: "#C47A7A",
  amber: "#C4974A",
  blue: "#7A9AB8",
  lavender: "#9A7AB8",
};

// ---- Shared style atoms ---------------------------------------------

export const cardStyle = {
  background: T.card,
  border: T.border,
  borderRadius: T.radius,
  padding: "16px 20px",
};

export const cardHoverStyle = {
  ...cardStyle,
  cursor: "pointer",
  transition: "background 120ms ease",
};

export const whisperStyle = {
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase",
  color: T.inkGhost,
  fontFamily: T.sans,
};

export const narrativeStyle = {
  fontSize: "15px",
  fontWeight: 400,
  fontStyle: "italic",
  fontFamily: T.serif,
  color: "rgba(255,255,255,0.72)",
  lineHeight: 1.7,
};

export const bodyStyle = {
  fontSize: "14px",
  fontWeight: 400,
  fontFamily: T.sans,
  color: T.ink2,
  lineHeight: 1.6,
};

export const headingStyle = {
  fontFamily: T.serif,
  fontWeight: 400,
  color: "rgba(255,255,255,0.88)",
  letterSpacing: "-0.01em",
};

export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: T.inset,
  border: T.border,
  borderRadius: T.radiusSm,
  color: T.ink,
  fontSize: "14px",
  fontFamily: T.sans,
  outline: "none",
  boxSizing: "border-box",
};

// ---- Seasonal system ------------------------------------------------

export function getSeason(date = new Date()) {
  const m = date.getMonth(); // 0-11
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "fall";
}

export const SEASON_ACCENT = {
  spring: T.sage,
  summer: T.amber,
  fall: T.rose,
  winter: T.blue,
};

export const SEASON_LABEL = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

// seasonPresence values observed in the atlas: e.g. "Spring, Summer, Fall"
export function isSpeciesActiveNow(s, season = getSeason()) {
  const p = String(s?.seasonPresence || "").toLowerCase();
  if (!p) return false;
  if (p.includes("year-round") || p.includes("all year")) return true;
  return p.includes(season);
}

// ---- Badges ---------------------------------------------------------

export const DIFF_COLORS = {
  easy: { bg: "rgba(122,184,122,0.12)", text: T.sage },
  moderate: { bg: "rgba(196,151,74,0.12)", text: T.amber },
  hard: { bg: "rgba(196,122,122,0.12)", text: T.rose },
  strenuous: { bg: "rgba(154,122,184,0.12)", text: T.lavender },
};

export function diffColor(level) {
  const key = String(level || "").toLowerCase();
  return DIFF_COLORS[key] || DIFF_COLORS.moderate;
}

// ---- Layout constants -----------------------------------------------

export const PAGE_PX = 20; // horizontal page padding
export const NAV_H = 64; // bottom nav clearance
export const PAGE_SIZE = 50; // constitutional pagination — never 48, never 100
