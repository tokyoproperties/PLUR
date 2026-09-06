// Trails.jsx — EarthEye OC constitutional trail list
// Seasonal banner, dark cards with 16:9 cinematic heroes, whisper labels,
// difficulty badges in the constitutional palette. Tap → /trails/:id.

import { useState, useEffect, useMemo } from "react";
import { listTrails } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  T, cardHoverStyle, whisperStyle, narrativeStyle, inputStyle,
  PAGE_PX, NAV_H, diffColor, getSeason, SEASON_LABEL,
} from "@/theme";

function TrailCard({ t, navigate }) {
  const dc = diffColor(t.difficulty);
  const habitats = Array.isArray(t.habitatTypes) ? t.habitatTypes : [];
  return (
    <button
      onClick={() => navigate("/trails/" + t.id)}
      style={{
        ...cardHoverStyle,
        display: "block",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        width: "100%",
        marginBottom: "12px",
        padding: 0,
        overflow: "hidden",
        minHeight: "44px",
      }}
    >
      {/* 16:9 cinematic hero */}
      <div style={{ aspectRatio: "16/9", overflow: "hidden", background: T.fallback }}>
        {t.heroImage && (
          <img
            src={t.heroImage}
            alt={t.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          style={{
            ...whisperStyle,
            marginBottom: "6px",
          }}
        >
          {t.jurisdiction}
        </div>
        <div
          style={{
            fontFamily: T.serif,
            fontSize: "16px",
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.3,
            marginBottom: "8px",
          }}
        >
          {t.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {t.distanceMiles != null && (
            <span style={{ fontSize: "11px", color: T.inkMuted, fontFamily: T.sans }}>
              {t.distanceMiles} mi
            </span>
          )}
          {t.elevationGain != null && (
            <span style={{ fontSize: "11px", color: T.inkMuted, fontFamily: T.sans }}>
              {t.elevationGain} ft gain
            </span>
          )}
          {t.difficulty && (
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "3px 8px",
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
        {habitats.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            {habitats.slice(0, 3).map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: T.inkGhost,
                  background: "rgba(255,255,255,0.04)",
                  padding: "3px 7px",
                  borderRadius: "6px",
                  fontFamily: T.sans,
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export default function TrailsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [trails, setTrails] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    listTrails()
      .then((data) => {
        if (cancelled) return;
        setTrails(data || []);
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let out = trails;
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((t) => String(t.name || "").toLowerCase().includes(q));
    }
    return [...out].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [trails, query]);

  const season = getSeason();

  function setQuery(v) {
    const next = new URLSearchParams(searchParams);
    if (v) next.set("q", v);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  return (
    <div style={{ padding: "20px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
      {state === "loading" && <p style={{ ...narrativeStyle }}>Loading the atlas…</p>}

      {state === "error" && (
        <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Atlas</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>
            The trail atlas is unavailable. Check your connection and reopen.
          </p>
        </div>
      )}

      {state === "ready" && (
        <>
          {/* Seasonal banner */}
          <div style={{ ...cardHoverStyle, cursor: "default", marginBottom: "16px" }}>
            <div style={{ ...whisperStyle, marginBottom: "8px" }}>
              {SEASON_LABEL[season]} on the trails
            </div>
            <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>
              {trails.length} corridors cross the county — coastal, riparian, and chaparral.
            </p>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trails…"
            style={{ ...inputStyle, marginBottom: "20px" }}
          />

          {filtered.length === 0 ? (
            <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
              <div style={{ ...whisperStyle, marginBottom: "12px" }}>Field record</div>
              <p style={{ ...narrativeStyle, marginBottom: 0 }}>
                {query
                  ? "No trails recorded for “" + query + ".”"
                  : "No trails match the current filter."}
              </p>
            </div>
          ) : (
            filtered.map((t) => <TrailCard key={t.id} t={t} navigate={navigate} />)
          )}
        </>
      )}
    </div>
  );
}
