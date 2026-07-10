// Senpex / Pckup — Team Birthday Tracker
// Single-file Cloudflare Worker: form + shared birthday wall + JSON API + ICS calendar feed.

import { FAVICON_ICO_B64, FAVICON_PNG_B64 } from "./favicon.js";
import { LOGO_B64 } from "./logo.js";

const COMPANY = "Senpex / Pckup";

// Shown in every page footer via the __BUILDINFO__ placeholder. UPDATE THIS
// on every shipped change: keep the token estimate and date fresh. (Exact
// usage isn't exposed to the model, so the figure is a maintained estimate
// of cumulative tokens across all Claude sessions building this app.)
const BUILD_NOTE =
  "🤖 Built with Claude Fable 5 (claude-fable-5) · updated July 10, 2026";
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/"));
        return new Response(PAGE.replace("__BUILDINFO__", BUILD_NOTE), {
          // no-store: stale cached pages kept biting us (old form JS posting
          // outdated payloads, missing features after deploys).
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      }
      if (url.pathname === "/visitors" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/visitors"));
        return new Response(VISITORS_PAGE.replace("__BUILDINFO__", BUILD_NOTE), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      }
      if (url.pathname === "/changelog" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/changelog"));
        return new Response(CHANGELOG_PAGE.replace("__BUILDINFO__", BUILD_NOTE), {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      }
      if (url.pathname === "/api/birthdays" && request.method === "GET") {
        return listBirthdays(env, request);
      }
      if (url.pathname === "/api/submit" && request.method === "POST") {
        return submit(request, env);
      }
      if (url.pathname === "/api/edit" && request.method === "POST") {
        return editEntry(request, env);
      }
      if (url.pathname === "/api/delete" && request.method === "POST") {
        return deleteEntry(request, env);
      }
      if (url.pathname === "/auth/x/start" && request.method === "GET") {
        return xAuthStart(request, env);
      }
      if (url.pathname === "/auth/x/callback" && request.method === "GET") {
        return xAuthCallback(request, env);
      }
      if (url.pathname === "/auth/ig/start" && request.method === "GET") {
        return igAuthStart(request, env);
      }
      if (url.pathname === "/auth/ig/callback" && request.method === "GET") {
        return igAuthCallback(request, env);
      }
      if (url.pathname === "/api/visits" && request.method === "GET") {
        return listVisits(env, url);
      }
      if (url.pathname === "/api/person-visits" && request.method === "GET") {
        return personVisits(env, url);
      }
      if (url.pathname === "/world.json" && request.method === "GET") {
        return worldJson();
      }
      if (url.pathname.startsWith("/flag/") && request.method === "GET") {
        return flagPng(url.pathname.slice(6));
      }
      if (url.pathname.startsWith("/avatar/") && request.method === "GET") {
        return avatarImg(env, url.pathname.slice(8));
      }
      if (url.pathname === "/calendar.ics" && request.method === "GET") {
        return icsFeed(env);
      }
      if (url.pathname === "/favicon.ico") {
        return faviconResponse(FAVICON_ICO_B64, "image/x-icon");
      }
      if (
        url.pathname === "/favicon.png" ||
        url.pathname === "/apple-touch-icon.png"
      ) {
        return faviconResponse(FAVICON_PNG_B64, "image/png");
      }
      if (url.pathname === "/logo.png") {
        return faviconResponse(LOGO_B64, "image/png");
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      return json({ error: "Server error: " + err.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Ownership key for an IP: IPv4 matches exactly; IPv6 matches on the /64
// prefix (first four hextets) because devices rotate the second half daily.
function ipKey(ip) {
  if (!ip) return null;
  if (ip.indexOf(":") === -1) return ip;
  return ip.split(":").slice(0, 4).join(":");
}

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

// ---------- API ----------

// Serve a person's uploaded avatar (stored as a data URL in D1).
async function avatarImg(env, idStr) {
  const id = Number.parseInt(idStr, 10);
  if (!Number.isInteger(id) || id <= 0)
    return new Response("Not found", { status: 404 });
  const row = await env.DB.prepare("SELECT avatar FROM birthdays WHERE id = ?1")
    .bind(id)
    .first();
  if (!row || !row.avatar || row.avatar.indexOf("data:image/") !== 0)
    return new Response("Not found", { status: 404 });
  const comma = row.avatar.indexOf(",");
  const mime = row.avatar.slice(5, comma).split(";")[0] || "image/jpeg";
  const bin = atob(row.avatar.slice(comma + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { "content-type": mime, "cache-control": "public, max-age=300" },
  });
}

async function listBirthdays(env, request) {
  // "mine" marks the requester's own entry so the page can show the edit
  // button. Three signals, weakest last: bt_name cookie match, or the entry
  // was submitted from the requester's network and is the ONLY one from that
  // network (so a shared office IP never marks someone else's card).
  const me = normKey(cookieName(request) || "");
  const reqIp = ipKey(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      null
  );
  const { results } = await env.DB.prepare(
    "SELECT id, name, name_key, company, position, month, day, city, country, ip, " +
      "avatar IS NOT NULL AS has_avatar, instagram, linkedin, x_handle, " +
      "join_month, join_day, join_year " +
      "FROM birthdays ORDER BY month, day, name"
  ).all();
  const ipCounts = {};
  for (const r of results) {
    const k = ipKey(r.ip);
    if (k) ipCounts[k] = (ipCounts[k] || 0) + 1;
  }
  // Fourth signal: visits from the requester's network that carry a
  // submitted name identify that person on this network — works even when
  // several teammates share an office IP.
  const netNames = await namesOnNetwork(env, reqIp);
  for (const r of results) {
    const k = ipKey(r.ip);
    r.mine =
      (!!me && r.name_key === me) ||
      (!!reqIp && k === reqIp && ipCounts[k] === 1) ||
      netNames.has(r.name_key);
    delete r.name_key;
    delete r.ip; // never expose raw IPs on the public birthdays API
  }
  return json(results);
}

// Distinct submitted names seen in visits from this network (ipKey match).
async function namesOnNetwork(env, reqIp) {
  if (!reqIp) return new Set();
  const pat = reqIp.indexOf(":") >= 0 ? reqIp + ":%" : reqIp;
  const { results } = await env.DB.prepare(
    "SELECT DISTINCT name FROM visits WHERE name IS NOT NULL AND (ip = ?1 OR ip LIKE ?2)"
  )
    .bind(reqIp, pat)
    .all();
  return new Set(results.map((x) => normKey(x.name)));
}

function normKey(s) {
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}

// Shared field validation for submit and edit. Returns { error, status } or
// the cleaned fields.
function parseEntry(body) {
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const position = String(body.position || "").trim();
  const month = Number.parseInt(body.month, 10);
  const day = Number.parseInt(body.day, 10);
  const year =
    body.year === undefined || body.year === null || body.year === ""
      ? null
      : Number.parseInt(body.year, 10);

  if (!name || name.length > 100)
    return { error: "Please enter your full name (up to 100 characters)." };
  if (!position || position.length > 100)
    return { error: "Please enter your position (up to 100 characters)." };
  if (!Number.isInteger(month) || month < 1 || month > 12)
    return { error: "Please pick a valid month." };
  if (!Number.isInteger(day) || day < 1 || day > DAYS_IN_MONTH[month - 1])
    return { error: "That day doesn't exist in the selected month." };
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2020))
    return { error: "Birth year looks off — use a 4-digit year (or leave it blank)." };

  // Join date: month + year, both mandatory (no day).
  const joinMonth = Number.parseInt(body.join_month, 10);
  const joinYear = Number.parseInt(body.join_year, 10);
  if (!Number.isInteger(joinMonth) || joinMonth < 1 || joinMonth > 12)
    return { error: "Please pick the month you joined the team." };
  if (!Number.isInteger(joinYear) || joinYear < 1990 || joinYear > 2030)
    return { error: "Please add the year you joined the team." };

  return { name, position, month, day, year, joinMonth, joinYear };
}

// ---------- Social profile validation ----------
// Fool-proofing: accept handles, @handles, or any URL variant; canonicalize
// to the official profile URL; enforce each platform's real handle rules;
// and (where the platform answers anonymous requests) probe that the
// profile actually exists.

const SOCIAL_HOSTS = {
  ig: ["instagram.com", "www.instagram.com", "m.instagram.com"],
  x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"],
};
const SOCIAL_HANDLE_RE = {
  ig: /^[A-Za-z0-9._]{1,30}$/,
  x: /^[A-Za-z0-9_]{1,15}$/,
};

function socialHandleToUrl(kind, h) {
  if (kind === "li") {
    if (!/^[A-Za-z0-9\-_.%]{2,100}$/.test(h))
      return { error: "add it as a profile URL like linkedin.com/in/your-name." };
    return { url: "https://www.linkedin.com/in/" + h, handle: h };
  }
  if (!SOCIAL_HANDLE_RE[kind].test(h))
    return {
      error:
        kind === "ig"
          ? "that handle doesn't look valid (letters, numbers, dots, underscores, max 30)."
          : "that handle doesn't look valid (letters, numbers, underscores, max 15).",
    };
  return {
    url: (kind === "ig" ? "https://www.instagram.com/" : "https://x.com/") + h,
    handle: h,
  };
}

function normalizeSocial(kind, raw) {
  const v = String(raw === undefined || raw === null ? "" : raw).trim().slice(0, 200);
  if (!v) return { error: "empty" };
  if (/^https?:\/\//i.test(v) || v.indexOf(".com/") !== -1) {
    let u;
    try {
      u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
    } catch {
      return { error: "that link doesn't parse — paste the full profile URL." };
    }
    const host = u.hostname.toLowerCase();
    if (kind === "li") {
      if (host.indexOf("linkedin.com") === -1)
        return { error: "the link must be on linkedin.com." };
      const path = u.pathname.replace(/\/+$/, "");
      if (!/^\/(in|company|school)\/[A-Za-z0-9\-_.%]+$/.test(path))
        return { error: "the link should look like linkedin.com/in/your-name." };
      return { url: "https://www.linkedin.com" + path, handle: path.split("/")[2] };
    }
    if (SOCIAL_HOSTS[kind].indexOf(host) === -1)
      return {
        error:
          kind === "ig"
            ? "the link must be on instagram.com."
            : "the link must be on x.com or twitter.com.",
      };
    const handle = u.pathname.split("/").filter(Boolean)[0] || "";
    return socialHandleToUrl(kind, handle);
  }
  return socialHandleToUrl(kind, v.replace(/^@/, ""));
}

// ---------- "Sign in with X" (OAuth 2.0 + PKCE) ----------
// The form's X logo opens a popup to /auth/x/start, the user authorizes on
// x.com, and the callback posts their verified @username back to the page.
// X_CLIENT_ID is a public var; X_CLIENT_SECRET (confidential apps) is a
// wrangler secret and used only server-side at the token exchange.

function b64url(buf) {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function xAuthStart(request, env) {
  if (!env.X_CLIENT_ID)
    return new Response("X sign-in isn't configured yet.", { status: 503 });
  const origin = new URL(request.url).origin;
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const challenge = b64url(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  );
  const auth = new URL("https://x.com/i/oauth2/authorize");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("client_id", env.X_CLIENT_ID);
  auth.searchParams.set("redirect_uri", origin + "/auth/x/callback");
  auth.searchParams.set("scope", "users.read tweet.read");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", challenge);
  auth.searchParams.set("code_challenge_method", "S256");
  return new Response(null, {
    status: 302,
    headers: {
      location: auth.toString(),
      "set-cookie":
        "xoauth=" + verifier + "." + state +
        "; Max-Age=600; Path=/auth/x; HttpOnly; Secure; SameSite=Lax",
    },
  });
}

async function xAuthCallback(request, env) {
  const url = new URL(request.url);
  const closeMsg = (msg) =>
    new Response(
      "<!doctype html><script>try{if(window.opener)window.opener.postMessage(" +
        JSON.stringify(msg) + "," + JSON.stringify(url.origin) +
        ");}catch(e){}window.close();</script>" +
        "<p style=\"font-family:sans-serif\">You can close this window.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("cookie") || "").match(/(?:^|;\s*)xoauth=([^;]+)/);
  if (!code || !state || !cookie)
    return closeMsg({ xAuthError: "X sign-in was cancelled or timed out — try again." });
  const parts = cookie[1].split(".");
  if (state !== parts[1])
    return closeMsg({ xAuthError: "Sign-in session mismatch — try again." });

  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: url.origin + "/auth/x/callback",
    client_id: env.X_CLIENT_ID,
    code_verifier: parts[0],
  });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (env.X_CLIENT_SECRET)
    headers.authorization = "Basic " + btoa(env.X_CLIENT_ID + ":" + env.X_CLIENT_SECRET);
  const tr = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers,
    body: form,
  });
  const tj = await tr.json();
  if (!tj.access_token) {
    console.log("x-oauth: token exchange failed " + tr.status + " " + JSON.stringify(tj).slice(0, 300));
    return closeMsg({ xAuthError: "X sign-in failed at the token step — try again." });
  }
  const ur = await fetch("https://api.x.com/2/users/me", {
    headers: { authorization: "Bearer " + tj.access_token },
  });
  const uj = await ur.json();
  const username = uj.data && uj.data.username;
  if (!username) {
    console.log("x-oauth: users/me failed " + ur.status + " " + JSON.stringify(uj).slice(0, 300));
    return closeMsg({ xAuthError: "Signed in, but couldn't read your X profile — try again." });
  }
  console.log("x-oauth: verified @" + username + " via Sign in with X");
  return closeMsg({ xUsername: username });
}

// ---------- "Sign in with Instagram" (Instagram API with Instagram Login) ----------
// Same popup pattern as X. Works for professional (business/creator)
// accounts — Meta retired OAuth for personal accounts with Basic Display
// (Dec 2024). Needs IG_APP_ID + IG_APP_SECRET secrets and the callback URL
// registered in the Meta app's Instagram business-login settings.

async function igAuthStart(request, env) {
  if (!env.IG_APP_ID)
    return new Response("Instagram sign-in isn't configured yet.", { status: 503 });
  const origin = new URL(request.url).origin;
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const auth = new URL("https://www.instagram.com/oauth/authorize");
  auth.searchParams.set("client_id", env.IG_APP_ID);
  auth.searchParams.set("redirect_uri", origin + "/auth/ig/callback");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "instagram_business_basic");
  auth.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      location: auth.toString(),
      "set-cookie":
        "igoauth=" + state + "; Max-Age=600; Path=/auth/ig; HttpOnly; Secure; SameSite=Lax",
    },
  });
}

async function igAuthCallback(request, env) {
  const url = new URL(request.url);
  const closeMsg = (msg) =>
    new Response(
      "<!doctype html><script>try{if(window.opener)window.opener.postMessage(" +
        JSON.stringify(msg) + "," + JSON.stringify(url.origin) +
        ");}catch(e){}window.close();</script>" +
        "<p style=\"font-family:sans-serif\">You can close this window.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("cookie") || "").match(/(?:^|;\s*)igoauth=([^;]+)/);
  if (!code || !state || !cookie)
    return closeMsg({ igAuthError: "Instagram sign-in was cancelled or timed out — try again." });
  if (state !== cookie[1])
    return closeMsg({ igAuthError: "Sign-in session mismatch — try again." });

  const form = new URLSearchParams({
    client_id: env.IG_APP_ID,
    client_secret: env.IG_APP_SECRET || "",
    grant_type: "authorization_code",
    redirect_uri: url.origin + "/auth/ig/callback",
    code: code,
  });
  const tr = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: form,
  });
  const tj = await tr.json().catch(() => ({}));
  if (!tj.access_token) {
    console.log("ig-oauth: token exchange failed " + tr.status + " " + JSON.stringify(tj).slice(0, 300));
    return closeMsg({
      igAuthError:
        "Instagram sign-in failed — make sure your account is a professional (business/creator) account, then try again.",
    });
  }
  const ur = await fetch(
    "https://graph.instagram.com/v22.0/me?fields=username&access_token=" +
      encodeURIComponent(tj.access_token)
  );
  const uj = await ur.json().catch(() => ({}));
  if (!uj.username) {
    console.log("ig-oauth: me lookup failed " + ur.status + " " + JSON.stringify(uj).slice(0, 300));
    return closeMsg({ igAuthError: "Signed in, but couldn't read your Instagram username — try again." });
  }
  console.log("ig-oauth: verified @" + uj.username + " via Sign in with Instagram");
  return closeMsg({ igUsername: uj.username });
}

