// Auto-updating ICS feed of yearly-recurring birthdays.

import { COMPANY } from "../config.js";

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

export async function icsFeed(env) {
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
