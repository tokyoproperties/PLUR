// EarthEye OC — Species v4 — Yard Edition DNA
import { useState, useEffect, useMemo, useRef } from "react";
import BottomNav from "./BottomNav";
import { Species, Observation } from "@/api/entities";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:        "#0F0F0D",
  card:      "#1A1A17",
  border:    "rgba(255,255,255,0.07)",
  ink:       "rgba(255,255,255,0.90)",
  inkMid:    "rgba(255,255,255,0.70)",
  inkLight:  "rgba(255,255,255,0.35)",
  inkFaint:  "rgba(255,255,255,0.18)",
  accent:    "#7AB87A",
  accentRose:"#C47A7A",
  accentAmber:"#C4974A",
};

// ── Group accent colors (for small circular indicators only) ──────────────────
const GROUP_COLOR = {
  bird:        "#C47A7A",  // dusty rose
  mammal:      "#C4974A",  // warm amber
  reptile:     "#7AB87A",  // sage
  amphibian:   "#7A9AB8",  // muted blue
  fish:        "#7A9AB8",
  plant:       "#7AB87A",
  insect:      "#9A7AB8",  // lavender
  arachnid:    "#9A7AB8",
  fungi:       "#9A7AB8",
  invertebrate:"#C4974A",
  crustacean:  "#7A9AB8",
  mollusk:     "#7A9AB8",
  algae:       "#7AB87A",
  lichen:      "#7AB87A",
  "human impact": "rgba(255,255,255,0.2)",
};

function groupColor(g) {
  return GROUP_COLOR[g?.toLowerCase()] || "rgba(255,255,255,0.15)";
}

// ── Filters ───────────────────────────────────────────────────────────────────
const HABITAT_FILTERS = [
  { id: "coastal",   label: "Coastal",      keywords: ["coast","beach","intertidal","tidepool","rocky shore","sandy beach","surf zone","dune","bluff"] },
  { id: "wetlands",  label: "Wetlands",     keywords: ["wetland","marsh","estuary","saltmarsh","mudflat","bay","riparian","tidal","cordgrass","pickleweed","creek","river"] },
  { id: "chaparral", label: "Chaparral",    keywords: ["chaparral","sage scrub","scrub","shrubland","coastal sage","manzanita","ceanothus","chamise"] },
  { id: "woodland",  label: "Oak Woodland", keywords: ["oak woodland","oak","woodland","canyon woodland","riparian woodland","walnut"] },
  { id: "mountains", label: "Mountains",    keywords: ["mountain","peak","ridge","conifer","pine","fir","subalpine","cleveland","saddleback","santiago"] },
  { id: "grassland", label: "Grassland",    keywords: ["grassland","meadow","vernal pool","annual grass","open field","prairie"] },
  { id: "marine",    label: "Marine",       keywords: ["kelp forest","ocean","offshore","pelagic","subtidal","reef","open water","marine"] },
  { id: "urban",     label: "Urban Edge",   keywords: ["urban","suburban","garden","park","developed","city","edge","disturbed"] },
];

const SEASON_FILTERS = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "fall",   label: "Fall"   },
  { id: "winter", label: "Winter" },
];

const RARE_STATUSES = ["of concern","threatened","endangered","critically endangered",
  "state threatened","federally threatened","federally endangered","rare","very rare"];

const SORT_OPTIONS = [
  { id: "az",        label: "A → Z"         },
  { id: "za",        label: "Z → A"         },
  { id: "sightings", label: "Most Sightings" },
  { id: "recent",    label: "Recently Seen" },
  { id: "rarest",    label: "Rarest First"  },
];