// The IG anchor account id for Business Discovery, resolved once from the
// access token itself (works for both Facebook-login and Instagram-login
// token flavors). IG_BUSINESS_ID secret, if set, overrides.
let IG_ID_CACHE = null;

async function resolveIgBusinessId(env) {
  if (env.IG_BUSINESS_ID) return env.IG_BUSINESS_ID;
  if (IG_ID_CACHE) return IG_ID_CACHE;
  try {
    const r = await fetch(
      "https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=" +
        encodeURIComponent(env.IG_ACCESS_TOKEN)
    );
    const j = await r.json();
    const hit = j.data && j.data.map((p) => p.instagram_business_account).find(Boolean);
    if (hit && hit.id) {
      IG_ID_CACHE = String(hit.id);
      return IG_ID_CACHE;
    }
  } catch {}
  try {
    const r = await fetch(
      "https://graph.instagram.com/v21.0/me?fields=user_id,id&access_token=" +
        encodeURIComponent(env.IG_ACCESS_TOKEN)
    );
    const j = await r.json();
    const id = j.user_id || j.id;
    if (id) {
      IG_ID_CACHE = String(id);
      return IG_ID_CACHE;
    }
  } catch {}
  return null;
}

// Existence checks, strongest available first:
// 1. Official APIs when keys are configured (wrangler secrets):
//    - X_BEARER_TOKEN → X API v2 users lookup (definitive yes/no)
//    - IG_ACCESS_TOKEN + IG_BUSINESS_ID → Meta Business Discovery (definitive
//      yes for business/creator accounts; personal accounts are invisible to
//      the API, so a miss is ambiguous and falls through)
// 2. Anonymous public probe: only a definitive 404 rejects — anti-bot noise
//    (302 login walls, 403, 429, timeouts) must never block a real person.
// LinkedIn has no anonymous-safe check, so it gets format validation only.
async function socialExists(env, kind, n) {
  if (kind === "li") return true;

  if (kind === "x" && env.X_BEARER_TOKEN) {
    try {
      const r = await fetch(
        "https://api.x.com/2/users/by/username/" + encodeURIComponent(n.handle),
        { headers: { authorization: "Bearer " + env.X_BEARER_TOKEN } }
      );
      if (r.status === 200) {
        const j = await r.json();
        if (j.data && j.data.id) {
          console.log("x-verify: @" + n.handle + " CONFIRMED via official X API");
          return true;
        }
        if (j.errors && j.errors.some((e) => String(e.title || "").indexOf("Not Found") >= 0)) {
          console.log("x-verify: @" + n.handle + " NOT FOUND via official X API");
          return false;
        }
      }
      console.log("x-verify: X API status " + r.status + " — falling back to public probe");
      // 401/403 (tier/token) or 429 → fall through to the public probe
    } catch {}
  }

  if (kind === "ig" && env.IG_ACCESS_TOKEN) {
    try {
      const igId = await resolveIgBusinessId(env);
      if (igId) {
        // Business Discovery works on both Graph hosts depending on which
        // login flavor issued the token — try both.
        for (const host of [
          "https://graph.facebook.com/v21.0/",
          "https://graph.instagram.com/v21.0/",
        ]) {
          const u =
            host + igId +
            "?fields=" + encodeURIComponent("business_discovery.username(" + n.handle + "){username}") +
            "&access_token=" + encodeURIComponent(env.IG_ACCESS_TOKEN);
          const r = await fetch(u);
          const j = await r.json();
          if (j.business_discovery && j.business_discovery.username) return true;
        }
        // Miss = personal account OR nonexistent — ambiguous, fall through.
      }
    } catch {}
  }

  try {
    const url =
      kind === "ig" ? "https://www.instagram.com/" + n.handle + "/" : "https://x.com/" + n.handle;
    const r = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "Mozilla/5.0 (compatible; SenpexBirthdayBot/1.0)" },
    });
    return r.status !== 404;
  } catch {
    return true;
  }
}

async function normalizeAndCheckSocials(env, body) {
  const labels = { ig: "Instagram", li: "LinkedIn", x: "X" };
  const out = {};
  for (const [kind, field] of [["ig", "instagram"], ["li", "linkedin"], ["x", "x"]]) {
    const n = normalizeSocial(kind, body[field]);
    if (n.error)
      return {
        error:
          n.error === "empty"
            ? "Please add your " + labels[kind] + " (handle or URL)."
            : labels[kind] + ": " + n.error,
      };
    out[kind] = n;
  }
  const [igOk, xOk] = await Promise.all([
    socialExists(env, "ig", out.ig),
    socialExists(env, "x", out.x),
  ]);
  if (!igOk)
    return { error: "Instagram: we couldn't find @" + out.ig.handle + " — double-check the handle." };
  if (!xOk)
    return { error: "X: we couldn't find @" + out.x.handle + " — double-check the handle." };
  return { instagram: out.ig.url, linkedin: out.li.url, x: out.x.url };
}

async function submit(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    null;
  const cf = request.cf || {};
  const geoCity = cf.city || null;
  const geoCountry = cf.country || null;
  const entry = parseEntry(body);
  if (entry.error) return json({ error: entry.error }, 400);
  const { name, position, month, day, year, joinMonth, joinYear } = entry;

  const socials = await normalizeAndCheckSocials(env, body);
  if (socials.error) return json({ error: socials.error }, 400);
  const instagram = socials.instagram;
  const linkedin = socials.linkedin;
  const xHandle = socials.x;

  // Photo is mandatory on every submission.
  const avatar =
    typeof body.avatar === "string" &&
    body.avatar.indexOf("data:image/") === 0 &&
    body.avatar.length <= 250000
      ? body.avatar
      : null;
  if (!avatar)
    return json({ error: "Please add your photo — it's required." }, 400);

  // Every successful submit issues a fresh edit token: the browser that made
  // the latest submission owns the entry (stored client-side, checked by
  // /api/edit so nobody can edit someone else's card).
  const token = crypto.randomUUID();

  // "Is this you?" flow: the form sends replace_id when the submitter says an
  // existing same-birthday entry is them — update that row in place, allowing
  // a name change (which the name-keyed upsert below can't do).
  const replaceId = Number.parseInt(body.replace_id, 10);
  if (Number.isInteger(replaceId) && replaceId > 0) {
    try {
      const res = await env.DB.prepare(
        "UPDATE birthdays SET name = ?1, name_key = ?2, company = ?3, position = ?4, " +
          "month = ?5, day = ?6, year = ?7, ip = ?8, edit_token = ?9, " +
          "city = ?10, country = ?11, avatar = ?12, instagram = ?13, linkedin = ?14, " +
          "x_handle = ?15, join_month = ?16, join_day = ?17, join_year = ?18, " +
          "updated_at = datetime('now') WHERE id = ?19"
      )
        .bind(
          name, name.toLowerCase(), COMPANY, position, month, day, year, ip, token,
          geoCity, geoCountry, avatar, instagram, linkedin, xHandle,
          joinMonth, null, joinYear, replaceId
        )
        .run();
      if (!res.meta || res.meta.changes === 0)
        return json({ error: "That entry no longer exists — try submitting again." }, 404);
    } catch (e) {
      if (String(e.message || e).includes("UNIQUE"))
        return json({ error: "That name is already on the wall — use a different name." }, 409);
      throw e;
    }
    return json({ ok: true, id: replaceId, token: token });
  }

  // Conflict target is name_key ALONE (unique index idx_birthdays_name_key):
  // company is a server-side constant now, but rows submitted before that
  // change carried other company values, and keying on (name_key, company)
  // let the same person duplicate. Same name = same person, full stop.
  await env.DB.prepare(
    "INSERT INTO birthdays (name, name_key, company, position, month, day, year, ip, edit_token, city, country, " +
      "avatar, instagram, linkedin, x_handle, join_month, join_day, join_year) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18) " +
      "ON CONFLICT (name_key) DO UPDATE SET " +
      "name = excluded.name, company = excluded.company, position = excluded.position, " +
      "month = excluded.month, day = excluded.day, year = excluded.year, " +
      "ip = excluded.ip, edit_token = excluded.edit_token, " +
      "city = excluded.city, country = excluded.country, " +
      "avatar = excluded.avatar, instagram = excluded.instagram, linkedin = excluded.linkedin, " +
      "x_handle = excluded.x_handle, join_month = excluded.join_month, " +
      "join_day = excluded.join_day, join_year = excluded.join_year, updated_at = datetime('now')"
  )
    .bind(
      name, name.toLowerCase(), COMPANY, position, month, day, year, ip, token, geoCity, geoCountry,
      avatar, instagram, linkedin, xHandle, joinMonth, null, joinYear
    )
    .run();

  const row = await env.DB.prepare("SELECT id FROM birthdays WHERE name_key = ?1")
    .bind(name.toLowerCase())
    .first();
  return json({ ok: true, id: row ? row.id : null, token: token });
}

// Does this request prove ownership of the row? Four signals, in order:
// edit token from submit time, bt_name cookie match, sole entry from the
// requester's network, or named visits from that network matching the row.
async function ownsEntry(env, request, row, token) {
  if (row.edit_token && token && row.edit_token === token) return true;
  const me = normKey(cookieName(request) || "");
  if (me && row.name_key === me) return true;
  const reqIp = ipKey(
    request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      null
  );
  if (!reqIp) return false;
  if (ipKey(row.ip) === reqIp) {
    const { results } = await env.DB.prepare(
      "SELECT ip FROM birthdays WHERE ip IS NOT NULL"
    ).all();
    if (results.filter((r) => ipKey(r.ip) === reqIp).length === 1) return true;
  }
  return (await namesOnNetwork(env, reqIp)).has(row.name_key);
}

// Owner-only edits: requires the edit token issued to the browser that
// created (or last submitted) the entry. Without it → 403.
async function editEntry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const id = Number.parseInt(body.id, 10);
  const token = String(body.token || "");
  if (!Number.isInteger(id) || id <= 0)
    return json({ error: "Missing entry id." }, 400);
  const entry = parseEntry(body);
  if (entry.error) return json({ error: entry.error }, 400);
  const { name, position, month, day, year, joinMonth, joinYear } = entry;

  const socials = await normalizeAndCheckSocials(env, body);
  if (socials.error) return json({ error: socials.error }, 400);
  const instagram = socials.instagram;
  const linkedin = socials.linkedin;
  const xHandle = socials.x;

  const row = await env.DB.prepare(
    "SELECT edit_token, name_key, ip, avatar FROM birthdays WHERE id = ?1"
  )
    .bind(id)
    .first();
  if (!row) return json({ error: "That entry no longer exists." }, 404);
  // body.claim === true is the explicit "This is me" takeover from the UI.
  // It needs no prior proof — same trust level as the existing ability to
  // resubmit the form under any name — and hands this browser the token.
  const claimed = body.claim === true;
  const authorized = claimed || (await ownsEntry(env, request, row, token));
  if (!authorized)
    return json(
      { error: "You can only edit your own entry. If this card is yours, use its \"This is me\" button to claim it." },
      403
    );
  const newToken = crypto.randomUUID();

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    null;
  const cf = request.cf || {};

  // Avatar: undefined = keep current, data URL = replace. A photo is
  // mandatory, so the result can never be empty.
  let avatar = row.avatar;
  if (body.avatar !== undefined) {
    avatar =
      typeof body.avatar === "string" &&
      body.avatar.indexOf("data:image/") === 0 &&
      body.avatar.length <= 250000
        ? body.avatar
        : null;
  }
  if (!avatar)
    return json({ error: "Please add your photo — it's required." }, 400);

  try {
    await env.DB.prepare(
      "UPDATE birthdays SET name = ?1, name_key = ?2, company = ?3, position = ?4, " +
        "month = ?5, day = ?6, year = ?7, ip = ?8, edit_token = ?9, " +
        "city = ?10, country = ?11, avatar = ?12, instagram = ?13, linkedin = ?14, " +
        "x_handle = ?15, join_month = ?16, join_day = ?17, join_year = ?18, " +
        "updated_at = datetime('now') WHERE id = ?19"
    )
      .bind(
        name, name.toLowerCase(), COMPANY, position, month, day, year, ip,
        newToken, cf.city || null, cf.country || null,
        avatar, instagram, linkedin, xHandle, joinMonth, null, joinYear, id
      )
      .run();
  } catch (e) {
    if (String(e.message || e).includes("UNIQUE"))
      return json({ error: "That name is already on the wall — use a different name." }, 409);
    throw e;
  }
  return json({ ok: true, id: id, token: newToken });
}

// Owner-only delete (same ownership rules as edit; claim allowed so nobody
// is ever locked out of removing their own card).
async function deleteEntry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const id = Number.parseInt(body.id, 10);
  if (!Number.isInteger(id) || id <= 0)
    return json({ error: "Missing entry id." }, 400);
  const row = await env.DB.prepare(
    "SELECT edit_token, name_key, ip FROM birthdays WHERE id = ?1"
  )
    .bind(id)
    .first();
  if (!row) return json({ error: "That entry no longer exists." }, 404);
  const authorized =
    body.claim === true ||
    (await ownsEntry(env, request, row, String(body.token || "")));
  if (!authorized)
    return json(
      { error: "You can only delete your own entry. If this card is yours, claim it first via \"This is me\"." },
      403
    );
  await env.DB.prepare("DELETE FROM birthdays WHERE id = ?1").bind(id).run();
  return json({ ok: true });
}

// ---------- Visitor tracking ----------
// Cloudflare attaches geo data to every request (request.cf); the visitor's
// address comes from the CF-Connecting-IP header. Logging runs via
// ctx.waitUntil so it never slows down or breaks the page itself.

