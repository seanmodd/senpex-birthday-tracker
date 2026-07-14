# HANDOFF — Senpex / Pckup Team Birthday Tracker

> **ADDENDUM 6 (2026-07-13, ~10:55 PM PT):** person popup + card layout per
> Sean — clicking a card (non-interactive area) opens `#pmodal`/`pvBody`
> built by `openPersonModal(b)`: avatar, name, zodiac badge, Department
> (via `deptOf()` — the title-library group of the primary title, omitted
> for pending/non-library titles), bold primary + additional roles,
> birthday/joined/location grid, socials, a Horoscope box sharing the card
> popover's content via `signInfoInto()`, and the GCal link. Cards now show
> "Department: <group>", the primary title bold, and roles listed below
> (the "+N roles" chip and its `rmodal` are REMOVED). Cakes: no longer on
> click — they bubble up from the cursor while hovering a card (spawn every
> 320ms at cursor, `hover: hover` devices only) and pause while the cursor
> is on the `.zwrap` horoscope badge/popover.
>
> **ADDENDUM 5 (2026-07-13, ~9:00 PM PT):** form restructure per Sean —
> (1) "Full name" replaced by THREE mandatory fields: legal first name,
> legal last name, and preferred name (`name` column = preferred, shown on
> cards; new nullable columns `legal_first`/`legal_last` added to prod +
> local D1 via additive ALTER TABLE — exact statements:
> `ALTER TABLE birthdays ADD COLUMN legal_first TEXT;` and
> `ALTER TABLE birthdays ADD COLUMN legal_last TEXT;` — and to schema.sql;
> these MUST run against a remote DB before deploying this code or every
> birthdays query fails on the missing columns). A "?" tooltip on
> Preferred name explains it's what the card shows. PII gating (hardened
> after adversarial review): legal names + birth year are NEVER on the
> public /api/birthdays list — the `mine` flag is spoofable (client-set
> bt_name cookie / shared-network heuristic) so it only gates UI buttons,
> not data. Edit-modal prefill comes from `POST /api/my-entry {id, token}`
> which requires the row's edit TOKEN (the one strong proof); claim-mode
> edits start with empty legal/date fields. (2) The three birthday inputs
> became ONE native
> `<input type="date">` in both modals — so a full date incl. year is
> required by the UI going forward (server still tolerates null year for
> the 5 pre-existing rows until they edit; year is never displayed).
> (3) Dashed separators (matching Additional Roles) now precede Birthday,
> Month/Year joined, and Photo in both modals. Existing rows lack legal
> names until their owner next edits (mandatory-on-next-edit pattern).
>
> **ADDENDUM 4 (2026-07-13, ~8:35 PM PT):** the tidy-up release's
> link-record commit (`3ba9733`) is now referenced as a related pill on the
> "Commit codes as links" bullet — Sean flagged that it was the one commit
> of a changelogged release with no reference. The ship pattern in
> Addendum 3 is RETIRED in favor of a cleaner one that never creates
> placeholders or unreferenced release commits: **the feature commit ships
> the product change only (no changelog edit); an immediate follow-up
> "changelog: <release>" commit adds the bullets, referencing the feature
> commit's now-known hash directly; deploy after the changelog commit.**
> Changelog-only commits are plumbing and carry no bullets of their own
> (established precedent: `6872aea`, `3ba9733`, the README-only commits) —
> this is the documented, principled exception that terminates the
> otherwise-infinite self-reference regress. Footer date advanced to
> July 13 per the every-ship rule.
>
> **ADDENDUM 3 (2026-07-11, ~5:00 PM PT):** changelog presentation refined
> per Sean: ONE section per unique date (same-day releases consolidate under
> a single date heading, each keeping its time-stamped sub-line — the
> renderer groups the `DAYS` batches by date), and every reference pill now
> shows the 7-character commit code it links to instead of a "GitHub"
> label. The former self-referential entry now links to its real commit
> (`ad9aaed`). Standing pattern for future ships: the feature commit adds
> the changelog bullet with a `/commits/main` placeholder, and an immediate
> follow-up commit records the real hash BEFORE deploying — so the live
> page always shows true per-commit links. Wording corrections required for
> accuracy: header + "Daily changelog" bullet now say "up to five entries
> per release" (the per-day phrasing became wrong once days consolidate).
>
> **ADDENDUM 2 (2026-07-11, ~4:45 PM PT):** the changelog is now
> data-driven and every bullet links to the GitHub commit that shipped it
> (`src/pages/changelog.js`: a `DAYS` array of `{t, d, c, also?, label?}`
> items rendered by `renderDays()`; hashes live once in the `C` map).
> Reconciliation method: all 53 pre-existing bullets were mapped by
> verifying actual commit DIFFS (not messages) with a 5-agent adversarial
> pass — all 53 verified, none unmappable. June 11–12 work pre-dates the
> repo, so those 33 bullets link to the initial import `3b1968b` with the
> visible label "Initial import". Multi-commit bullets carry a "+shorthash"
> related link: form-popup (+`e3d1cb8` deep link), build transparency
> (+`fb04ea5`), recommend-a-title (+`61886f4`). The new self-referential
> entry links to `/commits/main` because a commit cannot contain its own
> hash — the one documented exception. Wording of all historical bullets
> is byte-identical to before (verified programmatically). Files:
> changelog.js, README.md, this file. Shipped as
> "feat: link changelog entries to GitHub changes" immediately after this
> addendum was written; exact hash/version ID in that commit's session
> report (self-hash limitation), deployed to the same production Worker.
>
> **ADDENDUM (2026-07-11, ~4:30 PM PT, later the same day):** the
> recommendation-email pipeline this document describes was REPLACED by a
> pure client-side `mailto:` flow — the employee sends the email themselves
> from their own mail app. `src/api/recommendations.js` and
> `POST /api/recommend-title` no longer exist, nothing writes to
> `title_recommendations` (table retained, unused), and NO Cloudflare Email
> Sending setup is needed anymore. Ignore the email items in §3 (row 1),
> §10, §13 (email tests), §14 (email_status risk), and §21 (step 3); the
> rest of this document still stands.

