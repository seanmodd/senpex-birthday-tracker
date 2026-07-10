// Social handle validation: canonicalization, platform rules, and
// existence checks (official APIs when keys are configured).

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

export async function normalizeAndCheckSocials(env, body) {
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