// The form sets a "bt_name" cookie after a successful submission, so later
// visits from that person's browser carry their name even behind a shared
// office IP or after their IP changes.
function cookieName(request) {
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

async function logVisit(env, request, path) {
  try {
    const cf = request.cf || {};
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ua = (request.headers.get("user-agent") || "").slice(0, 300);
    const lat = Number(cf.latitude);
    const lon = Number(cf.longitude);
    await env.DB.prepare(
      "INSERT INTO visits (ip, city, region, country, latitude, longitude, colo, timezone, user_agent, path, name) " +
        "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)"
    )
      .bind(
        ip,
        cf.city || null,
        cf.region || null,
        cf.country || null,
        Number.isFinite(lat) ? lat : null,
        Number.isFinite(lon) ? lon : null,
        cf.colo || null,
        cf.timezone || null,
        ua,
        path,
        cookieName(request)
      )
      .run();
  } catch {
    // Never let tracking take the site down.
  }
}

// World coastline data for the globe, proxied same-origin so the page never
// depends on a third-party CDN at runtime. Cached per isolate + in the browser.
let WORLD_CACHE = null;

async function worldJson() {
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

// Resolved display name for a visit row (visits aliased as v): the visit's
// own cookie-set name wins; otherwise match the IP against birthday
// submissions, but only when exactly one person maps to that IP (a shared
// office IP must not mislabel teammates).
const NAME_RESOLVE =
  "COALESCE(v.name, (SELECT b.name FROM birthdays b WHERE b.ip = v.ip " +
  "AND v.ip IS NOT NULL AND v.ip != 'unknown' " +
  "AND (SELECT COUNT(DISTINCT b2.name) FROM birthdays b2 WHERE b2.ip = v.ip) = 1 " +
  "LIMIT 1))";

// Whitelisted time ranges → SQLite datetime modifiers (never user-interpolated).
const VISIT_RANGES = {
  "1h": "-1 hours",
  "24h": "-24 hours",
  "7d": "-7 days",
  "30d": "-30 days",
};

function rangeCond(range) {
  const mod = VISIT_RANGES[range];
  return mod ? " AND v.ts >= datetime('now', '" + mod + "')" : "";
}

// Country flag images (real flags, not emoji), proxied same-origin from
// flagcdn.com and cached per isolate + in the browser. 32x24 source, shown
// at 16-18px wide so it stays crisp on retina screens.
const FLAG_CACHE = new Map();

async function flagPng(file) {
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

async function listVisits(env, url) {
  const range = url.searchParams.get("range") || "all";
  const cond = rangeCond(range);
  const [recent, points, totals, cityList, countryList] = await Promise.all([
    env.DB.prepare(
      "SELECT v.id, v.ts, v.ip, v.city, v.region, v.country, v.path, " +
        NAME_RESOLVE + " AS name " +
        "FROM visits v WHERE 1=1" + cond + " ORDER BY v.id DESC LIMIT 250"
    ).all(),
    // One globe dot per person-per-place: group by resolved name so hover and
    // click can be about a person, with all anonymous visits pooled per place.
    env.DB.prepare(
      "SELECT name, lat, lon, city, country, COUNT(*) AS count FROM (" +
        "SELECT " + NAME_RESOLVE + " AS name, round(v.latitude, 1) AS lat, " +
        "round(v.longitude, 1) AS lon, v.city AS city, v.country AS country " +
        "FROM visits v WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL" + cond +
        ") GROUP BY name, lat, lon, city, country"
    ).all(),
    env.DB.prepare(
      "SELECT COUNT(*) AS total, COUNT(DISTINCT v.ip) AS uniques, " +
        "COUNT(DISTINCT v.city) AS cities, COUNT(DISTINCT v.country) AS countries " +
        "FROM visits v WHERE 1=1" + cond
    ).first(),
    env.DB.prepare(
      "SELECT v.city AS city, v.country AS country, COUNT(*) AS count, " +
        "round(avg(v.latitude), 2) AS lat, round(avg(v.longitude), 2) AS lon " +
        "FROM visits v WHERE v.city IS NOT NULL" + cond +
        " GROUP BY v.city, v.country ORDER BY count DESC, v.city LIMIT 100"
    ).all(),
    env.DB.prepare(
      "SELECT v.country AS country, COUNT(*) AS count, " +
        "round(avg(v.latitude), 2) AS lat, round(avg(v.longitude), 2) AS lon " +
        "FROM visits v WHERE v.country IS NOT NULL" + cond +
        " GROUP BY v.country ORDER BY count DESC, v.country LIMIT 100"
    ).all(),
  ]);
  return new Response(
    JSON.stringify({
      range: range,
      total: totals.total,
      uniques: totals.uniques,
      cities: totals.cities,
      countries: totals.countries,
      recent: recent.results,
      points: points.results,
      cityList: cityList.results,
      countryList: countryList.results,
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    }
  );
}

// Visit history for one globe dot: a named person (all their visits anywhere
// with that resolved name) or the anonymous pool at one location.
async function personVisits(env, url) {
  const sp = url.searchParams;
  const cond = rangeCond(sp.get("range") || "all");
  const name = (sp.get("name") || "").slice(0, 100);
  let stmt;
  if (name) {
    stmt = env.DB.prepare(
      "SELECT v.id, v.ts, v.ip, v.city, v.region, v.country, v.path FROM visits v " +
        "WHERE " + NAME_RESOLVE + " = ?1" + cond + " ORDER BY v.id DESC LIMIT 500"
    ).bind(name);
  } else {
    const lat = Number.parseFloat(sp.get("lat"));
    const lon = Number.parseFloat(sp.get("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon))
      return json({ error: "name or lat/lon required" }, 400);
    stmt = env.DB.prepare(
      "SELECT v.id, v.ts, v.ip, v.city, v.region, v.country, v.path FROM visits v " +
        "WHERE " + NAME_RESOLVE + " IS NULL " +
        "AND v.latitude IS NOT NULL AND v.longitude IS NOT NULL " +
        "AND abs(round(v.latitude, 1) - ?1) < 0.001 AND abs(round(v.longitude, 1) - ?2) < 0.001" +
        cond + " ORDER BY v.id DESC LIMIT 500"
    ).bind(lat, lon);
  }
  const { results } = await stmt.all();
  return new Response(JSON.stringify({ visits: results }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// ---------- ICS feed (subscribe once in Google Calendar; auto-updates) ----------

function pad2(n) {
  return String(n).padStart(2, "0");
}

function icsEscape(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

async function icsFeed(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, company, position, month, day FROM birthdays ORDER BY month, day, name"
  ).all();

  const now = new Date();
  const stamp =
    now.getUTCFullYear() +
    pad2(now.getUTCMonth() + 1) +
    pad2(now.getUTCDate()) +
    "T" +
    pad2(now.getUTCHours()) +
    pad2(now.getUTCMinutes()) +
    pad2(now.getUTCSeconds()) +
    "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Senpex Pckup//Birthday Tracker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Senpex / Pckup Birthdays",
    "X-WR-CALDESC:Team birthdays from the birthday tracker. Updates automatically as people submit the form.",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];

  for (const b of results) {
    // Feb 29 birthdays anchor on a leap year so the yearly rule stays valid.
    const baseYear = b.month === 2 && b.day === 29 ? 2024 : now.getUTCFullYear();
    const startUtc = Date.UTC(baseYear, b.month - 1, b.day);
    const endDate = new Date(startUtc + 86400000);
    const dtStart = "" + baseYear + pad2(b.month) + pad2(b.day);
    const dtEnd =
      "" +
      endDate.getUTCFullYear() +
      pad2(endDate.getUTCMonth() + 1) +
      pad2(endDate.getUTCDate());

    lines.push(
      "BEGIN:VEVENT",
      "UID:bday-" + b.id + "@senpex-pckup-birthdays",
      "DTSTAMP:" + stamp,
      "DTSTART;VALUE=DATE:" + dtStart,
      "DTEND;VALUE=DATE:" + dtEnd,
      "RRULE:FREQ=YEARLY",
      "SUMMARY:" + icsEscape("🎂 " + b.name + " — birthday"),
      "DESCRIPTION:" + icsEscape(b.position + " at " + COMPANY + ". From the team birthday tracker."),
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="senpex-pckup-birthdays.ics"',
      "cache-control": "no-cache",
    },
  });
}

// ---------- Page ----------

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Senpex / Pckup — Team Birthday Tracker</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #FF5C33;      /* Senpex red-orange */
    --brand-dark: #d94a26;
    --brand-deep: #a8391e;
    --ink: #1a1714;        /* dark dark grey, near black */
    --ink-2: #2b2620;
    --muted: #6e6862;      /* grey text */
    --bg: #f7f5f1;         /* off white */
    --card: #fffefc;
    --line: #e6e4df;       /* light grey */
    --tint: #ffece5;       /* light brand tint */
    --ok: #1f7a37;
    --err: #c22424;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "TASA Orbiter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--ink);
  }
  header {
    background: rgb(27, 27, 27);
    color: #f7f5f1;
    padding: 48px 20px 42px;
    text-align: center;
    border-bottom: 4px solid var(--brand);
    position: relative;
  }
  .corner {
    position: absolute;
    top: 14px; right: 16px;
    display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
  }
  .tracker-link {
    color: #cfc9c2;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 999px;
    padding: 6px 13px;
  }
  .tracker-link:hover { color: #fff; border-color: var(--brand); }
  @media (max-width: 620px) {
    .corner { position: static; flex-direction: row; justify-content: center; margin-bottom: 16px; }
    header { padding-top: 22px; }
  }
  .logo {
    height: 52px; width: auto;
    display: block; margin: 0 auto 18px;
  }
  header h1 { margin: 0 0 8px; font-size: 32px; font-weight: 600; letter-spacing: -0.3px; }
  header p { margin: 0; color: #cfc9c2; font-size: 15px; }
  header p b { color: var(--brand); font-weight: 600; }
  main { max-width: 1000px; margin: 40px auto 60px; padding: 0 16px; }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: 0 6px 18px rgba(26, 23, 20, 0.06);
    padding: 22px;
  }
  .card h2 { margin: 0 0 14px; font-size: 19px; font-weight: 600; }
  form .row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
  form .field { flex: 1 1 200px; display: flex; flex-direction: column; gap: 5px; }
  form label, form .lbl {
    font-size: 12.5px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  input, select {
    font: inherit;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: #fff;
    color: var(--ink);
    width: 100%;
  }
  input:focus, select:focus { outline: 2px solid var(--brand); border-color: transparent; }
  button.primary {
    font: inherit;
    font-weight: 700;
    background: var(--brand);
    color: #fff;
    border: 0;
    border-radius: 9px;
    padding: 12px 24px;
    cursor: pointer;
  }
  button.primary:hover { background: var(--brand-dark); }
  button.primary:disabled { opacity: 0.6; cursor: wait; }
  #status { margin: 10px 0 0; font-size: 14px; font-weight: 600; display: none; }
  #status.ok { display: block; color: var(--ok); }
  #status.err { display: block; color: var(--err); }
  .wall-head { display: flex; align-items: baseline; gap: 10px; margin: 30px 4px 12px; }
  .wall-head h2 { margin: 0; font-size: 22px; font-weight: 600; }
  .wall-head span { color: var(--muted); font-size: 14px; font-weight: 500; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .grid[hidden] { display: none; }
  .today-banner {
    display: flex; align-items: center; gap: 14px;
    background: var(--tint); border: 1.5px solid var(--brand);
    border-radius: 14px; padding: 16px 20px; margin: 30px 4px 0;
  }
  .tb-emoji { font-size: 34px; line-height: 1; }
  .tb-title { font-size: 17px; font-weight: 700; color: var(--brand-deep); }
  .tb-sub { font-size: 13.5px; color: var(--brand-dark); margin-top: 2px; }
  .tb-avs { margin-left: auto; display: flex; gap: 6px; }
  .today-banner[hidden] { display: none; }
  .person { display: flex; flex-direction: column; gap: 6px; padding: 16px; }
  .person.today { outline: 2px solid var(--brand); }
  .p-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .p-name { font-weight: 700; font-size: 15px; }
  .zwrap { position: relative; cursor: default; }
  .zbadge { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; }
  .zwrap:hover .zbadge { color: var(--brand-dark); }
  .zpop {
    display: none; position: absolute; top: 100%; right: 0; z-index: 30;
    width: 272px; background: #fff; border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px; box-shadow: 0 14px 36px rgba(26, 23, 20, 0.18); text-align: left;
  }
  .zwrap:hover .zpop { display: block; }
  .zp-title { font-weight: 700; font-size: 13.5px; margin-bottom: 2px; }
  .zp-sub { color: var(--brand-dark); font-size: 12px; font-weight: 600; margin-bottom: 6px; }
  .zp-text { color: var(--muted); font-size: 12.5px; line-height: 1.45; }
  .zp-job-title {
    margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--line);
    font-weight: 700; font-size: 12.5px; color: var(--brand-dark); margin-bottom: 3px;
  }
  .p-pos { color: var(--muted); font-size: 13px; min-height: 17px; }
  .p-loc { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12.5px; }
  .p-joined { color: var(--muted); font-size: 12.5px; }
  .p-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .av-img, .av-init {
    width: 42px; height: 42px; border-radius: 50%; flex: none;
  }
  .av-img { object-fit: cover; box-shadow: 0 0 0 2px var(--tint); }
  .av-init {
    background: var(--tint); color: var(--brand-dark);
    font-weight: 700; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
  }
  .socials { display: flex; gap: 8px; margin-top: 2px; }
  a.social {
    width: 26px; height: 26px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); border: 1px solid var(--line);
  }
  a.social:hover { color: var(--brand-dark); border-color: var(--brand); }
  a.social svg { width: 15px; height: 15px; fill: currentColor; display: block; }
  .soc-input { display: flex; align-items: center; gap: 8px; }
  .soc-input input { flex: 1; min-width: 0; }
  .soc-ico {
    width: 38px; height: 38px; flex: none;
    border: 1px solid var(--line); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: var(--ink); background: #fff;
  }
  .soc-ico svg { width: 17px; height: 17px; fill: currentColor; display: block; }
  .soc-ico.soc-click { cursor: pointer; }
  .soc-ico.soc-click:hover { border-color: var(--brand); color: var(--brand-dark); background: var(--tint); }
  input.x-verified { border-color: var(--ok); background: #f1faf3; }
  .av-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .av-prev { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 2px var(--tint); }
  .av-row input[type="file"] { font-size: 12.5px; color: var(--muted); max-width: 220px; }
  img.flag {
    width: 16px; height: auto; border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(26, 23, 20, 0.12);
  }
  .p-when { font-size: 13.5px; color: var(--ink-2); }
  .p-when b { color: var(--brand-dark); }
  a.gcal {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--brand-dark);
    text-decoration: none;
  }
  a.gcal:hover { text-decoration: underline; }
  .actions { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; align-items: center; }
  a.editbtn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--brand-dark);
    border: 1.5px solid var(--brand); border-radius: 999px;
    padding: 5px 13px; text-decoration: none;
  }
  a.editbtn:hover { background: var(--tint); }
  a.delbtn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--muted);
    border: 1.5px solid var(--line); border-radius: 999px;
    padding: 5px 13px; text-decoration: none;
  }
  a.delbtn:hover { color: var(--err); border-color: var(--err); }
  a.claimlink {
    margin-top: 6px; align-self: flex-start;
    font-size: 12px; font-weight: 600; color: var(--muted);
    text-decoration: none; border-bottom: 1px dashed var(--line);
  }
  a.claimlink:hover { color: var(--brand-dark); border-bottom-color: var(--brand); }
  .claim-note {
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 8px;
    color: var(--brand-deep); font-size: 12.5px; line-height: 1.45;
    padding: 9px 11px; margin: 0 0 12px;
  }
  .person { position: relative; }
  .cake-float {
    position: absolute; font-size: 26px; pointer-events: none; z-index: 5;
    animation: cakeUp 1.3s ease-out forwards;
  }
  @keyframes cakeUp {
    0% { opacity: 0; transform: translateY(0) scale(0.7); }
    15% { opacity: 1; transform: translateY(-12px) scale(1.05); }
    100% { opacity: 0; transform: translateY(-95px) scale(1); }
  }
  .dialog .lbl {
    display: block; margin-bottom: 5px;
    font-size: 12.5px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  #eErr { color: var(--err); font-size: 13px; font-weight: 600; margin: 10px 0 0; }
  #empty { color: var(--muted); text-align: center; padding: 30px 0; }
  .subscribe { margin-top: 30px; }
  .subscribe ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
  .subscribe code {
    background: #f1efea;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 2px 7px;
    font-size: 12.5px;
    word-break: break-all;
  }
  .subscribe button {
    font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink);
    border: 1px solid var(--line); background: #fff; border-radius: 7px;
    padding: 3px 10px; cursor: pointer; margin-left: 6px;
  }
  .subscribe button:hover { border-color: var(--brand); color: var(--brand-dark); }
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(27, 27, 27, 0.55);
    backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .overlay[hidden] { display: none; }
  #fmodal { z-index: 45; }
  .dialog { animation: dlgIn 0.18s ease-out; }
  @keyframes dlgIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }
  .dialog.wide { max-width: 580px; max-height: 88vh; overflow-y: auto; }
  .hero-cta {
    margin-top: 18px;
    font: inherit; font-size: 15.5px; font-weight: 700;
    background: var(--brand); color: #fff;
    border: 0; border-radius: 999px; padding: 12px 30px;
    cursor: pointer; box-shadow: 0 6px 18px rgba(255, 92, 51, 0.35);
  }
  .hero-cta:hover { background: var(--brand-dark); }
  .dialog {
    background: var(--card); border: 1px solid var(--line); border-radius: 14px;
    padding: 22px; max-width: 480px; width: 100%; position: relative;
    box-shadow: 0 18px 50px rgba(26, 23, 20, 0.35);
  }
  .dialog h3 { margin: 0 0 8px; font-size: 18px; }
  .dlg-sub { margin: 0 0 14px; color: var(--muted); font-size: 13.5px; line-height: 1.45; }
  .dlg-x {
    position: absolute; top: 8px; right: 12px;
    border: 0; background: none; font-size: 22px; color: var(--muted);
    cursor: pointer; line-height: 1; padding: 4px;
  }
  .dlg-x:hover { color: var(--ink); }
  .match {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px; margin-bottom: 10px;
  }
  .match b { font-size: 14.5px; }
  .match .m-sub { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  button.mini {
    font: inherit; font-size: 13px; font-weight: 700;
    background: var(--brand); color: #fff; border: 0; border-radius: 8px;
    padding: 8px 14px; cursor: pointer; white-space: nowrap;
  }
  button.mini:hover { background: var(--brand-dark); }
  button.ghost {
    font: inherit; font-size: 13.5px; font-weight: 600;
    background: #fff; color: var(--ink);
    border: 1px solid var(--line); border-radius: 9px;
    padding: 10px 16px; cursor: pointer;
  }
  button.ghost:hover { border-color: var(--brand); color: var(--brand-dark); }
  .dlg-row { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; }
  .muted { color: var(--muted); }
  footer { text-align: center; color: var(--muted); font-size: 12.5px; padding-bottom: 30px; }
  footer a { color: var(--brand-dark); }
</style>
</head>
<body>
<header>
  <div class="corner">
    <a class="tracker-link" href="/visitors">📡 Visitor tracker</a>
    <a class="tracker-link" href="/changelog">📋 Changelog</a>
  </div>
  <img class="logo" src="/logo.png?v=2" alt="Senpex / Pckup logo">
  <h1>Team Birthday Tracker</h1>
  <p>Add your birthday so we know the most important day in your life!</p>
  <button class="hero-cta" id="openForm" type="button">🎈 Add your birthday</button>
</header>
<main>
  <div id="todayBanner" class="today-banner" hidden></div>

  <div class="wall-head">
    <h2>Upcoming birthdays</h2>
    <span id="count"></span>
  </div>
  <p id="upEmpty" class="muted" style="margin:4px 4px 0;font-size:13.5px" hidden>No birthdays in the next 30 days.</p>
  <div id="grid" class="grid"></div>

  <div class="wall-head" id="laterHead" hidden>
    <h2>Later birthdays</h2>
    <span id="count2"></span>
  </div>
  <div id="grid2" class="grid" hidden></div>

  <p id="empty" hidden>No birthdays yet — be the first! 🎈</p>

  <section class="card subscribe">
    <h2>📅 Get these on your Google Calendar all at once</h2>
    <ol>
      <li>
        <b>All birthdays, auto-updating (recommended):</b> in Google Calendar, go to
        <i>Other calendars → + → From URL</i> and paste
        <code id="icsurl"></code><button id="copyics" type="button">Copy</button><br>
        <span class="muted">New submissions appear automatically — every birthday repeats yearly.</span>
      </li>
      <li>
        <b>One person on your own calendar:</b> click “＋ Google Calendar” on their card —
        it creates a yearly recurring event you just save.
      </li>
    </ol>
  </section>
</main>

<div id="fmodal" class="overlay" hidden>
  <div class="dialog wide" role="dialog" aria-modal="true" aria-labelledby="fTitle">
    <button class="dlg-x" id="fClose" type="button" aria-label="Close">×</button>
    <h3 id="fTitle">🎂 Add your birthday</h3>
    <p class="dlg-sub">Get yourself on the wall so the team never misses your day.</p>
    <form id="bform">
      <div class="row">
        <div class="field" style="flex:2 1 240px">
          <label for="name">Full name</label>
          <input id="name" required maxlength="100" placeholder="e.g. Alex Petrovski" autocomplete="name">
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex:2 1 240px">
          <label for="position">Position</label>
          <input id="position" required maxlength="100" placeholder="e.g. Operations Manager">
        </div>
        <div class="field">
          <label for="month">Birthday month</label>
          <select id="month" required></select>
        </div>
        <div class="field" style="flex:0 1 110px">
          <label for="day">Day</label>
          <select id="day" required></select>
        </div>
        <div class="field" style="flex:0 1 140px">
          <label for="year">Year <span style="text-transform:none">(optional)</span></label>
          <input id="year" type="number" min="1900" max="2020" placeholder="—">
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="jmonth">Month joined</label>
          <select id="jmonth" required></select>
        </div>
        <div class="field" style="flex:0 1 160px">
          <label for="jyear">Year joined</label>
          <input id="jyear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
        </div>
      </div>
      <div class="row">
        <div class="field">
          <span class="lbl">Your photo</span>
          <div class="av-row">
            <img id="fAvPrev" class="av-prev" alt="" hidden>
            <input id="fAvatar" type="file" accept="image/*" required>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="fIg">Instagram <span style="text-transform:none">— click the logo to sign in</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-click" data-soc="ig" data-igin="fIg" role="button" tabindex="0" title="Sign in with Instagram to verify (business/creator accounts)"></span>
            <input id="fIg" required maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
        <div class="field">
          <label for="fLi">LinkedIn</label>
          <div class="soc-input">
            <span class="soc-ico" data-soc="li"></span>
            <input id="fLi" required maxlength="200" placeholder="profile URL or handle">
          </div>
        </div>
        <div class="field">
          <label for="fX">X <span style="text-transform:none">— click the logo to sign in &amp; verify</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-x soc-click" data-soc="x" data-xin="fX" role="button" tabindex="0" title="Sign in with X to verify your handle"></span>
            <input id="fX" required maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
      </div>
      <button class="primary" id="submitBtn" type="submit">Add me to the wall 🎈</button>
      <p id="status"></p>
      <p class="muted" style="font-size:12.5px;margin:10px 0 0">
        Already on the wall? Submitting again with the same name updates your entry. Year of birth is never shown to the team.
      </p>
    </form>
  </div>
</div>

<div id="modal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">
    <button class="dlg-x" id="dlgClose" type="button" aria-label="Close">×</button>
    <div id="dlgStep1">
      <h3 id="dlgTitle">🎂 Someone already has this birthday — is this you?</h3>
      <p class="dlg-sub">If you were added before (maybe spelled a little differently), pick yourself so we update your card instead of creating a double.</p>
      <div id="dlgMatches"></div>
      <button class="ghost" id="dlgNew" type="button">No — we just share a birthday, add me</button>
    </div>
    <div id="dlgStep2" hidden>
      <h3>Update your entry</h3>
      <p class="dlg-sub">We'll update your existing card with what you just filled in. Want to fix how your name appears while you're at it?</p>
      <label class="lbl" for="dlgName" style="display:block;margin-bottom:5px">Your name</label>
      <input id="dlgName" maxlength="100" autocomplete="name">
      <div class="dlg-row">
        <button class="ghost" id="dlgBack" type="button">← Back</button>
        <button class="primary" id="dlgSave" type="button">Save my entry</button>
      </div>
    </div>
  </div>
</div>

<div id="emodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="eTitle">
    <button class="dlg-x" id="eClose" type="button" aria-label="Close">×</button>
    <h3 id="eTitle">✏️ Edit your entry</h3>
    <p class="dlg-sub">Change anything — your name, position, or the date. Only you can edit this card.</p>
    <p class="claim-note" id="claimNote" hidden>You're claiming this card as yours — after saving, you can edit or delete it from this browser. Please only claim your own entry.</p>
    <div style="margin-bottom:10px">
      <label class="lbl" for="eName">Full name</label>
      <input id="eName" maxlength="100" autocomplete="name">
    </div>
    <div style="margin-bottom:10px">
      <label class="lbl" for="ePos">Position</label>
      <input id="ePos" maxlength="100">
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:2 1 140px">
        <label class="lbl" for="eMonth">Birthday month</label>
        <select id="eMonth"></select>
      </div>
      <div style="flex:1 1 80px">
        <label class="lbl" for="eDay">Day</label>
        <select id="eDay"></select>
      </div>
      <div style="flex:1 1 100px">
        <label class="lbl" for="eYear">Year <span style="text-transform:none">(optional)</span></label>
        <input id="eYear" type="number" min="1900" max="2020" placeholder="—">
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:2 1 140px">
        <label class="lbl" for="eJMonth">Month joined</label>
        <select id="eJMonth"></select>
      </div>
      <div style="flex:1 1 110px">
        <label class="lbl" for="eJYear">Year joined</label>
        <input id="eJYear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
      </div>
    </div>
    <div style="margin-top:10px">
      <label class="lbl" for="eAvatar">Photo</label>
      <div class="av-row">
        <img id="eAvPrev" class="av-prev" alt="" hidden>
        <input id="eAvatar" type="file" accept="image/*">
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:1 1 130px">
        <label class="lbl" for="eIg">Instagram</label>
        <div class="soc-input">
          <span class="soc-ico soc-click" data-soc="ig" data-igin="eIg" role="button" tabindex="0" title="Sign in with Instagram to verify (business/creator accounts)"></span>
          <input id="eIg" maxlength="200" placeholder="@handle or sign in →">
        </div>
      </div>
      <div style="flex:1 1 130px">
        <label class="lbl" for="eLi">LinkedIn</label>
        <div class="soc-input">
          <span class="soc-ico" data-soc="li"></span>
          <input id="eLi" maxlength="200" placeholder="profile URL">
        </div>
      </div>
      <div style="flex:1 1 130px">
        <label class="lbl" for="eX">X</label>
        <div class="soc-input">
          <span class="soc-ico soc-x soc-click" data-soc="x" data-xin="eX" role="button" tabindex="0" title="Sign in with X to verify your handle"></span>
          <input id="eX" maxlength="200" placeholder="@handle or sign in →">
        </div>
      </div>
    </div>
    <p id="eErr" hidden></p>
    <div class="dlg-row">
      <button class="ghost" id="eCancel" type="button">Cancel</button>
      <button class="primary" id="eSave" type="button">Save changes</button>
    </div>
  </div>
</div>

<footer>Senpex / Pckup internal tool · data stays in our database · <a href="/calendar.ics">calendar feed</a>
<div style="margin-top:7px;font-size:11.5px;opacity:.85">__BUILDINFO__</div></footer>
<script>
(function () {
  var COMPANY = "Senpex / Pckup";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MDAYS = [31,29,31,30,31,30,31,31,30,31,30,31];
  var allBirthdays = [];

  var monthSel = document.getElementById("month");
  var daySel = document.getElementById("day");
  for (var i = 0; i < 12; i++) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = MONTHS[i];
    monthSel.appendChild(o);
  }
  function fillDays() {
    var max = MDAYS[parseInt(monthSel.value, 10) - 1];
    var cur = parseInt(daySel.value || "1", 10);
    daySel.innerHTML = "";
    for (var d = 1; d <= max; d++) {
      var o = document.createElement("option");
      o.value = String(d);
      o.textContent = String(d);
      daySel.appendChild(o);
    }
    daySel.value = String(Math.min(cur, max));
  }
  monthSel.addEventListener("change", fillDays);
  fillDays();

  var jMonthSel = document.getElementById("jmonth");
  for (var ji = 0; ji < 12; ji++) {
    var jo = document.createElement("option");
    jo.value = String(ji + 1);
    jo.textContent = MONTHS[ji];
    jMonthSel.appendChild(jo);
  }


  // Shared client-side photo pipeline: square-crop + downscale to 192px JPEG
  // so uploads stay tiny no matter what people pick.
  function readAvatarFile(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var S = 192;
        var c = document.createElement("canvas");
        c.width = S; c.height = S;
        var cctx = c.getContext("2d");
        var m = Math.min(img.width, img.height);
        cctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
        cb(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  var formAvatarData = null;
  document.getElementById("fAvatar").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    readAvatarFile(f, function (data) {
      formAvatarData = data;
      var prev = document.getElementById("fAvPrev");
      prev.src = data;
      prev.hidden = false;
    });
  });

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function nextOccurrence(m, d) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var y = today.getFullYear();
    if (m === 2 && d === 29) {
      while (new Date(y, 1, 29).getDate() !== 29 || new Date(y, 1, 29) < today) y++;
      return new Date(y, 1, 29);
    }
    var t = new Date(y, m - 1, d);
    if (t < today) t = new Date(y + 1, m - 1, d);
    return t;
  }

  function daysUntil(m, d) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((nextOccurrence(m, d) - today) / 86400000);
  }

  // Western zodiac: sign m-1 runs until lastDay[m-1] of month m, then sign m starts.
  function zodiac(m, d) {
    var signs = [["Capricorn","♑"],["Aquarius","♒"],["Pisces","♓"],["Aries","♈"],
                 ["Taurus","♉"],["Gemini","♊"],["Cancer","♋"],["Leo","♌"],
                 ["Virgo","♍"],["Libra","♎"],["Scorpio","♏"],["Sagittarius","♐"],
                 ["Capricorn","♑"]];
    var lastDay = [19,18,20,19,20,20,22,22,22,22,21,21];
    return signs[d <= lastDay[m - 1] ? m - 1 : m];
  }

  // Hover content per sign: dates, element/ruler, and a get-to-know-them blurb.
  var ZINFO = {
    Aries: ["Mar 21 – Apr 19", "Fire sign · ruled by Mars",
      "Bold, energetic, and first to volunteer for anything. Aries hates losing slightly more than they love winning — pure drive, zero patience for slow elevators."],
    Taurus: ["Apr 20 – May 20", "Earth sign · ruled by Venus",
      "Steady, loyal, and allergic to drama. Taurus remembers every favor and every good meal — win them over with consistency (or snacks)."],
    Gemini: ["May 21 – Jun 20", "Air sign · ruled by Mercury",
      "Quick-witted and endlessly curious, Gemini can talk to anyone about anything. Forty browser tabs open, and somehow it all works."],
    Cancer: ["Jun 21 – Jul 22", "Water sign · ruled by the Moon",
      "The team's emotional radar. Cancer remembers your coffee order, your dog's name, and exactly what you said three months ago — in a good way."],
    Leo: ["Jul 23 – Aug 22", "Fire sign · ruled by the Sun",
      "Warm, generous, and born for the spotlight. A Leo's praise feels like sunshine — and yes, they noticed that you noticed their new haircut."],
    Virgo: ["Aug 23 – Sep 22", "Earth sign · ruled by Mercury",
      "The detail person. Virgo spots the typo, fixes the spreadsheet, and quietly makes everything run better. Done properly or not at all."],
    Libra: ["Sep 23 – Oct 22", "Air sign · ruled by Venus",
      "The diplomat. Libra hears every side, keeps the peace, and has impeccable taste — just don't ask them to pick a lunch spot in under ten minutes."],
    Scorpio: ["Oct 23 – Nov 21", "Water sign · ruled by Mars & Pluto",
      "Intense, perceptive, and fiercely loyal. Scorpio reads the room in seconds and keeps secrets like a bank vault."],
    Sagittarius: ["Nov 22 – Dec 21", "Fire sign · ruled by Jupiter",
      "The optimist with a passport. Sagittarius brings big ideas, bigger laughs, and an honest opinion whether you asked for it or not."],
    Capricorn: ["Dec 22 – Jan 19", "Earth sign · ruled by Saturn",
      "Ambitious and unshakeable. Capricorn climbs the mountain twice — once to plan the route, once to do it properly. Dry humor included."],
    Aquarius: ["Jan 20 – Feb 18", "Air sign · ruled by Saturn & Uranus",
      "The original thinker. Aquarius questions every rule, befriends absolutely everyone, and is already living five years in the future."],
    Pisces: ["Feb 19 – Mar 20", "Water sign · ruled by Jupiter & Neptune",
      "The imaginative soul. Pisces feels everything, dreams in color, and somehow always knows when you've had a rough day."]
  };

  // How the sign's commonly attributed strengths map onto the person's
  // actual job — {ROLE} gets replaced with their real title. Tone: factual.
  var ZJOB = {
    Aries: "Aries is traditionally associated with initiative, direct decision-making, and comfort under competitive pressure. Those traits map onto the {ROLE} role in practical ways: acting early, committing to a call, and maintaining momentum when work gets hectic.",
    Taurus: "Taurus is traditionally associated with consistency, patience, and methodical follow-through. In the {ROLE} role, that profile shows up as reliable execution, steady judgment under stress, and work that holds up over time.",
    Gemini: "Gemini is traditionally associated with verbal agility, fast context-switching, and curiosity. Applied to {ROLE} work, those translate to clear communication, quick absorption of new information, and handling several threads in parallel.",
    Cancer: "Cancer is traditionally associated with strong interpersonal perception and protective instincts. In the {ROLE} role, that reads as early detection of problems, attentiveness to team and customer needs, and sound judgment about people.",
    Leo: "Leo is traditionally associated with confidence, visibility, and high personal standards. For {ROLE} work, that profile supports clear ownership of outcomes, motivating the people around them, and holding deliverables to a consistent bar.",
    Virgo: "Virgo is traditionally associated with precision, process orientation, and quality control. Those are core competencies in {ROLE} work: catching errors early, structuring messy tasks, and improving systems incrementally.",
    Libra: "Libra is traditionally associated with balanced judgment, diplomacy, and fairness. In the {ROLE} role, that means weighing trade-offs cleanly, de-escalating conflict, and making decisions that others accept and act on.",
    Scorpio: "Scorpio is traditionally associated with sustained focus, persistence, and reading situations beneath the surface. Applied to {ROLE} work, that maps to deep problem-solving, discretion, and follow-through on difficult tasks.",
    Sagittarius: "Sagittarius is traditionally associated with big-picture thinking, candor, and adaptability. In the {ROLE} role, that supports honest assessments, openness to better approaches, and steadiness through change.",
    Capricorn: "Capricorn is traditionally associated with discipline, long-term planning, and goal persistence. Those map directly onto {ROLE} work: structured execution, realistic scoping, and finishing what gets started.",
    Aquarius: "Aquarius is traditionally associated with independent thinking and systems-level problem solving. In the {ROLE} role, that translates to productively questioning defaults and finding more efficient routes to the same result.",
    Pisces: "Pisces is traditionally associated with empathy, imagination, and pattern intuition. In {ROLE} work, that profile supports anticipating needs before they're stated, creative problem-solving, and smooth collaboration."
  };

  // Real flag image served by our own /flag/ route; hides itself if missing.
  function flagEl(country) {
    if (!country || String(country).length !== 2) return null;
    var img = document.createElement("img");
    img.className = "flag";
    img.src = "/flag/" + String(country).toLowerCase() + ".png";
    img.alt = country;
    img.onerror = function () { img.style.display = "none"; };
    return img;
  }

  function avatarEl(b) {
    if (b.has_avatar) {
      var img = document.createElement("img");
      img.className = "av-img";
      img.src = "/avatar/" + b.id;
      img.alt = b.name;
      img.onerror = function () { img.style.display = "none"; };
      return img;
    }
    var parts = b.name.split(" ");
    var init = (parts[0] ? parts[0][0] : "") + (parts[1] ? parts[1][0] : "");
    return el("div", "av-init", init.toUpperCase());
  }

  // Social profile links: handles become canonical profile URLs; full http(s)
  // URLs pass through as-is (and nothing else does).
  function socialHref(kind, val) {
    if (!val) return null;
    val = String(val).trim();
    if (val.indexOf("https://") === 0 || val.indexOf("http://") === 0) return val;
    var h = val.replace("@", "").trim();
    if (!h) return null;
    if (kind === "ig") return "https://instagram.com/" + encodeURIComponent(h);
    if (kind === "x") return "https://x.com/" + encodeURIComponent(h);
    return "https://www.linkedin.com/in/" + encodeURIComponent(h);
  }

  var SOCIAL_SVG = {
    ig: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    li: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    x: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>'
  };

  function socialLink(kind, val, label) {
    var href = socialHref(kind, val);
    if (!href) return null;
    var a = el("a", "social");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = label;
    a.setAttribute("aria-label", label);
    a.innerHTML = SOCIAL_SVG[kind];
    return a;
  }

  // Drop the platform logos into every social input, and make the X logo a
  // real "Sign in with X" button: popup → OAuth on x.com → the verified
  // @username comes back and fills the field.
  var socTargetInput = null;
  Array.prototype.forEach.call(document.querySelectorAll(".soc-ico[data-soc]"), function (span) {
    span.innerHTML = SOCIAL_SVG[span.getAttribute("data-soc")] || "";
    var xin = span.getAttribute("data-xin");
    var igin = span.getAttribute("data-igin");
    var targetId = xin || igin;
    if (!targetId) return;
    var startUrl = xin ? "/auth/x/start" : "/auth/ig/start";
    function openSignin() {
      socTargetInput = document.getElementById(targetId);
      window.open(startUrl, "socauth", "width=500,height=750");
    }
    span.addEventListener("click", openSignin);
    span.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openSignin(); }
    });
  });
  window.addEventListener("message", function (ev) {
    if (ev.origin !== location.origin || !ev.data) return;
    var verified = ev.data.xUsername || ev.data.igUsername;
    var failed = ev.data.xAuthError || ev.data.igAuthError;
    if (verified && socTargetInput) {
      socTargetInput.value = "@" + verified;
      socTargetInput.classList.add("x-verified");
      socTargetInput.title = "Verified via sign-in";
    } else if (failed && socTargetInput) {
      socTargetInput.classList.remove("x-verified");
      var status = document.getElementById("status");
      status.className = "err";
      status.textContent = failed;
    }
  });


  function gcalUrl(b) {
    var t = nextOccurrence(b.month, b.day);
    var e = new Date(t.getTime() + 86400000);
    var ds = "" + t.getFullYear() + pad2(t.getMonth() + 1) + pad2(t.getDate());
    var de = "" + e.getFullYear() + pad2(e.getMonth() + 1) + pad2(e.getDate());
    // Documented Google Calendar template format: all-day event (dates as
    // YYYYMMDD with exclusive end = next day) repeating yearly. recur is left
    // unencoded to match Google's own examples (recur=RRULE:FREQ=YEARLY).
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent("🎂 " + b.name + " — birthday") +
      "&dates=" + ds + "/" + de +
      "&recur=RRULE:FREQ=YEARLY" +
      "&details=" + encodeURIComponent(b.position + " at " + COMPANY + " — from the team birthday tracker");
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function render(list) {
    allBirthdays = list.slice();
    var grid = document.getElementById("grid");
    var grid2 = document.getElementById("grid2");
    var empty = document.getElementById("empty");
    var count = document.getElementById("count");
    var count2 = document.getElementById("count2");
    grid.innerHTML = "";
    grid2.innerHTML = "";
    empty.hidden = list.length > 0;
    var todays = [];
    var nUpcoming = 0, nLater = 0;

    list.sort(function (a, b) { return daysUntil(a.month, a.day) - daysUntil(b.month, b.day) || a.name.localeCompare(b.name); });

    var myTokens = getTokens();
    // One person = one birthday: once this browser owns any card, it has no
    // business claiming another.
    var ownsAny = list.some(function (x) {
      return myTokens[String(x.id)] || x.mine;
    });
    list.forEach(function (b) {
      var days = daysUntil(b.month, b.day);
      var card = el("div", "card person" + (days === 0 ? " today" : ""));
      var top = el("div", "p-top");
      var left = el("div", "p-left");
      left.appendChild(avatarEl(b));
      left.appendChild(el("div", "p-name", (days === 0 ? "🎉 " : "") + b.name));
      top.appendChild(left);
      var z = zodiac(b.month, b.day);
      var zw = el("span", "zwrap");
      zw.appendChild(el("span", "zbadge", z[1] + " " + z[0]));
      var zinfo = ZINFO[z[0]];
      if (zinfo) {
        var zp = el("div", "zpop");
        zp.appendChild(el("div", "zp-title", z[1] + " " + z[0] + " · " + zinfo[0]));
        zp.appendChild(el("div", "zp-sub", zinfo[1]));
        zp.appendChild(el("div", "zp-text", zinfo[2]));
        if (ZJOB[z[0]] && b.position) {
          zp.appendChild(el("div", "zp-job-title", "⭐ Sign × role fit"));
          zp.appendChild(el("div", "zp-text", ZJOB[z[0]].split("{ROLE}").join(b.position)));
        }
        zw.appendChild(zp);
      }
      top.appendChild(zw);
      card.appendChild(top);
      card.appendChild(el("div", "p-pos", b.position));
      if (b.city || b.country) {
        var loc = el("div", "p-loc");
        var lf = flagEl(b.country);
        if (lf) loc.appendChild(lf);
        loc.appendChild(document.createTextNode(
          (b.city ? b.city : "") + (b.city && b.country ? " · " : "") + (b.country || "")));
        card.appendChild(loc);
      }
      if (b.join_month && b.join_year) {
        card.appendChild(el("div", "p-joined",
          "🗓 Joined " + MONTHS[b.join_month - 1].slice(0, 3) + " " + b.join_year));
      }
      var when = el("div", "p-when");
      var dateStr = MONTHS[b.month - 1] + " " + b.day;
      if (days === 0) {
        when.innerHTML = dateStr + " · <b>Today! 🎂</b>";
      } else {
        when.textContent = dateStr + " · in " + days + (days === 1 ? " day" : " days");
      }
      card.appendChild(when);
      var ig = socialLink("ig", b.instagram, "Instagram");
      var li = socialLink("li", b.linkedin, "LinkedIn");
      var xx = socialLink("x", b.x_handle, "X");
      if (ig || li || xx) {
        var soc = el("div", "socials");
        if (ig) soc.appendChild(ig);
        if (li) soc.appendChild(li);
        if (xx) soc.appendChild(xx);
        card.appendChild(soc);
      }
      var a = el("a", "gcal", "＋ Google Calendar");
      a.href = gcalUrl(b);
      a.target = "_blank";
      a.rel = "noopener";
      card.appendChild(a);
      if (myTokens[String(b.id)] || b.mine) {
        var actions = el("div", "actions");
        var ed = el("a", "editbtn", "✏️ Edit");
        ed.href = "#";
        ed.addEventListener("click", function (ev) {
          ev.preventDefault();
          openEditModal(b, false);
        });
        actions.appendChild(ed);
        var del = el("a", "delbtn", "🗑 Delete");
        del.href = "#";
        del.addEventListener("click", function (ev) {
          ev.preventDefault();
          deleteEntry(b);
        });
        actions.appendChild(del);
        card.appendChild(actions);
      } else if (!ownsAny) {
        var claim = el("a", "claimlink", "🪪 This is me — let me edit it");
        claim.href = "#";
        claim.addEventListener("click", function (ev) {
          ev.preventDefault();
          openEditModal(b, true);
        });
        card.appendChild(claim);
      }
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("a, button, .zpop, input, select")) return;
        var cake = el("span", "cake-float", "🎂");
        cake.style.right = (10 + Math.random() * 40) + "px";
        cake.style.bottom = "12px";
        card.appendChild(cake);
        cake.addEventListener("animationend", function () { cake.remove(); });
      });
      // Today's people are announced in the banner; within 30 days stays
      // under Upcoming, everything further out moves to Later.
      if (days === 0) todays.push(b);
      if (days <= 30) {
        grid.appendChild(card);
        nUpcoming++;
      } else {
        grid2.appendChild(card);
        nLater++;
      }
    });

    count.textContent = nUpcoming ? nUpcoming + (nUpcoming === 1 ? " person" : " people") : "";
    count2.textContent = nLater ? nLater + (nLater === 1 ? " person" : " people") : "";
    document.getElementById("upEmpty").hidden = !(list.length && nUpcoming === 0);
    document.getElementById("laterHead").hidden = nLater === 0;
    grid2.hidden = nLater === 0;

    var banner = document.getElementById("todayBanner");
    banner.innerHTML = "";
    if (todays.length) {
      var names = todays.map(function (b) { return b.name; });
      var nameStr = names.length === 1
        ? names[0]
        : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
      banner.appendChild(el("span", "tb-emoji", "🎂"));
      var twrap = el("div");
      twrap.appendChild(el("div", "tb-title", "Today is " + nameStr + "'s birthday!"));
      twrap.appendChild(el("div", "tb-sub",
        "Go wish " + (names.length === 1 ? "them" : "them all") + " a happy one 🎉"));
      banner.appendChild(twrap);
      var avs = el("div", "tb-avs");
      todays.forEach(function (b) { avs.appendChild(avatarEl(b)); });
      banner.appendChild(avs);
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  function load() {
    fetch("/api/birthdays")
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {});
  }

  document.getElementById("icsurl").textContent = location.origin + "/calendar.ics";
  document.getElementById("copyics").addEventListener("click", function () {
    navigator.clipboard.writeText(location.origin + "/calendar.ics").then(function () {
      var btn = document.getElementById("copyics");
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = "Copy"; }, 1500);
    });
  });

  function doSubmit(payload, replaceId) {
    var btn = document.getElementById("submitBtn");
    var status = document.getElementById("status");
    btn.disabled = true;
    status.className = "";
    var body = {
      name: payload.name, position: payload.position,
      month: payload.month, day: payload.day, year: payload.year,
      join_month: payload.join_month, join_year: payload.join_year,
      instagram: payload.instagram, linkedin: payload.linkedin, x: payload.x,
      avatar: payload.avatar
    };
    if (replaceId) body.replace_id = replaceId;
    fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          status.className = "ok";
          status.textContent = replaceId
            ? "🎉 Updated! Your entry is current."
            : "🎉 Saved! You're on the wall.";
          document.cookie = "bt_name=" + encodeURIComponent(payload.name) +
            "; path=/; max-age=31536000; SameSite=Lax";
          if (res.j.id && res.j.token) saveToken(res.j.id, res.j.token);
          load();
          setTimeout(closeFormModal, 900);
        } else {
          status.className = "err";
          status.textContent = res.j.error || "Something went wrong — try again.";
        }
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Network error — try again.";
      })
      .finally(function () { btn.disabled = false; });
  }

  // "Is this you?" popup — fires when the submitted birthday matches someone
  // already on the wall under a different name.
  var dupPayload = null, dupTarget = null;

  // NB: this code lives inside a worker template literal — regex backslashes
  // must be doubled (\\s) or they get eaten before the browser sees them.
  function normSpace(s) { return s.trim().replace(/\\s+/g, " "); }
  function normName(s) { return normSpace(s).toLowerCase(); }

  // Edit tokens: the server hands one back per successful submit; holding it
  // is what makes this browser the owner of that entry.
  function getTokens() {
    try { return JSON.parse(localStorage.getItem("bt_tokens") || "{}"); } catch (e) { return {}; }
  }
  function saveToken(id, token) {
    var t = getTokens();
    t[String(id)] = token;
    try { localStorage.setItem("bt_tokens", JSON.stringify(t)); } catch (e) {}
  }

  function openDupModal(payload, dupes) {
    dupPayload = payload;
    dupTarget = null;
    var matches = document.getElementById("dlgMatches");
    matches.innerHTML = "";
    dupes.forEach(function (b) {
      var row = el("div", "match");
      var info = el("div");
      info.appendChild(el("b", null, b.name));
      info.appendChild(el("div", "m-sub",
        (b.position ? b.position + " · " : "") + MONTHS[b.month - 1] + " " + b.day));
      var btn = el("button", "mini", "Yes, that's me");
      btn.type = "button";
      btn.addEventListener("click", function () {
        dupTarget = b;
        document.getElementById("dlgStep1").hidden = true;
        document.getElementById("dlgStep2").hidden = false;
        var ni = document.getElementById("dlgName");
        ni.value = dupPayload.name;
        ni.focus();
      });
      row.appendChild(info);
      row.appendChild(btn);
      matches.appendChild(row);
    });
    document.getElementById("dlgStep1").hidden = false;
    document.getElementById("dlgStep2").hidden = true;
    document.getElementById("modal").hidden = false;
  }

  function closeModal() { document.getElementById("modal").hidden = true; }

  document.getElementById("dlgClose").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("modal")) closeModal();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      closeModal();
      document.getElementById("emodal").hidden = true;
      document.getElementById("fmodal").hidden = true;
    }
  });
  document.getElementById("dlgNew").addEventListener("click", function () {
    var p = dupPayload;
    closeModal();
    if (p) doSubmit(p);
  });
  document.getElementById("dlgBack").addEventListener("click", function () {
    document.getElementById("dlgStep2").hidden = true;
    document.getElementById("dlgStep1").hidden = false;
  });
  document.getElementById("dlgSave").addEventListener("click", function () {
    var ni = document.getElementById("dlgName");
    var nm = normSpace(ni.value);
    if (!nm) { ni.focus(); return; }
    var p = {
      name: nm, position: dupPayload.position,
      month: dupPayload.month, day: dupPayload.day, year: dupPayload.year,
      join_month: dupPayload.join_month, join_year: dupPayload.join_year,
      instagram: dupPayload.instagram, linkedin: dupPayload.linkedin, x: dupPayload.x,
      avatar: dupPayload.avatar
    };
    var target = dupTarget;
    closeModal();
    doSubmit(p, target ? target.id : undefined);
  });

  // Owner-only edit modal. claimMode = "This is me" takeover of a card the
  // browser can't prove it owns.
  var editing = null;
  var editingClaim = false;
  var avatarData; // undefined = unchanged, "" = remove, data URL = new photo

  document.getElementById("eAvatar").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    readAvatarFile(f, function (data) {
      avatarData = data;
      var prev = document.getElementById("eAvPrev");
      prev.src = data;
      prev.hidden = false;
    });
  });

  function deleteEntry(b) {
    if (!window.confirm('Delete "' + b.name + '" from the wall? This can\\u2019t be undone.')) return;
    var status = document.getElementById("status");
    fetch("/api/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: b.id, token: getTokens()[String(b.id)] })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          status.className = "ok";
          status.textContent = "🗑 Entry deleted.";
          load();
        } else {
          status.className = "err";
          status.textContent = res.j.error || "Couldn't delete — try again.";
        }
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Network error — try again.";
      });
  }

  function fillDayOptions(sel, month, keep) {
    var max = MDAYS[month - 1];
    sel.innerHTML = "";
    for (var d = 1; d <= max; d++) {
      var o = document.createElement("option");
      o.value = String(d);
      o.textContent = String(d);
      sel.appendChild(o);
    }
    sel.value = String(Math.min(keep || 1, max));
  }

  function openEditModal(b, claimMode) {
    editing = b;
    editingClaim = claimMode === true;
    document.getElementById("claimNote").hidden = !editingClaim;
    document.getElementById("eTitle").textContent = editingClaim
      ? "🪪 Claim & edit this entry"
      : "✏️ Edit your entry";
    var em = document.getElementById("eMonth");
    var edd = document.getElementById("eDay");
    var ejm = document.getElementById("eJMonth");
    if (!em.options.length) {
      for (var i = 0; i < 12; i++) {
        var o = document.createElement("option");
        o.value = String(i + 1);
        o.textContent = MONTHS[i];
        em.appendChild(o);
        var o2 = document.createElement("option");
        o2.value = String(i + 1);
        o2.textContent = MONTHS[i];
        ejm.appendChild(o2);
      }
      em.addEventListener("change", function () {
        fillDayOptions(edd, parseInt(em.value, 10), parseInt(edd.value || "1", 10));
      });
    }
    document.getElementById("eName").value = b.name;
    document.getElementById("ePos").value = b.position || "";
    em.value = String(b.month);
    fillDayOptions(edd, b.month, b.day);
    document.getElementById("eYear").value = "";
    ejm.value = String(b.join_month || 1);
    document.getElementById("eJYear").value = b.join_year || "";
    document.getElementById("eIg").value = b.instagram || "";
    document.getElementById("eLi").value = b.linkedin || "";
    document.getElementById("eX").value = b.x_handle || "";
    avatarData = undefined;
    var prev = document.getElementById("eAvPrev");
    prev.hidden = !b.has_avatar;
    if (b.has_avatar) prev.src = "/avatar/" + b.id + "?t=" + Date.now();
    document.getElementById("eAvatar").value = "";
    document.getElementById("eErr").hidden = true;
    document.getElementById("emodal").hidden = false;
    document.getElementById("eName").focus();
  }

  function closeEditModal() { document.getElementById("emodal").hidden = true; }
  document.getElementById("eClose").addEventListener("click", closeEditModal);
  document.getElementById("eCancel").addEventListener("click", closeEditModal);
  document.getElementById("emodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("emodal")) closeEditModal();
  });

  document.getElementById("eSave").addEventListener("click", function () {
    if (!editing) return;
    var err = document.getElementById("eErr");
    var payload = {
      id: editing.id,
      token: getTokens()[String(editing.id)],
      name: normSpace(document.getElementById("eName").value),
      position: document.getElementById("ePos").value,
      month: parseInt(document.getElementById("eMonth").value, 10),
      day: parseInt(document.getElementById("eDay").value, 10),
      year: document.getElementById("eYear").value || null,
      join_month: parseInt(document.getElementById("eJMonth").value, 10),
      join_year: document.getElementById("eJYear").value || null,
      instagram: document.getElementById("eIg").value,
      linkedin: document.getElementById("eLi").value,
      x: document.getElementById("eX").value
    };
    if (avatarData !== undefined) payload.avatar = avatarData;
    if (editingClaim) payload.claim = true;
    if (!payload.name) {
      err.textContent = "Name can't be empty.";
      err.hidden = false;
      return;
    }
    var btn = this;
    btn.disabled = true;
    fetch("/api/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          closeEditModal();
          var status = document.getElementById("status");
          status.className = "ok";
          status.textContent = "✏️ Updated!";
          document.cookie = "bt_name=" + encodeURIComponent(payload.name) +
            "; path=/; max-age=31536000; SameSite=Lax";
          if (res.j.id && res.j.token) saveToken(res.j.id, res.j.token);
          load();
        } else {
          err.textContent = res.j.error || "Couldn't save — try again.";
          err.hidden = false;
        }
      })
      .catch(function () {
        err.textContent = "Network error — try again.";
        err.hidden = false;
      })
      .finally(function () { btn.disabled = false; });
  });

  // The submission form lives in a popup now.
  function openFormModal() {
    document.getElementById("fmodal").hidden = false;
    document.getElementById("name").focus();
  }
  function closeFormModal() {
    document.getElementById("fmodal").hidden = true;
  }
  document.getElementById("openForm").addEventListener("click", openFormModal);
  document.getElementById("fClose").addEventListener("click", closeFormModal);
  document.getElementById("fmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("fmodal")) closeFormModal();
  });

  var form = document.getElementById("bform");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var status = document.getElementById("status");
    if (!formAvatarData) {
      status.className = "err";
      status.textContent = "📸 Please add your photo — it's required.";
      return;
    }
    var payload = {
      name: normSpace(document.getElementById("name").value),
      position: document.getElementById("position").value,
      month: parseInt(monthSel.value, 10),
      day: parseInt(daySel.value, 10),
      year: document.getElementById("year").value || null,
      join_month: parseInt(jMonthSel.value, 10),
      join_year: document.getElementById("jyear").value || null,
      instagram: document.getElementById("fIg").value,
      linkedin: document.getElementById("fLi").value,
      x: document.getElementById("fX").value,
      avatar: formAvatarData
    };
    if (!payload.name) return;
    var dupes = allBirthdays.filter(function (b) {
      return b.month === payload.month && b.day === payload.day &&
        normName(b.name) !== normName(payload.name);
    });
    if (dupes.length) { openDupModal(payload, dupes); return; }
    doSubmit(payload);
  });

  load();
})();
</script>
</body>
</html>`;

// ---------- Visitors page (globe + live feed) ----------

const VISITORS_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Visitor Tracker — Senpex / Pckup</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #FF5C33;
    --brand-dark: #d94a26;
    --bg: rgb(27, 27, 27);
    --panel: #232323;
    --panel-2: #1f1f1f;
    --line: #383838;
    --text: #f0eeec;
    --muted: #9a948e;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "TASA Orbiter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  header.top {
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
    padding: 26px 22px;
    border-bottom: 4px solid var(--brand);
    flex-wrap: wrap;
  }
  header.top h1 { margin: 0 0 4px; font-size: 26px; font-weight: 600; }
  header.top p { margin: 0; color: var(--muted); font-size: 14px; }
  a.back {
    color: #cfc9c2; text-decoration: none; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 7px 14px;
    white-space: nowrap;
  }
  a.back:hover { color: #fff; border-color: var(--brand); }
  main { max-width: 1000px; margin: 26px auto 50px; padding: 0 16px; display: flex; flex-direction: column; gap: 18px; }
  .stats { display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch; }
  .stat {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 18px; min-width: 130px; flex: 1 1 130px;
    position: relative;
  }
  .stat.has-pop { cursor: default; }
  .stat.has-pop:hover, .stat.has-pop:focus-within { border-color: var(--brand); }
  .stat.has-pop::after {
    content: "▾"; position: absolute; top: 10px; right: 12px;
    color: var(--muted); font-size: 11px;
  }
  .stat-pop {
    display: none; position: absolute; top: 100%; left: 50%; z-index: 20;
    transform: translateX(-50%);
    min-width: 250px; max-width: calc(100vw - 32px);
    max-height: 280px; overflow-y: auto;
    background: #141414; border: 1px solid #4d4d4d; border-radius: 10px;
    padding: 6px; box-shadow: 0 14px 38px rgba(0, 0, 0, 0.55);
  }
  .stat.has-pop:hover .stat-pop, .stat.has-pop:focus-within .stat-pop { display: block; }
  .pop-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 9px; border-radius: 7px; font-size: 13px;
  }
  .pop-row.clickable { cursor: pointer; }
  .pop-row:hover { background: rgba(255, 255, 255, 0.07); }
  .pop-row.clickable:hover .pop-name { color: var(--brand); }
  .pop-name { color: var(--text); font-weight: 600; }
  .pop-count { margin-left: auto; color: var(--muted); font-size: 12px; font-weight: 700; padding-left: 10px; }
  .pop-empty { color: var(--muted); padding: 7px 9px; font-size: 12.5px; }
  .stat b { display: block; font-size: 24px; font-weight: 700; color: var(--brand); }
  .stat span { font-size: 11.5px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .live {
    display: flex; align-items: center; gap: 8px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 18px; font-size: 12.5px; font-weight: 700; color: #cfc9c2;
  }
  .pulse {
    width: 9px; height: 9px; border-radius: 50%; background: var(--brand); display: inline-block;
    animation: pulse 1.6s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 92, 51, 0.5); }
    70% { box-shadow: 0 0 0 9px rgba(255, 92, 51, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 92, 51, 0); }
  }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; }
  .panel h2 { margin: 0 0 14px; font-size: 18px; font-weight: 600; }
  .range-box select {
    display: block; width: 100%; margin-top: 5px;
    font: inherit; font-size: 13.5px; font-weight: 600;
    background: var(--panel-2); color: var(--text);
    border: 1px solid #4a4a4a; border-radius: 8px; padding: 6px 8px;
    cursor: pointer;
  }
  .range-box select:focus { outline: 2px solid var(--brand); border-color: transparent; }
  #globe-wrap { display: flex; justify-content: center; position: relative; }
  #gtip {
    position: absolute; z-index: 5;
    transform: translate(-50%, -135%);
    background: #141414; color: var(--text);
    border: 1px solid #4d4d4d; border-radius: 8px;
    padding: 7px 11px; font-size: 12.5px;
    pointer-events: none; white-space: nowrap;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
  }
  #gtip b { color: var(--brand); }
  #gtip[hidden] { display: none; }
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .overlay[hidden] { display: none; }
  .dialog {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 20px; max-width: 470px; width: 100%; position: relative;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
  }
  .dialog h3 { margin: 0 0 6px; font-size: 17px; }
  .dialog h3 .nm { color: var(--brand); }
  .dlg-sub { margin: 0 0 12px; color: var(--muted); font-size: 13px; }
  .dlg-x {
    position: absolute; top: 8px; right: 12px;
    border: 0; background: none; font-size: 22px; color: var(--muted);
    cursor: pointer; line-height: 1; padding: 4px;
  }
  .dlg-x:hover { color: #fff; }
  .plist { max-height: 340px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-2); }
  .pv { display: flex; justify-content: space-between; gap: 10px; padding: 10px 13px; border-bottom: 1px solid #303030; font-size: 13px; }
  .pv:last-child { border-bottom: 0; }
  .pv-when { color: var(--text); font-weight: 600; white-space: nowrap; }
  .pv-what { color: var(--muted); text-align: right; }
  #globe { width: 100%; max-width: 620px; height: auto; display: block; cursor: grab; touch-action: none; }
  #globe:active { cursor: grabbing; }
  .spin-controls {
    display: flex; gap: 18px; align-items: center; justify-content: center;
    margin-top: 14px; color: var(--muted); font-size: 12.5px; font-weight: 600;
    flex-wrap: wrap;
  }
  .spin-controls label { display: inline-flex; align-items: center; gap: 8px; }
  .spin-controls input[type="range"] { width: 130px; accent-color: var(--brand); cursor: pointer; }
  .spin-controls button {
    font: inherit; font-size: 12.5px; font-weight: 600; color: #cfc9c2;
    background: var(--panel-2); border: 1px solid #4a4a4a; border-radius: 999px;
    padding: 6px 13px; cursor: pointer;
  }
  .spin-controls button:hover { color: #fff; border-color: var(--brand); }
  #spinPlay { min-width: 92px; }
  .legend { text-align: center; color: var(--muted); font-size: 12.5px; margin: 12px 0 0; }
  .legend .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--brand); margin-right: 5px; }
  #globe-fallback { color: var(--muted); text-align: center; padding: 26px 0; }
  #feed { max-height: 480px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-2); }
  .visit { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-bottom: 1px solid #303030; }
  .visit:last-child { border-bottom: 0; }
  .v-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); flex: none; }
  .v-main { min-width: 0; }
  .v-loc { font-weight: 600; font-size: 14px; }
  .v-ip { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .v-name { color: var(--brand); font-weight: 600; }
  img.flag {
    width: 18px; height: auto; border-radius: 2px;
    vertical-align: -2px; margin-right: 6px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.14);
  }
  #gtip img.flag, .dlg-sub img.flag { width: 16px; }
  .v-right { margin-left: auto; text-align: right; flex: none; }
  .v-time { color: #cfc9c2; font-size: 13px; white-space: nowrap; }
  .v-path { color: var(--muted); font-size: 11.5px; margin-top: 2px; }
  .visit.fresh { animation: flashbg 2.4s ease-out; }
  @keyframes flashbg {
    0% { background-color: rgba(255, 92, 51, 0.22); }
    100% { background-color: transparent; }
  }
  #feed-empty { color: var(--muted); text-align: center; padding: 26px 0; }
  footer { text-align: center; color: var(--muted); font-size: 12.5px; padding-bottom: 30px; }
  footer a { color: var(--brand); }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>📡 Visitor Tracker</h1>
    <p>Every visit to the birthday tracker in real-time: exact time, IP address, and city.</p>
  </div>
  <a class="back" href="/">← Birthday tracker</a>
</header>
<main>
  <div class="stats">
    <div class="stat"><b id="s-total">—</b><span>Total visits</span></div>
    <div class="stat"><b id="s-unique">—</b><span>Unique visitors</span></div>
    <div class="stat has-pop" tabindex="0">
      <b id="s-cities">—</b><span>Cities</span>
      <div class="stat-pop" id="pop-cities"></div>
    </div>
    <div class="stat has-pop" tabindex="0">
      <b id="s-countries">—</b><span>Countries</span>
      <div class="stat-pop" id="pop-countries"></div>
    </div>
    <div class="stat range-box">
      <span>Time range</span>
      <select id="range" aria-label="Time range">
        <option value="all" selected>All time</option>
        <option value="1h">Last hour</option>
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
    </div>
    <div class="live"><span class="pulse"></span> LIVE · <span id="updated">connecting…</span></div>
  </div>

  <section class="panel">
    <h2>🌍 Where the visits come from</h2>
    <div id="globe-wrap"><canvas id="globe" width="640" height="640" role="img" aria-label="Globe showing visitor locations"></canvas><div id="gtip" hidden></div></div>
    <div class="spin-controls">
      <label for="spinSpeed">🌀 Spin speed <input type="range" id="spinSpeed" min="0" max="60" step="1"></label>
      <label for="spinFric">🧊 Glide <input type="range" id="spinFric" min="0" max="100" step="1"></label>
      <button id="spinPlay" type="button" title="Pause or resume the spin">⏸ Pause</button>
      <button id="spinReset" type="button" title="Reset spin to defaults">↺ Reset spin</button>
    </div>
    <p id="globe-fallback" hidden>Couldn't load the world map — the live feed below still works.</p>
    <p class="legend"><span class="dot"></span> one dot per visitor · bigger dot = more visits · hover for who, click for their history · drag to spin</p>
  </section>

  <section class="panel">
    <h2>Live visit feed</h2>
    <div id="feed"></div>
    <p id="feed-empty" hidden>No visits logged yet — share the link and watch this fill up.</p>
  </section>
</main>

<div id="pmodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pTitle">
    <button class="dlg-x" id="pClose" type="button" aria-label="Close">×</button>
    <h3 id="pTitle">Visit history</h3>
    <p class="dlg-sub" id="pSub"></p>
    <div id="pList" class="plist"></div>
  </div>
</div>
<footer>Senpex / Pckup internal tool · <a href="/">team birthday tracker</a>
<div style="margin-top:7px;font-size:11.5px;opacity:.85">__BUILDINFO__</div></footer>
<script>
(function () {
  var points = [];
  var curRange = "all";
  var maxSeenId = 0;
  var firstLoad = true;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function fmtTs(ts) {
    var d = new Date(ts.replace(" ", "T") + "Z");
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  function locStr(v) {
    var parts = [];
    if (v.city) parts.push(v.city);
    if (v.region && v.region !== v.city) parts.push(v.region);
    var s = parts.join(", ");
    if (v.country) s = s ? s + " · " + v.country : v.country;
    return s || "Unknown location";
  }

  function pageName(p) {
    if (p === "/visitors") return "this tracker";
    if (p === "/changelog") return "the changelog";
    return "birthday wall";
  }

  // Real flag image (proxied through /flag/), hidden if the code has no flag.
  function flagEl(country) {
    if (!country || String(country).length !== 2) return null;
    var img = document.createElement("img");
    img.className = "flag";
    img.src = "/flag/" + String(country).toLowerCase() + ".png";
    img.alt = country;
    img.onerror = function () { img.style.display = "none"; };
    return img;
  }

  function renderFeed(recent) {
    var feed = document.getElementById("feed");
    var empty = document.getElementById("feed-empty");
    feed.innerHTML = "";
    empty.hidden = recent.length > 0;
    feed.style.display = recent.length ? "block" : "none";
    recent.forEach(function (v) {
      var row = el("div", "visit" + (!firstLoad && v.id > maxSeenId ? " fresh" : ""));
      row.appendChild(el("span", "v-dot"));
      var main = el("div", "v-main");
      main.appendChild(el("div", "v-loc", locStr(v)));
      var ipline = el("div", "v-ip");
      var fl = flagEl(v.country);
      if (fl) ipline.appendChild(fl);
      ipline.appendChild(el("span", v.name ? "v-name" : "v-anon", v.name || "Unknown visitor"));
      ipline.appendChild(document.createTextNode(" · " + (v.ip || "unknown IP")));
      main.appendChild(ipline);
      row.appendChild(main);
      var right = el("div", "v-right");
      right.appendChild(el("div", "v-time", fmtTs(v.ts)));
      right.appendChild(el("div", "v-path", "viewed " + pageName(v.path)));
      row.appendChild(right);
      feed.appendChild(row);
    });
    if (recent.length) {
      var top = recent[0].id;
      if (top > maxSeenId) maxSeenId = top;
    }
  }

  function setStats(data) {
    document.getElementById("s-total").textContent = data.total;
    document.getElementById("s-unique").textContent = data.uniques;
    document.getElementById("s-cities").textContent = data.cities;
    document.getElementById("s-countries").textContent = data.countries;
    document.getElementById("updated").textContent =
      "updated " + new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // Full country name from its 2-letter code, e.g. US → United States.
  var regionNames = null;
  function regionName(cc) {
    try {
      if (!regionNames) regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      return regionNames.of(String(cc).toUpperCase()) || cc;
    } catch (e) {
      return cc;
    }
  }

  // Hover popovers on the Cities / Countries stat cards: every place with its
  // flag and visit count, respecting the selected time range.
  function popRow(label, c, kind) {
    var row = el("div", "pop-row");
    var f = flagEl(c.country);
    if (f) row.appendChild(f);
    row.appendChild(el("span", "pop-name", label));
    row.appendChild(el("span", "pop-count", c.count));
    if (c.lat !== null && c.lat !== undefined && c.lon !== null && c.lon !== undefined) {
      row.classList.add("clickable");
      row.title = "Show on the globe";
      row.addEventListener("click", function () {
        setHighlight(kind, c);
        flyTo(c.lat, c.lon);
      });
    }
    return row;
  }

  function renderPops(cities, countries) {
    var pc = document.getElementById("pop-cities");
    pc.innerHTML = "";
    if (!cities.length) pc.appendChild(el("div", "pop-empty", "No city data yet"));
    cities.forEach(function (c) {
      pc.appendChild(popRow(c.city + (c.country ? ", " + c.country : ""), c, "city"));
    });
    var pn = document.getElementById("pop-countries");
    pn.innerHTML = "";
    if (!countries.length) pn.appendChild(el("div", "pop-empty", "No country data yet"));
    countries.forEach(function (c) {
      pn.appendChild(popRow(regionName(c.country), c, "country"));
    });
  }

  // One dot per visitor: people sharing a rounded location are fanned out in
  // a small ring so every dot stays hoverable. dlat/dlon are display coords;
  // lat/lon stay exact for history queries.
  function spreadPoints(raw) {
    var groups = {};
    raw.forEach(function (p) {
      var k = p.lat + "|" + p.lon;
      (groups[k] = groups[k] || []).push(p);
    });
    var out = [];
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (p, i) {
        var dlat = p.lat, dlon = p.lon;
        if (g.length > 1) {
          var ang = (2 * Math.PI * i) / g.length;
          var stretch = Math.max(0.2, Math.cos((p.lat * Math.PI) / 180));
          dlat = p.lat + 0.5 * Math.sin(ang);
          dlon = p.lon + (0.5 * Math.cos(ang)) / stretch;
        }
        out.push({
          name: p.name, city: p.city, country: p.country, count: p.count,
          lat: p.lat, lon: p.lon, dlat: dlat, dlon: dlon
        });
      });
    });
    return out;
  }

  function load() {
    fetch("/api/visits" + (curRange === "all" ? "" : "?range=" + curRange))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setStats(data);
        renderPops(data.cityList || [], data.countryList || []);
        renderFeed(data.recent || []);
        points = spreadPoints(data.points || []);
        firstLoad = false;
      })
      .catch(function () {
        document.getElementById("updated").textContent = "connection lost — retrying";
      });
  }

  load();
  setInterval(load, 5000);

  // Keep stat popovers inside the viewport (they're centered on their card,
  // which can poke past the edge on narrow screens).
  function fitPop(stat) {
    var pop = stat.querySelector(".stat-pop");
    if (!pop) return;
    pop.style.marginLeft = "0px";
    var r = pop.getBoundingClientRect();
    if (!r.width) return;
    var pad = 12;
    var shift = 0;
    if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    pop.style.marginLeft = shift + "px";
  }
  Array.prototype.forEach.call(document.querySelectorAll(".stat.has-pop"), function (stat) {
    function fit() { requestAnimationFrame(function () { fitPop(stat); }); }
    stat.addEventListener("mouseenter", fit);
    stat.addEventListener("focusin", fit);
  });

  document.getElementById("range").addEventListener("change", function () {
    curRange = this.value;
    firstLoad = true; // rows appearing because of a range switch aren't "new"
    load();
  });

  // ----- Globe: vanilla canvas orthographic projection, no libraries -----
  var canvas = document.getElementById("globe");
  var g2d = canvas.getContext("2d");
  var CX = 320, CY = 320, R = 298;
  var DEG = Math.PI / 180;
  var centerLon = -40, centerLat = 18;
  var rings = null;
  var dotHits = [];
  var pointerDown = false, draggingActive = false;
  var lastInteraction = 0;

  // Spin physics: user-adjustable auto-spin speed (deg/s), glide (how long a
  // flick keeps the globe turning), direction — plus flick velocity state.
  var spin = { speed: 8, glide: 55, dir: 1, paused: false };
  try {
    var savedSpin = JSON.parse(localStorage.getItem("globe_spin") || "{}");
    if (typeof savedSpin.speed === "number") spin.speed = savedSpin.speed;
    if (typeof savedSpin.glide === "number") spin.glide = savedSpin.glide;
    if (savedSpin.dir === 1 || savedSpin.dir === -1) spin.dir = savedSpin.dir;
    if (savedSpin.paused === true) spin.paused = true;
  } catch (e) {}
  var velLon = 0, velLat = 0;          // current inertia, deg/s
  var dragVelLon = 0, dragVelLat = 0;  // velocity sampled during drag
  var lastMoveT = 0;

  function saveSpin() {
    try { localStorage.setItem("globe_spin", JSON.stringify(spin)); } catch (e) {}
  }

  var speedSlider = document.getElementById("spinSpeed");
  var fricSlider = document.getElementById("spinFric");
  speedSlider.value = String(spin.speed);
  fricSlider.value = String(spin.glide);
  speedSlider.addEventListener("input", function () {
    spin.speed = parseInt(this.value, 10) || 0;
    saveSpin();
  });
  fricSlider.addEventListener("input", function () {
    spin.glide = parseInt(this.value, 10) || 0;
    saveSpin();
  });
  // Play/pause: the label always mirrors the real state — it also flips to
  // ▶ Play on its own if the speed slider hits 0 (the globe isn't going).
  var playBtn = document.getElementById("spinPlay");
  function refreshPlayBtn() {
    var label = !spin.paused && spin.speed > 0 ? "⏸ Pause" : "▶ Play";
    if (playBtn.textContent !== label) playBtn.textContent = label;
  }
  playBtn.addEventListener("click", function () {
    if (!spin.paused && spin.speed === 0) {
      // "Play" pressed while the slider is at zero: give it a speed again.
      spin.speed = 8;
      speedSlider.value = "8";
    } else {
      spin.paused = !spin.paused;
    }
    if (spin.paused) {
      velLon = velLat = 0; // a paused globe should actually stop
    } else {
      lastInteraction = Date.now() - 3000; // resume instantly
    }
    saveSpin();
    refreshPlayBtn();
  });

  document.getElementById("spinReset").addEventListener("click", function () {
    spin.speed = 8;
    spin.glide = 55;
    spin.dir = 1;
    spin.paused = false;
    speedSlider.value = "8";
    fricSlider.value = "55";
    velLon = velLat = 0;
    lastInteraction = Date.now() - 3000; // resume default spin immediately
    saveSpin();
    refreshPlayBtn();
  });

  function project(lon, lat) {
    var l = lon * DEG, p = lat * DEG, l0 = centerLon * DEG, p0 = centerLat * DEG;
    var cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
    if (cosc < 0) return null;
    return [
      CX + R * Math.cos(p) * Math.sin(l - l0),
      CY - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0))
    ];
  }

  // TopoJSON decoding: delta-decode quantized arcs, stitch arcs into rings.
  function decodeWorld(topo) {
    var tr = topo.transform;
    var arcs = topo.arcs.map(function (arc) {
      if (!tr) return arc;
      var x = 0, y = 0;
      return arc.map(function (pt) {
        x += pt[0]; y += pt[1];
        return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]];
      });
    });
    function ringOf(idxList) {
      var ring = [];
      idxList.forEach(function (ai) {
        var pts = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse();
        if (ring.length) pts = pts.slice(1);
        ring = ring.concat(pts);
      });
      return ring;
    }
    var out = [];
    topo.objects.countries.geometries.forEach(function (geom) {
      if (geom.type === "Polygon") {
        geom.arcs.forEach(function (r) { out.push(ringOf(r)); });
      } else if (geom.type === "MultiPolygon") {
        geom.arcs.forEach(function (poly) {
          poly.forEach(function (r) { out.push(ringOf(r)); });
        });
      }
    });
    return out;
  }

  // Trace a lat/lon polyline, lifting the pen wherever it dips behind the horizon.
  function tracePath(pts) {
    var pen = false;
    for (var i = 0; i < pts.length; i++) {
      var xy = project(pts[i][0], pts[i][1]);
      if (xy) {
        if (pen) g2d.lineTo(xy[0], xy[1]);
        else { g2d.moveTo(xy[0], xy[1]); pen = true; }
      } else {
        pen = false;
      }
    }
  }

  function sampleLine(f) {
    var pts = [];
    for (var i = 0; i <= 72; i++) pts.push(f(i / 72));
    return pts;
  }

  function drawGlobe() {
    g2d.clearRect(0, 0, 640, 640);
    g2d.beginPath();
    g2d.arc(CX, CY, R, 0, 2 * Math.PI);
    g2d.fillStyle = "#262626";
    g2d.fill();
    g2d.strokeStyle = "#4d4d4d";
    g2d.lineWidth = 1.5;
    g2d.stroke();

    g2d.beginPath();
    for (var lon = -180; lon < 180; lon += 30) {
      (function (LN) { tracePath(sampleLine(function (t) { return [LN, -90 + 180 * t]; })); })(lon);
    }
    for (var lat = -60; lat <= 60; lat += 30) {
      (function (LT) { tracePath(sampleLine(function (t) { return [-180 + 360 * t, LT]; })); })(lat);
    }
    g2d.strokeStyle = "rgba(255,255,255,0.06)";
    g2d.lineWidth = 0.6;
    g2d.stroke();

    if (rings) {
      g2d.beginPath();
      rings.forEach(tracePath);
      g2d.strokeStyle = "#857c72";
      g2d.lineWidth = 0.8;
      g2d.stroke();
    }

    dotHits = [];
    var hlActive = highlight && Date.now() < highlight.until;
    points.forEach(function (p) {
      if (p.lat === null || p.lon === null) return;
      var xy = project(p.dlon, p.dlat);
      if (!xy) return;
      var hl = hlActive &&
        (highlight.type === "country"
          ? p.country === highlight.country
          : p.city === highlight.city && p.country === highlight.country);
      var pulse = hl ? 1 + 0.35 * Math.sin(Date.now() / 110) : 1;
      var r = Math.min(12, 3.5 + Math.sqrt(p.count) * 1.7);
      g2d.beginPath();
      g2d.arc(xy[0], xy[1], r * 2 * pulse, 0, 2 * Math.PI);
      g2d.fillStyle = hl ? "rgba(64,170,255,0.3)" : "rgba(255,92,51,0.15)";
      g2d.fill();
      g2d.beginPath();
      g2d.arc(xy[0], xy[1], r * (hl ? pulse * 0.6 + 0.4 : 1), 0, 2 * Math.PI);
      g2d.fillStyle = hl ? "#40AAFF" : "#FF5C33";
      g2d.fill();
      g2d.strokeStyle = hl ? "#eaf6ff" : "#1b1b1b";
      g2d.lineWidth = hl ? 1.5 : 1;
      g2d.stroke();
      dotHits.push({ x: xy[0], y: xy[1], r: r, p: p });
    });
  }

  // Clicked city/country: its dot(s) glow bright blue and pulse for a while.
  var highlight = null;
  function setHighlight(kind, c) {
    highlight = {
      type: kind,
      city: c.city || null,
      country: c.country || null,
      until: Date.now() + 10000
    };
  }

  // Smoothly swing the globe to center a target (used by the city/country
  // popovers). Holds auto-rotation for a few seconds afterwards.
  var flyTimer = null;
  function flyTo(lat, lon) {
    var startLon = centerLon, startLat = centerLat;
    var dLon = lon - startLon;
    while (dLon > 180) dLon -= 360;
    while (dLon < -180) dLon += 360;
    var dLat = Math.max(-75, Math.min(75, lat)) - startLat;
    var t0 = Date.now();
    lastInteraction = Date.now() + 5000;
    if (flyTimer) clearInterval(flyTimer);
    flyTimer = setInterval(function () {
      var t = Math.min(1, (Date.now() - t0) / 900);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      centerLon = startLon + dLon * e;
      centerLat = startLat + dLat * e;
      if (t >= 1) { clearInterval(flyTimer); flyTimer = null; }
    }, 16);
    document.getElementById("globe").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function canvasPos(ev) {
    var rect = canvas.getBoundingClientRect();
    var scale = 640 / rect.width;
    return [(ev.clientX - rect.left) * scale, (ev.clientY - rect.top) * scale];
  }

  function hitDot(ev) {
    var pos = canvasPos(ev);
    for (var i = dotHits.length - 1; i >= 0; i--) {
      var d = dotHits[i];
      var dx = pos[0] - d.x, dy = pos[1] - d.y;
      if (dx * dx + dy * dy <= (d.r + 4) * (d.r + 4)) return d;
    }
    return null;
  }

  function rangeLabel() {
    var sel = document.getElementById("range");
    return sel.options[sel.selectedIndex].text.toLowerCase();
  }

  // Click a dot → mini visit feed for that person (or the unknowns at that spot).
  function openPersonModal(p) {
    var title = document.getElementById("pTitle");
    var sub = document.getElementById("pSub");
    var list = document.getElementById("pList");
    title.innerHTML = "";
    title.appendChild(el("span", "nm", p.name || "Unknown visitor"));
    title.appendChild(document.createTextNode(" — visit history"));
    var loc = (p.city ? p.city + ", " : "") + (p.country || "");
    sub.innerHTML = "";
    var sf = flagEl(p.country);
    if (sf) sub.appendChild(sf);
    sub.appendChild(document.createTextNode((loc ? loc + " · " : "") +
      p.count + (p.count === 1 ? " visit" : " visits") + " · " + rangeLabel()));
    list.innerHTML = "";
    list.appendChild(el("div", "pv", "Loading…"));
    document.getElementById("pmodal").hidden = false;
    var q = p.name
      ? "name=" + encodeURIComponent(p.name)
      : "lat=" + encodeURIComponent(p.lat) + "&lon=" + encodeURIComponent(p.lon);
    if (curRange !== "all") q += "&range=" + curRange;
    fetch("/api/person-visits?" + q)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        list.innerHTML = "";
        var vs = d.visits || [];
        if (!vs.length) {
          list.appendChild(el("div", "pv", "No visits in this time range."));
          return;
        }
        vs.forEach(function (v) {
          var row = el("div", "pv");
          row.appendChild(el("span", "pv-when", fmtTs(v.ts)));
          row.appendChild(el("span", "pv-what",
            pageName(v.path) + (v.city ? " · " + v.city : "")));
          list.appendChild(row);
        });
      })
      .catch(function () {
        list.innerHTML = "";
        list.appendChild(el("div", "pv", "Couldn't load visit history."));
      });
  }

  function closePersonModal() { document.getElementById("pmodal").hidden = true; }
  document.getElementById("pClose").addEventListener("click", closePersonModal);
  document.getElementById("pmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("pmodal")) closePersonModal();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closePersonModal();
  });

  var lastX = 0, lastY = 0, downX = 0, downY = 0;
  canvas.addEventListener("pointerdown", function (ev) {
    pointerDown = true;
    draggingActive = false;
    downX = lastX = ev.clientX;
    downY = lastY = ev.clientY;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });
  canvas.addEventListener("pointermove", function (ev) {
    var tip = document.getElementById("gtip");
    if (!pointerDown) {
      var d = hitDot(ev);
      if (d) {
        var wrapRect = document.getElementById("globe-wrap").getBoundingClientRect();
        tip.innerHTML = "";
        var tf = flagEl(d.p.country);
        if (tf) tip.appendChild(tf);
        var loc = (d.p.city ? d.p.city + ", " : "") + (d.p.country || "");
        tip.appendChild(el("b", null, loc || "Unknown location"));
        tip.appendChild(document.createTextNode(
          " — " + (d.p.name || "Unknown") + " · " +
          d.p.count + (d.p.count === 1 ? " visit" : " visits")));
        tip.style.left = (ev.clientX - wrapRect.left) + "px";
        tip.style.top = (ev.clientY - wrapRect.top) + "px";
        tip.hidden = false;
        canvas.style.cursor = "pointer";
        lastInteraction = Date.now(); // hold the globe still while inspecting
      } else {
        tip.hidden = true;
        canvas.style.cursor = "grab";
      }
      return;
    }
    if (!draggingActive &&
        (Math.abs(ev.clientX - downX) > 4 || Math.abs(ev.clientY - downY) > 4)) {
      draggingActive = true;
      tip.hidden = true;
      velLon = velLat = 0; // grabbing the globe cancels any inertia
    }
    if (!draggingActive) return;
    var scale = 640 / canvas.getBoundingClientRect().width;
    var dLon = -(ev.clientX - lastX) * 0.28 * scale;
    var dLat = (ev.clientY - lastY) * 0.28 * scale;
    centerLon += dLon;
    centerLat = Math.max(-75, Math.min(75, centerLat + dLat));
    var now = Date.now();
    var dtm = Math.max(1, now - (lastMoveT || now - 16));
    dragVelLon = (dLon / dtm) * 1000;
    dragVelLat = (dLat / dtm) * 1000;
    lastMoveT = now;
    lastX = ev.clientX; lastY = ev.clientY;
    lastInteraction = now;
  });
  window.addEventListener("pointerup", function (ev) {
    if (!pointerDown) return;
    pointerDown = false;
    lastInteraction = Date.now();
    if (!draggingActive) {
      var d = hitDot(ev);
      if (d) openPersonModal(d.p);
    } else if (Date.now() - lastMoveT < 120) {
      // Flick: release while moving hands the globe the drag velocity, and
      // the spin controller follows the throw — slider and direction update
      // to the speed you flung it at, then the globe just keeps going.
      velLon = Math.max(-300, Math.min(300, dragVelLon));
      velLat = Math.max(-150, Math.min(150, dragVelLat));
      spin.speed = Math.min(60, Math.round(Math.abs(velLon)));
      spin.dir = velLon >= 0 ? 1 : -1;
      spin.paused = false; // physically throwing the globe overrides pause
      speedSlider.value = String(spin.speed);
      saveSpin();
      refreshPlayBtn();
      lastInteraction = Date.now() - 3000; // no idle pause: seamless handover
    }
    dragVelLon = dragVelLat = 0;
    draggingActive = false;
  });
  canvas.addEventListener("pointerleave", function () {
    document.getElementById("gtip").hidden = true;
    canvas.style.cursor = "grab";
  });

  var lastFrame = 0;
  function frame(tms) {
    if (!lastFrame) lastFrame = tms;
    var dt = Math.min(100, tms - lastFrame);
    lastFrame = tms;
    if (velLon !== 0 || velLat !== 0) {
      // Flick inertia eases toward the sustained spin target (the slider
      // value the throw just set), at a rate set by the glide slider —
      // 0 = settles instantly, 100 = long honey-smooth coast.
      var target = spin.dir * spin.speed;
      centerLon += ((velLon !== 0 ? velLon : target) * dt) / 1000;
      centerLat = Math.max(-75, Math.min(75, centerLat + (velLat * dt) / 1000));
      var k = Math.pow(0.82 + (spin.glide / 100) * 0.175, dt / 16);
      if (velLon !== 0) {
        velLon = target + (velLon - target) * k;
        if (Math.abs(velLon - target) < 0.5) velLon = 0;
      }
      velLat *= k;
      if (Math.abs(velLat) < 0.8) velLat = 0;
      lastInteraction = velLon === 0 && velLat === 0 ? Date.now() - 3000 : Date.now();
    } else if (!pointerDown && !spin.paused && Date.now() - lastInteraction > 2500) {
      centerLon += (spin.dir * spin.speed * dt) / 1000;
    }
    if (centerLon > 180) centerLon -= 360;
    if (centerLon < -180) centerLon += 360;
    refreshPlayBtn();
    drawGlobe();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  fetch("/world.json")
    .then(function (r) {
      if (!r.ok) throw new Error("bad status");
      return r.json();
    })
    .then(function (topo) { rings = decodeWorld(topo); })
    .catch(function () {
      document.getElementById("globe-fallback").hidden = false;
    });
})();
</script>
</body>
</html>`;