Written 2026-07-11 ~3:15 PM PT at the end of a Claude Code session, from
verified repository/database state. Everything below was checked against
`git status`, `git log`, `wrangler secret list`, and read-only D1 queries
at write time — nothing is claimed that wasn't observed.

- **Live app:** https://senpex-birthday-tracker.seansmodd.workers.dev
- **GitHub:** https://github.com/seanmodd/senpex-birthday-tracker (public)
- **Local repo (absolute path, note the spaces):**
  `/Users/seanmodd/Documents/claude code projects/birthday-tracker`
- **Branch:** `main` (up to date with `origin/main`)
- **Git status at handoff:** clean working tree; the ONLY uncommitted file is
  this `HANDOFF.md` (untracked, deliberately not committed — Sean asked that
  nothing be committed/pushed without explicit approval)
- **Most recent commit:** `6872aea` — "Changelog: date the job-titles release
  July 11; refresh footer date" (15 commits total, all pushed)

---

## 1. Original requirements (accumulated across sessions)

Built June 11–12, 2026 (pre-git) and extended July 10–11, 2026:

1. Internal tool where employees submit name/birthday; everyone sees the
   wall; Sean can add birthdays as **yearly recurring Google Calendar
   events** (ICS feed + per-person links). Hosted publicly, one company
   identity "Senpex / Pckup".
2. Visitor tracker page: every visit logged (exact time, IP, city), globe
   visualization, live feed, time-range filter, per-visitor identification.
3. Brand: TASA Orbiter font, red-orange **#FF5C33**, near-black
   `rgb(27,27,27)` surfaces, **no gradients**, official Pckup wordmark
   (header) + square P-mark (favicon).
