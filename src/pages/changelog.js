// ---------- Changelog page ----------
// Data-driven: every bullet carries the verified GitHub commit that shipped
// it, reconciled against the actual repository history (diffs, not commit
// messages). June's launch-week work pre-dates the repo, so those bullets
// link to the initial import. See HANDOFF.md for the reconciliation notes.

const REPO_URL = "https://github.com/seanmodd/senpex-birthday-tracker";

// Full commit hashes, named once; bullets reference them symbolically.
const C = {
  initial: "3b1968b42847e1d9afd41c563bc26564b7c1abe2", // initial import (all pre-git June work)
  banner: "d1fca1c4bfde0e35134bd181256c825ed4868d6a", // today-banner + Upcoming/Later split
  buildInfo: "82da00f828515f66da7e8497668203438cf8ba44", // build-info footer
  formPopup: "24ac9b7cb740ef96266f1899db43c4973154ca33", // form becomes a popup
  footerNote: "fb04ea52995ddc43492be7b6f18188856f9b0d3d", // footer wording refinement
  deepLink: "e3d1cb8849688751497a9d5797176e764f514ee4", // /?add=1 deep link
  ghCorner: "62b133ea4e279f124ebacfba3c309f8ed1de31a1", // GitHub corner link
  reorg: "6a8f491c75198a8fb35610236592c5060fe0836a", // module layout reorg
  policy: "0b4cbce24072ff99acb32094ddddaa5e6047746f", // five-entries-per-day policy
  mobile: "edcac2cbce8559bcd0e63b478cf1ce4f61e3f0dc", // mobile UX pass
  titles: "ba549898e3e41774796164927e97e78f98ee33fb", // job titles + roles + recommendations
  mailto: "61886f4267a4e98731ec656b040fef8f699d91f4", // email-composer recommendation flow
  ghRefs: "ad9aaedf6e6c85450b18d1f7705d2593d2c1f48b", // per-bullet GitHub commit links
  tidy: REPO_URL + "/commits/main", // consolidation + hash pills; replaced with the real hash right after that commit exists
};