// ---------- Changelog page ----------

const CHANGELOG_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Changelog — Senpex / Pckup Birthday Tracker</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #FF5C33;
    --bg: rgb(27, 27, 27);
    --panel: #232323;
    --line: #383838;
    --text: #f0eeec;
    --muted: #9a948e;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "TASA Orbiter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  header.top {
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
    padding: 26px 22px;
    border-bottom: 4px solid var(--brand);
    flex-wrap: wrap;
  }
  header.top h1 { margin: 0 0 4px; font-size: 26px; font-weight: 600; }
  header.top p { margin: 0; color: var(--muted); font-size: 14px; }
  .links { display: flex; gap: 8px; flex-wrap: wrap; }
  a.back {
    color: #cfc9c2; text-decoration: none; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 7px 14px;
    white-space: nowrap;
  }
  a.back:hover { color: #fff; border-color: var(--brand); }
  main { max-width: 760px; margin: 30px auto 60px; padding: 0 16px; }
  .day { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px 24px; margin-bottom: 18px; }
  .day h2 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: var(--brand); }
  .day .d-sub { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
  .day ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 9px; }
  .day li { font-size: 14px; line-height: 1.5; }
  .day li b { color: var(--text); }
  .day li span { color: var(--muted); }
  footer { text-align: center; color: var(--muted); font-size: 12.5px; padding-bottom: 30px; }
  footer a { color: var(--brand); }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>📋 Changelog</h1>
    <p>Everything shipped to the Senpex / Pckup birthday tracker, newest first. One dated entry per day at most — same-day changes are batched together.</p>
  </div>
  <div class="links">
    <a class="back" href="/">← Birthday tracker</a>
    <a class="back" href="/visitors">📡 Visitor tracker</a>
  </div>
