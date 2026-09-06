// Home.jsx — EarthEye OC constitutional home
// Whisper label, Georgia italic seasonal narrative, quiet stat cards,
// observations — never instructions.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSpecies, listTrails } from "@/api/entities";
import {
  T, cardHoverStyle, whisperStyle, narrativeStyle, bodyStyle,
  PAGE_PX, NAV_H, getSeason, SEASON_LABEL, isSpeciesActiveNow,
} from "@/theme";

export default function Home() {
  const navigate = useNavigate();

  const [species, setSpecies] = useState([]);
  const [trails, setTrails] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error

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

  const season = getSeason();
  const activeCount = species.filter((s) => isSpeciesActiveNow(s, season)).length;

  const SEASON_PHRASE = {
    spring: "Spring light is good for noticing what changed overnight.",
    summer: "Late summer carries the coastal sage and the dry-season hum of insects.",
    fall: "Fall arrives quietly — the chaparral breathes out its stored heat.",
    winter: "Winter rains green the hills and quiet the trails.",
  };

  return (
    <div style={{ padding: "28px " + PAGE_PX + "px", paddingBottom: NAV_H + 32 + "px" }}>
      {/* Greeting */}
      <div style={{ ...whisperStyle, marginBottom: "8px" }}>
        Orange County Field Guide
      </div>
      <p style={{ ...narrativeStyle, marginTop: 0, marginBottom: "28px" }}>
        {state === "ready"
          ? SEASON_PHRASE[season] + " " + activeCount + " of " + species.length +
            " atlas species hold " + SEASON_LABEL[season].toLowerCase() + " presence."
          : "Loading the atlas…"}
      </p>

      {state === "error" && (
        <div style={{ ...cardHoverStyle, cursor: "default", textAlign: "center" }}>
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>Atlas</div>
          <p style={{ ...narrativeStyle, marginBottom: 0 }}>
            The atlas is unavailable right now. Check your connection and reopen.
          </p>
        </div>
      )}

      {state === "ready" && (
        <>
          {/* Stat tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              onClick={() => navigate("/species")}
              style={{ ...cardHoverStyle, minHeight: "44px" }}
            >
              <div style={{ ...whisperStyle, marginBottom: "10px" }}>
                Species recorded
              </div>
              <div
                style={{
                  fontFamily: T.serif,
                  fontSize: "24px",
                  fontWeight: 400,
                  color: T.ink,
                }}
              >
                {species.length}
              </div>
            </div>
            <div
              onClick={() => navigate("/trails")}
              style={{ ...cardHoverStyle, minHeight: "44px" }}
            >
              <div style={{ ...whisperStyle, marginBottom: "10px" }}>
                Trails recorded
              </div>
              <div
                style={{
                  fontFamily: T.serif,
                  fontSize: "24px",
                  fontWeight: 400,
                  color: T.ink,
                }}
              >
                {trails.length}
              </div>
            </div>
          </div>

          {/* Quiet section list */}
          <div style={{ ...whisperStyle, marginBottom: "12px" }}>
            Surfaces
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Species", note: "The atlas, in seasonal order", path: "/species" },
              { label: "Trails", note: "Corridors, watersheds, and coastal paths", path: "/trails" },
              { label: "Sky", note: "Light, horizon, and zenith", path: "/sky" },
              { label: "Seasonal", note: "The year in motion", path: "/seasonal" },
              { label: "Story", note: "Watershed and land narrative", path: "/watershed-story" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...cardHoverStyle,
                  textAlign: "left",
                  color: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "inherit",
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
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: T.inkMuted,
                      fontFamily: T.sans,
                    }}
                  >
                    {item.note}
                  </span>
                </span>
                <span style={{ color: T.inkGhost, fontSize: "14px" }}>→</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