// Each item: t = bold title, d = description HTML (keeps the leading em dash),
// c = primary commit hash (or a full URL for the rare non-commit reference),
// also = optional related commit hashes, label = link text override.
const DAYS = [
  {
    date: "July 11, 2026",
    sub: "Changelog tidy-up · added 4:55 PM PST",
    items: [
      { t: "One section per day", d: "— same-day releases now consolidate under a single date heading, each release keeping its own time stamp inside it.", c: C.tidy },
      { t: "Commit codes as links", d: "— every reference pill now shows the actual 7-character commit code it links to, so you can see at a glance which change shipped what.", c: C.tidy },
    ],
  },
  {
    date: "July 11, 2026",
    sub: "The changelog goes to the source · added 4:39 PM PST",
    items: [
      { t: "Changelog entries link to GitHub", d: "— every bullet on this page now carries a small GitHub link to the exact commit that shipped it, verified against the repository history. June's launch-week work links to the initial import, since it pre-dates the repo.", c: C.ghRefs },
    ],
  },
  {
    date: "July 11, 2026",
    sub: "Recommendations now go by email — from you · added 4:03 PM PST",
    items: [
      { t: "You send the recommendation yourself", d: "— \"Recommend a title\" now opens your own email app with the message already written: addressed to sean@senpex.com, subject \"New Recommended Job Title for Birthday Tracker\", with the title, intended use, explanation, and your name prefilled. You review it and hit send — the app never emails anyone on your behalf.", c: C.mailto },
      { t: "No email app? No problem", d: "— the popup always shows the full recipient, subject, and message with a Copy Email Details button, so you can paste it into webmail or anything else.", c: C.mailto },
      { t: "Leaner behind the scenes", d: "— automatic server-side email sending, the retry-email flow, and the recommendation endpoint were all removed; recommendations no longer touch the database at all.", c: C.mailto },
    ],
  },
  {
    date: "July 11, 2026",
    sub: "Job titles &amp; additional roles · added 3:04 PM PST",
    items: [
      { t: "Primary Job Title", d: "— the form's position field is now a searchable autocomplete over an approved library of 267 titles across 12 departments, with the primary title displayed prominently on every card.", c: C.titles },
      { t: "Additional Roles", d: "— add up to four optional extra roles, each removable; cards show a \"+N additional roles\" chip that opens the full Roles view. No duplicates, and the primary title can't repeat as a role.", c: C.titles },
      { t: "Search the wall", d: "— a search box finds people by name, primary title, or any additional role (primary matches rank first).", c: C.titles },
      { t: "Recommend a title", d: "— can't find the right title? Recommend one from any title field: it checks for near-duplicates, sends it to Sean for review, and you can use the pending title right away.", c: C.titles, also: ["mailto"] },
      { t: "Streamlined title hierarchy", d: "— dispatch and delivery operations use clean Specialist → Manager → Director families (say hello to \"Dispatch Fleet Specialist\").", c: C.titles },
    ],
  },
  {
    date: "July 10, 2026",
    sub: "Mobile polish — a full design review on phones · added 2:19 PM PST",
    items: [
      { t: "Comfortable to tap", d: "— every button, link, icon, and slider across all three pages now meets the 44px touch-target standard: card actions, social icons, nav pills, popup close buttons, the Copy button, footer links.", c: C.mobile },
      { t: "The globe behaves on phones", d: "— vertical swipes scroll the page instead of getting trapped spinning the globe, dots are actually tappable fingertip-size, the spin controls align into a tidy grid, and feed rows stack cleanly instead of crushing into four lines.", c: C.mobile },
      { t: "A better form popup", d: "— full-width sticky submit button that stays visible while you scroll, a 44px close target, branded photo-picker button, tidier field rows, and the clickable Instagram/X logos now look clickable.", c: C.mobile },
      { t: "Easier to find your way", d: "— the visitor tracker now links to the changelog, dates stick to the top while you scroll the changelog, and your phone's browser chrome matches the dark theme.", c: C.mobile },
      { t: "Sharper details", d: "— all buttons share the pill shape, text contrast lifted to accessibility standards in five spots, the calendar URL no longer tears mid-address, and page edges got proper breathing room.", c: C.mobile },
    ],
  },
  {
    date: "July 10, 2026",
    sub: "Wall sections, the repo, and transparency · last updated 1:02 PM PST",
    items: [
      { t: "Codebase reorganized", d: "— the single 3,500-line worker file is now a clean module layout (router, api/, auth/, pages/, lib/, proxies/, assets/) with every page byte-identical before and after.", c: C.reorg },
      { t: "The form is a popup now", d: "— \"🎈 Add your birthday\" opens a polished dialog instead of a big card at the top; the wall gets the spotlight (deep link: /?add=1 opens it directly). Also fixed an empty orange box that showed when nobody's birthday is today.", c: C.formPopup, also: ["deepLink"] },
      { t: "Today's-birthday banner", d: "— when it's someone's birthday today, a celebration banner with their photo appears at the top of the wall.", c: C.banner },
      { t: "Upcoming vs. Later birthdays", d: "— Upcoming now shows only the next 30 days; everyone further out lives under a new Later birthdays section.", c: C.banner },
      { t: "Open source on GitHub", d: "— the tracker's code is public at <a href=\"https://github.com/seanmodd/senpex-birthday-tracker\" style=\"color:var(--brand)\">github.com/seanmodd/senpex-birthday-tracker</a> (linked from the GitHub logo in the site's corner); every change ships as a commit, and all API keys live outside the repo.", c: C.ghCorner },
      { t: "Build transparency", d: "— every page footer now shows the AI model that builds this site, refreshed with each update.", c: C.buildInfo, also: ["footerNote"] },
      { t: "Daily changelog", d: "— this page logs up to five entries per release.", c: C.policy },
    ],
  },
  {
    date: "June 12, 2026",
    sub: "Visitor analytics, editing, and personality features · launch-week batch, pre-dates the daily policy",
    items: [
      { t: "Sign in with Instagram", d: "— the Instagram logo in the form now opens Instagram's login popup and fills in your verified username (business/creator accounts; personal accounts type their handle).", c: C.initial },
      { t: "Sign in with X", d: "— click the X logo in the form, authorize in the popup, and your verified @handle fills itself in. Platform logos now show on every social field.", c: C.initial },
      { t: "Join date simplified", d: "— month + year you joined (both required); the day is gone. Cards show \"🗓 Joined Mar 2023\".", c: C.initial },
      { t: "Official API verification", d: "— X handles are verified through the X API and Instagram business/creator accounts through Meta's API (once keys are configured); everything else keeps the public checks.", c: C.initial },
      { t: "Fool-proof social links", d: "— handles, @handles, or any URL variant all get cleaned into the official profile link; impossible handles are rejected with specific errors, and Instagram/X handles are checked for existence where the platforms allow. Card icons always open the real profile.", c: C.initial },
      { t: "Globe play/pause", d: "— a ⏸/▶ button next to the spin controls; it tracks the real state (drops to ▶ if the speed hits zero, and throwing the globe un-pauses it).", c: C.initial },
      { t: "Photo, socials &amp; join date now required", d: "— the form collects your photo, Instagram, LinkedIn, X, and the month + day you joined the team (year optional). Cards show \"🗓 Joined\".", c: C.initial },
      { t: "Photos &amp; socials", d: "— add your face to your card (✏️ Edit → upload a photo) plus Instagram, LinkedIn, and X links shown as icons. No photo? You get smart initials.", c: C.initial },
      { t: "New font", d: "— the whole site now wears TASA Orbiter.", c: C.initial },
      { t: "Blue highlight on the globe", d: "— click a city or country in the breakdowns and its dot turns bright pulsing blue while the globe flies to it.", c: C.initial },
      { t: "Reset spin", d: "— one button puts the globe's speed, glide, and direction back to defaults (replaces the direction toggle — flicking sets direction now).", c: C.initial },
      { t: "One person, one card", d: "— once you own a card, the \"This is me\" button disappears from everyone else's (you don't have two birthdays).", c: C.initial },
      { t: "Flick handoff", d: "— throw the globe and the spin-speed slider updates to match your throw; the globe keeps spinning at that speed.", c: C.initial },
      { t: "Edit &amp; delete for everyone", d: "— every card now has Edit and Delete for its owner, and a \"This is me\" claim button so you're never locked out of your own entry, on any device.", c: C.initial },
      { t: "Globe spin controls", d: "— sliders for spin speed and glide plus a direction toggle on the visitor tracker, and you can now flick the globe and watch it coast.", c: C.initial },
      { t: "Birthday cakes", d: "— click anyone's card on the wall and a 🎂 floats up. No practical purpose. No regrets.", c: C.initial },
      { t: "Changelog page", d: "— this page, linked from the top of the birthday wall.", c: C.initial },
      { t: "Click a city or country to fly there", d: "— the Cities/Countries breakdowns on the visitor tracker now swing the globe to that spot when clicked.", c: C.initial },
      { t: "Sign × role fit notes", d: "— the horoscope popover now includes how each sign's commonly attributed strengths map onto that person's actual job title.", c: C.initial },
      { t: "City &amp; country breakdowns", d: "— hover the Cities or Countries stat for a full list with flags and visit counts.", c: C.initial },
      { t: "Real country flags", d: "— flag images (not emoji) next to every visitor in the feed, globe tooltips, and history popups.", c: C.initial },
      { t: "Location on birthday cards", d: "— each card shows the person's city, country, and flag.", c: C.initial },
      { t: "Owner-only editing", d: "— an \"Edit my card\" button appears on your own entry; ownership is recognized by edit token, submission cookie, or your network. Nobody can edit anyone else's card.", c: C.initial },
      { t: "Zodiac signs &amp; personality popovers", d: "— every card shows the person's sign; hover it for traits and dates.", c: C.initial },
      { t: "\"Is this you?\" duplicate guard", d: "— submitting a birthday someone already has asks whether it's you before creating a double, with an option to fix your name.", c: C.initial },
      { t: "Globe interactivity", d: "— hover any dot to see who it is; click for that person's full visit history. One dot per visitor.", c: C.initial },
      { t: "Time-range filter", d: "— view visitor stats for the last hour, day, week, month, or all time.", c: C.initial },
      { t: "Reliability fixes", d: "— duplicate entries resolved (your name is your identity), pages always load the latest version, calendar links verified as all-day yearly recurring events.", c: C.initial },
    ],
  },
  {
    date: "June 11, 2026",
    sub: "Launch day",
    items: [
      { t: "Birthday tracker launched", d: "— submission form and a shared wall sorted by who's up next, live at this address.", c: C.initial },
      { t: "Google Calendar integration", d: "— subscribe once to the auto-updating feed (every birthday repeats yearly), or add any single person with one click.", c: C.initial },
      { t: "Visitor tracker", d: "— live feed of every site visit with exact time, IP address, and city, plus a hand-built rotating globe and stat cards.", c: C.initial },
      { t: "Visitor names", d: "— once someone adds themselves to the wall, their visits show their name; everyone else appears as an unknown visitor.", c: C.initial },
      { t: "Senpex / Pckup branding", d: "— official Pckup wordmark and favicon, IBM Plex Sans, brand red-orange (#FF5C33), solid dark hero, one company identity.", c: C.initial },
    ],
  },
];

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

