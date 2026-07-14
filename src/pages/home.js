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
    margin-top: 7px;
    font-weight: 700; font-size: 12.5px; color: var(--brand-dark); margin-bottom: 3px;
  }
  .zp-fit-hl {
    background: var(--tint); color: var(--brand-deep); font-weight: 600;
    padding: 1px 3px; border-radius: 4px;
    -webkit-box-decoration-break: clone; box-decoration-break: clone;
  }
  .zp-more { margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--line); }
  .p-dept {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.4px; color: var(--brand-dark); margin-bottom: 1px;
  }
  .p-pos { color: var(--muted); font-size: 13px; min-height: 17px; }
  .p-pos b { color: var(--ink); font-weight: 700; font-size: 13.5px; }
  .p-roles {
    list-style: none; margin: 3px 0 0; padding: 0;
    color: var(--muted); font-size: 12.5px; line-height: 1.5;
  }
  .req-badge {
    display: inline-block; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.4px;
    color: #fff; background: var(--brand); border-radius: 999px;
    padding: 2px 8px; margin-left: 6px; vertical-align: 1px;
  }
  .hint { font-size: 12px; color: var(--muted); margin-top: 4px; text-transform: none; letter-spacing: 0; font-weight: 500; }
  .ac-wrap { position: relative; }
  .ac-drop {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 60;
    background: #fff; border: 1px solid var(--line); border-radius: 10px;
    box-shadow: 0 14px 36px rgba(26, 23, 20, 0.16);
    max-height: 240px; overflow-y: auto; padding: 4px;
  }
  .ac-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 10px; border-radius: 7px; font-size: 14px; cursor: pointer;
  }
  .ac-item b { color: var(--brand-deep); }
  .ac-item.sel, .ac-item:hover { background: var(--tint); }
  .ac-dept { font-size: 10.5px; color: var(--muted); white-space: nowrap; flex: none; }
  .ac-rec {
    display: block; width: 100%; text-align: left; font: inherit;
    font-size: 12.5px; font-weight: 600; color: var(--brand-deep);
    background: none; border: 0; border-top: 1px solid var(--line);
    padding: 11px 10px 7px; margin-top: 4px; cursor: pointer;
  }
  .ac-rec:hover { text-decoration: underline; }
  .roles-sec { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line); }
  .sep-top { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line); }
  .tip-wrap { position: relative; display: inline-block; }
  button.tip {
    width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--line);
    background: #fff; color: var(--muted); font-size: 11px; font-weight: 700;
    line-height: 1; cursor: help; padding: 0; margin-left: 3px; vertical-align: -2px;
    position: relative;
  }
  /* Invisible halo extends the tap target to the 44px standard. */
  button.tip::after { content: ""; position: absolute; inset: -13px; border-radius: 50%; }
  button.tip:hover { color: var(--brand-deep); border-color: var(--brand); }
  button.tip:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; }
  .tip-pop {
    position: absolute; left: -10px; top: calc(100% + 8px); width: 240px;
    background: rgb(27, 27, 27); color: #f0eeec; font-size: 12px; font-weight: 400;
    line-height: 1.5; padding: 10px 12px; border-radius: 9px; z-index: 60;
    display: none; text-transform: none; letter-spacing: normal;
  }
  button.tip:hover + .tip-pop, button.tip:focus + .tip-pop { display: block; }
  .role-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .role-num { font-size: 11px; font-weight: 700; color: var(--muted); flex: none; width: 44px; }
  .role-row .ac-wrap { flex: 1; min-width: 0; }
  .role-x {
    flex: none; width: 40px; height: 40px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; color: var(--muted); background: #fff;
    border: 1px solid var(--line); cursor: pointer;
  }
  .role-x:hover { color: var(--err); border-color: var(--err); }
  .role-err { color: var(--err); font-size: 12px; font-weight: 600; margin-top: 5px; }
  .p-created {
    position: absolute; right: 14px; bottom: 10px;
    font-size: 12px; color: var(--muted);
  }
  .soc-note {
    margin: 2px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--brand-deep);
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 9px;
    padding: 9px 12px; text-transform: none; letter-spacing: normal; font-weight: 400;
  }
  .team-globe {
    display: flex; gap: 22px; align-items: center; flex-wrap: wrap;
    background: var(--card); border: 1px solid var(--line); border-radius: 14px;
    box-shadow: 0 6px 18px rgba(26, 23, 20, 0.06);
    padding: 18px 22px; margin: 26px 4px 0;
  }
  .tg-canvas { flex: 0 1 300px; min-width: 220px; margin: 0 auto; position: relative; }
  .tg-canvas canvas {
    width: 100%; height: auto; display: block;
    touch-action: pan-y; cursor: grab; border-radius: 50%;
  }
  #tgtip {
    position: absolute; z-index: 25; pointer-events: none;
    background: #fff; border: 1px solid var(--line); border-radius: 10px;
    box-shadow: 0 12px 30px rgba(26, 23, 20, 0.18);
    padding: 9px 12px; font-size: 12.5px; line-height: 1.5; max-width: 210px;
  }
  #tgtip .tt-name { font-weight: 700; font-size: 13px; }
  #tgtip .tt-role { color: var(--brand-dark); font-weight: 600; font-size: 12px; }
  #tgtip .tt-loc { color: var(--muted); }
  #tgtip .tg-time { display: block; margin-left: 0; }
  #tgReset {
    position: absolute; top: 4px; right: 4px; z-index: 26;
    font-size: 12px; padding: 7px 12px; min-height: 34px;
  }
  .tg-side { flex: 1 1 280px; min-width: 250px; }
  .tg-title { margin: 0 0 4px; font-size: 17px; }
  .tg-sub { margin: 0 0 6px; color: var(--muted); font-size: 13px; }
  .tg-hq {
    margin: 0 0 10px; font-size: 12px; line-height: 1.45; color: var(--brand-deep);
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 8px; padding: 6px 10px;
  }
  .tg-row {
    display: flex; align-items: baseline; gap: 8px; padding: 7px 0;
    border-top: 1px dashed var(--line); font-size: 13.5px; flex-wrap: wrap;
  }
  .tg-row:first-child { border-top: 0; }
  .tg-loc { color: var(--muted); font-size: 12.5px; }
  .tg-time {
    margin-left: auto; color: var(--brand-dark); font-weight: 600;
    font-size: 12.5px; font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .wall-search { margin: 26px 4px 0; }
  .wall-search input {
    font: inherit; font-size: 14.5px; width: 100%;
    padding: 12px 14px; border: 1px solid var(--line); border-radius: 999px;
    background: #fff; color: var(--ink);
  }
  .wall-search input:focus { outline: 2px solid var(--brand); border-color: transparent; }
  /* Person popup: everything about one teammate, opened by clicking their card. */
  #pmodal .dialog { max-width: 480px; }
  .pv-head { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
  .pv-head .av-img, .pv-head .av-init { width: 64px; height: 64px; border-radius: 50%; }
  .pv-head .av-init { display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .pv-name { font-size: 20px; font-weight: 700; }
  .pv-zbadge {
    display: inline-block; margin-top: 3px; font-size: 12.5px; font-weight: 600;
    color: var(--brand-deep); background: var(--tint);
    border: 1px solid #ffc9b3; border-radius: 999px; padding: 3px 10px;
  }
  .pv-sec {
    margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line);
  }
  .pv-sec .lbl { display: block; margin-bottom: 5px; }
  .pv-dept { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--brand-dark); }
  .pv-primary { font-size: 15.5px; font-weight: 700; margin: 2px 0; }
  .pv-roles { list-style: none; margin: 2px 0 0; padding: 0; color: var(--muted); font-size: 13.5px; line-height: 1.6; }
  .pv-grid { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; font-size: 13.5px; }
  .pv-grid .k { color: var(--muted); font-weight: 600; white-space: nowrap; }
  .pv-zbox {
    margin-top: 8px; padding: 12px 14px; border: 1px solid var(--line);
    border-radius: 10px; background: var(--bg);
  }
  .pv-socials { display: flex; gap: 8px; }
  .pv-soc-note { margin: 0 0 9px; color: var(--muted); font-size: 12.5px; line-height: 1.5; }
  #recmodal { z-index: 55; }
  .rec-note { font-size: 12.5px; color: var(--muted); margin-top: 8px; line-height: 1.45; }
  .rec-warn {
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 8px;
    color: var(--brand-deep); font-size: 13px; padding: 10px 12px; margin-top: 10px;
  }
  .rec-ok { color: var(--ok); font-size: 13.5px; font-weight: 600; margin-top: 10px; }
  .rec-fallback {
    margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line);
    border-radius: 9px; background: #fff; font-size: 13px;
  }
  .rec-fallback .fb-hint { margin: 0 0 8px; color: var(--muted); font-size: 12.5px; line-height: 1.45; }
  .rec-fallback .fb-row { margin-bottom: 6px; overflow-wrap: anywhere; }
  .rec-fallback .fb-lbl {
    display: inline-block; min-width: 62px; font-weight: 700;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);
  }
  .rec-fallback pre {
    font: inherit; white-space: pre-wrap; overflow-wrap: anywhere;
    margin: 4px 0 0; padding: 8px 10px; border: 1px solid var(--line);
    border-radius: 8px; background: var(--bg);
  }
  .rec-fallback .fb-copy { margin-top: 8px; min-height: 44px; }
  textarea {
    font: inherit; padding: 10px 12px; border: 1px solid var(--line);
    border-radius: 9px; background: #fff; color: var(--ink); width: 100%;
    min-height: 70px; resize: vertical;
  }
  textarea:focus { outline: 2px solid var(--brand); border-color: transparent; }
  .radio-row { display: flex; gap: 14px; margin-top: 6px; font-size: 13.5px; flex-wrap: wrap; }
  .radio-row label { display: flex; align-items: center; gap: 6px; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--ink); font-size: 13.5px; cursor: pointer; }
  .radio-row input { width: auto; accent-color: var(--brand); }
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
  img.flag { width: 16px; height: auto; border-radius: 2px; }
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
  #bform .row:last-of-type .field, #eform .row:last-of-type .field { flex: 1 1 100%; }
  .claim-note {
    background: var(--tint); border: 1px solid #ffc9b3; border-radius: 8px;
    color: var(--brand-deep); font-size: 12.5px; line-height: 1.45;
    padding: 9px 11px; margin: 0 0 12px;
  }
  .person { position: relative; cursor: pointer; }
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
    max-height: 88vh; overflow-y: auto;
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
    .dialog { padding: 18px 16px; border-radius: 14px; margin-top: 8px; max-height: none; overflow-y: visible; }
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

  <div class="team-globe">
    <div class="tg-canvas">
      <canvas id="tglobe" width="440" height="440" role="img" aria-label="Interactive globe showing where every teammate is in the world — drag to spin, click a marker to zoom in"></canvas>
      <div id="tgtip" hidden></div>
      <button id="tgReset" class="ghost" type="button" hidden>⤾ Reset view</button>
    </div>
    <div class="tg-side">
      <h3 class="tg-title">🌍 One team, all around the world</h3>
      <p class="tg-sub">Where everyone is right now — and their local date &amp; time at this very moment.</p>
      <p class="tg-hq">🏢 Team HQ is on <b>(UTC-08:00) Pacific Time (US &amp; Canada)</b> — compare everyone's local time against that.</p>
      <div id="tgList"></div>
    </div>
  </div>
  <div class="wall-search">
    <input id="wallSearch" type="search" placeholder="🔍 Search people or roles…" autocomplete="off" aria-label="Search people or roles">
  </div>

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
  <p id="searchEmpty" class="muted" style="text-align:center;padding:26px 0" hidden>No people or roles match your search.</p>

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
        <div class="field" style="flex:1 1 150px">
          <label for="legalFirst">Legal first name</label>
          <input id="legalFirst" required maxlength="60" placeholder="e.g. Alexander" autocomplete="given-name">
        </div>
        <div class="field" style="flex:1 1 150px">
          <label for="legalLast">Legal last name</label>
          <input id="legalLast" required maxlength="60" placeholder="e.g. Petrovski" autocomplete="family-name">
        </div>
        <div class="field" style="flex:1 1 100%">
          <label for="name">Preferred name<span class="tip-wrap"><button type="button" class="tip" aria-describedby="prefTipPop">?</button><span class="tip-pop" role="tooltip" id="prefTipPop">Your preferred name is what appears on your birthday card and everywhere on the wall. Your legal first and last name are kept for company records and are never displayed to the team.</span></span></label>
          <input id="name" required maxlength="100" placeholder="e.g. Alex Petrovski" autocomplete="nickname">
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex:1 1 100%">
          <label for="position">Primary Job Title <span class="req-badge">Primary</span></label>
          <div class="ac-wrap">
            <input id="position" required maxlength="100" placeholder="Start typing your job title…" autocomplete="off">
          </div>
          <span class="hint">Select the title that best represents your main role at the company.</span>
        </div>
        <div class="field roles-sec" style="flex:1 1 100%">
          <span class="lbl">Additional Roles <span style="text-transform:none">(optional)</span></span>
          <div id="fRolesList"></div>
          <div class="role-err" id="fRolesErr" hidden></div>
          <button class="ghost" type="button" id="fAddRole" style="margin-top:10px">＋ Add Additional Role</button>
          <p class="hint" id="fRolesHint">Add up to four other roles or responsibilities you hold within the company.</p>
          <p class="hint" id="fRolesMax" hidden>Maximum of four additional roles reached.</p>
        </div>
      </div>
      <div class="row sep-top">
        <div class="field" style="flex:1 1 100%">
          <label for="bdate">Birthday</label>
          <input id="bdate" type="date" required min="1900-01-01" max="2020-12-31">
          <span class="hint">Pick the month, day, and year in one go — the year is never shown to the team.</span>
        </div>
      </div>
      <div class="row sep-top">
        <div class="field" style="flex:2 1 180px">
          <label for="jmonth">Month joined</label>
          <select id="jmonth" required></select>
        </div>
        <div class="field" style="flex:1 1 120px">
          <label for="jyear">Year joined</label>
          <input id="jyear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
        </div>
      </div>
      <div class="row sep-top">
        <div class="field">
          <span class="lbl">Your photo</span>
          <div class="av-row">
            <img id="fAvPrev" class="av-prev" alt="" hidden>
            <input id="fAvatar" type="file" accept="image/*" required>
          </div>
        </div>
      </div>
      <div class="row sep-top" style="margin-bottom:4px">
        <div class="field" style="flex:1 1 100%">
          <span class="lbl">Your socials<span class="tip-wrap"><button type="button" class="tip" aria-describedby="socTipPop">?</button><span class="tip-pop" role="tooltip" id="socTipPop">The Instagram, LinkedIn, and X "sign in" buttons aren't connected yet — the official sign-in API isn't live yet while we finish the integration. For now, just type your handle (like @yourname) or paste your profile URL and it will be verified the standard way.</span></span></span>
          <p class="soc-note">🌍 Why all three? Our team lives all around the world — sharing your socials helps teammates put a face to the name, cheer you on from afar, and keep our community and culture close across every timezone.<br><br>🚧 <b>Under construction:</b> the Instagram / LinkedIn / X sign-in API isn't live yet while we finish the official integration — for now, please just type your handle or paste your profile URL.</p>
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

