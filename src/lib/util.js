// Small shared helpers.

// Ownership key for an IP: IPv4 matches exactly; IPv6 matches on the /64
// prefix (first four hextets) because devices rotate the second half daily.
export function ipKey(ip) {
  if (!ip) return null;
  if (ip.indexOf(":") === -1) return ip;
  return ip.split(":").slice(0, 4).join(":");
}

export function normKey(s) {
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}

// ---------- "Sign in with X" (OAuth 2.0 + PKCE) ----------
// The form's X logo opens a popup to /auth/x/start, the user authorizes on
// x.com, and the callback posts their verified @username back to the page.
// X_CLIENT_ID is a public var; X_CLIENT_SECRET (confidential apps) is a
// wrangler secret and used only server-side at the token exchange.

export function b64url(buf) {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ---------- Visitor tracking ----------
// Cloudflare attaches geo data to every request (request.cf); the visitor's
// address comes from the CF-Connecting-IP header. Logging runs via
// ctx.waitUntil so it never slows down or breaks the page itself.

// The form sets a "bt_name" cookie after a successful submission, so later
// visits from that person's browser carry their name even behind a shared
// office IP or after their IP changes.
export function cookieName(request) {
  const m = (request.headers.get("cookie") || "").match(
    /(?:^|;\s*)bt_name=([^;]+)/
  );
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).trim().slice(0, 100) || null;
  } catch {
    return null;
  }
}