4. Mandatory form fields: photo, Instagram + LinkedIn + X (all three), join
   month + year. Sign-in-with-X / Instagram to verify handles. Zodiac signs
   with personality + role-fit popovers. Owner-only edit/delete with a
   "This is me" claim fallback. Today-banner; Upcoming (30 days) vs Later.
5. Changelog page (≤5 dated entries/day, times labeled PST), model
   attribution footer, GitHub link in header, mobile optimization.
6. **July 11 (latest spec):** structured job titles — one required Primary
   Job Title + up to 4 optional Additional Roles, 267-title approved
   autocomplete library (streamlined Specialist→Manager→Director families),
   card/popup display, wall search, recommend-a-title flow that stores then
   emails sean@senpex.com, idempotent, with graceful email failure.

## 2. Fully completed (verified working)

- Entire birthday wall product incl. all §1–5 above, deployed to production.
- Job-titles feature (July 11): data model, validation, autocomplete UI,
  additional-roles manager, roles chip + Roles popup, wall search with
  primary-over-role ranking, recommend-a-title modal with near-duplicate
  detection, store-first idempotent persistence, retryable email pipeline.
- Multi-agent verification (see §12) with **all 6 code-review findings
  fixed** and re-verified.
- Mobile optimization across all pages (July 10, 34 judged fixes applied).
- Repo hygiene: modular layout, README with screenshots + file-by-file
  docs, public after a full-history secret audit (clean).

## 3. Partially completed

| Item | State | Blocking step |
|---|---|---|
| **Email to sean@senpex.com** | Code complete + tested for the failure path. `env.EMAIL` binding NOT configured, so recommendations store with `email_status='Failed'` + client Retry button (spec-compliant fallback). | Sean: `npx wrangler email sending enable senpex.com` + DNS records; then add `"send_email": [{ "name": "EMAIL" }]` to `wrangler.jsonc` and deploy. From-address in code: `birthday-tracker@senpex.com`. |
| **Sign in with Instagram** | Full OAuth code deployed (`/auth/ig/*`), returns 503 "not configured". | Sean: set secrets `IG_APP_ID` + `IG_APP_SECRET` (Meta app → Instagram product → business login), register callback `https://senpex-birthday-tracker.seansmodd.workers.dev/auth/ig/callback`. Business/creator accounts only (Meta limitation). |
| **Instagram existence verification** | Business-Discovery code deployed, dormant. | Optional secret `IG_ACCESS_TOKEN` (+ optional `IG_BUSINESS_ID` override). |
| Profile-completion prompt for pre-roles entries | Edit modal enforces all mandatory fields on next edit; no proactive "confirm your title" nudge exists. | Optional UX addition. |

## 4. Not started

- Drag-and-drop reordering of additional roles (spec said "when practical";
  order IS persisted and editable by remove/re-add — verified — but there is
  no drag UI).
- Admin review UI for title recommendations (statuses exist in DB:
  Pending/Approved/Rejected/Needs Revision; no page reads them yet —
  currently reviewable via D1 queries or the future email).
- CI/auto-deploy from GitHub (offered, never requested).

## 5. Files (all tracked; tree verified via `git ls-files`)

```
.gitignore                  README.md                 HANDOFF.md (this file, UNTRACKED)
docs/screenshots/{wall,form,visitors,changelog}.png   (demo-data screenshots)
pckup-logo.svg              schema.sql                wrangler.jsonc
src/index.js                (router only)
src/config.js               (COMPANY, BUILD_NOTE footer, DAYS_IN_MONTH)
src/lib/{http,util,titles}.js
src/api/{birthdays,visits,calendar,titles,recommendations}.js
src/auth/{x,instagram,socials}.js
src/pages/{home,visitors,changelog}.js
src/proxies/{world,flags}.js
src/assets/{favicon,logo,serve}.js
```
Renames in history: `src/favicon.js → src/assets/favicon.js`,
`src/logo.js → src/assets/logo.js` (git-tracked, `R100`). Nothing deleted.
Created July 11: `src/lib/titles.js`, `src/api/titles.js`,
`src/api/recommendations.js`. Untracked/ignored: `.wrangler/` (local dev
state incl. the local D1 with demo rows), `node_modules/`.