<div id="pmodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-label="About this teammate">
    <button class="dlg-x" id="pClose" type="button" aria-label="Close">×</button>
    <div id="pvBody"></div>
  </div>
</div>

<div id="recmodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="recTitle">
    <button class="dlg-x" id="recClose" type="button" aria-label="Close">×</button>
    <h3 id="recTitle">💡 Recommend a title</h3>
    <p class="dlg-sub">Suggest a job title for the approved library. You send it to Sean by email, and he reviews every recommendation.</p>
    <div style="margin-bottom:10px">
      <label class="lbl" for="recName">Recommended job title</label>
      <input id="recName" maxlength="120" placeholder="e.g. Dispatch Fleet Manager">
    </div>
    <div style="margin-bottom:10px">
      <label class="lbl" for="recWhy">Why this title? <span style="text-transform:none">(optional)</span></label>
      <textarea id="recWhy" maxlength="1000" placeholder="What does this role cover?"></textarea>
    </div>
    <div>
      <span class="lbl">Intended use</span>
      <div class="radio-row">
        <label><input type="radio" name="recUse" value="primary"> Primary Job Title</label>
        <label><input type="radio" name="recUse" value="additional"> Additional Role</label>
      </div>
    </div>
    <div class="rec-warn" id="recWarn" hidden></div>
    <p class="rec-ok" id="recOk" hidden></p>
    <div class="rec-fallback" id="recFallback" hidden>
      <p class="fb-hint">If your email app didn't open, copy the details below and send them from any email account:</p>
      <div class="fb-row"><span class="fb-lbl">To</span><span id="fbTo">sean@senpex.com</span></div>
      <div class="fb-row"><span class="fb-lbl">Subject</span><span id="fbSubject"></span></div>
      <div class="fb-row"><span class="fb-lbl">Body</span><pre id="fbBody"></pre></div>
      <button class="ghost fb-copy" id="fbCopy" type="button">Copy Email Details</button>
    </div>
    <p class="role-err" id="recErr" hidden></p>
    <div class="dlg-row">
      <button class="ghost" id="recCancel" type="button">Cancel</button>
      <button class="primary" id="recSubmit" type="button">Open Email to Send Recommendation</button>
    </div>
  </div>