// Bullet titles hold HTML entities (&amp;) and quotes; strip to plain text
// before embedding in an aria-label attribute.
function plainTitle(t) {
  return t.replace(/&amp;/g, "and").replace(/[\"\""]/g, "");
}

// Each pill shows the 7-character code of the commit it links to. The rare
// non-commit reference (a /commits/main placeholder that exists only until
// the follow-up commit records the real hash) is labeled "history".
function refLinks(item) {
  const isUrl = item.c.indexOf("http") === 0;
  const url = isUrl ? item.c : REPO_URL + "/commit/" + item.c;
  const label = isUrl ? "history" : item.c.slice(0, 7);
  const verb = item.c === C.initial
    ? "View the initial GitHub import for: "
    : "View the GitHub commit for: ";
  let html =
    ' <a class="gh-ref" href="' + url + '" target="_blank" rel="noopener noreferrer"' +
    ' aria-label="' + escAttr(verb + plainTitle(item.t)) + '">' + label + "</a>";
  (item.also || []).forEach(function (key) {
    const hash = C[key];
    html +=
      ' <a class="gh-ref" href="' + REPO_URL + "/commit/" + hash + '" target="_blank" rel="noopener noreferrer"' +
      ' aria-label="' + escAttr("Related GitHub commit for: " + plainTitle(item.t)) + '">' + hash.slice(0, 7) + "</a>";
  });
  return html;
}

