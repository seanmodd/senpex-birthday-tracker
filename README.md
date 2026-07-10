# Senpex / Pckup — Team Birthday Tracker

Internal team tool: a birthday wall everyone fills out, with Google Calendar
sync, a live visitor tracker with an interactive globe, and a changelog.

**Live:** https://senpex-birthday-tracker.seansmodd.workers.dev

## The birthday wall

A banner celebrates whoever's birthday is *today*; the next 30 days sit under
**Upcoming**, everyone else under **Later**. Cards carry photos (or initials),
zodiac signs with personality popovers, location flags, join dates, social
links, and one-click yearly-recurring Google Calendar events. Owners get
Edit/Delete; everyone else sees a "This is me" claim button until they own a
card.

![Birthday wall](docs/screenshots/wall.png)

## The form

"🎈 Add your birthday" opens a popup — photo upload with live preview,
required socials with platform logos, and **Sign in with X / Instagram**:
click the logo, authorize in a popup, and your verified handle fills itself
in. Deep link: [`/?add=1`](https://senpex-birthday-tracker.seansmodd.workers.dev/?add=1)
opens it directly.

![Add your birthday popup](docs/screenshots/form.png)

## The visitor tracker

Every page view is logged with exact time, IP, and geolocation. The globe is
hand-rolled canvas (no JS libraries): one dot per visitor, hover for who,
click for their full visit history, flick to spin (the speed slider follows
your throw), plus play/pause and reset. Stat cards break down cities and
countries with flags — click one and the globe flies there, pulsing the dot
blue.

![Visitor tracker](docs/screenshots/visitors.png)

## The changelog

Everything shipped, batched into at most one dated entry per day, at
[`/changelog`](https://senpex-birthday-tracker.seansmodd.workers.dev/changelog).

![Changelog](docs/screenshots/changelog.png)

## Architecture

One Cloudflare Worker (wrangler bundles the modules; no separate build
step). Data lives in Cloudflare D1 (`birthday-tracker-db`) — see
[`schema.sql`](schema.sql).

```
src/
  index.js         entry point — routing only
  config.js        site-wide constants
  lib/             http + small shared helpers
  api/             birthdays (CRUD + ownership), visits, calendar feed
  auth/            Sign in with X / Instagram, social validation
  pages/           the three HTML pages (home, visitors, changelog)
  proxies/         same-origin world-map + flag proxies
  assets/          embedded brand assets (favicon, logo) + serving
```

Notable details:

- **Ownership without accounts** — edit rights resolve through four signals
  (edit token → name cookie → unique network → named visits from the
  network), with an explicit claim flow as the escape hatch.
- **Verified socials** — any handle/URL variant canonicalizes server-side;
  X handles are checked against the official X API, OAuth sign-in flows
  (`/auth/x/*`, `/auth/ig/*`) verify identity directly.
- **Same-origin everything** — world map data, country flags, and avatars are
  proxied/served by the worker itself; the pages depend on no third-party
  scripts.
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

*Screenshots show demo data, not real teammates.*

🤖 Built and maintained with [Claude Code](https://claude.com/claude-code).