</div>

<div id="emodal" class="overlay" hidden>
  <div class="dialog wide" role="dialog" aria-modal="true" aria-labelledby="eTitle">
    <button class="dlg-x" id="eClose" type="button" aria-label="Close">×</button>
    <h3 id="eTitle">✏️ Edit your entry</h3>
    <p class="dlg-sub">Change anything — your name, position, or the date. Only you can edit this card.</p>
    <p class="claim-note" id="claimNote" hidden>Anyone can edit any card right now. If this is a teammate's card, be kind — changes show on the wall immediately, and their private details (legal name, birth year) stay protected either way.</p>
    <form id="eform">
      <div class="row">
        <div class="field" style="flex:1 1 150px">
          <label for="eLegalFirst">Legal first name</label>
          <input id="eLegalFirst" maxlength="60" autocomplete="given-name">
        </div>
        <div class="field" style="flex:1 1 150px">
          <label for="eLegalLast">Legal last name</label>
          <input id="eLegalLast" maxlength="60" autocomplete="family-name">
        </div>
        <div class="field" style="flex:1 1 100%">
          <label for="eName">Preferred name<span class="tip-wrap"><button type="button" class="tip" aria-describedby="ePrefTipPop">?</button><span class="tip-pop" role="tooltip" id="ePrefTipPop">Your preferred name is what appears on your birthday card and everywhere on the wall. Your legal first and last name are kept for company records and are never displayed to the team.</span></span></label>
          <input id="eName" maxlength="100" autocomplete="nickname">
        </div>
      </div>
      <div class="row">
        <div class="field" style="flex:1 1 100%">
          <label for="ePos">Primary Job Title <span class="req-badge">Primary</span></label>
          <div class="ac-wrap">
            <input id="ePos" maxlength="100" placeholder="Start typing your job title…" autocomplete="off">
          </div>
          <span class="hint">Select the title that best represents your main role at the company.</span>
        </div>
        <div class="field roles-sec" style="flex:1 1 100%">
          <span class="lbl">Additional Roles <span style="text-transform:none">(optional)</span></span>
          <div id="eRolesList"></div>
          <div class="role-err" id="eRolesErr" hidden></div>
          <button class="ghost" type="button" id="eAddRole" style="margin-top:10px">＋ Add Additional Role</button>
          <p class="hint" id="eRolesMax" hidden>Maximum of four additional roles reached.</p>
        </div>
      </div>
      <div class="row sep-top">
        <div class="field" style="flex:1 1 100%">
          <label for="eBdate">Birthday</label>
          <input id="eBdate" type="date" min="1900-01-01" max="2020-12-31">
          <span class="hint">Pick the month, day, and year in one go — the year is never shown to the team.</span>
        </div>
      </div>
      <div class="row sep-top">
        <div class="field" style="flex:2 1 180px">
          <label for="eJMonth">Month joined</label>
          <select id="eJMonth"></select>
        </div>
        <div class="field" style="flex:1 1 120px">
          <label for="eJYear">Year joined</label>
          <input id="eJYear" type="number" required min="1990" max="2030" placeholder="e.g. 2023">
        </div>
      </div>
      <div class="row sep-top">
        <div class="field">
          <span class="lbl">Photo</span>
          <div class="av-row">
            <img id="eAvPrev" class="av-prev" alt="" hidden>
            <input id="eAvatar" type="file" accept="image/*">
          </div>
        </div>
      </div>
      <div class="row sep-top" style="margin-bottom:4px">
        <div class="field" style="flex:1 1 100%">
          <span class="lbl">Socials<span class="tip-wrap"><button type="button" class="tip" aria-describedby="eSocTipPop">?</button><span class="tip-pop" role="tooltip" id="eSocTipPop">The Instagram, LinkedIn, and X "sign in" buttons aren't connected yet — the official sign-in API isn't live yet while we finish the integration. For now, just type your handle (like @yourname) or paste your profile URL and it will be verified the standard way.</span></span></span>
          <p class="soc-note">🚧 <b>Under construction:</b> Instagram / LinkedIn / X sign-in API isn't live yet — just type your handle or paste your profile URL.</p>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label for="eIg">Instagram <span style="text-transform:none">— click the logo to sign in</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-click" data-soc="ig" data-igin="eIg" role="button" tabindex="0" title="Sign in with Instagram to verify (business/creator accounts)"></span>
            <input id="eIg" maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
        <div class="field">
          <label for="eLi">LinkedIn</label>
          <div class="soc-input">
            <span class="soc-ico" data-soc="li"></span>
            <input id="eLi" maxlength="200" placeholder="profile URL or handle">
          </div>
        </div>
        <div class="field">
          <label for="eX">X <span style="text-transform:none">— click the logo to sign in &amp; verify</span></label>
          <div class="soc-input">
            <span class="soc-ico soc-x soc-click" data-soc="x" data-xin="eX" role="button" tabindex="0" title="Sign in with X to verify your handle"></span>
            <input id="eX" maxlength="200" placeholder="@handle, URL, or sign in →">
          </div>
        </div>
      </div>
    </form>
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
  var allBirthdays = [];

  // The birthday is one native date input (month, day, and year in one go);
  // the API still takes the three parts, split out of the YYYY-MM-DD value.
  function splitDateInput(value) {
    return {
      year: parseInt(value.slice(0, 4), 10),
      month: parseInt(value.slice(5, 7), 10),
      day: parseInt(value.slice(8, 10), 10)
    };
  }

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

  // Fills a container with a sign's reading — shared by the card hover
  // popover and the person popup. Order: the ⭐ Sign × role fit leads (with
  // its second sentence — the "why they're perfect for the job" part —
  // highlighted), then the element/ruler line and personality blurb.
  function signInfoInto(box, z, position) {
    var zinfo = ZINFO[z[0]];
    if (!zinfo) return false;
    box.appendChild(el("div", "zp-title", z[1] + " " + z[0] + " · " + zinfo[0]));
    if (ZJOB[z[0]] && position) {
      box.appendChild(el("div", "zp-job-title", "⭐ Sign × role fit"));
      var fit = ZJOB[z[0]].split("{ROLE}").join(position);
      var cut = fit.indexOf(". ");
      var fitEl = el("div", "zp-text");
      if (cut > 0) {
        fitEl.appendChild(document.createTextNode(fit.slice(0, cut + 2)));
        fitEl.appendChild(el("mark", "zp-fit-hl", fit.slice(cut + 2)));
      } else {
        fitEl.textContent = fit;
      }
      box.appendChild(fitEl);
    }
    var more = el("div", "zp-more");
    more.appendChild(el("div", "zp-sub", zinfo[1]));
    more.appendChild(el("div", "zp-text", zinfo[2]));
    box.appendChild(more);
    return true;
  }

  // Department = the approved-library group of the person's primary title
  // (null for pending recommended titles that aren't in the library yet).
  function deptOf(title) {
    if (!title) return null;
    var tl = title.toLowerCase();
    for (var i = 0; i < TITLES.length; i++) {
      if (TITLES[i].tl === tl) return TITLES[i].d;
    }
    return null;
  }

  function render(list) {
    var grid = document.getElementById("grid");
    var grid2 = document.getElementById("grid2");
    var empty = document.getElementById("empty");
    var count = document.getElementById("count");
    var count2 = document.getElementById("count2");
    grid.innerHTML = "";
    grid2.innerHTML = "";
    var searching = normSpace(wallQuery || "") !== "";
    empty.hidden = list.length > 0 || searching;
    document.getElementById("searchEmpty").hidden = !(searching && list.length === 0);
    var todays = [];
    var nUpcoming = 0, nLater = 0;

    list.sort(function (a, b) {
      return (a.__rank || 0) - (b.__rank || 0) ||
        daysUntil(a.month, a.day) - daysUntil(b.month, b.day) ||
        a.name.localeCompare(b.name);
    });

    var myTokens = getTokens();
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
      var zp = el("div", "zpop");
      if (signInfoInto(zp, z, b.position)) zw.appendChild(zp);
      top.appendChild(zw);
      card.appendChild(top);
      var dept = deptOf(b.position);
      if (dept) card.appendChild(el("div", "p-dept", "Department: " + dept));
      var pos = el("div", "p-pos");
      pos.appendChild(el("b", null, b.position));
      card.appendChild(pos);
      if (b.roles && b.roles.length) {
        var rl = el("ul", "p-roles");
        b.roles.forEach(function (r) { rl.appendChild(el("li", null, "• " + r)); });
        card.appendChild(rl);
      }
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
      if (b.created_at) {
        var cd = String(b.created_at).slice(0, 10).split("-");
        if (cd.length === 3) {
          card.appendChild(el("div", "p-created",
            "Created: " + cd[1] + "/" + cd[2] + "/" + cd[0].slice(2)));
        }
      }
      // Open editing (for now): every card shows Edit for everyone. Your own
      // card edits directly; someone else's opens through the claim path, so
      // the mandatory fields are re-entered honestly and tokens stay sane.
      // Delete remains owner-only.
      var isMine = !!(myTokens[String(b.id)] || b.mine);
      var actions = el("div", "actions");
      var ed = el("a", "editbtn", "✏️ Edit");
      ed.href = "#";
      ed.addEventListener("click", function (ev) {
        ev.preventDefault();
        openEditModal(b, !isMine);
      });
      actions.appendChild(ed);
      if (isMine) {
        var del = el("a", "delbtn", "🗑 Delete");
        del.href = "#";
        del.addEventListener("click", function (ev) {
          ev.preventDefault();
          deleteEntry(b);
        });
        actions.appendChild(del);
      }
      card.appendChild(actions);
      // Click anywhere non-interactive on the card → the person popup.
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("a, button, .zwrap, input, select")) return;
        openPersonModal(b);
      });
      // Hover cakes: 🎂 bubbles up from wherever the cursor is on the card,
      // pausing while the cursor rests on the horoscope badge/popover.
      if (window.matchMedia("(hover: hover)").matches) {
        var cakeTimer = null, cakeX = 0, cakeY = 0, cakePaused = false;
        function spawnCake() {
          if (cakePaused) return;
          var cake = el("span", "cake-float", "🎂");
          cake.style.left = (cakeX - 13) + "px";
          cake.style.top = (cakeY - 30) + "px";
          card.appendChild(cake);
          cake.addEventListener("animationend", function () { cake.remove(); });
        }
        card.addEventListener("mousemove", function (ev) {
          var r = card.getBoundingClientRect();
          cakeX = ev.clientX - r.left;
          cakeY = ev.clientY - r.top;
          cakePaused = !!(ev.target.closest && ev.target.closest(".zwrap"));
        });
        card.addEventListener("mouseenter", function (ev) {
          var r = card.getBoundingClientRect();
          cakeX = ev.clientX - r.left;
          cakeY = ev.clientY - r.top;
          cakePaused = !!(ev.target.closest && ev.target.closest(".zwrap"));
          spawnCake();
          if (cakeTimer) clearInterval(cakeTimer);
          cakeTimer = setInterval(spawnCake, 320);
        });
        card.addEventListener("mouseleave", function () {
          if (cakeTimer) { clearInterval(cakeTimer); cakeTimer = null; }
          cakePaused = false;
        });
      }
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
      .then(function (list) {
        allBirthdays = list;
        renderWall();
      })
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
      name: payload.name, legal_first: payload.legal_first, legal_last: payload.legal_last,
      position: payload.position,
      month: payload.month, day: payload.day, year: payload.year,
      join_month: payload.join_month, join_year: payload.join_year,
      instagram: payload.instagram, linkedin: payload.linkedin, x: payload.x,
      avatar: payload.avatar,
      additional_roles: payload.additional_roles || []
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
      document.getElementById("pmodal").hidden = true;
      document.getElementById("recmodal").hidden = true;
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
      name: nm, legal_first: dupPayload.legal_first, legal_last: dupPayload.legal_last,
      position: dupPayload.position,
      month: dupPayload.month, day: dupPayload.day, year: dupPayload.year,
      join_month: dupPayload.join_month, join_year: dupPayload.join_year,
      instagram: dupPayload.instagram, linkedin: dupPayload.linkedin, x: dupPayload.x,
      avatar: dupPayload.avatar,
      additional_roles: dupPayload.additional_roles || []
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

  var editRoles = setupRoles("eRolesList", "eAddRole", "eRolesMax", "eRolesErr", document.getElementById("ePos"));
  attachTitleAutocomplete(document.getElementById("ePos"), {
    intendedUse: "primary",
    getExcluded: function () { return editRoles.getRoles(); }
  });

  function openEditModal(b, claimMode) {
    editing = b;
    editingClaim = claimMode === true;
    document.getElementById("claimNote").hidden = !editingClaim;
    document.getElementById("eTitle").textContent = editingClaim
      ? "✏️ Edit this card"
      : "✏️ Edit your entry";
    var ejm = document.getElementById("eJMonth");
    if (!ejm.options.length) {
      for (var i = 0; i < 12; i++) {
        var o2 = document.createElement("option");
        o2.value = String(i + 1);
        o2.textContent = MONTHS[i];
        ejm.appendChild(o2);
      }
    }
    document.getElementById("eName").value = b.name;
    document.getElementById("ePos").value = b.position || "";
    editRoles.setRoles(b.roles || []);
    // Legal names and birth year are never on the public list. They prefill
    // only via /api/my-entry, which demands this browser's edit token — the
    // one ownership proof that can't be spoofed. Without it (e.g. a "This is
    // me" claim) the fields start empty and are re-entered on save.
    document.getElementById("eLegalFirst").value = "";
    document.getElementById("eLegalLast").value = "";
    document.getElementById("eBdate").value = "";
    var myToken = getTokens()[String(b.id)];
    if (myToken) {
      fetch("/api/my-entry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: b.id, token: myToken })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || !j.ok || editing !== b) return;
          document.getElementById("eLegalFirst").value = j.legal_first || "";
          document.getElementById("eLegalLast").value = j.legal_last || "";
          if (j.year) {
            document.getElementById("eBdate").value =
              j.year + "-" + ("0" + b.month).slice(-2) + "-" + ("0" + b.day).slice(-2);
          }
        })
        .catch(function () {});
    }
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

  // The edit fields live in a real <form> (so they share the add form's
  // layout CSS) — swallow implicit Enter-submits; saving goes through eSave.
  document.getElementById("eform").addEventListener("submit", function (ev) {
    ev.preventDefault();
  });
  document.getElementById("eSave").addEventListener("click", function () {
    if (!editing) return;
    var err = document.getElementById("eErr");
    var bdateVal = document.getElementById("eBdate").value;
    // No date picked (it only prefills for the card's owner): keep the
    // card's current month/day and let the server keep its stored year.
    var bd = bdateVal
      ? splitDateInput(bdateVal)
      : { month: editing.month, day: editing.day, year: null };
    var payload = {
      id: editing.id,
      token: getTokens()[String(editing.id)],
      name: normSpace(document.getElementById("eName").value),
      legal_first: normSpace(document.getElementById("eLegalFirst").value),
      legal_last: normSpace(document.getElementById("eLegalLast").value),
      position: document.getElementById("ePos").value,
      month: bd.month,
      day: bd.day,
      year: bd.year,
      join_month: parseInt(document.getElementById("eJMonth").value, 10),
      join_year: document.getElementById("eJYear").value || null,
      instagram: document.getElementById("eIg").value,
      linkedin: document.getElementById("eLi").value,
      x: document.getElementById("eX").value,
      additional_roles: editRoles.getRoles()
    };
    if (avatarData !== undefined) payload.avatar = avatarData;
    // Legal names may stay blank on an edit — the server keeps what's stored.
    if (!payload.name) {
      err.textContent = "Preferred name can't be empty.";
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
          // The server returns a token only to the owner/claimer — an open
          // edit of someone else's card must not rebrand this browser.
          if (res.j.id && res.j.token) {
            document.cookie = "bt_name=" + encodeURIComponent(payload.name) +
              "; path=/; max-age=31536000; SameSite=Lax";
            saveToken(res.j.id, res.j.token);
          }
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

  // ----- Job titles: approved library, autocomplete, additional roles -----
  var TITLE_GROUPS = [];
  var TITLES = []; // [{ t: title, tl: lowercase, d: dept }]
  fetch("/api/titles")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      TITLE_GROUPS = d.groups || [];
      TITLE_GROUPS.forEach(function (g) {
        g.titles.forEach(function (t) {
          TITLES.push({ t: t, tl: t.toLowerCase(), d: g.dept });
        });
      });
      // Cards may have rendered before the library arrived — re-render so
      // the Department line (looked up from TITLES) can appear.
      if (allBirthdays.length) renderWall();
    })
    .catch(function () {});

  var ACRONYMS = { "ai": "AI", "qa": "QA", "it": "IT", "ios": "iOS", "api": "API",
    "ux": "UX", "ui": "UI", "mlops": "MLOps", "devops": "DevOps", "seo": "SEO",
    "sem": "SEM", "hr": "HR", "of": "of", "and": "and", "the": "the" };
  function titleCase(str) {
    return normSpace(str).split(" ").map(function (w, i) {
      var key = w.toLowerCase();
      if (ACRONYMS[key]) return (i === 0 && (key === "of" || key === "and" || key === "the"))
        ? key.charAt(0).toUpperCase() + key.slice(1) : ACRONYMS[key];
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }

  function titleMatches(q) {
    var ql = q.toLowerCase();
    var starts = [], words = [], subs = [];
    TITLES.forEach(function (x) {
      if (x.tl.indexOf(ql) === 0) starts.push(x);
      else if (x.tl.split(" ").some(function (w) { return w.indexOf(ql) === 0; })) words.push(x);
      else if (x.tl.indexOf(ql) >= 0) subs.push(x);
    });
    return starts.concat(words, subs);
  }

  // Searchable autocomplete with keyboard navigation, match highlighting,
  // dept tags, already-selected exclusion, and a recommend-a-title footer.
  function attachTitleAutocomplete(input, opts) {
    var wrap = input.parentElement; // .ac-wrap
    var drop = null, items = [], sel = -1;
    function close() { if (drop) { drop.remove(); drop = null; items = []; sel = -1; } }
    function pick(title) {
      input.value = title;
      close();
      if (opts.onPick) opts.onPick(title);
    }
    function render() {
      close();
      var q = normSpace(input.value);
      if (!q) return;
      var excluded = (opts.getExcluded ? opts.getExcluded() : []).map(function (x) { return x.toLowerCase(); });
      var list = titleMatches(q).filter(function (x) { return excluded.indexOf(x.tl) === -1; }).slice(0, 8);
      drop = el("div", "ac-drop");
      var ql = q.toLowerCase();
      list.forEach(function (x) {
        var row = el("div", "ac-item");
        var name = el("span");
        var at = x.tl.indexOf(ql);
        if (at >= 0) {
          name.appendChild(document.createTextNode(x.t.slice(0, at)));
          name.appendChild(el("b", null, x.t.slice(at, at + q.length)));
          name.appendChild(document.createTextNode(x.t.slice(at + q.length)));
        } else {
          name.textContent = x.t;
        }
        row.appendChild(name);
        row.appendChild(el("span", "ac-dept", x.d));
        row.addEventListener("mousedown", function (ev) { ev.preventDefault(); pick(x.t); });
        drop.appendChild(row);
        items.push({ row: row, title: x.t });
      });
      var recBtn = el("button", "ac-rec", "Can't find the right title? Recommend a title");
      recBtn.type = "button";
      recBtn.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
        close();
        openRecModal(input, opts.intendedUse, input.value);
      });
      drop.appendChild(recBtn);
      wrap.appendChild(drop);
    }
    function move(delta) {
      if (!items.length) return;
      if (sel >= 0) items[sel].row.classList.remove("sel");
      sel = (sel + delta + items.length) % items.length;
      items[sel].row.classList.add("sel");
      items[sel].row.scrollIntoView({ block: "nearest" });
    }
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("keydown", function (ev) {
      if (!drop) return;
      if (ev.key === "ArrowDown") { ev.preventDefault(); move(1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); move(-1); }
      else if (ev.key === "Enter") {
        if (sel >= 0) { ev.preventDefault(); pick(items[sel].title); }
        else close();
      }
      else if (ev.key === "Escape") { close(); ev.stopPropagation(); }
    });
    input.addEventListener("blur", function () { setTimeout(close, 150); });
  }

  // Additional-roles list manager (used by both the form and the edit modal).
  function setupRoles(listId, addBtnId, maxId, errId, primaryInput) {
    var listEl = document.getElementById(listId);
    var addBtn = document.getElementById(addBtnId);
    var maxEl = document.getElementById(maxId);
    var errEl = document.getElementById(errId);
    function inputs() {
      return Array.prototype.slice.call(listEl.querySelectorAll("input"));
    }
    function values() {
      return inputs().map(function (i) { return normSpace(i.value); }).filter(Boolean);
    }
    function showErr(msg) {
      errEl.textContent = msg;
      errEl.hidden = false;
      setTimeout(function () { errEl.hidden = true; }, 4000);
    }
    function refresh() {
      var rows = listEl.querySelectorAll(".role-row");
      Array.prototype.forEach.call(rows, function (row, i) {
        row.querySelector(".role-num").textContent = "Role " + (i + 1);
      });
      var full = rows.length >= 4;
      addBtn.hidden = full;
      maxEl.hidden = !full;
    }
    function isDup(title, exceptInput) {
      var tl = normSpace(title).toLowerCase();
      if (!tl) return false;
      if (normSpace(primaryInput.value).toLowerCase() === tl) return true;
      return inputs().some(function (i) {
        return i !== exceptInput && normSpace(i.value).toLowerCase() === tl;
      });
    }
    function addRow(value) {
      if (listEl.querySelectorAll(".role-row").length >= 4) return null;
      var row = el("div", "role-row");
      row.appendChild(el("span", "role-num", ""));
      var wrap = el("div", "ac-wrap");
      var input = document.createElement("input");
      input.maxLength = 100;
      input.placeholder = "Start typing a role…";
      input.autocomplete = "off";
      input.value = value || "";
      wrap.appendChild(input);
      row.appendChild(wrap);
      var x = el("button", "role-x", "×");
      x.type = "button";
      x.title = "Remove this role";
      x.setAttribute("aria-label", "Remove this role");
      x.addEventListener("click", function () { row.remove(); refresh(); });
      row.appendChild(x);
      listEl.appendChild(row);
      attachTitleAutocomplete(input, {
        intendedUse: "additional",
        getExcluded: function () {
          return [normSpace(primaryInput.value)].concat(
            inputs().filter(function (i) { return i !== input; }).map(function (i) { return normSpace(i.value); })
          ).filter(Boolean);
        },
        onPick: function (title) {
          if (isDup(title, input)) {
            input.value = "";
            showErr("This role has already been added. Please select a different role.");
          }
        }
      });
      input.addEventListener("change", function () {
        if (input.value && isDup(input.value, input)) {
          input.value = "";
          showErr("This role has already been added. Please select a different role.");
        }
      });
      refresh();
      if (!value) input.focus();
      return row;
    }
    addBtn.addEventListener("click", function () { addRow(""); });
    return {
      getRoles: values,
      setRoles: function (roles) {
        listEl.innerHTML = "";
        (roles || []).slice(0, 4).forEach(function (r) { addRow(r); });
        refresh();
      },
      reset: function () { listEl.innerHTML = ""; refresh(); }
    };
  }

  var formRoles = setupRoles("fRolesList", "fAddRole", "fRolesMax", "fRolesErr", document.getElementById("position"));
  attachTitleAutocomplete(document.getElementById("position"), {
    intendedUse: "primary",
    getExcluded: function () { return formRoles.getRoles(); }
  });

  // ----- Recommend-a-title modal -----
  // The recommendation is sent by the employee from their own email app via a
  // mailto: link. The app never sends email and never stores recommendations.
  var recSource = null;
  var REC_EMAIL = "sean@senpex.com";
  var REC_SUBJECT = "New Recommended Job Title for Birthday Tracker";
  function openRecModal(sourceInput, intendedUse, prefill) {
    recSource = sourceInput;
    document.getElementById("recName").value = normSpace(prefill || "");
    document.getElementById("recWhy").value = "";
    var radios = document.getElementsByName("recUse");
    Array.prototype.forEach.call(radios, function (r) { r.checked = r.value === intendedUse; });
    resetRecOutcome();
    document.getElementById("recErr").hidden = true;
    document.getElementById("recmodal").hidden = false;
    document.getElementById("recName").focus();
  }
  // Hide the outcome sections whenever the drafted email would go stale, so
  // the fallback To/Subject/Body can never disagree with the fields.
  function resetRecOutcome() {
    recWarnAccepted = false;
    document.getElementById("recWarn").hidden = true;
    document.getElementById("recOk").hidden = true;
    document.getElementById("recFallback").hidden = true;
    document.getElementById("recSubmit").textContent = "Open Email to Send Recommendation";
  }
  document.getElementById("recName").addEventListener("input", resetRecOutcome);
  document.getElementById("recWhy").addEventListener("input", resetRecOutcome);
  Array.prototype.forEach.call(document.getElementsByName("recUse"), function (r) {
    r.addEventListener("change", resetRecOutcome);
  });
  function closeRecModal() { document.getElementById("recmodal").hidden = true; }
  document.getElementById("recClose").addEventListener("click", closeRecModal);
  document.getElementById("recCancel").addEventListener("click", closeRecModal);
  document.getElementById("recmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("recmodal")) closeRecModal();
  });

  function nearestTitle(norm) {
    var nl = norm.toLowerCase();
    var exact = TITLES.filter(function (x) { return x.tl === nl; })[0];
    if (exact) return { kind: "exact", title: exact.t };
    var contains = TITLES.filter(function (x) {
      return x.tl.indexOf(nl) >= 0 || nl.indexOf(x.tl) >= 0;
    })[0];
    if (contains) return { kind: "near", title: contains.t };
    var words = nl.split(" ").filter(function (w) { return w.length > 2; });
    var best = null, bestShared = 1;
    TITLES.forEach(function (x) {
      var tw = x.tl.split(" ");
      var shared = words.filter(function (w) { return tw.indexOf(w) >= 0; }).length;
      if (shared > bestShared) { bestShared = shared; best = x.t; }
    });
    if (best) return { kind: "near", title: best };
    return null;
  }

  var recWarnAccepted = false;
  // The wall form sets the bt_name cookie client-side after a submission, so
  // the drafted email can name its sender when this browser has an entry.
  function currentUserName() {
    var m = document.cookie.match(/(?:^|;\\s*)bt_name=([^;]+)/);
    if (!m) return "";
    try { return decodeURIComponent(m[1]); } catch (e) { return ""; }
  }
  document.getElementById("recSubmit").addEventListener("click", function () {
    var btn = this;
    var errEl = document.getElementById("recErr");
    var warnEl = document.getElementById("recWarn");
    errEl.hidden = true;
    var norm = titleCase(document.getElementById("recName").value);
    if (!norm) {
      errEl.textContent = "Please enter the title you want to recommend.";
      errEl.hidden = false;
      return;
    }
    document.getElementById("recName").value = norm;
    var match = nearestTitle(norm);
    if (match && match.kind === "exact") {
      errEl.textContent = '"' + match.title + '" already exists in the library — just select it from the list.';
      errEl.hidden = false;
      if (recSource) {
        recSource.value = match.title;
        recSource.dispatchEvent(new Event("change"));
      }
      return;
    }
    if (match && match.kind === "near" && !recWarnAccepted) {
      warnEl.innerHTML = "";
      warnEl.appendChild(document.createTextNode(
        'This looks close to the approved title "' + match.title + '". Recommend it anyway, or use the approved one?'));
      var useBtn = el("button", "ghost", 'Use "' + match.title + '"');
      useBtn.type = "button";
      useBtn.style.marginTop = "8px";
      useBtn.addEventListener("click", function () {
        if (recSource) {
          recSource.value = match.title;
          recSource.dispatchEvent(new Event("change"));
        }
        closeRecModal();
      });
      var btnWrap = el("div");
      btnWrap.appendChild(useBtn);
      warnEl.appendChild(btnWrap);
      warnEl.hidden = false;
      document.getElementById("recOk").hidden = true;
      document.getElementById("recFallback").hidden = true;
      recWarnAccepted = true;
      btn.textContent = "Open Email Anyway";
      return;
    }
    // recWarnAccepted stays true after a send so re-clicking to relaunch the
    // mail app on unchanged input doesn't re-ask; any edit resets it.
    var use = "primary";
    Array.prototype.forEach.call(document.getElementsByName("recUse"), function (r) { if (r.checked) use = r.value; });
    var why = document.getElementById("recWhy").value.trim();
    var who = currentUserName();
    var body = [
      "Recommended Job Title: " + norm,
      "Intended Use: " + (use === "additional" ? "Additional Role" : "Primary Job Title"),
      "Explanation: " + (why || "None provided"),
      "Submitted By: " + (who || "Not available")
    ].join("\\r\\n"); // RFC 6068: mailto body line breaks must encode as %0D%0A
    // The fallback details always show: the browser can't detect whether a
    // mail app actually opened, and the copy path must stay available.
    document.getElementById("fbSubject").textContent = REC_SUBJECT;
    document.getElementById("fbBody").textContent = body;
    document.getElementById("fbCopy").textContent = "Copy Email Details";
    var okEl = document.getElementById("recOk");
    okEl.textContent = "Your email app has been opened. Review the recommendation and send it to Sean.";
    okEl.hidden = false;
    document.getElementById("recFallback").hidden = false;
    warnEl.hidden = true;
    btn.textContent = "Open Email to Send Recommendation";
    if (recSource) {
      recSource.value = norm;
      recSource.dispatchEvent(new Event("change"));
    }
    // An anchor click is the most reliable cross-platform way to launch the
    // default mail app from a mailto: URL (incl. iOS Safari and Android).
    var a = document.createElement("a");
    a.href = "mailto:" + REC_EMAIL +
      "?subject=" + encodeURIComponent(REC_SUBJECT) +
      "&body=" + encodeURIComponent(body);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  document.getElementById("fbCopy").addEventListener("click", function () {
    var copyBtn = this;
    var details = "To: " + REC_EMAIL +
      "\\r\\nSubject: " + document.getElementById("fbSubject").textContent +
      "\\r\\n\\r\\n" + document.getElementById("fbBody").textContent;
    function done(copied) {
      copyBtn.textContent = copied ? "Copied!" : "Copy failed — select the text above and copy it manually";
      setTimeout(function () { copyBtn.textContent = "Copy Email Details"; }, 2500);
    }
    function legacyCopy() {
      var ta = document.createElement("textarea");
      ta.value = details;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      done(copied);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(details).then(function () { done(true); }, legacyCopy);
    } else {
      legacyCopy();
    }
  });

  // ----- Roles view modal (from the +N roles chip on cards) -----
  // ----- Person popup: the full picture of one teammate, from their card -----
  function openPersonModal(b) {
    var body = document.getElementById("pvBody");
    body.innerHTML = "";
    var days = daysUntil(b.month, b.day);
    var z = zodiac(b.month, b.day);

    var head = el("div", "pv-head");
    head.appendChild(avatarEl(b));
    var hd = el("div");
    hd.appendChild(el("div", "pv-name", (days === 0 ? "🎉 " : "") + b.name));
    hd.appendChild(el("span", "pv-zbadge", z[1] + " " + z[0]));
    head.appendChild(hd);
    body.appendChild(head);

    var role = el("div", "pv-sec");
    var dept = deptOf(b.position);
    if (dept) role.appendChild(el("div", "pv-dept", "Department: " + dept));
    role.appendChild(el("div", "pv-primary", b.position));
    if (b.roles && b.roles.length) {
      var ul = el("ul", "pv-roles");
      b.roles.forEach(function (r) { ul.appendChild(el("li", null, "• " + r)); });
      role.appendChild(ul);
    }
    body.appendChild(role);

    var det = el("div", "pv-sec");
    var grid = el("div", "pv-grid");
    function row(k, val) {
      grid.appendChild(el("span", "k", k));
      var v = el("span", "v");
      if (typeof val === "string") v.textContent = val;
      else v.appendChild(val);
      grid.appendChild(v);
    }
    row("Birthday", MONTHS[b.month - 1] + " " + b.day +
      (days === 0 ? " · Today! 🎂" : " · in " + days + (days === 1 ? " day" : " days")));
    if (b.join_month && b.join_year)
      row("Joined", MONTHS[b.join_month - 1] + " " + b.join_year);
    if (b.city || b.country) {
      var loc = el("span");
      var lf = flagEl(b.country);
      if (lf) loc.appendChild(lf);
      loc.appendChild(document.createTextNode(
        (b.city ? b.city : "") + (b.city && b.country ? " · " : "") + (b.country || "")));
      row("Location", loc);
    }
    det.appendChild(grid);
    body.appendChild(det);

    // Socials get their own segment — a nudge to actually reach out.
    var ig = socialLink("ig", b.instagram, "Instagram");
    var li = socialLink("li", b.linkedin, "LinkedIn");
    var xx = socialLink("x", b.x_handle, "X");
    if (ig || li || xx) {
      var socSec = el("div", "pv-sec");
      socSec.appendChild(el("span", "lbl", "💬 Get to know your teammate!"));
      socSec.appendChild(el("p", "pv-soc-note",
        "Say hi, follow, connect — a quick hello goes a long way across timezones."));
      var soc = el("div", "pv-socials");
      if (ig) soc.appendChild(ig);
      if (li) soc.appendChild(li);
      if (xx) soc.appendChild(xx);
      socSec.appendChild(soc);
      body.appendChild(socSec);
    }

    var zsec = el("div", "pv-sec");
    zsec.appendChild(el("span", "lbl", "Horoscope"));
    var zbox = el("div", "pv-zbox");
    if (signInfoInto(zbox, z, b.position)) zsec.appendChild(zbox);
    body.appendChild(zsec);

    var cal = el("a", "gcal", "＋ Google Calendar");
    cal.href = gcalUrl(b);
    cal.target = "_blank";
    cal.rel = "noopener";
    body.appendChild(cal);

    document.getElementById("pmodal").hidden = false;
  }
  document.getElementById("pClose").addEventListener("click", function () {
    document.getElementById("pmodal").hidden = true;
  });
  document.getElementById("pmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("pmodal")) document.getElementById("pmodal").hidden = true;
  });

  // ----- Wall search: name + primary title rank above additional-role matches -----
  var wallQuery = "";
  function applySearch(list) {
    var q = normSpace(wallQuery).toLowerCase();
    if (!q) return list.map(function (b) { b.__rank = 0; return b; });
    return list.filter(function (b) {
      var primary = (b.name + " " + b.position).toLowerCase().indexOf(q) >= 0;
      var viaRole = (b.roles || []).some(function (r) { return r.toLowerCase().indexOf(q) >= 0; });
      b.__rank = primary ? 0 : 1;
      return primary || viaRole;
    });
  }
  function renderWall() { render(applySearch(allBirthdays.slice())); }
  document.getElementById("wallSearch").addEventListener("input", function () {
    wallQuery = this.value;
    renderWall();
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
    var bdateVal = document.getElementById("bdate").value;
    if (!bdateVal) {
      status.className = "err";
      status.textContent = "🎂 Please pick your birthday.";
      return;
    }
    var bd = splitDateInput(bdateVal);
    var payload = {
      name: normSpace(document.getElementById("name").value),
      legal_first: normSpace(document.getElementById("legalFirst").value),
      legal_last: normSpace(document.getElementById("legalLast").value),
      position: document.getElementById("position").value,
      month: bd.month,
      day: bd.day,
      year: bd.year,
      join_month: parseInt(jMonthSel.value, 10),
      join_year: document.getElementById("jyear").value || null,
      instagram: document.getElementById("fIg").value,
      linkedin: document.getElementById("fLi").value,
      x: document.getElementById("fX").value,
      avatar: formAvatarData,
      additional_roles: formRoles.getRoles()
    };
    if (!payload.name || !payload.legal_first || !payload.legal_last) return;
    var dupes = allBirthdays.filter(function (b) {
      return b.month === payload.month && b.day === payload.day &&
        normName(b.name) !== normName(payload.name);
    });
    if (dupes.length) { openDupModal(payload, dupes); return; }
    doSubmit(payload);
  });

  // ----- Team globe: everyone's spot on the planet + their live local time.
  // Same hand-rolled orthographic canvas approach as the visitor tracker,
  // in a compact auto-spinning form tuned for the wall's light theme.
  (function () {
    var cv = document.getElementById("tglobe");
    if (!cv || !cv.getContext) return;
    var g = cv.getContext("2d");
    var GC = 220, GR = 205;
    var D2R = Math.PI / 180;
    var gLon = -30, gLat = 18;
    var gZoom = 1, tZoom = 1, tLon = null, tLat = null;
    var gRings = null;
    var team = [];
    var dotHits = [];
    var lastInteract = 0;
    var pDown = false, pDragged = false, pX = 0, pY = 0;

    function gProject(lon, lat) {
      var l = lon * D2R, p = lat * D2R, l0 = gLon * D2R, p0 = gLat * D2R;
      var cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
      if (cosc < 0) return null;
      var R2 = GR * gZoom;
      return [
        GC + R2 * Math.cos(p) * Math.sin(l - l0),
        GC - R2 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0))
      ];
    }
    function gTrace(pts) {
      var pen = false;
      for (var i = 0; i < pts.length; i++) {
        var xy = gProject(pts[i][0], pts[i][1]);
        if (xy) {
          if (pen) g.lineTo(xy[0], xy[1]);
          else { g.moveTo(xy[0], xy[1]); pen = true; }
        } else {
          pen = false;
        }
      }
    }
    function gSample(f) {
      var pts = [];
      for (var i = 0; i <= 72; i++) pts.push(f(i / 72));
      return pts;
    }
    function decodeWorldTopo(topo) {
      var tr = topo.transform;
      var arcs = topo.arcs.map(function (arc) {
        if (!tr) return arc;
        var x = 0, y = 0;
        return arc.map(function (pt) {
          x += pt[0]; y += pt[1];
          return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]];
        });
      });
      function ringOf(idxList) {
        var ring = [];
        idxList.forEach(function (ai) {
          var pts = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse();
          if (ring.length) pts = pts.slice(1);
          ring = ring.concat(pts);
        });
        return ring;
      }
      var out = [];
      topo.objects.countries.geometries.forEach(function (geom) {
        if (geom.type === "Polygon") {
          geom.arcs.forEach(function (r) { out.push(ringOf(r)); });
        } else if (geom.type === "MultiPolygon") {
          geom.arcs.forEach(function (poly) {
            poly.forEach(function (r) { out.push(ringOf(r)); });
          });
        }
      });
      return out;
    }

    function drawTeamGlobe() {
      g.clearRect(0, 0, 440, 440);
      g.beginPath();
      g.arc(GC, GC, GR * gZoom, 0, 2 * Math.PI);
      g.fillStyle = "#fdfcfa";
      g.fill();
      g.strokeStyle = "#e3dcd3";
      g.lineWidth = 1.5;
      g.stroke();
      g.beginPath();
      for (var lon = -180; lon < 180; lon += 30) {
        (function (LN) { gTrace(gSample(function (t) { return [LN, -90 + 180 * t]; })); })(lon);
      }
      for (var lat = -60; lat <= 60; lat += 30) {
        (function (LT) { gTrace(gSample(function (t) { return [-180 + 360 * t, LT]; })); })(lat);
      }
      g.strokeStyle = "rgba(26, 23, 20, 0.05)";
      g.lineWidth = 0.6;
      g.stroke();
      if (gRings) {
        g.beginPath();
        gRings.forEach(gTrace);
        g.strokeStyle = "#b3a99e";
        g.lineWidth = 0.8;
        g.stroke();
      }
      // Dots: teammates sharing a city fan out around the spot in a small
      // ring that widens as you zoom, so dense clusters stay decipherable.
      dotHits = [];
      var pulse = 1 + 0.18 * Math.sin(Date.now() / 300);
      var fan = 5 + Math.min(1, (gZoom - 1) / 1.8) * 15;
      team.forEach(function (p) {
        if (p.latitude === null || p.latitude === undefined ||
            p.longitude === null || p.longitude === undefined) return;
        var xy = gProject(p.longitude, p.latitude);
        if (!xy) return;
        var x = xy[0], y = xy[1];
        if (p.gN > 1) {
          var ang = (p.gI / p.gN) * 2 * Math.PI - Math.PI / 2;
          x += Math.cos(ang) * fan;
          y += Math.sin(ang) * fan;
        }
        g.beginPath();
        g.arc(x, y, 11 * pulse, 0, 2 * Math.PI);
        g.fillStyle = "rgba(255, 92, 51, 0.16)";
        g.fill();
        g.beginPath();
        g.arc(x, y, 5.5, 0, 2 * Math.PI);
        g.fillStyle = "#FF5C33";
        g.fill();
        g.strokeStyle = "#fff";
        g.lineWidth = 1.2;
        g.stroke();
        dotHits.push({ x: x, y: y, p: p });
      });
    }

    var lastT = 0;
    function gFrame(t) {
      if (!lastT) lastT = t;
      var dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      // Ease toward the zoom target (and its center) when one is set.
      if (Math.abs(tZoom - gZoom) > 0.005) {
        gZoom += (tZoom - gZoom) * Math.min(1, dt * 6);
      }
      if (tLat !== null) {
        var dLon = tLon - gLon;
        while (dLon > 180) dLon -= 360;
        while (dLon < -180) dLon += 360;
        gLon += dLon * Math.min(1, dt * 6);
        gLat += (tLat - gLat) * Math.min(1, dt * 6);
        if (Math.abs(dLon) < 0.2 && Math.abs(tLat - gLat) < 0.2) { tLon = null; tLat = null; }
      }
      // Auto-spin only when un-zoomed, not being touched, and idle a moment.
      if (tZoom === 1 && !pDown && Date.now() - lastInteract > 3000) {
        gLon = gLon - 5.5 * dt;
        if (gLon < -180) gLon += 360;
      }
      drawTeamGlobe();
      requestAnimationFrame(gFrame);
    }

    // --- Interaction: drag to spin, hover a dot for the person, click a
    // --- cluster to zoom in, click open water (or Reset) to zoom back out.
    var tip = document.getElementById("tgtip");
    var resetBtn = document.getElementById("tgReset");
    function canvasPos(ev) {
      var rect = cv.getBoundingClientRect();
      var scale = 440 / rect.width;
      return { x: (ev.clientX - rect.left) * scale, y: (ev.clientY - rect.top) * scale };
    }
    function hitDot(pos, slop) {
      var best = null, bestD = (slop || 12) * (slop || 12);
      for (var i = 0; i < dotHits.length; i++) {
        var dx = dotHits[i].x - pos.x, dy = dotHits[i].y - pos.y;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = dotHits[i]; }
      }
      return best;
    }
    function showTip(hit) {
      tip.innerHTML = "";
      var p = hit.p;
      tip.appendChild(el("div", "tt-name", p.name));
      if (p.position) tip.appendChild(el("div", "tt-role", p.position));
      var loc = el("div", "tt-loc");
      var f = flagEl(p.country);
      if (f) loc.appendChild(f);
      loc.appendChild(document.createTextNode(
        " " + (p.city ? p.city + " · " : "") + (p.country || "")));
      tip.appendChild(loc);
      var tEl = el("span", "tg-time");
      tEl.setAttribute("data-tz", p.timezone || "");
      tip.appendChild(tEl);
      tickClocks();
      var rect = cv.getBoundingClientRect();
      var sx = hit.x / (440 / rect.width), sy = hit.y / (440 / rect.width);
      tip.style.left = Math.max(0, Math.min(rect.width - 150, sx + 12)) + "px";
      tip.style.top = Math.max(0, sy - 14) + "px";
      tip.hidden = false;
    }
    function hideTip() { tip.hidden = true; }
    function setZoom(z, lat, lon) {
      tZoom = z;
      if (lat !== undefined) { tLat = lat; tLon = lon; }
      resetBtn.hidden = z === 1;
      lastInteract = Date.now();
    }
    resetBtn.addEventListener("click", function () { hideTip(); setZoom(1); });

    cv.addEventListener("pointerdown", function (ev) {
      pDown = true; pDragged = false;
      pX = ev.clientX; pY = ev.clientY;
      lastInteract = Date.now();
      try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    cv.addEventListener("pointermove", function (ev) {
      lastInteract = Date.now();
      if (pDown) {
        var dx = ev.clientX - pX, dy = ev.clientY - pY;
        if (Math.abs(dx) + Math.abs(dy) > 4) pDragged = true;
        if (pDragged) {
          var scale = 440 / cv.getBoundingClientRect().width;
          gLon -= dx * 0.3 * scale / gZoom;
          gLat += dy * 0.3 * scale / gZoom;
          if (gLat > 78) gLat = 78;
          if (gLat < -78) gLat = -78;
          tLon = null; tLat = null;
          pX = ev.clientX; pY = ev.clientY;
          hideTip();
          cv.style.cursor = "grabbing";
        }
        return;
      }
      var hit = hitDot(canvasPos(ev), 14);
      if (hit) { showTip(hit); cv.style.cursor = "pointer"; }
      else { hideTip(); cv.style.cursor = "grab"; }
    });
    cv.addEventListener("pointerup", function (ev) {
      pDown = false;
      cv.style.cursor = "grab";
      if (pDragged) { pDragged = false; return; }
      var hit = hitDot(canvasPos(ev), 16);
      if (hit) {
        if (gZoom < 2) setZoom(3.2, hit.p.latitude, hit.p.longitude);
        showTip(hit);
      } else {
        hideTip();
        if (tZoom > 1) setZoom(1);
      }
    });
    cv.addEventListener("pointerleave", function () {
      if (!pDown) { hideTip(); cv.style.cursor = "grab"; }
    });

    var clockFmts = {};
    function clockFor(tz) {
      if (!(tz in clockFmts)) {
        try {
          clockFmts[tz] = new Intl.DateTimeFormat(undefined, {
            timeZone: tz, weekday: "short", month: "2-digit", day: "2-digit",
            hour: "numeric", minute: "2-digit", second: "2-digit"
          });
        } catch (e) { clockFmts[tz] = null; }
      }
      return clockFmts[tz];
    }
    function tickClocks() {
      var els = document.querySelectorAll(".tg-time");
      var now = new Date();
      for (var i = 0; i < els.length; i++) {
        var tz = els[i].getAttribute("data-tz");
        var fmt = tz ? clockFor(tz) : null;
        els[i].textContent = fmt ? fmt.format(now) : "local time unknown";
      }
    }
    setInterval(tickClocks, 1000);

    function buildTeamList() {
      var list = document.getElementById("tgList");
      list.innerHTML = "";
      team.forEach(function (p) {
        var row = el("div", "tg-row");
        row.appendChild(el("b", null, p.name));
        var loc = el("span", "tg-loc");
        var f = flagEl(p.country);
        if (f) loc.appendChild(f);
        loc.appendChild(document.createTextNode(
          (p.city ? p.city + " · " : "") + (p.country || "")));
        row.appendChild(loc);
        var tEl = el("span", "tg-time");
        tEl.setAttribute("data-tz", p.timezone || "");
        row.appendChild(tEl);
        list.appendChild(row);
      });
      tickClocks();
    }

    fetch("/world.json")
      .then(function (r) { return r.json(); })
      .then(function (d) { gRings = decodeWorldTopo(d); })
      .catch(function () {});
    fetch("/api/team-locations")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        team = d || [];
        // Group teammates who share a spot (same city) so the renderer can
        // fan each group out into a ring of distinct, clickable dots.
        var groups = {};
        team.forEach(function (p) {
          if (p.latitude === null || p.latitude === undefined) return;
          var key = p.latitude.toFixed(1) + "," + p.longitude.toFixed(1);
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
        });
        Object.keys(groups).forEach(function (key) {
          groups[key].forEach(function (p, k) {
            p.gI = k;
            p.gN = groups[key].length;
          });
        });
        // Fallback so we always know the time: if a teammate has a location
        // but no stored IANA timezone yet, approximate one from longitude
        // (Etc/GMT offset — refreshed to the exact zone next time they edit).
        team.forEach(function (p) {
          if (!p.timezone && p.longitude !== null && p.longitude !== undefined) {
            var off = Math.round(p.longitude / 15);
            if (off > 14) off = 14;
            if (off < -12) off = -12;
            p.timezone = off === 0 ? "Etc/GMT"
              : "Etc/GMT" + (off > 0 ? "-" : "+") + Math.abs(off);
          }
        });
        buildTeamList();
      })
      .catch(function () {});
    requestAnimationFrame(gFrame);
  })();

  load();
})();
</script>
</body>
</html>`;
