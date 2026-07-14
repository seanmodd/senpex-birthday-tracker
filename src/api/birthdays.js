// The birthday wall: list, submit, edit, delete, avatars, ownership.

import { COMPANY, DAYS_IN_MONTH } from "../config.js";
import { json } from "../lib/http.js";
import { ipKey, normKey, cookieName } from "../lib/util.js";
import { normalizeAndCheckSocials } from "../auth/socials.js";
import { namesOnNetwork } from "./visits.js";

// ---------- API ----------

// Serve a person's uploaded avatar (stored as a data URL in D1).
export async function avatarImg(env, idStr) {
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

export async function listBirthdays(env, request) {
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
      "join_month, join_day, join_year, additional_roles, created_at " +
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
    try {
      r.roles = r.additional_roles ? JSON.parse(r.additional_roles) : [];
    } catch {
      r.roles = [];
    }
    delete r.additional_roles;
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

// Shared field validation for submit and edit. Returns { error, status } or
// the cleaned fields.
function parseEntry(body) {
  // `name` is the PREFERRED name — the one shown on the card and the wall.
  // Legal first/last names are mandatory but never displayed to the team.
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  const legalFirst = String(body.legal_first || "").trim().replace(/\s+/g, " ");
  const legalLast = String(body.legal_last || "").trim().replace(/\s+/g, " ");
  const position = String(body.position || "").trim().replace(/\s+/g, " ");
  const month = Number.parseInt(body.month, 10);
  const day = Number.parseInt(body.day, 10);
  const year =
    body.year === undefined || body.year === null || body.year === ""
      ? null
      : Number.parseInt(body.year, 10);

  if (!legalFirst || legalFirst.length > 60)
    return { error: "Please enter your legal first name (up to 60 characters)." };
  if (!legalLast || legalLast.length > 60)
    return { error: "Please enter your legal last name (up to 60 characters)." };
  if (!name || name.length > 100)
    return { error: "Please enter your preferred name (up to 100 characters)." };
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

  // Additional roles: 0-4, no blanks, no duplicates (case-insensitive),
  // and never a copy of the primary title.
  const rawRoles = Array.isArray(body.additional_roles) ? body.additional_roles : [];
  const roles = [];
  const seen = new Set([position.toLowerCase()]);
  for (const r of rawRoles) {
    const t = String(r || "").trim().replace(/\s+/g, " ").slice(0, 100);
    if (!t) continue;
    if (seen.has(t.toLowerCase()))
      return { error: "This role has already been added. Please select a different role." };
    seen.add(t.toLowerCase());
    roles.push(t);
  }
  if (roles.length > 4)
    return { error: "You can add at most four additional roles." };

  return { name, legalFirst, legalLast, position, month, day, year, joinMonth, joinYear, roles };
}

export async function submit(request, env) {
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
  const geoLat = cf.latitude !== undefined ? Number.parseFloat(cf.latitude) : null;
  const geoLon = cf.longitude !== undefined ? Number.parseFloat(cf.longitude) : null;
  const geoTz = cf.timezone || null;
  const entry = parseEntry(body);
  if (entry.error) return json({ error: entry.error }, 400);
  const { name, legalFirst, legalLast, position, month, day, year, joinMonth, joinYear, roles } = entry;
  const rolesJson = roles.length ? JSON.stringify(roles) : null;

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
          "additional_roles = ?20, legal_first = ?21, legal_last = ?22, " +
          "latitude = ?23, longitude = ?24, timezone = ?25, " +
          "updated_at = datetime('now') WHERE id = ?19"
      )
        .bind(
          name, name.toLowerCase(), COMPANY, position, month, day, year, ip, token,
          geoCity, geoCountry, avatar, instagram, linkedin, xHandle,
          joinMonth, null, joinYear, replaceId, rolesJson, legalFirst, legalLast,
          geoLat, geoLon, geoTz
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
      "avatar, instagram, linkedin, x_handle, join_month, join_day, join_year, additional_roles, legal_first, legal_last, " +
      "latitude, longitude, timezone) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24) " +
      "ON CONFLICT (name_key) DO UPDATE SET " +
      "name = excluded.name, company = excluded.company, position = excluded.position, " +
      "month = excluded.month, day = excluded.day, year = excluded.year, " +
      "ip = excluded.ip, edit_token = excluded.edit_token, " +
      "city = excluded.city, country = excluded.country, " +
      "avatar = excluded.avatar, instagram = excluded.instagram, linkedin = excluded.linkedin, " +
      "x_handle = excluded.x_handle, join_month = excluded.join_month, " +
      "join_day = excluded.join_day, join_year = excluded.join_year, " +
      "additional_roles = excluded.additional_roles, legal_first = excluded.legal_first, " +
      "legal_last = excluded.legal_last, latitude = excluded.latitude, " +
      "longitude = excluded.longitude, timezone = excluded.timezone, updated_at = datetime('now')"
  )
    .bind(
      name, name.toLowerCase(), COMPANY, position, month, day, year, ip, token, geoCity, geoCountry,
      avatar, instagram, linkedin, xHandle, joinMonth, null, joinYear, rolesJson, legalFirst, legalLast,
      geoLat, geoLon, geoTz
    )
    .run();

  const row = await env.DB.prepare("SELECT id FROM birthdays WHERE name_key = ?1")
    .bind(name.toLowerCase())
    .first();
  return json({ ok: true, id: row ? row.id : null, token: token });
}

// Where everyone is: dots for the team globe plus IANA timezones for the
// live local-time clocks. City-level geo only — same precision the visitor
// tracker already shows publicly.
export async function teamLocations(env) {
  const { results } = await env.DB.prepare(
    "SELECT name, position, city, country, latitude, longitude, timezone " +
      "FROM birthdays ORDER BY name"
  ).all();
  return json(results);
}

// Private prefill for the edit modal: legal names and birth year are never
// on the public list, and the weak ownership signals (cookie, network) that
// gate the edit BUTTON are spoofable — so this endpoint demands the one
// strong proof, the edit token issued to the submitting browser.
export async function myEntry(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const id = Number.parseInt(body.id, 10);
  const token = String(body.token || "");
  if (!Number.isInteger(id) || id <= 0 || !token)
    return json({ error: "Missing entry id or token." }, 400);
  const row = await env.DB.prepare(
    "SELECT edit_token, legal_first, legal_last, year FROM birthdays WHERE id = ?1"
  ).bind(id).first();
  if (!row) return json({ error: "That entry no longer exists." }, 404);
  if (!row.edit_token || row.edit_token !== token)
    return json({ error: "Not authorized." }, 403);
  return json({
    ok: true,
    legal_first: row.legal_first,
    legal_last: row.legal_last,
    year: row.year,
  });
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
export async function editEntry(request, env) {
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
  const { name, legalFirst, legalLast, position, month, day, year, joinMonth, joinYear, roles } = entry;
  const rolesJson = roles.length ? JSON.stringify(roles) : null;

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
  const geoLat = cf.latitude !== undefined ? Number.parseFloat(cf.latitude) : null;
  const geoLon = cf.longitude !== undefined ? Number.parseFloat(cf.longitude) : null;
  const geoTz = cf.timezone || null;

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
        "additional_roles = ?20, legal_first = ?21, legal_last = ?22, " +
        "latitude = ?23, longitude = ?24, timezone = ?25, " +
        "updated_at = datetime('now') WHERE id = ?19"
    )
      .bind(
        name, name.toLowerCase(), COMPANY, position, month, day, year, ip,
        newToken, cf.city || null, cf.country || null,
        avatar, instagram, linkedin, xHandle, joinMonth, null, joinYear, id, rolesJson,
        legalFirst, legalLast, geoLat, geoLon, geoTz
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
export async function deleteEntry(request, env) {
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