</header>
<main>
  <section class="day">
    <h2>July 10, 2026</h2>
    <p class="d-sub">Wall sections, the repo, and transparency</p>
    <ul>
      <li><b>The form is a popup now</b> <span>— "🎈 Add your birthday" opens a polished dialog instead of a big card at the top; the wall gets the spotlight. Also fixed an empty orange box that showed when nobody's birthday is today.</span></li>
      <li><b>Today's-birthday banner</b> <span>— when it's someone's birthday today, a celebration banner with their photo appears at the top of the wall.</span></li>
      <li><b>Upcoming vs. Later birthdays</b> <span>— Upcoming now shows only the next 30 days; everyone further out lives under a new Later birthdays section.</span></li>
      <li><b>On GitHub</b> <span>— the tracker's code now lives in a private repo (github.com/seanmodd/senpex-birthday-tracker) and every change ships as a commit.</span></li>
      <li><b>Build transparency</b> <span>— every page footer now shows the AI model that builds this site, refreshed with each update.</span></li>
      <li><b>Daily changelog</b> <span>— this page batches changes into at most one dated entry per 24 hours.</span></li>
    </ul>
  </section>
  <section class="day">
    <h2>June 12, 2026</h2>
    <p class="d-sub">Visitor analytics, editing, and personality features</p>
    <ul>
      <li><b>Sign in with Instagram</b> <span>— the Instagram logo in the form now opens Instagram's login popup and fills in your verified username (business/creator accounts; personal accounts type their handle).</span></li>
      <li><b>Sign in with X</b> <span>— click the X logo in the form, authorize in the popup, and your verified @handle fills itself in. Platform logos now show on every social field.</span></li>
      <li><b>Join date simplified</b> <span>— month + year you joined (both required); the day is gone. Cards show "🗓 Joined Mar 2023".</span></li>
      <li><b>Official API verification</b> <span>— X handles are verified through the X API and Instagram business/creator accounts through Meta's API (once keys are configured); everything else keeps the public checks.</span></li>
      <li><b>Fool-proof social links</b> <span>— handles, @handles, or any URL variant all get cleaned into the official profile link; impossible handles are rejected with specific errors, and Instagram/X handles are checked for existence where the platforms allow. Card icons always open the real profile.</span></li>
      <li><b>Globe play/pause</b> <span>— a ⏸/▶ button next to the spin controls; it tracks the real state (drops to ▶ if the speed hits zero, and throwing the globe un-pauses it).</span></li>
      <li><b>Photo, socials &amp; join date now required</b> <span>— the form collects your photo, Instagram, LinkedIn, X, and the month + day you joined the team (year optional). Cards show "🗓 Joined".</span></li>
      <li><b>Photos &amp; socials</b> <span>— add your face to your card (✏️ Edit → upload a photo) plus Instagram, LinkedIn, and X links shown as icons. No photo? You get smart initials.</span></li>
      <li><b>New font</b> <span>— the whole site now wears TASA Orbiter.</span></li>
      <li><b>Blue highlight on the globe</b> <span>— click a city or country in the breakdowns and its dot turns bright pulsing blue while the globe flies to it.</span></li>
      <li><b>Reset spin</b> <span>— one button puts the globe's speed, glide, and direction back to defaults (replaces the direction toggle — flicking sets direction now).</span></li>
      <li><b>One person, one card</b> <span>— once you own a card, the "This is me" button disappears from everyone else's (you don't have two birthdays).</span></li>
      <li><b>Flick handoff</b> <span>— throw the globe and the spin-speed slider updates to match your throw; the globe keeps spinning at that speed.</span></li>
      <li><b>Edit &amp; delete for everyone</b> <span>— every card now has Edit and Delete for its owner, and a "This is me" claim button so you're never locked out of your own entry, on any device.</span></li>
      <li><b>Globe spin controls</b> <span>— sliders for spin speed and glide plus a direction toggle on the visitor tracker, and you can now flick the globe and watch it coast.</span></li>
      <li><b>Birthday cakes</b> <span>— click anyone's card on the wall and a 🎂 floats up. No practical purpose. No regrets.</span></li>
      <li><b>Changelog page</b> <span>— this page, linked from the top of the birthday wall.</span></li>
      <li><b>Click a city or country to fly there</b> <span>— the Cities/Countries breakdowns on the visitor tracker now swing the globe to that spot when clicked.</span></li>
      <li><b>Sign × role fit notes</b> <span>— the horoscope popover now includes how each sign's commonly attributed strengths map onto that person's actual job title.</span></li>
      <li><b>City &amp; country breakdowns</b> <span>— hover the Cities or Countries stat for a full list with flags and visit counts.</span></li>
      <li><b>Real country flags</b> <span>— flag images (not emoji) next to every visitor in the feed, globe tooltips, and history popups.</span></li>
      <li><b>Location on birthday cards</b> <span>— each card shows the person's city, country, and flag.</span></li>
      <li><b>Owner-only editing</b> <span>— an "Edit my card" button appears on your own entry; ownership is recognized by edit token, submission cookie, or your network. Nobody can edit anyone else's card.</span></li>
      <li><b>Zodiac signs &amp; personality popovers</b> <span>— every card shows the person's sign; hover it for traits and dates.</span></li>
      <li><b>"Is this you?" duplicate guard</b> <span>— submitting a birthday someone already has asks whether it's you before creating a double, with an option to fix your name.</span></li>
      <li><b>Globe interactivity</b> <span>— hover any dot to see who it is; click for that person's full visit history. One dot per visitor.</span></li>
      <li><b>Time-range filter</b> <span>— view visitor stats for the last hour, day, week, month, or all time.</span></li>
      <li><b>Reliability fixes</b> <span>— duplicate entries resolved (your name is your identity), pages always load the latest version, calendar links verified as all-day yearly recurring events.</span></li>
    </ul>
  </section>
  <section class="day">
    <h2>June 11, 2026</h2>
    <p class="d-sub">Launch day</p>
    <ul>
      <li><b>Birthday tracker launched</b> <span>— submission form and a shared wall sorted by who's up next, live at this address.</span></li>
      <li><b>Google Calendar integration</b> <span>— subscribe once to the auto-updating feed (every birthday repeats yearly), or add any single person with one click.</span></li>
      <li><b>Visitor tracker</b> <span>— live feed of every site visit with exact time, IP address, and city, plus a hand-built rotating globe and stat cards.</span></li>
      <li><b>Visitor names</b> <span>— once someone adds themselves to the wall, their visits show their name; everyone else appears as an unknown visitor.</span></li>
      <li><b>Senpex / Pckup branding</b> <span>— official Pckup wordmark and favicon, IBM Plex Sans, brand red-orange (#FF5C33), solid dark hero, one company identity.</span></li>
    </ul>
  </section>
</main>
<footer>Senpex / Pckup internal tool · <a href="/">birthday wall</a> · <a href="/visitors">visitor tracker</a>
<div style="margin-top:7px;font-size:11.5px;opacity:.85">__BUILDINFO__</div></footer>
</body>
</html>`;
