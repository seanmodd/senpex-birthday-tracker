# Senpex / Pckup — Team Birthday Tracker

Internal team tool: a birthday wall everyone fills out, with Google Calendar
sync, a live visitor tracker with an interactive globe, and a changelog.

**Live:** https://senpex-birthday-tracker.seansmodd.workers.dev

| Page | What it is |
|------|------------|
| `/` | Birthday wall + submission form (photo, socials, join date required) |
| `/visitors` | Live visitor tracker — feed, stats, time-range filter, spinning globe |
| `/changelog` | Everything shipped, newest first |

## Architecture

One Cloudflare Worker, no build step: [`src/index.js`](src/index.js) contains
the API, the visit logging, and all three pages as template literals.
Data lives in Cloudflare D1 (`birthday-tracker-db`) — see
[`schema.sql`](schema.sql). Embedded assets ([`src/favicon.js`](src/favicon.js),
[`src/logo.js`](src/logo.js)) are base64 of the official brand files.

Highlights:

- **Birthday wall** — avatars, zodiac popovers with role-fit notes, country
  flags, owner-only edit/delete (token → cookie → network → explicit claim),
  same-birthday "is this you?" dedupe, yearly-recurring Google Calendar links
  and an auto-updating ICS feed (`/calendar.ics`).
- **Sign in with X / Instagram** — OAuth popups verify handles
  (`/auth/x/*`, `/auth/ig/*`); submitted X handles are also verified via the
  official X API server-side.
- **Visitor tracker** — every page view logged with time, IP, and geo;
  hand-rolled canvas globe (no JS libraries) with flick physics, per-visitor
  dots, and click-through visit history.
- Fonts: TASA Orbiter · brand red-orange `#FF5C33` · all pages `no-store`.

## Deploy

```bash
npx wrangler deploy
```

Secrets (set once via `npx wrangler secret put <NAME>`, never committed):
`X_BEARER_TOKEN`, `X_CLIENT_SECRET`, `IG_APP_ID`, `IG_APP_SECRET`,
optional `IG_ACCESS_TOKEN` / `IG_BUSINESS_ID`.

Apply schema changes to production D1 with
`npx wrangler d1 execute birthday-tracker-db --remote --file schema.sql`
(existing tables migrate via `ALTER TABLE`).

🤖 Built and maintained with [Claude Code](https://claude.com/claude-code).
