// ---------- Page ----------

export const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="rgb(27, 27, 27)">
<title>Senpex / Pckup — Team Birthday Tracker</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #FF5C33;      /* Senpex red-orange */
    --brand-dark: #d94a26;
    --brand-deep: #a8391e;
    --ink: #1a1714;        /* dark dark grey, near black */
    --ink-2: #2b2620;
    --muted: #6e6862;      /* grey text */
    --bg: #f7f5f1;         /* off white */
    --card: #fffefc;
    --line: #e6e4df;       /* light grey */
    --tint: #ffece5;       /* light brand tint */
    --ok: #1f7a37;
    --err: #c22424;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "TASA Orbiter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--ink);
  }
  header {
    background: rgb(27, 27, 27);
    color: #f7f5f1;
    padding: 48px 20px 42px;
    text-align: center;
    border-bottom: 4px solid var(--brand);
    position: relative;
  }
  .gh-corner {
    position: absolute;
    top: 14px; left: 16px;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    color: #cfc9c2; border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 50%;
  }
  .gh-corner svg { width: 19px; height: 19px; fill: currentColor; display: block; }
  .gh-corner:hover { color: #fff; border-color: var(--brand); }
  .corner {
    position: absolute;
    top: 14px; right: 16px;
    display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
  }
  .tracker-link {
    color: #cfc9c2;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 999px;
    padding: 6px 13px;
  }
  .tracker-link:hover { color: #fff; border-color: var(--brand); }
  @media (max-width: 620px) {
    .corner { position: static; flex-direction: row; justify-content: center; margin-bottom: 16px; }
    header { padding-top: 22px; }
  }
  .logo {
    height: 52px; width: auto;
    display: block; margin: 0 auto 18px;
  }
  header h1 { margin: 0 0 8px; font-size: 32px; font-weight: 600; letter-spacing: -0.3px; }
  header p { margin: 0; color: #cfc9c2; font-size: 15px; }
  header p b { color: var(--brand); font-weight: 600; }
  main { max-width: 1000px; margin: 40px auto 60px; padding: 0 16px; }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: 0 6px 18px rgba(26, 23, 20, 0.06);
    padding: 22px;
  }
  .card h2 { margin: 0 0 14px; font-size: 19px; font-weight: 600; }
  form .row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
  form .field { flex: 1 1 200px; display: flex; flex-direction: column; gap: 5px; }
  form label, form .lbl {
    font-size: 12.5px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  input, select {
    font: inherit;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: #fff;
    color: var(--ink);
    width: 100%;
  }
  input:focus, select:focus { outline: 2px solid var(--brand); border-color: transparent; }
  button.primary {
    font: inherit;
    font-weight: 700;
    background: var(--brand);
    color: #fff;
    border: 0;
    border-radius: 999px;
    padding: 12px 24px;
    cursor: pointer;
  }
  button.primary:hover { background: var(--brand-dark); }
  button.primary:disabled { opacity: 0.6; cursor: wait; }
  #status { margin: 10px 0 0; font-size: 14px; font-weight: 600; display: none; }
  #status.ok { display: block; color: var(--ok); }
  #status.err { display: block; color: var(--err); }
  .wall-head { display: flex; align-items: baseline; gap: 10px; margin: 30px 4px 12px; }
  .wall-head h2 { margin: 0; font-size: 22px; font-weight: 600; }
  .wall-head span { color: var(--muted); font-size: 14px; font-weight: 500; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .grid[hidden] { display: none; }
  .today-banner {
    display: flex; align-items: center; gap: 14px;
    background: var(--tint); border: 1.5px solid var(--brand);
    border-radius: 14px; padding: 16px 20px; margin: 30px 4px 0;
  }
  .tb-emoji { font-size: 34px; line-height: 1; }
  .tb-title { font-size: 17px; font-weight: 700; color: var(--brand-deep); }
  .tb-sub { font-size: 13.5px; color: var(--brand-deep); margin-top: 2px; }
  .tb-avs { margin-left: auto; display: flex; gap: 6px; }
  .today-banner[hidden] { display: none; }
  .person { display: flex; flex-direction: column; gap: 6px; padding: 16px; }
  .person.today { outline: 2px solid var(--brand); }
  .p-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .p-name { font-weight: 700; font-size: 15px; }
  .zwrap { position: relative; cursor: pointer; padding: 10px 0 10px 10px; margin: -10px 0 -10px -10px; }
  .zbadge { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; padding: 4px 9px; border: 1px solid var(--line); border-radius: 999px; }
  .zwrap:hover .zbadge { color: var(--brand-dark); }
  .zpop {
    display: none; position: absolute; top: 100%; right: 0; z-index: 30;
    width: 272px; background: #fff; border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px; box-shadow: 0 14px 36px rgba(26, 23, 20, 0.18); text-align: left;
  }
  .zwrap:hover .zpop { display: block; }
  .zwrap.tapped .zpop { display: block; }
  .zp-title { font-weight: 700; font-size: 13.5px; margin-bottom: 2px; }
  .zp-sub { color: var(--brand-dark); font-size: 12px; font-weight: 600; margin-bottom: 6px; }
  .zp-text { color: var(--muted); font-size: 12.5px; line-height: 1.45; }
  .zp-job-title {
    margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--line);
    font-weight: 700; font-size: 12.5px; color: var(--brand-dark); margin-bottom: 3px;
  }
  .p-pos { color: var(--muted); font-size: 13px; min-height: 17px; }
  .p-loc { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12.5px; }
  .p-joined { color: var(--muted); font-size: 12.5px; }
  .p-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .av-img, .av-init {
    width: 42px; height: 42px; border-radius: 50%; flex: none;
  }
  .av-img { object-fit: cover; box-shadow: 0 0 0 2px var(--tint); }
  .av-init {
    background: var(--tint); color: var(--brand-dark);
    font-weight: 700; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
  }
  .socials { display: flex; gap: 8px; margin-top: 2px; }
  a.social {
    width: 26px; height: 26px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); border: 1px solid var(--line);
  }
  a.social:hover { color: var(--brand-dark); border-color: var(--brand); }
  a.social svg { width: 15px; height: 15px; fill: currentColor; display: block; }
  .soc-input { display: flex; align-items: center; gap: 8px; }
  .soc-input input { flex: 1; min-width: 0; }
  .soc-ico {
    width: 38px; height: 38px; flex: none;
    border: 1px solid var(--line); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: var(--ink); background: #fff;
  }
  .soc-ico svg { width: 17px; height: 17px; fill: currentColor; display: block; }
  .soc-ico.soc-click { cursor: pointer; border-color: var(--brand); color: var(--brand-dark); background: var(--tint); }
  .soc-ico.soc-click:hover { border-color: var(--brand); color: var(--brand-dark); background: var(--tint); }
  input.x-verified { border-color: var(--ok); background: #f1faf3; }
  .av-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .av-prev { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 2px var(--tint); }
  .av-row input[type="file"] { font-size: 12.5px; color: var(--muted); max-width: 260px; }
  input[type="file"]::file-selector-button {
    font: inherit; font-size: 13px; font-weight: 600;
    color: var(--brand-deep); background: var(--tint);
    border: 1px solid #ffc9b3; border-radius: 7px;
    padding: 8px 12px; margin-right: 10px; cursor: pointer;
  }
  img.flag {
    width: 16px; height: auto; border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(26, 23, 20, 0.12);
  }
  .p-when { font-size: 13.5px; color: var(--ink-2); }
  .p-when b { color: var(--brand-dark); }
  a.gcal {
    margin-top: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--brand-deep);
    text-decoration: none;
    display: inline-flex; align-items: center; min-height: 44px;
  }
  a.gcal:hover { text-decoration: underline; }
  .actions { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; align-items: center; }
  a.editbtn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--brand-dark);
    border: 1.5px solid var(--brand); border-radius: 999px;
    padding: 5px 13px; text-decoration: none;
  }
  a.editbtn:hover { background: var(--tint); }
  a.delbtn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 700; color: var(--muted);
    border: 1.5px solid var(--line); border-radius: 999px;
    padding: 5px 13px; text-decoration: none;
  }
  a.delbtn:hover { color: var(--err); border-color: var(--err); }
  a.claimlink {
    margin-top: 6px; align-self: flex-start;
    font-size: 12px; font-weight: 600; color: var(--muted);
    text-decoration: none; border-bottom: 1px dashed var(--line);
  }
  a.claimlink:hover { color: var(--brand-dark); border-bottom-color: var(--brand); }
  #bform .row:last-of-type .field { flex: 1 1 100%; }
  .claim-note {
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 8px;
    color: var(--brand-deep); font-size: 12.5px; line-height: 1.45;
    padding: 9px 11px; margin: 0 0 12px;
  }
  .person { position: relative; }
  .cake-float {
    position: absolute; font-size: 26px; pointer-events: none; z-index: 5;
    animation: cakeUp 1.3s ease-out forwards;
  }
  @keyframes cakeUp {
    0% { opacity: 0; transform: translateY(0) scale(0.7); }
    15% { opacity: 1; transform: translateY(-12px) scale(1.05); }
    100% { opacity: 0; transform: translateY(-95px) scale(1); }
  }
  .dialog .lbl {
    display: block; margin-bottom: 5px;
    font-size: 12.5px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  #eErr { color: var(--err); font-size: 13px; font-weight: 600; margin: 10px 0 0; }
  #empty { color: var(--muted); text-align: center; padding: 30px 0; }
  .subscribe { margin-top: 30px; }
  .subscribe ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
  .subscribe code {
    background: #f1efea;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12.5px;
    word-break: break-all;
    display: inline-block; max-width: 100%; margin: 2px 0;
  }
  .subscribe i { white-space: nowrap; }
  .subscribe button {
    font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink);
    border: 1px solid var(--line); background: #fff; border-radius: 7px;
    padding: 10px 16px; cursor: pointer; margin-left: 6px; vertical-align: middle;
  }
  .subscribe button:hover { border-color: var(--brand); color: var(--brand-dark); }
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(27, 27, 27, 0.55);
    backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .overlay[hidden] { display: none; }
  #fmodal { z-index: 45; }
  .dialog { animation: dlgIn 0.18s ease-out; }
  @keyframes dlgIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }
  .dialog.wide { max-width: 580px; max-height: 88vh; overflow-y: auto; }
  .hero-cta {
    margin-top: 18px;
    font: inherit; font-size: 15.5px; font-weight: 700;
    background: var(--brand); color: #fff;
    border: 0; border-radius: 999px; padding: 12px 30px;
    cursor: pointer; box-shadow: 0 6px 18px rgba(255, 92, 51, 0.35);
  }
  .hero-cta:hover { background: var(--brand-dark); }
  .dialog {
    background: var(--card); border: 1px solid var(--line); border-radius: 14px;
    padding: 22px; max-width: 480px; width: 100%; position: relative;
    box-shadow: 0 18px 50px rgba(26, 23, 20, 0.35);
  }
  .dialog h3 { margin: 0 0 8px; font-size: 18px; }
  .dlg-sub { margin: 0 0 14px; color: var(--muted); font-size: 13.5px; line-height: 1.45; }
  .dlg-x {
    position: absolute; top: 4px; right: 4px;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border: 0; background: none; font-size: 24px; color: var(--muted);
    cursor: pointer; line-height: 1; padding: 0;
  }
  .dlg-x:hover { color: var(--ink); }
  .match {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px; margin-bottom: 10px;
  }
  .match b { font-size: 14.5px; }
  .match .m-sub { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  button.mini {
    font: inherit; font-size: 13px; font-weight: 700;
    background: var(--brand); color: #fff; border: 0; border-radius: 999px;
    padding: 8px 14px; cursor: pointer; white-space: nowrap;
  }
  button.mini:hover { background: var(--brand-dark); }
  button.ghost {
    font: inherit; font-size: 13.5px; font-weight: 600;
    background: #fff; color: var(--ink);
    border: 1px solid var(--line); border-radius: 999px;
    padding: 10px 16px; cursor: pointer;
  }
  button.ghost:hover { border-color: var(--brand); color: var(--brand-dark); }
  .dlg-row { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; }
  .muted { color: var(--muted); }
  footer { text-align: center; color: var(--muted); font-size: 12.5px; padding: 0 16px 30px; }
  footer a { color: var(--brand-dark); }
  @media (max-width: 640px) {
    header { padding: 18px 14px 26px; }
    .corner { position: static; flex-direction: row; justify-content: center; margin: 0 auto 14px; }
    .gh-corner { top: 10px; left: 10px; width: 40px; height: 40px; }
    .tracker-link { padding: 10px 16px; }
    .logo { height: 40px; margin-bottom: 12px; }
    header h1 { font-size: 25px; }
    header p { font-size: 14px; }
    .hero-cta { font-size: 15px; padding: 11px 22px; margin-top: 14px; }
    main { margin: 24px auto 44px; padding: 0 13px; }
    .card { padding: 18px; }
    .wall-head { margin: 24px 2px 10px; }
    .wall-head h2 { font-size: 20px; }
    .grid { grid-template-columns: 1fr; }
    .today-banner { padding: 14px 16px; margin: 24px 2px 0; }
    .tb-title { font-size: 16px; }
    .tb-emoji { font-size: 28px; }
    .tb-avs .av-img, .tb-avs .av-init { width: 38px; height: 38px; }
    a.social { width: 38px; height: 38px; }
    a.social svg { width: 17px; height: 17px; }
    .soc-ico { width: 44px; height: 44px; }
    .soc-ico svg { width: 19px; height: 19px; }
    a.editbtn, a.delbtn { padding: 10px 17px; font-size: 13px; }
    .overlay { padding: 10px; align-items: flex-start; overflow-y: auto; }
    .dialog { padding: 18px 16px; border-radius: 14px; margin-top: 8px; }
    .dialog.wide { max-height: none; }
    #submitBtn { position: sticky; bottom: 10px; width: 100%; margin-top: 14px; box-shadow: 0 -10px 18px rgba(255, 254, 252, 0.95); }
    .subscribe code { font-size: 11.5px; }
  }
</style>
</head>
<body>
<header>
  <a class="gh-corner" href="https://github.com/seanmodd/senpex-birthday-tracker" target="_blank" rel="noopener" title="View the source on GitHub" aria-label="GitHub repository"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
  <div class="corner">
    <a class="tracker-link" href="/visitors">📡 Visitor tracker</a>
    <a class="tracker-link" href="/changelog">📋 Changelog</a>
  </div>
  <img class="logo" src="/logo.png?v=2" alt="Senpex / Pckup logo">
  <h1>Team Birthday Tracker</h1>
  <p>Add your birthday so we know the most important day in your life!</p>
  <button class="hero-cta" id="openForm" type="button">🎈 Add your birthday</button>
</header>
<main>
  <div id="todayBanner" class="today-banner" hidden></div>

  <div class="wall-head">
    <h2>Upcoming birthdays</h2>
    <span id="count"></span>
  </div>
  <p id="upEmpty" class="muted" style="margin:4px 4px 0;font-size:13.5px" hidden>No birthdays in the next 30 days.</p>
  <div id="grid" class="grid"></div>

  <div class="wall-head" id="laterHead" hidden>
    <h2>Later birthdays</h2>
    <span id="count2"></span>
  </div>
  <div id="grid2" class="grid" hidden></div>

  <p id="empty" hidden>No birthdays yet — be the first! 🎈</p>

  <section class="card subscribe">
    <h2>📅 Get these on your Google Calendar all at once</h2>
    <ol>
      <li>
        <b>All birthdays, auto-updating (recommended):</b> in Google Calendar, go to
        <i>Other calendars → + → From URL</i> and paste
        <code id="icsurl"></code><button id="copyics" type="button">Copy</button><br>
        <span class="muted">New submissions appear automatically — every birthday repeats yearly.</span>
      </li>
      <li>
        <b>One person on your own calendar:</b> click “＋ Google Calendar” on their card —
        it creates a yearly recurring event you just save.
      </li>
    </ol>
  </section>
</main>

<div id="fmodal" class="overlay" hidden>
  <div class="dialog wide" role="dialog" aria-modal="true" aria-labelledby="fTitle">
    <button class="dlg-x" id="fClose" type="button" aria-label="Close">×</button>
    <h3 id="fTitle">🎂 Add your birthday</h3>
    <p class="dlg-sub">Get yourself on the wall so the team never misses your day.</p>
    <form id="bform">
      <div class="row">
        <div class="field" style="flex:2 1 240px">
          <label for="name">Full name</label>
          <input id="name" required maxlength="100" placeholder="e.g. Alex Petrovski" autocomplete="name">
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex:2 1 240px">
          <label for="position">Position</label>
          <input id="position" required maxlength="100" placeholder="e.g. Operations Manager">
        </div>
        <div class="field" style="flex:2 1 240px">
          <label for="month">Birthday month</label>
          <select id="month" required></select>
        </div>
        <div class="field" style="flex:1 1 100px">
          <label for="day">Day</label>
          <select id="day" required></select>
        </div>
        <div class="field" style="flex:1 1 120px">
          <label for="year">Year <span style="text-transform:none">(optional)</span></label>
          <input id="year" type="number" min="1900" max="2020" placeholder="—">
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex:2 1 180px">
          <label for="jmonth">Month joined</label>
          <select id="jmonth" required></select>
        </div>
        <div class="field" style="flex:1 1 120px">
          <label for="jyear">Year joined</label>
          <input id="jyear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
        </div>
      </div>
      <div class="row">
        <div class="field">
          <span class="lbl">Your photo</span>
          <div class="av-row">
            <img id="fAvPrev" class="av-prev" alt="" hidden>
            <input id="fAvatar" type="file" accept="image/*" required>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="fIg">Instagram <span style="text-transform:none">— click the logo to sign in</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-click" data-soc="ig" data-igin="fIg" role="button" tabindex="0" title="Sign in with Instagram to verify (business/creator accounts)"></span>
            <input id="fIg" required maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
        <div class="field">
          <label for="fLi">LinkedIn</label>
          <div class="soc-input">
            <span class="soc-ico" data-soc="li"></span>
            <input id="fLi" required maxlength="200" placeholder="profile URL or handle">
          </div>
        </div>
        <div class="field">
          <label for="fX">X <span style="text-transform:none">— click the logo to sign in &amp; verify</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-x soc-click" data-soc="x" data-xin="fX" role="button" tabindex="0" title="Sign in with X to verify your handle"></span>
            <input id="fX" required maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
      </div>
      <button class="primary" id="submitBtn" type="submit">Add me to the wall 🎈</button>
      <p id="status"></p>
      <p class="muted" style="font-size:12.5px;margin:10px 0 0">
        Already on the wall? Submitting again with the same name updates your entry. Year of birth is never shown to the team.
      </p>
    </form>
  </div>
</div>

<div id="modal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">
    <button class="dlg-x" id="dlgClose" type="button" aria-label="Close">×</button>
    <div id="dlgStep1">
      <h3 id="dlgTitle">🎂 Someone already has this birthday — is this you?</h3>
      <p class="dlg-sub">If you were added before (maybe spelled a little differently), pick yourself so we update your card instead of creating a double.</p>
      <div id="dlgMatches"></div>
      <button class="ghost" id="dlgNew" type="button">No — we just share a birthday, add me</button>
    </div>
    <div id="dlgStep2" hidden>
      <h3>Update your entry</h3>
      <p class="dlg-sub">We'll update your existing card with what you just filled in. Want to fix how your name appears while you're at it?</p>
      <label class="lbl" for="dlgName" style="display:block;margin-bottom:5px">Your name</label>
      <input id="dlgName" maxlength="100" autocomplete="name">
      <div class="dlg-row">
        <button class="ghost" id="dlgBack" type="button">← Back</button>
        <button class="primary" id="dlgSave" type="button">Save my entry</button>
      </div>
    </div>
  </div>
</div>

<div id="emodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="eTitle">
    <button class="dlg-x" id="eClose" type="button" aria-label="Close">×</button>
    <h3 id="eTitle">✏️ Edit your entry</h3>
    <p class="dlg-sub">Change anything — your name, position, or the date. Only you can edit this card.</p>
    <p class="claim-note" id="claimNote" hidden>You're claiming this card as yours — after saving, you can edit or delete it from this browser. Please only claim your own entry.</p>
    <div style="margin-bottom:10px">
      <label class="lbl" for="eName">Full name</label>
      <input id="eName" maxlength="100" autocomplete="name">
    </div>
    <div style="margin-bottom:10px">
      <label class="lbl" for="ePos">Position</label>
      <input id="ePos" maxlength="100">
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:2 1 140px">
        <label class="lbl" for="eMonth">Birthday month</label>
        <select id="eMonth"></select>
      </div>
      <div style="flex:1 1 80px">
        <label class="lbl" for="eDay">Day</label>
        <select id="eDay"></select>
      </div>
      <div style="flex:1 1 100px">
        <label class="lbl" for="eYear">Year <span style="text-transform:none">(optional)</span></label>
        <input id="eYear" type="number" min="1900" max="2020" placeholder="—">
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:2 1 140px">
        <label class="lbl" for="eJMonth">Month joined</label>
        <select id="eJMonth"></select>
      </div>
      <div style="flex:1 1 110px">
        <label class="lbl" for="eJYear">Year joined</label>
        <input id="eJYear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
      </div>
    </div>
    <div style="margin-top:10px">
      <label class="lbl" for="eAvatar">Photo</label>
      <div class="av-row">
        <img id="eAvPrev" class="av-prev" alt="" hidden>
        <input id="eAvatar" type="file" accept="image/*">
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:1 1 130px">
        <label class="lbl" for="eIg">Instagram</label>
        <div class="soc-input">
          <span class="soc-ico soc-click" data-soc="ig" data-igin="eIg" role="button" tabindex="0" title="Sign in with Instagram to verify (business/creator accounts)"></span>
          <input id="eIg" maxlength="200" placeholder="@handle or sign in →">
        </div>
      </div>
      <div style="flex:1 1 130px">
        <label class="lbl" for="eLi">LinkedIn</label>
        <div class="soc-input">
          <span class="soc-ico" data-soc="li"></span>
          <input id="eLi" maxlength="200" placeholder="profile URL">
        </div>
      </div>
      <div style="flex:1 1 130px">
        <label class="lbl" for="eX">X</label>
        <div class="soc-input">
          <span class="soc-ico soc-x soc-click" data-soc="x" data-xin="eX" role="button" tabindex="0" title="Sign in with X to verify your handle"></span>
          <input id="eX" maxlength="200" placeholder="@handle or sign in →">
        </div>
      </div>
    </div>
    <p id="eErr" hidden></p>
    <div class="dlg-row">
      <button class="ghost" id="eCancel" type="button">Cancel</button>
      <button class="primary" id="eSave" type="button">Save changes</button>
    </div>
  </div>
</div>

<footer>Senpex / Pckup internal tool · data is confidential · <a href="/calendar.ics">calendar feed</a>
<div style="margin-top:7px;font-size:11.5px;color:#5f5952">__BUILDINFO__</div></footer>
<script>
(function () {
  var COMPANY = "Senpex / Pckup";
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MDAYS = [31,29,31,30,31,30,31,31,30,31,30,31];
  var allBirthdays = [];

  var monthSel = document.getElementById("month");
  var daySel = document.getElementById("day");
  for (var i = 0; i < 12; i++) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = MONTHS[i];
    monthSel.appendChild(o);
  }
  function fillDays() {
    var max = MDAYS[parseInt(monthSel.value, 10) - 1];
    var cur = parseInt(daySel.value || "1", 10);
    daySel.innerHTML = "";
    for (var d = 1; d <= max; d++) {
      var o = document.createElement("option");
      o.value = String(d);
      o.textContent = String(d);
      daySel.appendChild(o);
    }
    daySel.value = String(Math.min(cur, max));
  }
  monthSel.addEventListener("change", fillDays);
  fillDays();

  var jMonthSel = document.getElementById("jmonth");
  for (var ji = 0; ji < 12; ji++) {
    var jo = document.createElement("option");
    jo.value = String(ji + 1);
    jo.textContent = MONTHS[ji];
    jMonthSel.appendChild(jo);
  }


  // Shared client-side photo pipeline: square-crop + downscale to 192px JPEG
  // so uploads stay tiny no matter what people pick.
  function readAvatarFile(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var S = 192;
        var c = document.createElement("canvas");
        c.width = S; c.height = S;
        var cctx = c.getContext("2d");
        var m = Math.min(img.width, img.height);
        cctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
        cb(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  var formAvatarData = null;
  document.getElementById("fAvatar").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    readAvatarFile(f, function (data) {
      formAvatarData = data;
      var prev = document.getElementById("fAvPrev");
      prev.src = data;
      prev.hidden = false;
    });
  });

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function nextOccurrence(m, d) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var y = today.getFullYear();
    if (m === 2 && d === 29) {
      while (new Date(y, 1, 29).getDate() !== 29 || new Date(y, 1, 29) < today) y++;
      return new Date(y, 1, 29);
    }
    var t = new Date(y, m - 1, d);
    if (t < today) t = new Date(y + 1, m - 1, d);
    return t;
  }

  function daysUntil(m, d) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((nextOccurrence(m, d) - today) / 86400000);
  }

  // Western zodiac: sign m-1 runs until lastDay[m-1] of month m, then sign m starts.
  function zodiac(m, d) {
    var signs = [["Capricorn","♑"],["Aquarius","♒"],["Pisces","♓"],["Aries","♈"],
                 ["Taurus","♉"],["Gemini","♊"],["Cancer","♋"],["Leo","♌"],
                 ["Virgo","♍"],["Libra","♎"],["Scorpio","♏"],["Sagittarius","♐"],
                 ["Capricorn","♑"]];
    var lastDay = [19,18,20,19,20,20,22,22,22,22,21,21];
    return signs[d <= lastDay[m - 1] ? m - 1 : m];
  }

  // Hover content per sign: dates, element/ruler, and a get-to-know-them blurb.
  var ZINFO = {
    Aries: ["Mar 21 – Apr 19", "Fire sign · ruled by Mars",
      "Bold, energetic, and first to volunteer for anything. Aries hates losing slightly more than they love winning — pure drive, zero patience for slow elevators."],
    Taurus: ["Apr 20 – May 20", "Earth sign · ruled by Venus",
      "Steady, loyal, and allergic to drama. Taurus remembers every favor and every good meal — win them over with consistency (or snacks)."],
    Gemini: ["May 21 – Jun 20", "Air sign · ruled by Mercury",
      "Quick-witted and endlessly curious, Gemini can talk to anyone about anything. Forty browser tabs open, and somehow it all works."],
    Cancer: ["Jun 21 – Jul 22", "Water sign · ruled by the Moon",
      "The team's emotional radar. Cancer remembers your coffee order, your dog's name, and exactly what you said three months ago — in a good way."],
    Leo: ["Jul 23 – Aug 22", "Fire sign · ruled by the Sun",
      "Warm, generous, and born for the spotlight. A Leo's praise feels like sunshine — and yes, they noticed that you noticed their new haircut."],
    Virgo: ["Aug 23 – Sep 22", "Earth sign · ruled by Mercury",
      "The detail person. Virgo spots the typo, fixes the spreadsheet, and quietly makes everything run better. Done properly or not at all."],
    Libra: ["Sep 23 – Oct 22", "Air sign · ruled by Venus",
      "The diplomat. Libra hears every side, keeps the peace, and has impeccable taste — just don't ask them to pick a lunch spot in under ten minutes."],
    Scorpio: ["Oct 23 – Nov 21", "Water sign · ruled by Mars & Pluto",
      "Intense, perceptive, and fiercely loyal. Scorpio reads the room in seconds and keeps secrets like a bank vault."],
    Sagittarius: ["Nov 22 – Dec 21", "Fire sign · ruled by Jupiter",
      "The optimist with a passport. Sagittarius brings big ideas, bigger laughs, and an honest opinion whether you asked for it or not."],
    Capricorn: ["Dec 22 – Jan 19", "Earth sign · ruled by Saturn",
      "Ambitious and unshakeable. Capricorn climbs the mountain twice — once to plan the route, once to do it properly. Dry humor included."],
    Aquarius: ["Jan 20 – Feb 18", "Air sign · ruled by Saturn & Uranus",
      "The original thinker. Aquarius questions every rule, befriends absolutely everyone, and is already living five years in the future."],
    Pisces: ["Feb 19 – Mar 20", "Water sign · ruled by Jupiter & Neptune",
      "The imaginative soul. Pisces feels everything, dreams in color, and somehow always knows when you've had a rough day."]
  };

  // How the sign's commonly attributed strengths map onto the person's
  // actual job — {ROLE} gets replaced with their real title. Tone: factual.
  var ZJOB = {
    Aries: "Aries is traditionally associated with initiative, direct decision-making, and comfort under competitive pressure. Those traits map onto the {ROLE} role in practical ways: acting early, committing to a call, and maintaining momentum when work gets hectic.",
    Taurus: "Taurus is traditionally associated with consistency, patience, and methodical follow-through. In the {ROLE} role, that profile shows up as reliable execution, steady judgment under stress, and work that holds up over time.",
    Gemini: "Gemini is traditionally associated with verbal agility, fast context-switching, and curiosity. Applied to {ROLE} work, those translate to clear communication, quick absorption of new information, and handling several threads in parallel.",
    Cancer: "Cancer is traditionally associated with strong interpersonal perception and protective instincts. In the {ROLE} role, that reads as early detection of problems, attentiveness to team and customer needs, and sound judgment about people.",
    Leo: "Leo is traditionally associated with confidence, visibility, and high personal standards. For {ROLE} work, that profile supports clear ownership of outcomes, motivating the people around them, and holding deliverables to a consistent bar.",
    Virgo: "Virgo is traditionally associated with precision, process orientation, and quality control. Those are core competencies in {ROLE} work: catching errors early, structuring messy tasks, and improving systems incrementally.",
    Libra: "Libra is traditionally associated with balanced judgment, diplomacy, and fairness. In the {ROLE} role, that means weighing trade-offs cleanly, de-escalating conflict, and making decisions that others accept and act on.",
    Scorpio: "Scorpio is traditionally associated with sustained focus, persistence, and reading situations beneath the surface. Applied to {ROLE} work, that maps to deep problem-solving, discretion, and follow-through on difficult tasks.",
    Sagittarius: "Sagittarius is traditionally associated with big-picture thinking, candor, and adaptability. In the {ROLE} role, that supports honest assessments, openness to better approaches, and steadiness through change.",
    Capricorn: "Capricorn is traditionally associated with discipline, long-term planning, and goal persistence. Those map directly onto {ROLE} work: structured execution, realistic scoping, and finishing what gets started.",
    Aquarius: "Aquarius is traditionally associated with independent thinking and systems-level problem solving. In the {ROLE} role, that translates to productively questioning defaults and finding more efficient routes to the same result.",
    Pisces: "Pisces is traditionally associated with empathy, imagination, and pattern intuition. In {ROLE} work, that profile supports anticipating needs before they're stated, creative problem-solving, and smooth collaboration."
  };

  // Real flag image served by our own /flag/ route; hides itself if missing.
  function flagEl(country) {
    if (!country || String(country).length !== 2) return null;
    var img = document.createElement("img");
    img.className = "flag";
    img.src = "/flag/" + String(country).toLowerCase() + ".png";
    img.alt = country;
    img.onerror = function () { img.style.display = "none"; };
    return img;
  }

  function avatarEl(b) {
    if (b.has_avatar) {
      var img = document.createElement("img");
      img.className = "av-img";
      img.src = "/avatar/" + b.id;
      img.alt = b.name;
      img.onerror = function () { img.style.display = "none"; };
      return img;
    }
    var parts = b.name.split(" ");
    var init = (parts[0] ? parts[0][0] : "") + (parts[1] ? parts[1][0] : "");
    return el("div", "av-init", init.toUpperCase());
  }

  // Social profile links: handles become canonical profile URLs; full http(s)
  // URLs pass through as-is (and nothing else does).
  function socialHref(kind, val) {
    if (!val) return null;
    val = String(val).trim();
    if (val.indexOf("https://") === 0 || val.indexOf("http://") === 0) return val;
    var h = val.replace("@", "").trim();
    if (!h) return null;
    if (kind === "ig") return "https://instagram.com/" + encodeURIComponent(h);
    if (kind === "x") return "https://x.com/" + encodeURIComponent(h);
    return "https://www.linkedin.com/in/" + encodeURIComponent(h);
  }

  var SOCIAL_SVG = {
    ig: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    li: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    x: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>'
  };

  function socialLink(kind, val, label) {
    var href = socialHref(kind, val);
    if (!href) return null;
    var a = el("a", "social");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.title = label;
    a.setAttribute("aria-label", label);
    a.innerHTML = SOCIAL_SVG[kind];
    return a;
  }

  // Drop the platform logos into every social input, and make the X logo a
  // real "Sign in with X" button: popup → OAuth on x.com → the verified
  // @username comes back and fills the field.
  var socTargetInput = null;
  Array.prototype.forEach.call(document.querySelectorAll(".soc-ico[data-soc]"), function (span) {
    span.innerHTML = SOCIAL_SVG[span.getAttribute("data-soc")] || "";
    var xin = span.getAttribute("data-xin");
    var igin = span.getAttribute("data-igin");
    var targetId = xin || igin;
    if (!targetId) return;
    var startUrl = xin ? "/auth/x/start" : "/auth/ig/start";
    function openSignin() {
      socTargetInput = document.getElementById(targetId);
      window.open(startUrl, "socauth", "width=500,height=750");
    }
    span.addEventListener("click", openSignin);
    span.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openSignin(); }
    });
  });
  window.addEventListener("message", function (ev) {
    if (ev.origin !== location.origin || !ev.data) return;
    var verified = ev.data.xUsername || ev.data.igUsername;
    var failed = ev.data.xAuthError || ev.data.igAuthError;
    if (verified && socTargetInput) {
      socTargetInput.value = "@" + verified;
      socTargetInput.classList.add("x-verified");
      socTargetInput.title = "Verified via sign-in";
    } else if (failed && socTargetInput) {
      socTargetInput.classList.remove("x-verified");
      var status = document.getElementById("status");
      status.className = "err";
      status.textContent = failed;
    }
  });


  function gcalUrl(b) {
    var t = nextOccurrence(b.month, b.day);
    var e = new Date(t.getTime() + 86400000);
    var ds = "" + t.getFullYear() + pad2(t.getMonth() + 1) + pad2(t.getDate());
    var de = "" + e.getFullYear() + pad2(e.getMonth() + 1) + pad2(e.getDate());
    // Documented Google Calendar template format: all-day event (dates as
    // YYYYMMDD with exclusive end = next day) repeating yearly. recur is left
    // unencoded to match Google's own examples (recur=RRULE:FREQ=YEARLY).
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent("🎂 " + b.name + " — birthday") +
      "&dates=" + ds + "/" + de +
      "&recur=RRULE:FREQ=YEARLY" +
      "&details=" + encodeURIComponent(b.position + " at " + COMPANY + " — from the team birthday tracker");
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function render(list) {
    allBirthdays = list.slice();
    var grid = document.getElementById("grid");
    var grid2 = document.getElementById("grid2");
    var empty = document.getElementById("empty");
    var count = document.getElementById("count");
    var count2 = document.getElementById("count2");
    grid.innerHTML = "";
    grid2.innerHTML = "";
    empty.hidden = list.length > 0;
    var todays = [];
    var nUpcoming = 0, nLater = 0;

    list.sort(function (a, b) { return daysUntil(a.month, a.day) - daysUntil(b.month, b.day) || a.name.localeCompare(b.name); });

    var myTokens = getTokens();
    // One person = one birthday: once this browser owns any card, it has no
    // business claiming another.
    var ownsAny = list.some(function (x) {
      return myTokens[String(x.id)] || x.mine;
    });
    list.forEach(function (b) {
      var days = daysUntil(b.month, b.day);
      var card = el("div", "card person" + (days === 0 ? " today" : ""));
      var top = el("div", "p-top");
      var left = el("div", "p-left");
      left.appendChild(avatarEl(b));
      left.appendChild(el("div", "p-name", (days === 0 ? "🎉 " : "") + b.name));
      top.appendChild(left);
      var z = zodiac(b.month, b.day);
      var zw = el("span", "zwrap");
      zw.appendChild(el("span", "zbadge", z[1] + " " + z[0]));
      var zinfo = ZINFO[z[0]];
      if (zinfo) {
        var zp = el("div", "zpop");
        zp.appendChild(el("div", "zp-title", z[1] + " " + z[0] + " · " + zinfo[0]));
        zp.appendChild(el("div", "zp-sub", zinfo[1]));
        zp.appendChild(el("div", "zp-text", zinfo[2]));
        if (ZJOB[z[0]] && b.position) {
          zp.appendChild(el("div", "zp-job-title", "⭐ Sign × role fit"));
          zp.appendChild(el("div", "zp-text", ZJOB[z[0]].split("{ROLE}").join(b.position)));
        }
        zw.appendChild(zp);
      }
      top.appendChild(zw);
      card.appendChild(top);
      card.appendChild(el("div", "p-pos", b.position));
      if (b.city || b.country) {
        var loc = el("div", "p-loc");
        var lf = flagEl(b.country);
        if (lf) loc.appendChild(lf);
        loc.appendChild(document.createTextNode(
          (b.city ? b.city : "") + (b.city && b.country ? " · " : "") + (b.country || "")));
        card.appendChild(loc);
      }
      if (b.join_month && b.join_year) {
        card.appendChild(el("div", "p-joined",
          "🗓 Joined " + MONTHS[b.join_month - 1].slice(0, 3) + " " + b.join_year));
      }
      var when = el("div", "p-when");
      var dateStr = MONTHS[b.month - 1] + " " + b.day;
      if (days === 0) {
        when.innerHTML = dateStr + " · <b>Today! 🎂</b>";
      } else {
        when.textContent = dateStr + " · in " + days + (days === 1 ? " day" : " days");
      }
      card.appendChild(when);
      var ig = socialLink("ig", b.instagram, "Instagram");
      var li = socialLink("li", b.linkedin, "LinkedIn");
      var xx = socialLink("x", b.x_handle, "X");
      if (ig || li || xx) {
        var soc = el("div", "socials");
        if (ig) soc.appendChild(ig);
        if (li) soc.appendChild(li);
        if (xx) soc.appendChild(xx);
        card.appendChild(soc);
      }
      var a = el("a", "gcal", "＋ Google Calendar");
      a.href = gcalUrl(b);
      a.target = "_blank";
      a.rel = "noopener";
      card.appendChild(a);
      if (myTokens[String(b.id)] || b.mine) {
        var actions = el("div", "actions");
        var ed = el("a", "editbtn", "✏️ Edit");
        ed.href = "#";
        ed.addEventListener("click", function (ev) {
          ev.preventDefault();
          openEditModal(b, false);
        });
        actions.appendChild(ed);
        var del = el("a", "delbtn", "🗑 Delete");
        del.href = "#";
        del.addEventListener("click", function (ev) {
          ev.preventDefault();
          deleteEntry(b);
        });
        actions.appendChild(del);
        card.appendChild(actions);
      } else if (!ownsAny) {
        var claim = el("a", "claimlink", "🪪 This is me — let me edit it");
        claim.href = "#";
        claim.addEventListener("click", function (ev) {
          ev.preventDefault();
          openEditModal(b, true);
        });
        card.appendChild(claim);
      }
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("a, button, .zwrap, input, select")) return;
        var cake = el("span", "cake-float", "🎂");
        cake.style.right = (10 + Math.random() * 40) + "px";
        cake.style.bottom = "12px";
        card.appendChild(cake);
        cake.addEventListener("animationend", function () { cake.remove(); });
      });
      // Today's people are announced in the banner; within 30 days stays
      // under Upcoming, everything further out moves to Later.
      if (days === 0) todays.push(b);
      if (days <= 30) {
        grid.appendChild(card);
        nUpcoming++;
      } else {
        grid2.appendChild(card);
        nLater++;
      }
    });

    count.textContent = nUpcoming ? nUpcoming + (nUpcoming === 1 ? " person" : " people") : "";
    count2.textContent = nLater ? nLater + (nLater === 1 ? " person" : " people") : "";
    document.getElementById("upEmpty").hidden = !(list.length && nUpcoming === 0);
    document.getElementById("laterHead").hidden = nLater === 0;
    grid2.hidden = nLater === 0;

    var banner = document.getElementById("todayBanner");
    banner.innerHTML = "";
    if (todays.length) {
      var names = todays.map(function (b) { return b.name; });
      var nameStr = names.length === 1
        ? names[0]
        : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
      banner.appendChild(el("span", "tb-emoji", "🎂"));
      var twrap = el("div");
      twrap.appendChild(el("div", "tb-title", "Today is " + nameStr + "'s birthday!"));
      twrap.appendChild(el("div", "tb-sub",
        "Go wish " + (names.length === 1 ? "them" : "them all") + " a happy one 🎉"));
      banner.appendChild(twrap);
      var avs = el("div", "tb-avs");
      todays.forEach(function (b) { avs.appendChild(avatarEl(b)); });
      banner.appendChild(avs);
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  function load() {
    fetch("/api/birthdays")
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {});
  }

  document.getElementById("icsurl").textContent = location.origin + "/calendar.ics";
  document.getElementById("copyics").addEventListener("click", function () {
    navigator.clipboard.writeText(location.origin + "/calendar.ics").then(function () {
      var btn = document.getElementById("copyics");
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = "Copy"; }, 1500);
    });
  });

  function doSubmit(payload, replaceId) {
    var btn = document.getElementById("submitBtn");
    var status = document.getElementById("status");
    btn.disabled = true;
    status.className = "";
    var body = {
      name: payload.name, position: payload.position,
      month: payload.month, day: payload.day, year: payload.year,
      join_month: payload.join_month, join_year: payload.join_year,
      instagram: payload.instagram, linkedin: payload.linkedin, x: payload.x,
      avatar: payload.avatar
    };
    if (replaceId) body.replace_id = replaceId;
    fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          status.className = "ok";
          status.textContent = replaceId
            ? "🎉 Updated! Your entry is current."
            : "🎉 Saved! You're on the wall.";
          document.cookie = "bt_name=" + encodeURIComponent(payload.name) +
            "; path=/; max-age=31536000; SameSite=Lax";
          if (res.j.id && res.j.token) saveToken(res.j.id, res.j.token);
          load();
          setTimeout(closeFormModal, 900);
        } else {
          status.className = "err";
          status.textContent = res.j.error || "Something went wrong — try again.";
        }
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Network error — try again.";
      })
      .finally(function () { btn.disabled = false; });
  }

  // "Is this you?" popup — fires when the submitted birthday matches someone
  // already on the wall under a different name.
  var dupPayload = null, dupTarget = null;

  // NB: this code lives inside a worker template literal — regex backslashes
  // must be doubled (\\s) or they get eaten before the browser sees them.
  function normSpace(s) { return s.trim().replace(/\\s+/g, " "); }
  function normName(s) { return normSpace(s).toLowerCase(); }

  // Edit tokens: the server hands one back per successful submit; holding it
  // is what makes this browser the owner of that entry.
  function getTokens() {
    try { return JSON.parse(localStorage.getItem("bt_tokens") || "{}"); } catch (e) { return {}; }
  }
  function saveToken(id, token) {
    var t = getTokens();
    t[String(id)] = token;
    try { localStorage.setItem("bt_tokens", JSON.stringify(t)); } catch (e) {}
  }

  function openDupModal(payload, dupes) {
    dupPayload = payload;
    dupTarget = null;
    var matches = document.getElementById("dlgMatches");
    matches.innerHTML = "";
    dupes.forEach(function (b) {
      var row = el("div", "match");
      var info = el("div");
      info.appendChild(el("b", null, b.name));
      info.appendChild(el("div", "m-sub",
        (b.position ? b.position + " · " : "") + MONTHS[b.month - 1] + " " + b.day));
      var btn = el("button", "mini", "Yes, that's me");
      btn.type = "button";
      btn.addEventListener("click", function () {
        dupTarget = b;
        document.getElementById("dlgStep1").hidden = true;
        document.getElementById("dlgStep2").hidden = false;
        var ni = document.getElementById("dlgName");
        ni.value = dupPayload.name;
        ni.focus();
      });
      row.appendChild(info);
      row.appendChild(btn);
      matches.appendChild(row);
    });
    document.getElementById("dlgStep1").hidden = false;
    document.getElementById("dlgStep2").hidden = true;
    document.getElementById("modal").hidden = false;
  }

  function closeModal() { document.getElementById("modal").hidden = true; }

  document.getElementById("dlgClose").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("modal")) closeModal();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      closeModal();
      document.getElementById("emodal").hidden = true;
      document.getElementById("fmodal").hidden = true;
    }
  });
  document.getElementById("dlgNew").addEventListener("click", function () {
    var p = dupPayload;
    closeModal();
    if (p) doSubmit(p);
  });
  document.getElementById("dlgBack").addEventListener("click", function () {
    document.getElementById("dlgStep2").hidden = true;
    document.getElementById("dlgStep1").hidden = false;
  });
  document.getElementById("dlgSave").addEventListener("click", function () {
    var ni = document.getElementById("dlgName");
    var nm = normSpace(ni.value);
    if (!nm) { ni.focus(); return; }
    var p = {
      name: nm, position: dupPayload.position,
      month: dupPayload.month, day: dupPayload.day, year: dupPayload.year,
      join_month: dupPayload.join_month, join_year: dupPayload.join_year,
      instagram: dupPayload.instagram, linkedin: dupPayload.linkedin, x: dupPayload.x,
      avatar: dupPayload.avatar
    };
    var target = dupTarget;
    closeModal();
    doSubmit(p, target ? target.id : undefined);
  });

  // Owner-only edit modal. claimMode = "This is me" takeover of a card the
  // browser can't prove it owns.
  var editing = null;
  var editingClaim = false;
  var avatarData; // undefined = unchanged, "" = remove, data URL = new photo

  document.getElementById("eAvatar").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    readAvatarFile(f, function (data) {
      avatarData = data;
      var prev = document.getElementById("eAvPrev");
      prev.src = data;
      prev.hidden = false;
    });
  });

  function deleteEntry(b) {
    if (!window.confirm('Delete "' + b.name + '" from the wall? This can\\u2019t be undone.')) return;
    var status = document.getElementById("status");
    fetch("/api/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: b.id, token: getTokens()[String(b.id)] })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          status.className = "ok";
          status.textContent = "🗑 Entry deleted.";
          load();
        } else {
          status.className = "err";
          status.textContent = res.j.error || "Couldn't delete — try again.";
        }
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Network error — try again.";
      });
  }

  function fillDayOptions(sel, month, keep) {
    var max = MDAYS[month - 1];
    sel.innerHTML = "";
    for (var d = 1; d <= max; d++) {
      var o = document.createElement("option");
      o.value = String(d);
      o.textContent = String(d);
      sel.appendChild(o);
    }
    sel.value = String(Math.min(keep || 1, max));
  }

  function openEditModal(b, claimMode) {
    editing = b;
    editingClaim = claimMode === true;
    document.getElementById("claimNote").hidden = !editingClaim;
    document.getElementById("eTitle").textContent = editingClaim
      ? "🪪 Claim & edit this entry"
      : "✏️ Edit your entry";
    var em = document.getElementById("eMonth");
    var edd = document.getElementById("eDay");
    var ejm = document.getElementById("eJMonth");
    if (!em.options.length) {
      for (var i = 0; i < 12; i++) {
        var o = document.createElement("option");
        o.value = String(i + 1);
        o.textContent = MONTHS[i];
        em.appendChild(o);
        var o2 = document.createElement("option");
        o2.value = String(i + 1);
        o2.textContent = MONTHS[i];
        ejm.appendChild(o2);
      }
      em.addEventListener("change", function () {
        fillDayOptions(edd, parseInt(em.value, 10), parseInt(edd.value || "1", 10));
      });
    }
    document.getElementById("eName").value = b.name;
    document.getElementById("ePos").value = b.position || "";
    em.value = String(b.month);
    fillDayOptions(edd, b.month, b.day);
    document.getElementById("eYear").value = "";
    ejm.value = String(b.join_month || 1);
    document.getElementById("eJYear").value = b.join_year || "";
    document.getElementById("eIg").value = b.instagram || "";
    document.getElementById("eLi").value = b.linkedin || "";
    document.getElementById("eX").value = b.x_handle || "";
    avatarData = undefined;
    var prev = document.getElementById("eAvPrev");
    prev.hidden = !b.has_avatar;
    if (b.has_avatar) prev.src = "/avatar/" + b.id + "?t=" + Date.now();
    document.getElementById("eAvatar").value = "";
    document.getElementById("eErr").hidden = true;
    document.getElementById("emodal").hidden = false;
    document.getElementById("eName").focus();
  }

  function closeEditModal() { document.getElementById("emodal").hidden = true; }
  document.getElementById("eClose").addEventListener("click", closeEditModal);
  document.getElementById("eCancel").addEventListener("click", closeEditModal);
  document.getElementById("emodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("emodal")) closeEditModal();
  });

  document.getElementById("eSave").addEventListener("click", function () {
    if (!editing) return;
    var err = document.getElementById("eErr");
    var payload = {
      id: editing.id,
      token: getTokens()[String(editing.id)],
      name: normSpace(document.getElementById("eName").value),
      position: document.getElementById("ePos").value,
      month: parseInt(document.getElementById("eMonth").value, 10),
      day: parseInt(document.getElementById("eDay").value, 10),
      year: document.getElementById("eYear").value || null,
      join_month: parseInt(document.getElementById("eJMonth").value, 10),
      join_year: document.getElementById("eJYear").value || null,
      instagram: document.getElementById("eIg").value,
      linkedin: document.getElementById("eLi").value,
      x: document.getElementById("eX").value
    };
    if (avatarData !== undefined) payload.avatar = avatarData;
    if (editingClaim) payload.claim = true;
    if (!payload.name) {
      err.textContent = "Name can't be empty.";
      err.hidden = false;
      return;
    }
    var btn = this;
    btn.disabled = true;
    fetch("/api/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          closeEditModal();
          var status = document.getElementById("status");
          status.className = "ok";
          status.textContent = "✏️ Updated!";
          document.cookie = "bt_name=" + encodeURIComponent(payload.name) +
            "; path=/; max-age=31536000; SameSite=Lax";
          if (res.j.id && res.j.token) saveToken(res.j.id, res.j.token);
          load();
        } else {
          err.textContent = res.j.error || "Couldn't save — try again.";
          err.hidden = false;
        }
      })
      .catch(function () {
        err.textContent = "Network error — try again.";
        err.hidden = false;
      })
      .finally(function () { btn.disabled = false; });
  });

  // The submission form lives in a popup now.
  function openFormModal() {
    document.getElementById("fmodal").hidden = false;
    document.getElementById("name").focus();
  }
  function closeFormModal() {
    document.getElementById("fmodal").hidden = true;
  }
  document.getElementById("openForm").addEventListener("click", openFormModal);
  // Deep link: /?add=1 opens the form straight away (shareable).
  if (new URLSearchParams(location.search).has("add")) openFormModal();

  // Touch devices have no hover, so tap toggles the zodiac popovers.
  if (window.matchMedia("(hover: none)").matches) {
    document.addEventListener("click", function (ev) {
      var z = ev.target.closest(".zwrap");
      var open = document.querySelectorAll(".zwrap.tapped");
      for (var i = 0; i < open.length; i++) if (open[i] !== z) open[i].classList.remove("tapped");
      if (z) z.classList.toggle("tapped");
    });
  }
  document.getElementById("fClose").addEventListener("click", closeFormModal);
  document.getElementById("fmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("fmodal")) closeFormModal();
  });

  var form = document.getElementById("bform");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var status = document.getElementById("status");
    if (!formAvatarData) {
      status.className = "err";
      status.textContent = "📸 Please add your photo — it's required.";
      return;
    }
    var payload = {
      name: normSpace(document.getElementById("name").value),
      position: document.getElementById("position").value,
      month: parseInt(monthSel.value, 10),
      day: parseInt(daySel.value, 10),
      year: document.getElementById("year").value || null,
      join_month: parseInt(jMonthSel.value, 10),
      join_year: document.getElementById("jyear").value || null,
      instagram: document.getElementById("fIg").value,
      linkedin: document.getElementById("fLi").value,
      x: document.getElementById("fX").value,
      avatar: formAvatarData
    };
    if (!payload.name) return;
    var dupes = allBirthdays.filter(function (b) {
      return b.month === payload.month && b.day === payload.day &&
        normName(b.name) !== normName(payload.name);
    });
    if (dupes.length) { openDupModal(payload, dupes); return; }
    doSubmit(payload);
  });

  load();
})();
</script>
</body>
</html>`;