## 6. Key implementation & architectural decisions

- **Pages are JS template literals** in `src/pages/*.js`. HARD RULES: no
  backtick characters, no `${` sequences, and client-side regex literals
  need doubled backslashes (`\\s`) or the backslash is eaten at template
  evaluation (this caused a real bug once — regex `/s+/` stripped letter
  "s" from names). Serve-time `.replace("__BUILDINFO__", BUILD_NOTE)`.
- **Ownership without accounts** (edit/delete): edit token (localStorage)
  → `bt_name` cookie → unique network (`ipKey`: IPv4 exact, IPv6 /64) →
  named visits from the network → explicit "This is me" claim (honor
  system, equivalent in power to the always-available resubmit-by-name).
- **Same-origin everything**: world map TopoJSON, country flags, avatars
  all proxied/served by the worker; zero third-party scripts (external
  `<script src>` tags don't load in Claude's preview browser).
- Name = identity: upsert keys on `name_key` alone (unique index
  `idx_birthdays_name_key`); same-birthday "is this you?" modal prevents
  spelling-variant duplicates.
- All HTML pages + JSON responses are `cache-control: no-store` (stale
  cached pages caused repeated user-facing bugs).
- Titles: primary stored in the existing `position` column (backward
  compatible); additional roles as a JSON array in `additional_roles`.
- Recommendation idempotency: client-generated UUID primary key +
  `ON CONFLICT (id) DO NOTHING`, plus an atomic email-send claim
  (`UPDATE ... SET email_status='Sending' WHERE email_status IN
  ('Pending','Failed')`) so concurrent submits can't double-email.

## 7. Database / schema (Cloudflare D1)

- DB: `birthday-tracker-db`, id `033be922-c6df-4e51-88bb-a201a9cad674`,
  account `9ed9081c1de3b687f6d0f43dca27b3f8`. Bound as `env.DB`.
- Tables (full DDL in `schema.sql`): `birthdays` (incl. `position` =
  primary title, `additional_roles` JSON, avatar data-URL, socials, join
  month/year, edit_token, ip/city/country), `visits` (geo-logged page
  views), `title_recommendations` (id PK, title, intended_use,
  explanation, employee snapshot, review_status, email_status).
- Migrations were applied via `ALTER TABLE` (remote via Cloudflare MCP,
  local via `wrangler d1 execute --local`); `schema.sql` reflects the full
  current shape for fresh installs.
- **Production data at handoff (do not delete): 5 birthday entries (real
  employees), 392 visits, 0 recommendations.**
- Local D1 (`.wrangler/`, untracked) holds fake demo people used for
  screenshots/tests.

## 8. Frontend changes (all in `src/pages/`)

Everything user-visible described in §1–2, most recently: primary-title
autocomplete (keyboard nav, match highlighting, dept tags, selected-title
exclusion, recommend-a-title footer), additional-roles list manager
(numbered rows, remove buttons, max-4 gate, duplicate messages per spec),
roles chip + Roles popup on cards, wall search box, recommendation modal
(normalization, exact/near-duplicate handling, retry-email state), plus the
July 10 mobile pass (44px tap targets, `touch-action: pan-y` globe, sticky
submit in the form popup, sticky changelog dates, theme-color, etc.).

## 9. Backend / API changes (all in `src/api/`, `src/auth/`, `src/index.js`)