const PAGE_SIZE = 50;
const NOW = Date.now();
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// ── Species card ──────────────────────────────────────────────────────────────
function SpeciesCard({ species, sightings, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const gc = groupColor(species.group);
  const cs = species.conservationStatus?.toLowerCase();
  const isRare = RARE_STATUSES.includes(cs);

  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: "11px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Photo — hard 4:3 */}
      <div style={{
        width: "100%", paddingTop: "75%",
        position: "relative", background: "#141412",
      }}>
        {species.imageUrl && !imgErr ? (
          <img
            src={species.imageUrl}
            alt={species.name}
            onError={() => setImgErr(true)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: gc, opacity: 0.5
            }} />
          </div>
        )}
        {/* Rare badge */}
        {isRare && (
          <div style={{
            position: "absolute", top: "7px", right: "7px",
            background: "rgba(196,122,122,0.85)",
            fontSize: "8px", fontWeight: "700", letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#FFF",
            borderRadius: "100px", padding: "3px 6px",
            backdropFilter: "blur(4px)"
          }}>
            {cs === "critically endangered" ? "Critical" :
             cs === "endangered" ? "Endangered" :
             cs === "threatened" ? "Threatened" : "At Risk"}
          </div>
        )}
        {/* Group dot — bottom left */}
        <div style={{
          position: "absolute", bottom: "7px", left: "7px",
          width: "8px", height: "8px", borderRadius: "50%",
          background: gc, opacity: 0.85
        }} />
      </div>

      {/* Text */}
      <div style={{ padding: "10px 11px 12px" }}>
        <div style={{
          fontSize: "13px", fontFamily: "Georgia, serif", fontWeight: "400",
          color: T.ink, lineHeight: 1.3, marginBottom: "3px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>
          {species.name}
        </div>
        <div style={{
          fontSize: "10px", fontStyle: "italic", color: T.inkLight,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>
          {species.scientificName || (species.group ? species.group.charAt(0).toUpperCase() + species.group.slice(1) : "")}
        </div>
        {sightings > 0 && (
          <div style={{ marginTop: "5px", fontSize: "10px", color: T.inkFaint }}>
            {sightings} {sightings === 1 ? "sighting" : "sightings"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: "100px", cursor: "pointer",
      fontSize: "12px", fontWeight: "600", border: "none",
      background: active ? "rgba(122,184,122,0.2)" : "rgba(255,255,255,0.06)",
      color: active ? T.accent : T.inkMid,
      outline: active ? `1px solid rgba(122,184,122,0.4)` : "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

// ── Active filter pill ────────────────────────────────────────────────────────
function FilterPill({ label, onRemove }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px 4px 11px", borderRadius: "100px",
      background: "rgba(122,184,122,0.12)",
      border: "1px solid rgba(122,184,122,0.25)",
      fontSize: "11px", fontWeight: "600", color: T.accent
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "rgba(122,184,122,0.6)", fontSize: "14px", lineHeight: 1,
        padding: 0, display: "flex", alignItems: "center"
      }}>×</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SpeciesPage() {
  const [allSpecies, setAllSpecies]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [groupFilter, setGroupFilter]     = useState("all");
  const [habitatFilter, setHabitatFilter] = useState(null);
  const [seasonFilter, setSeasonFilter]   = useState(null);
  const [conservFilter, setConservFilter] = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [page, setPage]                   = useState(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get("pg") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [sortBy, setSortBy]               = useState("az");
  const [obsData, setObsData]             = useState({ bySp: {}, recentSp: new Set() });

  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const location       = useLocation();

  // Scroll restoration refs — declared early, effect fires after paged is computed
  // (paged is a const — referencing it in a dep array before declaration = TDZ crash)
  const scrollTargetRef = useRef(
    parseInt(new URLSearchParams(window.location.search).get("sy") || "0", 10)
  );
  const scrollDoneRef = useRef(false);

  // URL params
  useEffect(() => {
    const biome = searchParams.get("biome");
    if (biome) {
      const match = HABITAT_FILTERS.find(h => h.id === biome);
      if (match) { setHabitatFilter(biome); setShowFilters(true); }
      else setSearch(biome);
    }
    const group = searchParams.get("group");
    if (group) setGroupFilter(group.toLowerCase());
    const sort = searchParams.get("sort");
    if (sort) setSortBy(sort);
  }, []);

  // Load species
  useEffect(() => {
    (async () => {
      try {
        let all = [], skip = 0;
        while (true) {
          const b = await Species.filter({}, null, 500, skip);
          const r = Array.isArray(b) ? b : (b?.records || []);
          all = all.concat(r);
          if (r.length < 500) break;
          skip += 500;
        }
        all.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setAllSpecies(all);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Load observations
  useEffect(() => {
    (async () => {
      try {
        let all = [], skip = 0;
        while (true) {
          const b = await Observation.filter({}, null, 500, skip);
          const r = Array.isArray(b) ? b : (b?.records || []);
          if (!r.length) break;
          all = all.concat(r);
          if (r.length < 500) break;
          skip += 500;
        }
        const bySp = {}, recentSp = new Set();
        all.forEach(o => {
          if (!o.speciesId) return;
          if (!bySp[o.speciesId]) bySp[o.speciesId] = { count: 0, lastSeen: null };
          bySp[o.speciesId].count++;
          const ts = o.timestamp ? new Date(o.timestamp).getTime() : 0;
          if (ts && (!bySp[o.speciesId].lastSeen || ts > bySp[o.speciesId].lastSeen))
            bySp[o.speciesId].lastSeen = ts;
          if (ts && NOW - ts < THIRTY_DAYS) recentSp.add(o.speciesId);
        });
        setObsData({ bySp, recentSp });
      } catch {}
    })();
  }, []);

  // Suppress page reset on initial mount — only reset when filters actually change
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    setPage(1);
  }, [search, groupFilter, habitatFilter, seasonFilter, conservFilter, sortBy]);

  const groups = useMemo(() => {
    const raw = [...new Set(allSpecies.map(s => s.group?.toLowerCase()).filter(Boolean))].sort();
    return ["all", ...raw];
  }, [allSpecies]);

  const filtered = useMemo(() => {
    const { bySp, recentSp } = obsData;
    let result = allSpecies.filter(s => {
      if (search) {
        const q = search.toLowerCase().trim();
        // Normalize plural group terms to singular (group field is always singular)
        const PLURAL_MAP = {
          "mammals":"mammal","birds":"bird","reptiles":"reptile","amphibians":"amphibian",
          "fish":"fish","insects":"insect","arachnids":"arachnid","crustaceans":"crustacean",
          "mollusks":"mollusk","invertebrates":"invertebrate","plants":"plant",
          "fungi":"fungi","lichens":"lichen","algae":"algae"
        };
        const qNorm = PLURAL_MAP[q] || q;
        const GROUP_TERMS = ["mammal","bird","reptile","amphibian","fish","insect",
          "arachnid","crustacean","mollusk","invertebrate","plant","fungi","lichen",
          "algae","human impact"];
        const isGroupSearch = GROUP_TERMS.includes(qNorm);
        // Group search: match group field with normalized query
        if (isGroupSearch) {
          if (s.group?.toLowerCase() !== qNorm) return false;
        } else {
          // Free text search: name, scientificName, group, habitat, funFact, fieldCue
          const match = [s.name, s.scientificName, s.group, s.habitat, s.funFact, s.fieldCue]
            .some(f => f?.toLowerCase().includes(q));
          if (!match) return false;
        }
      }
      if (groupFilter !== "all" && s.group?.toLowerCase() !== groupFilter) return false;
      if (habitatFilter) {
        const hf = HABITAT_FILTERS.find(h => h.id === habitatFilter);
        if (hf) {
          const hay = [s.habitat, s.ecologicalRole?.join(" "), s.funFact, s.fieldCue]
            .filter(Boolean).join(" ").toLowerCase();
          if (!hf.keywords.some(kw => hay.includes(kw))) return false;
        }
      }
      if (seasonFilter) {
        const seasons = (s.seasonPresence || []).map(x => x.toLowerCase());
        if (!seasons.includes(seasonFilter)) return false;
      }
      if (conservFilter === "rare") {
        if (!RARE_STATUSES.includes(s.conservationStatus?.toLowerCase())) return false;
      }
      return true;
    });

    switch (sortBy) {
      case "za":        result.sort((a, b) => (b.name||"").localeCompare(a.name||"")); break;
      case "sightings": result.sort((a, b) => (bySp[b.id]?.count||0) - (bySp[a.id]?.count||0)); break;
      case "recent":    result.sort((a, b) => (bySp[b.id]?.lastSeen||0) - (bySp[a.id]?.lastSeen||0)); break;
      case "rarest":
        result.sort((a, b) => {
          const ra = RARE_STATUSES.includes(a.conservationStatus?.toLowerCase()) ? 0 : 1;
          const rb = RARE_STATUSES.includes(b.conservationStatus?.toLowerCase()) ? 0 : 1;
          return ra - rb || (a.name||"").localeCompare(b.name||"");
        }); break;
      default: result.sort((a, b) => (a.name||"").localeCompare(b.name||""));
    }
    return result;
  }, [allSpecies, obsData, search, groupFilter, habitatFilter, seasonFilter, conservFilter, sortBy]);

  const paged   = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;
  const activeFilterCount = [habitatFilter, seasonFilter, conservFilter].filter(Boolean).length;

  // Scroll restoration effect — placed HERE so paged.length is in scope (not TDZ)
  // paged is a const — must be declared before being used in a dep array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const sy = scrollTargetRef.current;
    if (!sy || scrollDoneRef.current || loading || paged.length === 0) return;
    let attempts = 0;
    let timerId;
    const tryScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= sy - 50) {
        window.scrollTo({ top: sy, behavior: "instant" });
        scrollDoneRef.current = true;
      } else if (attempts < 25) {
        attempts++;
        timerId = setTimeout(tryScroll, 80);
      } else {
        window.scrollTo({ top: maxScroll, behavior: "instant" });
        scrollDoneRef.current = true;
      }
    };
    timerId = setTimeout(tryScroll, 50);
    return () => clearTimeout(timerId);
  }, [loading, paged.length]); // eslint-disable-line

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: T.bg, borderBottom: `1px solid ${T.border}`,
        padding: "20px 20px 0",
      }}>
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.14em",
              textTransform: "uppercase", color: T.inkLight, marginBottom: "5px" }}>
              EarthEye OC · Atlas
            </div>
            <h1 style={{
              fontSize: "20px", fontFamily: "Georgia, serif", fontWeight: "400",
              color: T.ink, letterSpacing: "-0.01em", lineHeight: 1
            }}>
              {groupFilter !== "all"
                ? groupFilter.charAt(0).toUpperCase() + groupFilter.slice(1) + "s"
                : habitatFilter ? HABITAT_FILTERS.find(h=>h.id===habitatFilter)?.label || "Species"
                : seasonFilter ? seasonFilter.charAt(0).toUpperCase() + seasonFilter.slice(1) + " Species"
                : "Species"}
            </h1>
          </div>
          <div style={{ fontSize: "11px", color: T.inkLight }}>
            {loading ? "Loading…" : `${filtered.length.toLocaleString()} / ${allSpecies.length.toLocaleString()}`}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={T.inkLight} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Species, habitat, trait…"
              style={{
                width: "100%", paddingLeft: "36px", paddingRight: search ? "36px" : "12px",
                paddingTop: "10px", paddingBottom: "10px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${T.border}`,
                borderRadius: "9px", fontSize: "14px", color: T.ink,
                outline: "none", boxSizing: "border-box"
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                width: "18px", height: "18px", cursor: "pointer", color: T.inkMid,
                fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center"
              }}>×</button>
            )}
          </div>
          <button onClick={() => setShowFilters(f => !f)} style={{
            padding: "10px 14px", borderRadius: "9px", cursor: "pointer",
            background: (showFilters || activeFilterCount > 0) ? "rgba(122,184,122,0.15)" : "rgba(255,255,255,0.05)",
            color: (showFilters || activeFilterCount > 0) ? T.accent : T.inkMid,
            border: (showFilters || activeFilterCount > 0) ? "1px solid rgba(122,184,122,0.3)" : `1px solid ${T.border}`,
            fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
            flexShrink: 0
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                background: "rgba(122,184,122,0.25)", borderRadius: "100px",
                padding: "1px 6px", fontSize: "10px", fontWeight: "700", color: T.accent
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Group tabs */}
        {!loading && (
          <div style={{
            display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px",
            scrollbarWidth: "none",
          }}>
            {groups.map(g => (
              <Chip
                key={g}
                label={g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                active={groupFilter === g}
                onClick={() => setGroupFilter(g)}
              />
            ))}
          </div>
        )}

        {/* Suggest a species — quiet contribution loop (constitution §9) */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "10px" }}>
          <button
            aria-label="Suggest a species for the atlas"
            onClick={() => {
              const subject = encodeURIComponent("Species Suggestion");
              const body = encodeURIComponent(
                "A field guide grows with what people notice.\n\n" +
                "Species or plant you saw:\n" +
                "Where you saw it (trail, park, neighborhood):\n" +
                "When (date or season):\n" +
                "Anything else worth recording:\n"
              );
              window.location.href = `mailto:tokyoproperties@gmail.com?subject=${subject}&body=${body}`;
            }}
            style={{
              background: "none", border: "none", padding: "2px 0",
              fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.30)",
              cursor: "pointer", textDecoration: "none"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(122,184,122,0.70)"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.30)"; e.currentTarget.style.textDecoration = "none"; }}
          >
            Suggest a species
          </button>
        </div>
      </div>

      {/* ── Filter panel ──────────────────────────────────────────────────── */}
      {showFilters && (
        <div style={{
          background: "#161613",
          borderBottom: `1px solid ${T.border}`,
          padding: "18px 20px",
        }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
              textTransform: "uppercase", color: T.inkLight, marginBottom: "9px" }}>
              Habitat
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {HABITAT_FILTERS.map(h => (
                <Chip key={h.id} label={h.label} active={habitatFilter === h.id}
                  onClick={() => setHabitatFilter(habitatFilter === h.id ? null : h.id)} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
              textTransform: "uppercase", color: T.inkLight, marginBottom: "9px" }}>
              Season Present
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {SEASON_FILTERS.map(s => (
                <Chip key={s.id} label={s.label} active={seasonFilter === s.id}
                  onClick={() => setSeasonFilter(seasonFilter === s.id ? null : s.id)} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
                textTransform: "uppercase", color: T.inkLight, marginBottom: "9px" }}>
                Status
              </div>
              <Chip label="Rare / At-Risk" active={conservFilter === "rare"}
                onClick={() => setConservFilter(conservFilter === "rare" ? null : "rare")} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.12em",
                textTransform: "uppercase", color: T.inkLight, marginBottom: "9px" }}>
                Sort
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px", padding: "7px 10px",
                  fontSize: "12px", color: T.inkMid, cursor: "pointer"
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active pills */}
      {activeFilterCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "12px 20px 0" }}>
          {habitatFilter && (
            <FilterPill label={HABITAT_FILTERS.find(h=>h.id===habitatFilter)?.label || habitatFilter}
              onRemove={() => setHabitatFilter(null)} />
          )}
          {seasonFilter && (
            <FilterPill label={seasonFilter.charAt(0).toUpperCase() + seasonFilter.slice(1)}
              onRemove={() => setSeasonFilter(null)} />
          )}
          {conservFilter === "rare" && (
            <FilterPill label="Rare / At-Risk" onRemove={() => setConservFilter(null)} />
          )}
          <button
            onClick={() => { setHabitatFilter(null); setSeasonFilter(null); setConservFilter(null); }}
            style={{ fontSize: "11px", color: T.inkLight, background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 0", gap: "14px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.08)",
              borderTopColor: T.accent,
              animation: "spin 0.8s linear infinite"
            }} />
            <div style={{ fontSize: "12px", color: T.inkLight }}>Loading atlas…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "13px", color: T.inkLight, marginBottom: "12px" }}>
              No species match these filters.
            </div>
            <button
              onClick={() => { setSearch(""); setGroupFilter("all"); setHabitatFilter(null); setSeasonFilter(null); setConservFilter(null); }}
              style={{ fontSize: "13px", color: T.accent, background: "none", border: "none", cursor: "pointer" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {paged.map(s => (
                <SpeciesCard
                  key={s.id}
                  species={s}
                  sightings={obsData.bySp[s.id]?.count || 0}
                  onClick={() => {
                    // Encode current page + scroll in URL before navigating
                    // so browser Back restores exact state via URL
                    const sp = new URLSearchParams(window.location.search);
                    sp.set("pg", String(page));
                    sp.set("sy", String(Math.round(window.scrollY)));
                    window.history.replaceState(null, "", `/species?${sp.toString()}`);
                    navigate(`/SpeciesDetail?id=${s.id}`);
                  }}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "28px" }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "12px 28px", borderRadius: "100px", cursor: "pointer",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${T.border}`,
                    fontSize: "13px", color: T.inkMid
                  }}
                >
                  Load more · {filtered.length - paged.length} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="species" />
    </div>
  );
}