// One section per unique date: same-day releases render inside a single
// dated section, each keeping its own time-stamped sub-line.
function renderDays() {
  const grouped = [];
  DAYS.forEach(function (batch) {
    const g = grouped.find(function (x) { return x.date === batch.date; });
    if (g) g.batches.push(batch);
    else grouped.push({ date: batch.date, batches: [batch] });
  });
  return grouped.map(function (day) {
    const inner = day.batches.map(function (batch) {
      const lis = batch.items.map(function (item) {
        return "      <li><b>" + item.t + "</b> <span>" + item.d + "</span>" + refLinks(item) + "</li>";
      }).join("\n");
      return '    <p class="d-sub">' + batch.sub + "</p>\n    <ul>\n" + lis + "\n    </ul>";
    }).join("\n");
    return (
      '  <section class="day">\n' +
      "    <h2>" + day.date + "</h2>\n" +
      inner + "\n" +
      "  </section>"
    );
  }).join("\n");
}

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
  .day ul + .d-sub { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--line); }
  .day ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 9px; }
  .day li { font-size: 14px; line-height: 1.5; }
  .day li b { color: var(--text); }
  .day li span { color: var(--muted); }
  .day li .gh-ref {
    display: inline-block; margin-left: 7px; padding: 1px 10px;
    color: var(--muted); font-size: 11px; font-weight: 600; line-height: 19px;
    text-decoration: none; border: 1px solid var(--line); border-radius: 999px;
    white-space: nowrap; vertical-align: 1px;
  }
  .day li .gh-ref:hover { color: var(--brand); border-color: var(--brand); }
  .day li .gh-ref:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
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
    .day li .gh-ref { padding: 5px 12px; line-height: 20px; }
  }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>📋 Changelog</h1>
    <p>Everything shipped to the Senpex / Pckup birthday tracker, newest first — one section per day, up to five entries per release. Times are PST.</p>
  </div>
  <div class="links">
    <a class="back" href="/">← Birthday tracker</a>
    <a class="back" href="/visitors">📡 Visitor tracker</a>
  </div>
</header>
<main>
` + renderDays() + `
</main>
<footer>Senpex / Pckup internal tool · <a href="/">birthday wall</a> · <a href="/visitors">visitor tracker</a>
<div style="margin-top:7px;font-size:12px;color:#a39d97">__BUILDINFO__</div></footer>
</body>
</html>`;
