// World coastline data for the globe, proxied same-origin so the page never
// depends on a third-party CDN at runtime. Cached per isolate + in the browser.
let WORLD_CACHE = null;

export async function worldJson() {
  if (!WORLD_CACHE) {
    const r = await fetch(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    );
    if (!r.ok) {
      return new Response('{"error":"world data unavailable"}', {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
    WORLD_CACHE = await r.text();
  }
  return new Response(WORLD_CACHE, {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=604800",
    },
  });
}