Routes: `GET /`, `/visitors`, `/changelog`, `/api/birthdays`,
`/api/titles`, `/api/visits`, `/api/person-visits`, `/calendar.ics`,
`/world.json`, `/flag/{cc}.png`, `/avatar/{id}`, favicon/logo assets,
`/auth/x/start|callback`, `/auth/ig/start|callback`;
`POST /api/submit`, `/api/edit`, `/api/delete`, `/api/recommend-title`.
July 11 additions: titles endpoint, recommend-title endpoint,
roles validation in `parseEntry` (trim/collapse, blank-drop, ≤4,
case-insensitive dedupe incl. vs primary — exact spec error strings),
roles persisted through submit/upsert/replace/edit and returned as
`roles: []` from `/api/birthdays`.

## 10. Email configuration still required (see §3 table)

Cloudflare **Email Sending** (2025 product; use the local skill
`cloudflare-email-service` for details). Sean's account currently has NO
onboarded sending domain (verified: `wrangler email sending list` errors).
Steps: onboard senpex.com → DNS records → add `send_email` binding named
`EMAIL` to `wrangler.jsonc` → `npx wrangler deploy`. Code path is ready in
`src/api/recommendations.js` (`sendRecommendationEmail`). Recipient:
sean@senpex.com; subject: "New Job Title Recommendation".

## 11. Secrets / environment

Set (verified via `wrangler secret list`, values in Cloudflare only, never
in repo — full-history audit clean): `X_BEARER_TOKEN` (X API user lookup —
LIVE, verified working), `X_CLIENT_SECRET` (Sign in with X — LIVE, Sean
verified end-to-end as @persiansean). Public var in `wrangler.jsonc`:
`X_CLIENT_ID`. **Still needed:** `IG_APP_ID`, `IG_APP_SECRET` (Instagram
sign-in); optional `IG_ACCESS_TOKEN`, `IG_BUSINESS_ID` (IG verification).
Secrets are set by Sean personally via `npx wrangler secret put NAME`
(never paste values into chat; one X token was exposed once and rotated).

## 12. Tests executed and exact results

- **July 11, roles feature — 3-agent workflow (against LOCAL server only):**
  - Roles API matrix: **10/10 passed** (missing primary→400; 0/1/4
    roles ok + DB JSON verified; 5 roles→400; case-insensitive dup→400
    with exact spec message; primary-as-role→400; blanks dropped;
    edit replace/remove/reorder persisted in sent order; post-edit dup→400
    row unchanged).
  - Titles/recommendations: **8/8 passed** (267 titles/12 groups, banned
    titles absent; store-first; Pending/Failed statuses; same-id re-POST
    keeps exactly 1 row; existing-title→400; blank→400; bad id→400;
    intended_use stored).
  - Adversarial code review: 18 areas confirmed sound; **6 real findings**
    (fallback-id regex dead-end, rec-modal duplicate injection, whitespace
    dedupe bypass, stale near-match confirmation, email send race,
    misleading no-results state) — **all 6 fixed and re-verified** (fix
    verification outputs are in this session: 400 on whitespace bypass,
    200 on hex fallback id, `Failed` not `Sending` after claim flow,
    search-empty message rendering).
  - Browser UI pass (real browser): "dis"→ exactly the 3 dispatch titles;
    keyboard selection; 0 default role rows; add/remove/renumber; max-4
    gate; duplicate message; submit with 3 roles → chip "+3 additional
    roles" → Roles popup correct; search by primary, by full role, and by
    partial role all return the right person; recommendation warn→submit
    anyway→saved+Retry; pending title fills the field.
- **July 10, mobile — 9-agent design review** (4 page reviewers + cross-page
  + 4 adversarial judges): ~40 findings → 34 accepted → all implemented →
  re-verified by DOM measurement at a true 390px viewport (44px+ targets,
  `pan-y` globe, sticky dates pinned, popup sticky submit visible, zero
  horizontal overflow).
- Earlier same-session verifications (production, later cleaned up):
  X handle verification via official API (CONFIRMED/NOT FOUND worker logs),
  Sign in with X end-to-end (`x-oauth: verified @persiansean`), mandatory
  photo/socials/join-date 400s, edit-token/cookie/network/claim auth paths
  incl. 403s, GCal link format (all-day + `RRULE:FREQ=YEARLY`).

