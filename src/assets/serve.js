// Embedded brand assets, served as bytes.

import { FAVICON_ICO_B64, FAVICON_PNG_B64 } from "./favicon.js";
import { LOGO_B64 } from "./logo.js";

// ---------- Favicon (the official Pckup logo, same asset as /logo.png) ----------

function faviconResponse(b64, contentType) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400",
    },
  });
}

export function serveFaviconIco() {
  return faviconResponse(FAVICON_ICO_B64, "image/x-icon");
}
export function serveFaviconPng() {
  return faviconResponse(FAVICON_PNG_B64, "image/png");
}
export function serveLogo() {
  return faviconResponse(LOGO_B64, "image/png");
}
