// Visitor tracking: logging, feeds, aggregates, per-person history.

import { json } from "../lib/http.js";
import { ipKey, normKey, cookieName } from "../lib/util.js";

export async function logVisit(env, request, path) {
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

export async function listVisits(env, url) {
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
export async function personVisits(env, url) {
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

// Distinct submitted names seen in visits from this network (ipKey match).
export async function namesOnNetwork(env, reqIp) {
  if (!reqIp) return new Set();
  const pat = reqIp.indexOf(":") >= 0 ? reqIp + ":%" : reqIp;
  const { results } = await env.DB.prepare(
    "SELECT DISTINCT name FROM visits WHERE name IS NOT NULL AND (ip = ?1 OR ip LIKE ?2)"
  )
    .bind(reqIp, pat)
    .all();
  return new Set(results.map((x) => normKey(x.name)));
}