## 13. Tests skipped / not runnable

- Email delivery end-to-end (no `EMAIL` binding — impossible until domain
  onboarding; failure path IS tested).
- Instagram OAuth end-to-end (no IG secrets).
- Real-device (iOS/Android) testing — all mobile verification was desktop
  browser at 390px + headless; NOTE: macOS headless Chrome silently clamps
  width to 500px, so raw headless "mobile" screenshots are misleading.
- Concurrent email race fix verified by code inspection + status
  transitions only (needs a real EMAIL binding to exercise send-vs-send).
- Load/perf testing, cross-browser (Safari/Firefox) — never requested.

## 14. Known bugs, risks, unresolved issues

- `title_recommendations.email_status` can theoretically stick at
  `'Sending'` if the worker dies mid-send after claiming; retries only
  re-claim from Pending/Failed. Low likelihood; fix would be a stale-
  'Sending' timeout reclaim.
- "This is me" claim and resubmit-by-name are honor-system by design
  (internal tool); anyone could claim someone else's card.
- Changelog times are labeled "PST" year-round per Sean's explicit wording
  (technically PDT in summer).
- `BUILD_NOTE` (footer date) and the changelog are manually maintained —
  update `src/config.js` + `src/pages/changelog.js` with every ship.
- X users-lookup verification bills Sean's pay-per-use X app per check.
- The June 12 changelog section is a 28-bullet monolith (annotated as a
  launch-week batch; sticky dates mitigate).
- `/visitors` is public: shows visitor IPs/cities and employee names —
  accepted by Sean; a passcode was offered and declined-by-silence.
- Avatars are stored as base64 data-URLs in D1 (~12KB each) — fine at team
  scale, not for hundreds of users.

## 15. Running / unfinished processes at handoff

- `wrangler dev` (workerd) serving the LOCAL app at `http://localhost:8787`
  (started via Claude's preview tooling; safe to kill; restart with the
  `.claude/launch.json` config or `npx wrangler dev --local --port 8787`
  from the repo dir). Nothing else running; no unfinished commands.

## 16–20. Repository state (verified at write time)

- **Absolute path:** `/Users/seanmodd/Documents/claude code projects/birthday-tracker`
- **Branch:** `main`, in sync with `origin/main`
- **Status:** clean except this untracked `HANDOFF.md`
- **Uncommitted changes:** only `HANDOFF.md` (untracked)
- **Latest commit:** `6872aea` "Changelog: date the job-titles release July 11; refresh footer date"

## 21. Exact next steps for a fresh session

1. Read this file, then (same Claude account only) the memory files at
   `/Users/seanmodd/.claude/projects/-Users-seanmodd-Documents-claude-code-projects/memory/`
   (`birthday-tracker-app.md`, `senpex-brand.md`) — they encode all
   conventions, gotchas, and standing rules (commit+push every change,
   changelog ≤5 dated entries/day with PST stamps, footer date freshness,
   template-literal hazards, never test ownership flows on real employees'
   rows, screenshots must use demo data).
2. Decide whether to commit this HANDOFF.md (Sean must approve).
3. **Email:** walk Sean through `npx wrangler email sending enable
   senpex.com` + DNS; then add the `send_email` binding to
   `wrangler.jsonc`, deploy, and run one real recommendation end-to-end.
4. **Instagram:** have Sean set `IG_APP_ID`/`IG_APP_SECRET` + register the
   callback URL, then live-test `/auth/ig/start`.
5. Optional backlog: drag-reorder for additional roles; admin page for
   title recommendations; stale-'Sending' reclaim; proactive
   confirm-your-title prompt for the 5 existing entries.
6. Deploy with `npx wrangler deploy`; remote schema changes via
   `npx wrangler d1 execute birthday-tracker-db --remote --command "..."`.
   NEVER run destructive SQL against production without checking current
   rows first — real employees are on the wall.
