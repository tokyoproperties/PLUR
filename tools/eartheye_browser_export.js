/**
 * EarthEye OC — Browser Console Export
 * Mission 13C: Static JSON bridge for earth-eye-mobile
 *
 * HOW TO USE:
 *   1. Open https://earth-eye-view.base44.app in Chrome/Firefox
 *   2. Open DevTools (F12 → Console tab)
 *   3. Paste this entire script and press Enter
 *   4. Two files download automatically: eartheye_species.json + eartheye_trails.json
 *
 * Constitutional note: Observation intentionally excluded.
 * Only Species and Trail — pure atlas data, zero personal data.
 */

(async () => {
  const APP_ID  = "69fadffa28776cd540472426";
  const API_KEY = "5f212b5e24354599bc570c2164bad123";
  const BASE    = `https://api.base44.com/api/apps/${APP_ID}/entities`;
  const STRIP   = new Set(["created_by", "created_by_id", "is_sample", "updated_date"]);
  const STRIP_T = new Set([...STRIP, "archiveReason"]);

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  async function fetchAll(entity) {
    const records = [];
    let skip = 0;
    while (true) {
      const r = await fetch(`${BASE}/${entity}?limit=500&skip=${skip}`, { headers });
      if (!r.ok) throw new Error(`${entity} fetch failed: ${r.status}`);
      const data = await r.json();
      const batch = Array.isArray(data) ? data : (data.records ?? []);
      records.push(...batch);
      const hasMore = Array.isArray(data) ? batch.length === 500 : data.has_more;
      if (!hasMore) break;
      skip += batch.length;
      console.log(`  ${entity}: ${records.length} so far...`);
    }
    return records;
  }

  function clean(record, strip) {
    return Object.fromEntries(Object.entries(record).filter(([k]) => !strip.has(k)));
  }

  function download(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  const ts = new Date().toISOString();

  console.log("Fetching Species...");
  const allSpecies = await fetchAll("Species");
  const speciesRecords = allSpecies.map(r => clean(r, STRIP));
  console.log(`  → ${speciesRecords.length} species`);

  console.log("Fetching Trails...");
  const allTrails = await fetchAll("Trail");
  const activeTrails = allTrails.filter(t => !t.archived);
  const trailRecords = activeTrails.map(r => clean(r, STRIP_T));
  console.log(`  → ${allTrails.length} total, ${trailRecords.length} active`);

  download("eartheye_species.json", {
    schema_version: "1.0",
    generated_utc: ts,
    source: "EarthEye OC — earth-eye-view.base44.app",
    entity: "Species",
    count: speciesRecords.length,
    records: speciesRecords,
  });

  download("eartheye_trails.json", {
    schema_version: "1.0",
    generated_utc: ts,
    source: "EarthEye OC — earth-eye-view.base44.app",
    entity: "Trail",
    note: "Active trails only. Observation excluded by design.",
    count: trailRecords.length,
    records: trailRecords,
  });

  console.log("Done. Check your Downloads folder.");
})();
