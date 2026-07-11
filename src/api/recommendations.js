// Job-title recommendations: stored first, then emailed to Sean for review.
// Email failures never lose the recommendation — status is tracked and the
// client can retry with the same idempotency id.

import { json } from "../lib/http.js";
import { normKey, cookieName } from "../lib/util.js";
import { APPROVED_TITLES } from "../lib/titles.js";

const REVIEWER_EMAIL = "sean@senpex.com";

export async function recommendTitle(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const id = String(body.id || "").trim().slice(0, 64);
  const title = String(body.title || "").trim().replace(/\s+/g, " ").slice(0, 120);
  const intendedUse = body.intended_use === "additional" ? "additional" : "primary";
  const explanation = String(body.explanation || "").trim().slice(0, 1000) || null;

  if (!/^[a-f0-9-]{10,64}$/i.test(id))
    return json({ error: "Missing recommendation id." }, 400);
  if (!title)
    return json({ error: "Please enter the title you want to recommend." }, 400);
  if (APPROVED_TITLES.has(title.toLowerCase()))
    return json({ error: "That title already exists in the library — just select it from the list." }, 400);

  // Identify the submitting employee via their bt_name cookie, when possible.
  const me = normKey(cookieName(request) || "");
  let emp = null;
  if (me) {
    emp = await env.DB.prepare(
      "SELECT id, name, position, additional_roles FROM birthdays WHERE name_key = ?1"
    ).bind(me).first();
  }

  // Store FIRST (idempotent on id — repeated clicks and retries can't duplicate).
  await env.DB.prepare(
    "INSERT INTO title_recommendations (id, title, intended_use, explanation, " +
      "employee_id, employee_name, current_primary, current_roles) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) " +
      "ON CONFLICT (id) DO NOTHING"
  )
    .bind(
      id, title, intendedUse, explanation,
      emp ? emp.id : null,
      emp ? emp.name : cookieName(request) || null,
      emp ? emp.position : null,
      emp ? emp.additional_roles : null
    )
    .run();

  const rec = await env.DB.prepare(
    "SELECT * FROM title_recommendations WHERE id = ?1"
  ).bind(id).first();

  // Already delivered on a previous attempt? Don't send twice.
  if (rec.email_status === "Sent")
    return json({ ok: true, id: id, emailed: true });

  // Claim the send atomically so concurrent submissions/retries with the
  // same id can't both email Sean; a claim that loses simply reports the
  // stored state.
  const claim = await env.DB.prepare(
    "UPDATE title_recommendations SET email_status = 'Sending' " +
      "WHERE id = ?1 AND email_status IN ('Pending', 'Failed')"
  ).bind(id).run();
  if (!claim.meta || claim.meta.changes !== 1) {
    const now = await env.DB.prepare(
      "SELECT email_status FROM title_recommendations WHERE id = ?1"
    ).bind(id).first();
    return json({ ok: true, id: id, emailed: now && now.email_status === "Sent" });
  }

  const sent = await sendRecommendationEmail(env, rec);
  await env.DB.prepare(
    "UPDATE title_recommendations SET email_status = ?1 WHERE id = ?2 AND email_status != 'Sent'"
  ).bind(sent.ok ? "Sent" : "Failed", id).run();

  if (!sent.ok) console.log("title-rec email failed: " + sent.reason);
  return json({ ok: true, id: id, emailed: sent.ok });
}

async function sendRecommendationEmail(env, rec) {
  if (!env.EMAIL)
    return { ok: false, reason: "send_email binding not configured (domain not onboarded to Email Sending yet)" };
  try {
    const roles = rec.current_roles ? JSON.parse(rec.current_roles).join(", ") : null;
    const lines = [
      "A new job-title recommendation was submitted on the birthday tracker.",
      "",
      "Recommended title: " + rec.title,
      "Intended as: " + (rec.intended_use === "additional" ? "Additional Role" : "Primary Job Title"),
      "Explanation: " + (rec.explanation || "(none provided)"),
      "",
      "Submitted by: " + (rec.employee_name || "(not identified)"),
      "Current primary job title: " + (rec.current_primary || "(none on file)"),
      "Current additional roles: " + (roles || "(none)"),
      "Submitted at: " + rec.submitted_at + " UTC",
      "Recommendation ID: " + rec.id,
    ];
    await env.EMAIL.send({
      to: REVIEWER_EMAIL,
      from: { email: "birthday-tracker@senpex.com", name: "Senpex Birthday Tracker" },
      subject: "New Job Title Recommendation",
      text: lines.join("\n"),
      html: "<p>" + lines.map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("<br>") + "</p>",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String((e && e.message) || e) };
  }
}
