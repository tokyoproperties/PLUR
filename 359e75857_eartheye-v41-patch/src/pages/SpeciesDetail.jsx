// SpeciesDetail.jsx — EarthEye OC constitutional species detail
// 4:3 hero, Georgia serif name, italic scientific name, whisper section
// labels, narrative italics for field voice, contribution loop at the end.

import { useEffect, useState } from "react";
import { getSpecies } from "@/api/entities";
import { useParams, useNavigate } from "react-router-dom";
import {
  T, cardStyle, whisperStyle, narrativeStyle, bodyStyle, headingStyle,
  PAGE_PX, NAV_H, getSeason, SEASON_LABEL, isSpeciesActiveNow,
} from "@/theme";

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ ...whisperStyle, marginBottom: "10px" }}>{label}</div>
      {children}
    </div>
  );
}

export default function SpeciesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [species, setSpecies] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    getSpecies(id)
      .then((data) => {
        if (cancelled) return;
        setSpecies(data);
        setState(data ? "ready" : "missing");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => { cancelled = true; };
  }, [id]);

  if (state === "loading") {
    return (
      <div style={{ padding: "28px " + PAGE_PX + "px" }}>
        <p style={{ ...narrativeStyle }}>Loading species…</p>
      </div>
    );
  }

  if (state === "missing" || !species) {
    return (
      <div style={{ padding: "28px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...cardStyle,
            cursor: "pointer",
            fontFamily: "inherit",
            color: T.ink2,
            fontSize: "13px",
            marginBottom: "20px",
            minHeight: "44px",
            background: "transparent",
          }}
        >
          ← Back
        </button>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Field record</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>Species not found.</p>
        </div>
      </div>
    );
  }

  const s = species;
  const season = getSeason();
  const activeNow = isSpeciesActiveNow(s, season);
  const facts = Array.isArray(s.facts) ? s.facts.filter(Boolean) : [];

  const suggestSubject = encodeURIComponent(
    "EarthEye photo — " + s.name + " (" + (s.scientificName || "") + ")"
  );
  const suggestBody = encodeURIComponent(
    "Species: " + s.name + "\n" +
    "Scientific name: " + (s.scientificName || "") + "\n" +
    "Group: " + (s.group || "") + "\n" +
    "Atlas ID: " + s.id + "\n\n" +
    "A photograph of this species can be attached below. Stewardship keeps the field guide honest — thank you."
  );

  return (
    <div style={{ padding: "0 0 " + (NAV_H + 32) + "px" }}>
      {/* 4:3 hero — locked ratio, no distortion */}
      <div style={{ aspectRatio: "4/3", overflow: "hidden", background: T.fallback, position: "relative" }}>
        {s.imageUrl && (
          <img
            src={s.imageUrl}
            alt={s.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>

      <div style={{ padding: "24px " + PAGE_PX + "px 0" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...cardStyle,
            cursor: "pointer",
            fontFamily: "inherit",
            color: T.ink2,
            fontSize: "13px",
            marginBottom: "20px",
            padding: "10px 16px",
            minHeight: "44px",
            background: "transparent",
          }}
        >
          ← Back
        </button>

        {/* Name block */}
        <h1 style={{ ...headingStyle, fontSize: "clamp(22px, 6vw, 28px)", margin: "0 0 6px" }}>
          {s.name}
        </h1>
        {s.scientificName && (
          <div
            style={{
              fontStyle: "italic",
              fontFamily: T.serif,
              fontSize: "14px",
              color: "rgba(255,255,255,0.45)",
              marginBottom: "8px",
            }}
          >
            {s.scientificName}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
          {activeNow && (
            <span
              aria-label="active now"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: T.sage,
                display: "inline-block",
              }}
            />
          )}
          <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkGhost, fontFamily: T.sans }}>
            {s.group}
            {activeNow ? " · " + SEASON_LABEL[season].toLowerCase() + " presence" : ""}
          </span>
        </div>

        {s.fieldCue && (
          <Section label="Field cue">
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>{s.fieldCue}</p>
          </Section>
        )}

        {s.habitat && (
          <Section label="Habitat">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>{s.habitat}</p>
          </Section>
        )}

        {s.behavior && (
          <Section label="Behavior">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>{s.behavior}</p>
          </Section>
        )}

        {s.seasonPresence && (
          <Section label="When to find">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>
              {s.seasonPresence}
              {s.frequency ? " · " + s.frequency : ""}
            </p>
          </Section>
        )}

        {s.ecologicalRole && (
          <Section label="Ecological role">
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>{s.ecologicalRole}</p>
          </Section>
        )}

        {s.lookalikes && (
          <Section label="Lookalikes">
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>{s.lookalikes}</p>
          </Section>
        )}

        {facts.length > 0 && (
          <Section label="Atlas facts">
            {facts.map((f, i) => (
              <p key={i} style={{ ...narrativeStyle, marginTop: 0, marginBottom: "12px" }}>
                {f}
              </p>
            ))}
          </Section>
        )}

        {(s.nativeStatus || s.conservationStatus || s.endemicStatus) && (
          <Section label="Status">
            <p style={{ ...bodyStyle, marginTop: 0, marginBottom: 0 }}>
              {[
                s.nativeStatus && s.nativeStatus.charAt(0).toUpperCase() + s.nativeStatus.slice(1),
                s.endemicStatus,
                s.conservationStatus && "Conservation: " + s.conservationStatus,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Section>
        )}

        {/* Contribution loop — stewardship, not support */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span style={{ ...whisperStyle }}>Stewardship</span>
          <a
            href={
              "mailto:tokyoproperties@gmail.com?subject=" + suggestSubject + "&body=" + suggestBody
            }
            style={{
              fontSize: "11px",
              color: T.inkMuted,
              textDecoration: "none",
              fontFamily: T.serif,
              fontStyle: "italic",
              cursor: "pointer",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Suggest a photo
          </a>
        </div>
      </div>
    </div>
  );
}
