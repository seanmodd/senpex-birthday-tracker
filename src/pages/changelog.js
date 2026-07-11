// ---------- Changelog page ----------

export const CHANGELOG_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="rgb(27, 27, 27)">
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
  .links { display: flex; gap: 10px; flex-wrap: wrap; }
  a.back {
    color: #cfc9c2; text-decoration: none; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px;
    display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px;
    white-space: nowrap;
  }
  a.back:active { color: #fff; border-color: var(--brand); background: rgba(255, 92, 51, 0.12); }
  a.back:hover { color: #fff; border-color: var(--brand); }
  main { max-width: 760px; margin: 30px auto 60px; padding: 0 16px; }
  .day { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px 24px; margin-bottom: 18px; }
  .day h2 { margin: 0 -24px 4px; padding: 8px 24px 6px; font-size: 18px; font-weight: 700; color: var(--brand); position: sticky; top: 0; z-index: 1; background: var(--panel); }
  .day .d-sub { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
  .day ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 9px; }
  .day li { font-size: 14px; line-height: 1.5; }
  .day li b { color: var(--text); }
  .day li span { color: var(--muted); }
  footer { text-align: center; color: var(--muted); font-size: 13px; padding: 0 16px 30px; }
  footer a { color: var(--brand); display: inline-flex; align-items: center; min-height: 44px; padding: 0 8px; }
  @media (max-width: 640px) {
    header.top { padding: 20px 16px; }
    header.top h1 { font-size: 22px; }
    header.top p { font-size: 13px; }
    main { padding: 0 13px; margin: 22px auto 44px; }
    .day { padding: 18px 16px; }
    .day h2 { margin: 0 -16px 4px; padding: 8px 16px 6px; }
    .day li { font-size: 13.5px; }
  }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>📋 Changelog</h1>
    <p>Everything shipped to the Senpex / Pckup birthday tracker, newest first — up to five entries per day. Times are PST.</p>
  </div>
  <div class="links">
    <a class="back" href="/">← Birthday tracker</a>
    <a class="back" href="/visitors">📡 Visitor tracker</a>
  </div>
</header>
<main>
  <section class="day">
    <h2>July 11, 2026</h2>
    <p class="d-sub">Job titles &amp; additional roles · added 3:04 PM PST</p>
    <ul>
      <li><b>Primary Job Title</b> <span>— the form's position field is now a searchable autocomplete over an approved library of 267 titles across 12 departments, with the primary title displayed prominently on every card.</span></li>
      <li><b>Additional Roles</b> <span>— add up to four optional extra roles, each removable; cards show a "+N additional roles" chip that opens the full Roles view. No duplicates, and the primary title can't repeat as a role.</span></li>
      <li><b>Search the wall</b> <span>— a search box finds people by name, primary title, or any additional role (primary matches rank first).</span></li>
      <li><b>Recommend a title</b> <span>— can't find the right title? Recommend one from any title field: it checks for near-duplicates, saves for Sean's review, emails him, and you can use the pending title right away.</span></li>
      <li><b>Streamlined title hierarchy</b> <span>— dispatch and delivery operations use clean Specialist → Manager → Director families (say hello to "Dispatch Fleet Specialist").</span></li>
    </ul>
  </section>
  <section class="day">
    <h2>July 10, 2026</h2>
    <p class="d-sub">Mobile polish — a full design review on phones · added 2:19 PM PST</p>
    <ul>
      <li><b>Comfortable to tap</b> <span>— every button, link, icon, and slider across all three pages now meets the 44px touch-target standard: card actions, social icons, nav pills, popup close buttons, the Copy button, footer links.</span></li>
      <li><b>The globe behaves on phones</b> <span>— vertical swipes scroll the page instead of getting trapped spinning the globe, dots are actually tappable fingertip-size, the spin controls align into a tidy grid, and feed rows stack cleanly instead of crushing into four lines.</span></li>
      <li><b>A better form popup</b> <span>— full-width sticky submit button that stays visible while you scroll, a 44px close target, branded photo-picker button, tidier field rows, and the clickable Instagram/X logos now look clickable.</span></li>
      <li><b>Easier to find your way</b> <span>— the visitor tracker now links to the changelog, dates stick to the top while you scroll the changelog, and your phone's browser chrome matches the dark theme.</span></li>
      <li><b>Sharper details</b> <span>— all buttons share the pill shape, text contrast lifted to accessibility standards in five spots, the calendar URL no longer tears mid-address, and page edges got proper breathing room.</span></li>
    </ul>
  </section>
  <section class="day">
    <h2>July 10, 2026</h2>
    <p class="d-sub">Wall sections, the repo, and transparency · last updated 1:02 PM PST</p>
    <ul>
      <li><b>Codebase reorganized</b> <span>— the single 3,500-line worker file is now a clean module layout (router, api/, auth/, pages/, lib/, proxies/, assets/) with every page byte-identical before and after.</span></li>
      <li><b>The form is a popup now</b> <span>— "🎈 Add your birthday" opens a polished dialog instead of a big card at the top; the wall gets the spotlight (deep link: /?add=1 opens it directly). Also fixed an empty orange box that showed when nobody's birthday is today.</span></li>
      <li><b>Today's-birthday banner</b> <span>— when it's someone's birthday today, a celebration banner with their photo appears at the top of the wall.</span></li>
      <li><b>Upcoming vs. Later birthdays</b> <span>— Upcoming now shows only the next 30 days; everyone further out lives under a new Later birthdays section.</span></li>
      <li><b>Open source on GitHub</b> <span>— the tracker's code is public at <a href="https://github.com/seanmodd/senpex-birthday-tracker" style="color:var(--brand)">github.com/seanmodd/senpex-birthday-tracker</a> (linked from the GitHub logo in the site's corner); every change ships as a commit, and all API keys live outside the repo.</span></li>
      <li><b>Build transparency</b> <span>— every page footer now shows the AI model that builds this site, refreshed with each update.</span></li>
      <li><b>Daily changelog</b> <span>— this page logs up to five entries per day.</span></li>
    </ul>
  </section>
  <section class="day">
    <h2>June 12, 2026</h2>
    <p class="d-sub">Visitor analytics, editing, and personality features · launch-week batch, pre-dates the daily policy</p>
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
<div style="margin-top:7px;font-size:12px;color:#a39d97">__BUILDINFO__</div></footer>
</body>
</html>`;
