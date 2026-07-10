// Country flag images (real flags, not emoji), proxied same-origin from
// flagcdn.com and cached per isolate + in the browser. 32x24 source, shown
// at 16-18px wide so it stays crisp on retina screens.
const FLAG_CACHE = new Map();

export async function flagPng(file) {
  const m = /^([a-z]{2})\.png$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });
  const cc = m[1];
  let bytes = FLAG_CACHE.get(cc);
  if (!bytes) {
    const r = await fetch("https://flagcdn.com/32x24/" + cc + ".png");
    if (!r.ok) return new Response("Not found", { status: 404 });
    bytes = new Uint8Array(await r.arrayBuffer());
    FLAG_CACHE.set(cc, bytes);
  }
  return new Response(bytes, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=604800",
    },
  });
}
