// TrailDetail.jsx — EarthEye OC constitutional trail detail
// 16:9 cinematic hero, Georgia serif name, whisper labels, difficulty badge,
// habitat tags, narrative italic for ecological voice.

import { useEffect, useState } from "react";
import { getTrail } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";
import {
  T, cardStyle, whisperStyle, narrativeStyle, bodyStyle, headingStyle,
  PAGE_PX, NAV_H, diffColor,
} from "@/theme";

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ ...whisperStyle, marginBottom: "10px" }}>{label}</div>
      {children}
    </div>
  );
}

export default function TrailDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trail, setTrail] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    getTrail(id)
      .then((data) => {
        if (cancelled) return;
        setTrail(data);
        setState(data ? "ready" : "missing");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => { cancelled = true; };
  }, [id]);

  if (state === "loading") {
    return (
      <div style={{ padding: "28px " + PAGE_PX + "px" }}>
        <p style={{ ...narrativeStyle }}>Loading trail…</p>
      </div>
    );
  }

  if (state === "missing" || !trail) {
    return (
      <div style={{ padding: "28px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...cardStyle, cursor: "pointer", fontFamily: "inherit", color: T.ink2,
            fontSize: "13px", marginBottom: "20px", minHeight: "44px", background: "transparent",
          }}
        >
          ← Back
        </button>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Field record</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>Trail not found.</p>
        </div>
      </div>
    );
  }

  const t = trail;
  const dc = diffColor(t.difficulty);
  const habitats = Array.isArray(t.habitatTypes) ? t.habitatTypes : [];
  const speciesCount = Array.isArray(t.speciesIds) ? t.speciesIds.length : 0;

  return (
    <div style={{ padding: "0 0 " + (NAV_H + 32) + "px" }}>
      {/* 16:9 cinematic hero */}
      <div style={{ aspectRatio: "16/9", overflow: "hidden", background: T.fallback }}>
        {t.heroImage && (
          <img
            src={t.heroImage}
            alt={t.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      <div style={{ padding: "24px " + PAGE_PX + "px 0" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...cardStyle, cursor: "pointer", fontFamily: "inherit", color: T.ink2,
            fontSize: "13px", marginBottom: "20px", padding: "10px 16px",
            minHeight: "44px", background: "transparent",
          }}
        >
          ← Back
        </button>

        <h1 style={{ ...headingStyle, fontSize: "clamp(20px, 5.5vw, 26px)", margin: "0 0 6px" }}>
          {t.name}
        </h1>
        {t.jurisdiction && (
          <div style={{ ...whisperStyle, marginBottom: "24px" }}>{t.jurisdiction}</div>
        )}

        {/* Stats card */}
        <div style={{ ...cardStyle, marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {t.distanceMiles != null && (
              <span>
                <span style={{ fontFamily: T.serif, fontSize: "20px", color: T.ink }}>
                  {t.distanceMiles}
                </span>
                <span style={{ fontSize: "11px", color: T.inkMuted, marginLeft: "4px" }}>mi</span>
              </span>
            )}
            {t.elevationGain != null && (
              <span>
                <span style={{ fontFamily: T.serif, fontSize: "20px", color: T.ink }}>
                  {t.elevationGain}
                </span>
                <span style={{ fontSize: "11px", color: T.inkMuted, marginLeft: "4px" }}>ft gain</span>
              </span>
            )}
            {t.difficulty && (
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: dc.bg,
                  color: dc.text,
                  fontFamily: T.sans,
                }}
              >
                {t.difficulty}
              </span>
            )}
          </div>

          {/* Quiet amenities — observations, not directives */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "14px" }}>
            {[
              t.dogFriendly === true && "Dogs on leash",
              t.hasWater === true && "Water along the route",
              t.restrooms === true && "Restrooms at the trailhead",
              t.heatRisk && "Heat risk: " + t.heatRisk,
              speciesCount > 0 && speciesCount + " atlas species recorded",
            ]
              .filter(Boolean)
              .map((line, i) => (
                <span key={i} style={{ fontSize: "11px", color: T.inkMuted, fontFamily: T.sans }}>
                  {line}
                </span>
              ))}
          </div>
        </div>

        {habitats.length > 0 && (
          <Section label="Habitat types">
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {habitats.map((h, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: T.inkGhost,
                    background: "rgba(255,255,255,0.04)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontFamily: T.sans,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </Section>
        )}

        {t.ecologicalNotes && (
          <Section label="Ecological notes">
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>{t.ecologicalNotes}</p>
          </Section>
        )}

        {t.seasonalConditions && (
          <Section label="Seasonal conditions">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>{t.seasonalConditions}</p>
          </Section>
        )}

        {t.soundscape && (
          <Section label="Soundscape">
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>{t.soundscape}</p>
          </Section>
        )}

        {t.speciesHotspots && (
          <Section label="Where to notice">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>{t.speciesHotspots}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
