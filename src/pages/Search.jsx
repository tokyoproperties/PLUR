// Search.jsx — EarthEye OC constitutional index
// Quiet search across species and trails. Dark input, whisper section
// labels, tappable Georgia serif results.

import { useState, useEffect } from "react";
import { listSpecies, listTrails } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import {
  T, cardHoverStyle, whisperStyle, narrativeStyle, inputStyle,
  PAGE_PX, NAV_H, getSeason, isSpeciesActiveNow,
} from "@/theme";

export default function Search() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, t] = await Promise.all([listSpecies(), listTrails()]);
        if (!cancelled) {
          setSpecies(s || []);
          setTrails(t || []);
          setState("ready");
        }
      } catch (e) {
        if (!cancelled) setState("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const q = query.toLowerCase();
  const filteredSpecies = q
    ? species.filter((s) =>
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.scientificName || "").toLowerCase().includes(q)
      )
    : [];
  const filteredTrails = q
    ? trails.filter((t) => String(t.name || "").toLowerCase().includes(q))
    : [];

  const season = getSeason();

  return (
    <div style={{ padding: "20px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the atlas…"
        autoFocus
        style={{ ...inputStyle, marginBottom: "24px" }}
      />

      {state === "loading" && <p style={{ ...narrativeStyle }}>Opening the atlas…</p>}

      {state === "error" && (
        <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Atlas</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>
            The atlas is unavailable. Check your connection and reopen.
          </p>
        </div>
      )}

      {state === "ready" && !q && (
        <p style={{ ...narrativeStyle }}>
          {species.length} species and {trails.length} trails recorded across the county.
          Begin typing to search by name.
        </p>
      )}

      {state === "ready" && q && (
        <>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>
            Species · {filteredSpecies.length}
          </div>
          {filteredSpecies.slice(0, 20).map((s) => (
            <button
              key={s.id}
              onClick={() => navigate("/species/" + s.id)}
              style={{
                ...cardHoverStyle,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
                width: "100%",
                marginBottom: "10px",
                padding: "12px 16px",
                minHeight: "44px",
              }}
            >
              <span>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.serif,
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  {s.name}
                </span>
                {s.scientificName && (
                  <span
                    style={{
                      display: "block",
                      fontStyle: "italic",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: T.serif,
                      marginTop: "2px",
                    }}
                  >
                    {s.scientificName}
                  </span>
                )}
              </span>
              {isSpeciesActiveNow(s, season) && (
                <span
                  aria-label="active now"
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: T.sage,
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          ))}

          <div style={{ ...whisperStyle, margin: "24px 0 12px" }}>
            Trails · {filteredTrails.length}
          </div>
          {filteredTrails.slice(0, 20).map((t) => (
            <button
              key={t.id}
              onClick={() => navigate("/trails/" + t.id)}
              style={{
                ...cardHoverStyle,
                display: "block",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
                width: "100%",
                marginBottom: "10px",
                padding: "12px 16px",
                minHeight: "44px",
              }}
            >
              <span
                style={{
                  fontFamily: T.serif,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {t.name}
              </span>
              {t.jurisdiction && (
                <span
                  style={{
                    display: "block",
                    fontSize: "10px",
                    color: T.inkGhost,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    marginTop: "4px",
                    fontFamily: T.sans,
                  }}
                >
                  {t.jurisdiction}
                </span>
              )}
            </button>
          ))}

          {filteredSpecies.length === 0 && filteredTrails.length === 0 && (
            <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
              <div style={{ ...whisperStyle, marginBottom: "12px" }}>Field record</div>
              <p style={{ ...narrativeStyle, marginBottom: 0 }}>
                Nothing recorded for “{query}.”
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
