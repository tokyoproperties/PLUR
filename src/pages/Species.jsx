// Species.jsx — EarthEye OC constitutional species list
// Seasonal banner, whisper labels, dark cards with 4:3 thumbnails,
// Georgia serif names, sage presence dot for active-now species.
// PAGE_SIZE = 50 — constitutional. Tap → /species/:id.

import { useState, useEffect, useMemo } from "react";
import { listSpecies } from "@/api/entities";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  T, cardHoverStyle, whisperStyle, narrativeStyle, inputStyle,
  PAGE_PX, NAV_H, PAGE_SIZE, getSeason, SEASON_LABEL, SEASON_ACCENT,
  isSpeciesActiveNow,
} from "@/theme";

function SeasonalBanner({ total, activeCount }) {
  const season = getSeason();
  const accent = SEASON_ACCENT[season];
  return (
    <div style={{ ...cardHoverStyle, cursor: "default", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <div style={{ ...whisperStyle, marginBottom: "8px", color: accent }}>
          {SEASON_LABEL[season]} presence
        </div>
      </div>
      <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: 0 }}>
        {activeCount} of {total} atlas species hold {SEASON_LABEL[season].toLowerCase()} presence.
      </p>
    </div>
  );
}

function SpeciesCard({ s, navigate }) {
  const active = isSpeciesActiveNow(s);
  return (
    <button
      onClick={() => navigate("/species/" + s.id)}
      style={{
        ...cardHoverStyle,
        display: "flex",
        gap: "14px",
        alignItems: "center",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        width: "100%",
        marginBottom: "12px",
        minHeight: "44px",
      }}
    >
      {/* 4:3 thumbnail — the locked species image ratio */}
      <div
        style={{
          width: "72px",
          flexShrink: 0,
          aspectRatio: "4/3",
          borderRadius: T.radiusSm,
          overflow: "hidden",
          background: T.fallback,
        }}
      >
        {s.imageUrl && (
          <img
            src={s.imageUrl}
            alt={s.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: T.serif,
            fontSize: "15px",
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.35,
            marginBottom: "3px",
          }}
        >
          {s.name}
        </div>
        {s.scientificName && (
          <div
            style={{
              fontStyle: "italic",
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              fontFamily: T.serif,
              marginBottom: "5px",
            }}
          >
            {s.scientificName}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {active && (
            <span
              aria-label="active now"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: T.sage,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontSize: "10px", color: T.inkMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {s.group}
          </span>
        </div>
      </div>
      <span style={{ color: T.inkGhost, fontSize: "13px", flexShrink: 0 }}>→</span>
    </button>
  );
}

export default function SpeciesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const activeNow = searchParams.get("active") === "1";

  const [species, setSpecies] = useState([]);
  const [state, setState] = useState("loading");
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    listSpecies()
      .then((data) => {
        if (cancelled) return;
        setSpecies(data || []);
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => { cancelled = true; };
  }, []);

  const season = getSeason();

  const filtered = useMemo(() => {
    let out = species;
    if (activeNow) out = out.filter((s) => isSpeciesActiveNow(s, season));
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (s) =>
          String(s.name || "").toLowerCase().includes(q) ||
          String(s.scientificName || "").toLowerCase().includes(q) ||
          String(s.group || "").toLowerCase().includes(q)
      );
    }
    // active-now species first, then alphabetical
    out = [...out].sort((a, b) => {
      const aa = isSpeciesActiveNow(a, season) ? 0 : 1;
      const bb = isSpeciesActiveNow(b, season) ? 0 : 1;
      if (aa !== bb) return aa - bb;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    return out;
  }, [species, query, activeNow, season]);

  const activeCount = useMemo(
    () => species.filter((s) => isSpeciesActiveNow(s, season)).length,
    [species, season]
  );

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  return (
    <div style={{ padding: "20px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
      {state === "loading" && (
        <p style={{ ...narrativeStyle }}>Loading the atlas…</p>
      )}

      {state === "error" && (
        <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Atlas</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>
            The species atlas is unavailable. Check your connection and reopen.
          </p>
        </div>
      )}

      {state === "ready" && (
        <>
          <SeasonalBanner total={species.length} activeCount={activeCount} />

          {/* Search + active-now filter */}
          <input
            type="text"
            value={query}
            onChange={(e) => { setParam("q", e.target.value); setShown(PAGE_SIZE); }}
            placeholder="Search species…"
            style={{ ...inputStyle, marginBottom: "10px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => { setParam("active", activeNow ? "" : "1"); setShown(PAGE_SIZE); }}
              style={{
                cursor: "pointer",
                minHeight: "32px",
                padding: "0 12px",
                borderRadius: "999px",
                border: activeNow
                  ? "1px solid rgba(122,184,122,0.40)"
                  : "1px solid rgba(255,255,255,0.10)",
                background: activeNow ? "rgba(122,184,122,0.10)" : "transparent",
                color: activeNow ? T.sage : T.inkMuted,
                fontSize: "10px",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                fontFamily: T.sans,
              }}
            >
              Active now
            </button>
            <span style={{ fontSize: "11px", color: T.inkGhost, fontFamily: T.sans }}>
              {filtered.length} of {species.length}
            </span>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
              <div style={{ ...whisperStyle, marginBottom: "12px" }}>Field record</div>
              <p style={{ ...narrativeStyle, marginBottom: 0 }}>
                {query
                  ? "Nothing recorded for “" + query + ".”"
                  : "No species match the current filter."}
              </p>
            </div>
          ) : (
            <>
              {filtered.slice(0, shown).map((s) => (
                <SpeciesCard key={s.id} s={s} navigate={navigate} />
              ))}
              {shown < filtered.length && (
                <button
                  onClick={() => setShown((n) => n + PAGE_SIZE)}
                  style={{
                    ...cardHoverStyle,
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "inherit",
                    color: T.ink2,
                    fontSize: "13px",
                    minHeight: "44px",
                    background: "transparent",
                  }}
                >
                  More of the atlas
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
