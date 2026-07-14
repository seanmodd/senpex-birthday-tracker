// ---------- Visitors page (globe + live feed) ----------

export const VISITORS_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="rgb(27, 27, 27)">
<title>Visitor Tracker — Senpex / Pckup</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: #FF5C33;
    --brand-dark: #d94a26;
    --bg: rgb(27, 27, 27);
    --panel: #232323;
    --panel-2: #1f1f1f;
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
  a.back {
    color: #cfc9c2; text-decoration: none; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; padding: 7px 14px;
    white-space: nowrap;
  }
  a.back:hover { color: #fff; border-color: var(--brand); }
  .links { display: flex; gap: 10px; flex-wrap: wrap; }
  main { max-width: 1000px; margin: 26px auto 50px; padding: 0 16px; display: flex; flex-direction: column; gap: 18px; }
  .stats { display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch; }
  .stat {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 18px; min-width: 130px; flex: 1 1 130px;
    position: relative;
  }
  .stat.has-pop { cursor: default; }
  .stat.has-pop:hover, .stat.has-pop:focus-within { border-color: var(--brand); }
  .stat.has-pop::after {
    content: "▾"; position: absolute; top: 10px; right: 12px;
    color: var(--brand); font-size: 14px;
  }
  .stat-pop {
    display: none; position: absolute; top: 100%; left: 50%; z-index: 20;
    transform: translateX(-50%);
    min-width: 250px; max-width: calc(100vw - 32px);
    max-height: 280px; overflow-y: auto;
    background: #141414; border: 1px solid #4d4d4d; border-radius: 10px;
    padding: 6px; box-shadow: 0 14px 38px rgba(0, 0, 0, 0.55);
  }
  .stat.has-pop:hover .stat-pop, .stat.has-pop:focus-within .stat-pop { display: block; }
  .stat.has-pop.tapped .stat-pop { display: block; }
  .pop-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 9px; border-radius: 7px; font-size: 13px;
  }
  .pop-row.clickable { cursor: pointer; }
  .pop-row:hover { background: rgba(255, 255, 255, 0.07); }
  .pop-row.clickable:hover .pop-name { color: var(--brand); }
  .pop-name { color: var(--text); font-weight: 600; }
  .pop-count { margin-left: auto; color: var(--muted); font-size: 12px; font-weight: 700; padding-left: 10px; }
  .pop-empty { color: var(--muted); padding: 7px 9px; font-size: 12.5px; }
  .stat b { display: block; font-size: 24px; font-weight: 700; color: var(--brand); }
  .stat span { font-size: 11.5px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .live {
    display: flex; align-items: center; gap: 8px;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 18px; font-size: 12.5px; font-weight: 700; color: #cfc9c2;
  }
  .pulse {
    width: 9px; height: 9px; border-radius: 50%; background: var(--brand); display: inline-block;
    animation: pulse 1.6s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 92, 51, 0.5); }
    70% { box-shadow: 0 0 0 9px rgba(255, 92, 51, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 92, 51, 0); }
  }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; }
  .panel h2 { margin: 0 0 14px; font-size: 18px; font-weight: 600; }
  .range-box select {
    display: block; width: 100%; margin-top: 5px;
    font: inherit; font-size: 13.5px; font-weight: 600;
    background: var(--panel-2); color: var(--text);
    border: 1px solid #4a4a4a; border-radius: 8px; padding: 6px 8px;
    cursor: pointer;
  }
  .range-box select:focus { outline: 2px solid var(--brand); border-color: transparent; }
  #globe-wrap { display: flex; justify-content: center; position: relative; }
  #gtip {
    position: absolute; z-index: 5;
    transform: translate(-50%, -135%);
    background: #141414; color: var(--text);
    border: 1px solid #4d4d4d; border-radius: 8px;
    padding: 7px 11px; font-size: 12.5px;
    pointer-events: none; white-space: nowrap;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
  }
  #gtip b { color: var(--brand); }
  #gtip[hidden] { display: none; }
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .overlay[hidden] { display: none; }
  .dialog {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: 20px; max-width: 470px; width: 100%; position: relative;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
  }
  .dialog h3 { margin: 0 0 6px; font-size: 17px; }
  .dialog h3 .nm { color: var(--brand); }
  .dlg-sub { margin: 0 0 12px; color: var(--muted); font-size: 13px; }
  .dlg-x {
    position: absolute; top: 4px; right: 4px;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border: 0; background: none; font-size: 24px; color: var(--muted);
    cursor: pointer; line-height: 1; padding: 0;
  }
  .dlg-x:hover { color: #fff; }
  .plist { max-height: 340px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-2); }
  .pv { display: flex; justify-content: space-between; gap: 10px; padding: 10px 13px; border-bottom: 1px solid #303030; font-size: 13px; }
  .pv:last-child { border-bottom: 0; }
  .pv-when { color: var(--text); font-weight: 600; white-space: nowrap; }
  .pv-what { color: var(--muted); text-align: right; }
  #globe { width: 100%; max-width: 620px; height: auto; display: block; cursor: grab; touch-action: pan-y; }
  #globe:active { cursor: grabbing; }
  .spin-controls {
    display: flex; gap: 18px; align-items: center; justify-content: center;
    margin-top: 14px; color: var(--muted); font-size: 12.5px; font-weight: 600;
    flex-wrap: wrap;
  }
  .spin-controls label { display: inline-flex; align-items: center; gap: 8px; }
  .spin-controls input[type="range"] { width: 130px; accent-color: var(--brand); cursor: pointer; }
  .spin-controls button {
    font: inherit; font-size: 12.5px; font-weight: 600; color: #cfc9c2;
    background: var(--panel-2); border: 1px solid #4a4a4a; border-radius: 999px;
    padding: 6px 13px; cursor: pointer;
  }
  .spin-controls button:hover { color: #fff; border-color: var(--brand); }
  #spinPlay { min-width: 92px; }
  .legend { text-align: center; color: var(--muted); font-size: 12.5px; margin: 12px 0 0; }
  .legend .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--brand); margin-right: 5px; }
  #globe-fallback { color: var(--muted); text-align: center; padding: 26px 0; }
  #feed { max-height: 480px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-2); }
  .visit { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-bottom: 1px solid #303030; }
  .visit:last-child { border-bottom: 0; }
  .v-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); flex: none; }
  .v-main { min-width: 0; }
  .v-loc { font-weight: 600; font-size: 14px; }
  .v-ip { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .v-name { color: var(--brand); font-weight: 600; }
  img.flag {
    width: 18px; height: auto; border-radius: 2px;
    vertical-align: -2px; margin-right: 6px;
  }
  #gtip img.flag, .dlg-sub img.flag { width: 16px; }
  .v-right { margin-left: auto; text-align: right; flex: none; }
  .v-time { color: #cfc9c2; font-size: 13px; white-space: nowrap; }
  .v-path { color: var(--muted); font-size: 11.5px; margin-top: 2px; }
  .visit.fresh { animation: flashbg 2.4s ease-out; }
  @keyframes flashbg {
    0% { background-color: rgba(255, 92, 51, 0.22); }
    100% { background-color: transparent; }
  }
  #feed-empty { color: var(--muted); text-align: center; padding: 26px 0; }
  footer { text-align: center; color: var(--muted); font-size: 12.5px; padding: 0 16px 30px; }
  footer a { color: var(--brand); }
  @media (max-width: 640px) {
    header.top { padding: 20px 16px; }
    header.top h1 { font-size: 22px; }
    header.top p { font-size: 13px; }
    main { margin: 20px auto 40px; padding: 0 13px; gap: 14px; }
    .panel { padding: 16px; }
    .stat { padding: 11px 14px; min-width: 120px; }
    .stat b { font-size: 22px; }
    .stat.has-pop::after { top: 8px; right: 10px; }
    a.back { padding: 13px 16px; }
    .range-box select { padding: 12px 10px; font-size: 16px; }
    .pop-row { padding: 12px 10px; }
    .spin-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 10px; }
    .spin-controls label { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; }
    .spin-controls input[type="range"] { width: auto; max-width: none; flex: 1 1 auto; margin-left: 12px; height: 36px; }
    .spin-controls button { width: 100%; padding: 13px 18px; }
    .visit { flex-wrap: wrap; row-gap: 3px; }
    .v-right { flex: 1 1 100%; margin-left: 20px; text-align: left; display: flex; gap: 8px; align-items: baseline; }
    .v-path { margin-top: 0; }
    .stat-pop { max-height: 240px; min-width: 210px; }
    #pmodal .dialog, .overlay .dialog { padding: 18px 16px; }
    .pv, .visit { font-size: 12.5px; }
    .v-time { font-size: 12px; }
  }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1>📡 Visitor Tracker</h1>
    <p>Every visit to the birthday tracker in real-time: exact time, IP address, and city.</p>
  </div>
  <div class="links"><a class="back" href="/">← Birthday tracker</a><a class="back" href="/changelog">📋 Changelog</a></div>
</header>
<main>
  <div class="stats">
    <div class="stat"><b id="s-total">—</b><span>Total visits</span></div>
    <div class="stat"><b id="s-unique">—</b><span>Unique visitors</span></div>
    <div class="stat has-pop" tabindex="0">
      <b id="s-cities">—</b><span>Cities</span>
      <div class="stat-pop" id="pop-cities"></div>
    </div>
    <div class="stat has-pop" tabindex="0">
      <b id="s-countries">—</b><span>Countries</span>
      <div class="stat-pop" id="pop-countries"></div>
    </div>
    <div class="stat range-box">
      <span>Time range</span>
      <select id="range" aria-label="Time range">
        <option value="all" selected>All time</option>
        <option value="1h">Last hour</option>
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
    </div>
    <div class="live"><span class="pulse"></span> LIVE · <span id="updated">connecting…</span></div>
  </div>

  <section class="panel">
    <h2>🌍 Where the visits come from</h2>
    <div id="globe-wrap"><canvas id="globe" width="640" height="640" role="img" aria-label="Globe showing visitor locations"></canvas><div id="gtip" hidden></div></div>
    <div class="spin-controls">
      <label for="spinSpeed">🌀 Spin speed <input type="range" id="spinSpeed" min="0" max="60" step="1"></label>
      <label for="spinFric">🧊 Glide <input type="range" id="spinFric" min="0" max="100" step="1"></label>
      <button id="spinPlay" type="button" title="Pause or resume the spin">⏸ Pause</button>
      <button id="spinReset" type="button" title="Reset spin to defaults">↺ Reset spin</button>
    </div>
    <p id="globe-fallback" hidden>Couldn't load the world map — the live feed below still works.</p>
    <p class="legend"><span class="dot"></span> one dot per visitor · bigger dot = more visits · tap a dot for visit history · drag to spin</p>
  </section>

  <section class="panel">
    <h2>Live visit feed</h2>
    <div id="feed"></div>
    <p id="feed-empty" hidden>No visits logged yet — share the link and watch this fill up.</p>
  </section>
</main>

<div id="pmodal" class="overlay" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pTitle">
    <button class="dlg-x" id="pClose" type="button" aria-label="Close">×</button>
    <h3 id="pTitle">Visit history</h3>
    <p class="dlg-sub" id="pSub"></p>
    <div id="pList" class="plist"></div>
  </div>
</div>
<footer>Senpex / Pckup internal tool · <a href="/">team birthday tracker</a>
<div style="margin-top:7px;font-size:12px;color:#a39d97">__BUILDINFO__</div></footer>
<script>
(function () {
  var points = [];
  var curRange = "all";
  var maxSeenId = 0;
  var firstLoad = true;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function fmtTs(ts) {
    var d = new Date(ts.replace(" ", "T") + "Z");
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  function locStr(v) {
    var parts = [];
    if (v.city) parts.push(v.city);
    if (v.region && v.region !== v.city) parts.push(v.region);
    var s = parts.join(", ");
    if (v.country) s = s ? s + " · " + v.country : v.country;
    return s || "Unknown location";
  }

  function pageName(p) {
    if (p === "/visitors") return "this tracker";
    if (p === "/changelog") return "the changelog";
    return "birthday wall";
  }

  // Real flag image (proxied through /flag/), hidden if the code has no flag.
  function flagEl(country) {
    if (!country || String(country).length !== 2) return null;
    var img = document.createElement("img");
    img.className = "flag";
    img.src = "/flag/" + String(country).toLowerCase() + ".png";
    img.alt = country;
    img.onerror = function () { img.style.display = "none"; };
    return img;
  }

  function renderFeed(recent) {
    var feed = document.getElementById("feed");
    var empty = document.getElementById("feed-empty");
    feed.innerHTML = "";
    empty.hidden = recent.length > 0;
    feed.style.display = recent.length ? "block" : "none";
    recent.forEach(function (v) {
      var row = el("div", "visit" + (!firstLoad && v.id > maxSeenId ? " fresh" : ""));
      row.appendChild(el("span", "v-dot"));
      var main = el("div", "v-main");
      main.appendChild(el("div", "v-loc", locStr(v)));
      var ipline = el("div", "v-ip");
      var fl = flagEl(v.country);
      if (fl) ipline.appendChild(fl);
      ipline.appendChild(el("span", v.name ? "v-name" : "v-anon", v.name || "Unknown visitor"));
      ipline.appendChild(document.createTextNode(" · " + (v.ip || "unknown IP")));
      main.appendChild(ipline);
      row.appendChild(main);
      var right = el("div", "v-right");
      right.appendChild(el("div", "v-time", fmtTs(v.ts)));
      right.appendChild(el("div", "v-path", "viewed " + pageName(v.path)));
      row.appendChild(right);
      feed.appendChild(row);
    });
    if (recent.length) {
      var top = recent[0].id;
      if (top > maxSeenId) maxSeenId = top;
    }
  }

  function setStats(data) {
    document.getElementById("s-total").textContent = data.total;
    document.getElementById("s-unique").textContent = data.uniques;
    document.getElementById("s-cities").textContent = data.cities;
    document.getElementById("s-countries").textContent = data.countries;
    document.getElementById("updated").textContent =
      "updated " + new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // Full country name from its 2-letter code, e.g. US → United States.
  var regionNames = null;
  function regionName(cc) {
    try {
      if (!regionNames) regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      return regionNames.of(String(cc).toUpperCase()) || cc;
    } catch (e) {
      return cc;
    }
  }

  // Hover popovers on the Cities / Countries stat cards: every place with its
  // flag and visit count, respecting the selected time range.
  function popRow(label, c, kind) {
    var row = el("div", "pop-row");
    var f = flagEl(c.country);
    if (f) row.appendChild(f);
    row.appendChild(el("span", "pop-name", label));
    row.appendChild(el("span", "pop-count", c.count));
    if (c.lat !== null && c.lat !== undefined && c.lon !== null && c.lon !== undefined) {
      row.classList.add("clickable");
      row.title = "Show on the globe";
      row.addEventListener("click", function () {
        setHighlight(kind, c);
        flyTo(c.lat, c.lon);
      });
    }
    return row;
  }

  function renderPops(cities, countries) {
    var pc = document.getElementById("pop-cities");
    pc.innerHTML = "";
    if (!cities.length) pc.appendChild(el("div", "pop-empty", "No city data yet"));
    cities.forEach(function (c) {
      pc.appendChild(popRow(c.city + (c.country ? ", " + c.country : ""), c, "city"));
    });
    var pn = document.getElementById("pop-countries");
    pn.innerHTML = "";
    if (!countries.length) pn.appendChild(el("div", "pop-empty", "No country data yet"));
    countries.forEach(function (c) {
      pn.appendChild(popRow(regionName(c.country), c, "country"));
    });
  }

  // One dot per visitor: people sharing a rounded location are fanned out in
  // a small ring so every dot stays hoverable. dlat/dlon are display coords;
  // lat/lon stay exact for history queries.
  function spreadPoints(raw) {
    var groups = {};
    raw.forEach(function (p) {
      var k = p.lat + "|" + p.lon;
      (groups[k] = groups[k] || []).push(p);
    });
    var out = [];
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.forEach(function (p, i) {
        var dlat = p.lat, dlon = p.lon;
        if (g.length > 1) {
          var ang = (2 * Math.PI * i) / g.length;
          var stretch = Math.max(0.2, Math.cos((p.lat * Math.PI) / 180));
          dlat = p.lat + 0.5 * Math.sin(ang);
          dlon = p.lon + (0.5 * Math.cos(ang)) / stretch;
        }
        out.push({
          name: p.name, city: p.city, country: p.country, count: p.count,
          lat: p.lat, lon: p.lon, dlat: dlat, dlon: dlon
        });
      });
    });
    return out;
  }

  function load() {
    fetch("/api/visits" + (curRange === "all" ? "" : "?range=" + curRange))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setStats(data);
        renderPops(data.cityList || [], data.countryList || []);
        renderFeed(data.recent || []);
        points = spreadPoints(data.points || []);
        firstLoad = false;
      })
      .catch(function () {
        document.getElementById("updated").textContent = "connection lost — retrying";
      });
  }

  load();
  setInterval(load, 5000);

  // Keep stat popovers inside the viewport (they're centered on their card,
  // which can poke past the edge on narrow screens).
  function fitPop(stat) {
    var pop = stat.querySelector(".stat-pop");
    if (!pop) return;
    pop.style.marginLeft = "0px";
    var r = pop.getBoundingClientRect();
    if (!r.width) return;
    var pad = 12;
    var shift = 0;
    if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    pop.style.marginLeft = shift + "px";
  }
  Array.prototype.forEach.call(document.querySelectorAll(".stat.has-pop"), function (stat) {
    function fit() { requestAnimationFrame(function () { fitPop(stat); }); }
    stat.addEventListener("mouseenter", fit);
    stat.addEventListener("focusin", fit);
  });

  // Touch devices: tap a stat card to toggle its breakdown popover.
  if (window.matchMedia("(hover: none)").matches) {
    document.addEventListener("click", function (ev) {
      var st = ev.target.closest(".stat.has-pop");
      var open = document.querySelectorAll(".stat.has-pop.tapped");
      for (var i = 0; i < open.length; i++) if (open[i] !== st) open[i].classList.remove("tapped");
      if (st && !ev.target.closest(".pop-row")) {
        st.classList.toggle("tapped");
        if (st.classList.contains("tapped")) requestAnimationFrame(function () { fitPop(st); });
      }
    });
  }

  document.getElementById("range").addEventListener("change", function () {
    curRange = this.value;
    firstLoad = true; // rows appearing because of a range switch aren't "new"
    load();
  });

  // ----- Globe: vanilla canvas orthographic projection, no libraries -----
  var canvas = document.getElementById("globe");
  var g2d = canvas.getContext("2d");
  var CX = 320, CY = 320, R = 298;
  var DEG = Math.PI / 180;
  var centerLon = -40, centerLat = 18;
  var rings = null;
  var dotHits = [];
  var pointerDown = false, draggingActive = false;
  var lastInteraction = 0;

  // Spin physics: user-adjustable auto-spin speed (deg/s), glide (how long a
  // flick keeps the globe turning), direction — plus flick velocity state.
  var spin = { speed: 8, glide: 55, dir: 1, paused: false };
  try {
    var savedSpin = JSON.parse(localStorage.getItem("globe_spin") || "{}");
    if (typeof savedSpin.speed === "number") spin.speed = savedSpin.speed;
    if (typeof savedSpin.glide === "number") spin.glide = savedSpin.glide;
    if (savedSpin.dir === 1 || savedSpin.dir === -1) spin.dir = savedSpin.dir;
    if (savedSpin.paused === true) spin.paused = true;
  } catch (e) {}
  var velLon = 0, velLat = 0;          // current inertia, deg/s
  var dragVelLon = 0, dragVelLat = 0;  // velocity sampled during drag
  var lastMoveT = 0;

  function saveSpin() {
    try { localStorage.setItem("globe_spin", JSON.stringify(spin)); } catch (e) {}
  }

  var speedSlider = document.getElementById("spinSpeed");
  var fricSlider = document.getElementById("spinFric");
  speedSlider.value = String(spin.speed);
  fricSlider.value = String(spin.glide);
  speedSlider.addEventListener("input", function () {
    spin.speed = parseInt(this.value, 10) || 0;
    saveSpin();
  });
  fricSlider.addEventListener("input", function () {
    spin.glide = parseInt(this.value, 10) || 0;
    saveSpin();
  });
  // Play/pause: the label always mirrors the real state — it also flips to
  // ▶ Play on its own if the speed slider hits 0 (the globe isn't going).
  var playBtn = document.getElementById("spinPlay");
  function refreshPlayBtn() {
    var label = !spin.paused && spin.speed > 0 ? "⏸ Pause" : "▶ Play";
    if (playBtn.textContent !== label) playBtn.textContent = label;
  }
  playBtn.addEventListener("click", function () {
    if (!spin.paused && spin.speed === 0) {
      // "Play" pressed while the slider is at zero: give it a speed again.
      spin.speed = 8;
      speedSlider.value = "8";
    } else {
      spin.paused = !spin.paused;
    }
    if (spin.paused) {
      velLon = velLat = 0; // a paused globe should actually stop
    } else {
      lastInteraction = Date.now() - 3000; // resume instantly
    }
    saveSpin();
    refreshPlayBtn();
  });

  document.getElementById("spinReset").addEventListener("click", function () {
    spin.speed = 8;
    spin.glide = 55;
    spin.dir = 1;
    spin.paused = false;
    speedSlider.value = "8";
    fricSlider.value = "55";
    velLon = velLat = 0;
    lastInteraction = Date.now() - 3000; // resume default spin immediately
    saveSpin();
    refreshPlayBtn();
  });

  function project(lon, lat) {
    var l = lon * DEG, p = lat * DEG, l0 = centerLon * DEG, p0 = centerLat * DEG;
    var cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
    if (cosc < 0) return null;
    return [
      CX + R * Math.cos(p) * Math.sin(l - l0),
      CY - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0))
    ];
  }

  // TopoJSON decoding: delta-decode quantized arcs, stitch arcs into rings.
  function decodeWorld(topo) {
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

  // Trace a lat/lon polyline, lifting the pen wherever it dips behind the horizon.
  function tracePath(pts) {
    var pen = false;
    for (var i = 0; i < pts.length; i++) {
      var xy = project(pts[i][0], pts[i][1]);
      if (xy) {
        if (pen) g2d.lineTo(xy[0], xy[1]);
        else { g2d.moveTo(xy[0], xy[1]); pen = true; }
      } else {
        pen = false;
      }
    }
  }

  function sampleLine(f) {
    var pts = [];
    for (var i = 0; i <= 72; i++) pts.push(f(i / 72));
    return pts;
  }

  function drawGlobe() {
    g2d.clearRect(0, 0, 640, 640);
    g2d.beginPath();
    g2d.arc(CX, CY, R, 0, 2 * Math.PI);
    g2d.fillStyle = "#262626";
    g2d.fill();
    g2d.strokeStyle = "#4d4d4d";
    g2d.lineWidth = 1.5;
    g2d.stroke();

    g2d.beginPath();
    for (var lon = -180; lon < 180; lon += 30) {
      (function (LN) { tracePath(sampleLine(function (t) { return [LN, -90 + 180 * t]; })); })(lon);
    }
    for (var lat = -60; lat <= 60; lat += 30) {
      (function (LT) { tracePath(sampleLine(function (t) { return [-180 + 360 * t, LT]; })); })(lat);
    }
    g2d.strokeStyle = "rgba(255,255,255,0.06)";
    g2d.lineWidth = 0.6;
    g2d.stroke();

    if (rings) {
      g2d.beginPath();
      rings.forEach(tracePath);
      g2d.strokeStyle = "#857c72";
      g2d.lineWidth = 0.8;
      g2d.stroke();
    }

    dotHits = [];
    var hlActive = highlight && Date.now() < highlight.until;
    points.forEach(function (p) {
      if (p.lat === null || p.lon === null) return;
      var xy = project(p.dlon, p.dlat);
      if (!xy) return;
      var hl = hlActive &&
        (highlight.type === "country"
          ? p.country === highlight.country
          : p.city === highlight.city && p.country === highlight.country);
      var pulse = hl ? 1 + 0.35 * Math.sin(Date.now() / 110) : 1;
      var r = Math.min(12, 3.5 + Math.sqrt(p.count) * 1.7);
      g2d.beginPath();
      g2d.arc(xy[0], xy[1], r * 2 * pulse, 0, 2 * Math.PI);
      g2d.fillStyle = hl ? "rgba(64,170,255,0.3)" : "rgba(255,92,51,0.15)";
      g2d.fill();
      g2d.beginPath();
      g2d.arc(xy[0], xy[1], r * (hl ? pulse * 0.6 + 0.4 : 1), 0, 2 * Math.PI);
      g2d.fillStyle = hl ? "#40AAFF" : "#FF5C33";
      g2d.fill();
      g2d.strokeStyle = hl ? "#eaf6ff" : "#1b1b1b";
      g2d.lineWidth = hl ? 1.5 : 1;
      g2d.stroke();
      dotHits.push({ x: xy[0], y: xy[1], r: r, p: p });
    });
  }

  // Clicked city/country: its dot(s) glow bright blue and pulse for a while.
  var highlight = null;
  function setHighlight(kind, c) {
    highlight = {
      type: kind,
      city: c.city || null,
      country: c.country || null,
      until: Date.now() + 10000
    };
  }

  // Smoothly swing the globe to center a target (used by the city/country
  // popovers). Holds auto-rotation for a few seconds afterwards.
  var flyTimer = null;
  function flyTo(lat, lon) {
    var startLon = centerLon, startLat = centerLat;
    var dLon = lon - startLon;
    while (dLon > 180) dLon -= 360;
    while (dLon < -180) dLon += 360;
    var dLat = Math.max(-75, Math.min(75, lat)) - startLat;
    var t0 = Date.now();
    lastInteraction = Date.now() + 5000;
    if (flyTimer) clearInterval(flyTimer);
    flyTimer = setInterval(function () {
      var t = Math.min(1, (Date.now() - t0) / 900);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      centerLon = startLon + dLon * e;
      centerLat = startLat + dLat * e;
      if (t >= 1) { clearInterval(flyTimer); flyTimer = null; }
    }, 16);
    document.getElementById("globe").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function canvasPos(ev) {
    var rect = canvas.getBoundingClientRect();
    var scale = 640 / rect.width;
    return [(ev.clientX - rect.left) * scale, (ev.clientY - rect.top) * scale];
  }

  function hitDot(ev, slopCss) {
    var pos = canvasPos(ev);
    var scale = 640 / canvas.getBoundingClientRect().width;
    var slop = (slopCss || 6) * scale;
    for (var i = dotHits.length - 1; i >= 0; i--) {
      var d = dotHits[i];
      var dx = pos[0] - d.x, dy = pos[1] - d.y;
      if (dx * dx + dy * dy <= (d.r + slop) * (d.r + slop)) return d;
    }
    return null;
  }

  function rangeLabel() {
    var sel = document.getElementById("range");
    return sel.options[sel.selectedIndex].text.toLowerCase();
  }

  // Click a dot → mini visit feed for that person (or the unknowns at that spot).
  function openPersonModal(p) {
    var title = document.getElementById("pTitle");
    var sub = document.getElementById("pSub");
    var list = document.getElementById("pList");
    title.innerHTML = "";
    title.appendChild(el("span", "nm", p.name || "Unknown visitor"));
    title.appendChild(document.createTextNode(" — visit history"));
    var loc = (p.city ? p.city + ", " : "") + (p.country || "");
    sub.innerHTML = "";
    var sf = flagEl(p.country);
    if (sf) sub.appendChild(sf);
    sub.appendChild(document.createTextNode((loc ? loc + " · " : "") +
      p.count + (p.count === 1 ? " visit" : " visits") + " · " + rangeLabel()));
    list.innerHTML = "";
    list.appendChild(el("div", "pv", "Loading…"));
    document.getElementById("pmodal").hidden = false;
    var q = p.name
      ? "name=" + encodeURIComponent(p.name)
      : "lat=" + encodeURIComponent(p.lat) + "&lon=" + encodeURIComponent(p.lon);
    if (curRange !== "all") q += "&range=" + curRange;
    fetch("/api/person-visits?" + q)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        list.innerHTML = "";
        var vs = d.visits || [];
        if (!vs.length) {
          list.appendChild(el("div", "pv", "No visits in this time range."));
          return;
        }
        vs.forEach(function (v) {
          var row = el("div", "pv");
          row.appendChild(el("span", "pv-when", fmtTs(v.ts)));
          row.appendChild(el("span", "pv-what",
            pageName(v.path) + (v.city ? " · " + v.city : "")));
          list.appendChild(row);
        });
      })
      .catch(function () {
        list.innerHTML = "";
        list.appendChild(el("div", "pv", "Couldn't load visit history."));
      });
  }

  function closePersonModal() { document.getElementById("pmodal").hidden = true; }
  document.getElementById("pClose").addEventListener("click", closePersonModal);
  document.getElementById("pmodal").addEventListener("click", function (ev) {
    if (ev.target === document.getElementById("pmodal")) closePersonModal();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closePersonModal();
  });

  var lastX = 0, lastY = 0, downX = 0, downY = 0;
  canvas.addEventListener("pointerdown", function (ev) {
    pointerDown = true;
    draggingActive = false;
    downX = lastX = ev.clientX;
    downY = lastY = ev.clientY;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();
  });
  canvas.addEventListener("pointermove", function (ev) {
    var tip = document.getElementById("gtip");
    if (!pointerDown) {
      var d = hitDot(ev);
      if (d) {
        var wrapRect = document.getElementById("globe-wrap").getBoundingClientRect();
        tip.innerHTML = "";
        var tf = flagEl(d.p.country);
        if (tf) tip.appendChild(tf);
        var loc = (d.p.city ? d.p.city + ", " : "") + (d.p.country || "");
        tip.appendChild(el("b", null, loc || "Unknown location"));
        tip.appendChild(document.createTextNode(
          " — " + (d.p.name || "Unknown") + " · " +
          d.p.count + (d.p.count === 1 ? " visit" : " visits")));
        tip.style.left = (ev.clientX - wrapRect.left) + "px";
        tip.style.top = (ev.clientY - wrapRect.top) + "px";
        tip.hidden = false;
        canvas.style.cursor = "pointer";
        lastInteraction = Date.now(); // hold the globe still while inspecting
      } else {
        tip.hidden = true;
        canvas.style.cursor = "grab";
      }
      return;
    }
    if (!draggingActive &&
        (Math.abs(ev.clientX - downX) > 4 || Math.abs(ev.clientY - downY) > 4)) {
      draggingActive = true;
      tip.hidden = true;
      velLon = velLat = 0; // grabbing the globe cancels any inertia
    }
    if (!draggingActive) return;
    var scale = 640 / canvas.getBoundingClientRect().width;
    var dLon = -(ev.clientX - lastX) * 0.28 * scale;
    var dLat = (ev.clientY - lastY) * 0.28 * scale;
    centerLon += dLon;
    centerLat = Math.max(-75, Math.min(75, centerLat + dLat));
    var now = Date.now();
    var dtm = Math.max(1, now - (lastMoveT || now - 16));
    dragVelLon = (dLon / dtm) * 1000;
    dragVelLat = (dLat / dtm) * 1000;
    lastMoveT = now;
    lastX = ev.clientX; lastY = ev.clientY;
    lastInteraction = now;
  });
  window.addEventListener("pointerup", function (ev) {
    if (!pointerDown) return;
    pointerDown = false;
    lastInteraction = Date.now();
    if (!draggingActive) {
      var d = hitDot(ev, ev.pointerType === "mouse" ? 8 : 22);
      if (d) openPersonModal(d.p);
    } else if (Date.now() - lastMoveT < 120) {
      // Flick: release while moving hands the globe the drag velocity, and
      // the spin controller follows the throw — slider and direction update
      // to the speed you flung it at, then the globe just keeps going.
      velLon = Math.max(-300, Math.min(300, dragVelLon));
      velLat = Math.max(-150, Math.min(150, dragVelLat));
      spin.speed = Math.min(60, Math.round(Math.abs(velLon)));
      spin.dir = velLon >= 0 ? 1 : -1;
      spin.paused = false; // physically throwing the globe overrides pause
      speedSlider.value = String(spin.speed);
      saveSpin();
      refreshPlayBtn();
      lastInteraction = Date.now() - 3000; // no idle pause: seamless handover
    }
    dragVelLon = dragVelLat = 0;
    draggingActive = false;
  });
  canvas.addEventListener("pointerleave", function () {
    document.getElementById("gtip").hidden = true;
    canvas.style.cursor = "grab";
  });

  var lastFrame = 0;
  function frame(tms) {
    if (!lastFrame) lastFrame = tms;
    var dt = Math.min(100, tms - lastFrame);
    lastFrame = tms;
    if (velLon !== 0 || velLat !== 0) {
      // Flick inertia eases toward the sustained spin target (the slider
      // value the throw just set), at a rate set by the glide slider —
      // 0 = settles instantly, 100 = long honey-smooth coast.
      var target = spin.dir * spin.speed;
      centerLon += ((velLon !== 0 ? velLon : target) * dt) / 1000;
      centerLat = Math.max(-75, Math.min(75, centerLat + (velLat * dt) / 1000));
      var k = Math.pow(0.82 + (spin.glide / 100) * 0.175, dt / 16);
      if (velLon !== 0) {
        velLon = target + (velLon - target) * k;
        if (Math.abs(velLon - target) < 0.5) velLon = 0;
      }
      velLat *= k;
      if (Math.abs(velLat) < 0.8) velLat = 0;
      lastInteraction = velLon === 0 && velLat === 0 ? Date.now() - 3000 : Date.now();
    } else if (!pointerDown && !spin.paused && Date.now() - lastInteraction > 2500) {
      centerLon += (spin.dir * spin.speed * dt) / 1000;
    }
    if (centerLon > 180) centerLon -= 360;
    if (centerLon < -180) centerLon += 360;
    refreshPlayBtn();
    drawGlobe();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  fetch("/world.json")
    .then(function (r) {
      if (!r.ok) throw new Error("bad status");
      return r.json();
    })
    .then(function (topo) { rings = decodeWorld(topo); })
    .catch(function () {
      document.getElementById("globe-fallback").hidden = false;
    });
})();
</script>
</body>
</html>`;
