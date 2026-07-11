// Senpex / Pckup — Team Birthday Tracker
// Cloudflare Worker entry point: routing only. Everything else lives in
// focused modules — see the README for the layout.

import { json, htmlPage } from "./lib/http.js";
import { serveFaviconIco, serveFaviconPng, serveLogo } from "./assets/serve.js";
import { avatarImg, listBirthdays, submit, editEntry, deleteEntry } from "./api/birthdays.js";
import { logVisit, listVisits, personVisits } from "./api/visits.js";
import { icsFeed } from "./api/calendar.js";
import { listTitles } from "./api/titles.js";
import { recommendTitle } from "./api/recommendations.js";
import { xAuthStart, xAuthCallback } from "./auth/x.js";
import { igAuthStart, igAuthCallback } from "./auth/instagram.js";
import { worldJson } from "./proxies/world.js";
import { flagPng } from "./proxies/flags.js";
import { PAGE } from "./pages/home.js";
import { VISITORS_PAGE } from "./pages/visitors.js";
import { CHANGELOG_PAGE } from "./pages/changelog.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/"));
        return htmlPage(PAGE);
      }
      if (url.pathname === "/visitors" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/visitors"));
        return htmlPage(VISITORS_PAGE);
      }
      if (url.pathname === "/changelog" && request.method === "GET") {
        ctx.waitUntil(logVisit(env, request, "/changelog"));
        return htmlPage(CHANGELOG_PAGE);
      }
      if (url.pathname === "/api/birthdays" && request.method === "GET") {
        return listBirthdays(env, request);
      }
      if (url.pathname === "/api/titles" && request.method === "GET") {
        return listTitles();
      }
      if (url.pathname === "/api/recommend-title" && request.method === "POST") {
        return recommendTitle(request, env);
      }
      if (url.pathname === "/api/submit" && request.method === "POST") {
        return submit(request, env);
      }
      if (url.pathname === "/api/edit" && request.method === "POST") {
        return editEntry(request, env);
      }
      if (url.pathname === "/api/delete" && request.method === "POST") {
        return deleteEntry(request, env);
      }
      if (url.pathname === "/auth/x/start" && request.method === "GET") {
        return xAuthStart(request, env);
      }
      if (url.pathname === "/auth/x/callback" && request.method === "GET") {
        return xAuthCallback(request, env);
      }
      if (url.pathname === "/auth/ig/start" && request.method === "GET") {
        return igAuthStart(request, env);
      }
      if (url.pathname === "/auth/ig/callback" && request.method === "GET") {
        return igAuthCallback(request, env);
      }
      if (url.pathname === "/api/visits" && request.method === "GET") {
        return listVisits(env, url);
      }
      if (url.pathname === "/api/person-visits" && request.method === "GET") {
        return personVisits(env, url);
      }
      if (url.pathname === "/world.json" && request.method === "GET") {
        return worldJson();
      }
      if (url.pathname.startsWith("/flag/") && request.method === "GET") {
        return flagPng(url.pathname.slice(6));
      }
      if (url.pathname.startsWith("/avatar/") && request.method === "GET") {
        return avatarImg(env, url.pathname.slice(8));
      }
      if (url.pathname === "/calendar.ics" && request.method === "GET") {
        return icsFeed(env);
      }
      if (url.pathname === "/favicon.ico") {
        return serveFaviconIco();
      }
      if (
        url.pathname === "/favicon.png" ||
        url.pathname === "/apple-touch-icon.png"
      ) {
        return serveFaviconPng();
      }
      if (url.pathname === "/logo.png") {
        return serveLogo();
      }
      return new Response("Not found", { status: 404 });
    } catch (err) {
      return json({ error: "Server error: " + err.message }, 500);
    }
  },
};
