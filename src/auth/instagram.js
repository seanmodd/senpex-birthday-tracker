// "Sign in with Instagram" (Instagram API with Instagram Login).

import { b64url } from "../lib/util.js";

// ---------- "Sign in with Instagram" (Instagram API with Instagram Login) ----------
// Same popup pattern as X. Works for professional (business/creator)
// accounts — Meta retired OAuth for personal accounts with Basic Display
// (Dec 2024). Needs IG_APP_ID + IG_APP_SECRET secrets and the callback URL
// registered in the Meta app's Instagram business-login settings.

export async function igAuthStart(request, env) {
  if (!env.IG_APP_ID)
    return new Response("Instagram sign-in isn't configured yet.", { status: 503 });
  const origin = new URL(request.url).origin;
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const auth = new URL("https://www.instagram.com/oauth/authorize");
  auth.searchParams.set("client_id", env.IG_APP_ID);
  auth.searchParams.set("redirect_uri", origin + "/auth/ig/callback");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "instagram_business_basic");
  auth.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      location: auth.toString(),
      "set-cookie":
        "igoauth=" + state + "; Max-Age=600; Path=/auth/ig; HttpOnly; Secure; SameSite=Lax",
    },
  });
}

export async function igAuthCallback(request, env) {
  const url = new URL(request.url);
  const closeMsg = (msg) =>
    new Response(
      "<!doctype html><script>try{if(window.opener)window.opener.postMessage(" +
        JSON.stringify(msg) + "," + JSON.stringify(url.origin) +
        ");}catch(e){}window.close();</script>" +
        "<p style=\"font-family:sans-serif\">You can close this window.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("cookie") || "").match(/(?:^|;\s*)igoauth=([^;]+)/);
  if (!code || !state || !cookie)
    return closeMsg({ igAuthError: "Instagram sign-in was cancelled or timed out — try again." });
  if (state !== cookie[1])
    return closeMsg({ igAuthError: "Sign-in session mismatch — try again." });

  const form = new URLSearchParams({
    client_id: env.IG_APP_ID,
    client_secret: env.IG_APP_SECRET || "",
    grant_type: "authorization_code",
    redirect_uri: url.origin + "/auth/ig/callback",
    code: code,
  });
  const tr = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: form,
  });
  const tj = await tr.json().catch(() => ({}));
  if (!tj.access_token) {
    console.log("ig-oauth: token exchange failed " + tr.status + " " + JSON.stringify(tj).slice(0, 300));
    return closeMsg({
      igAuthError:
        "Instagram sign-in failed — make sure your account is a professional (business/creator) account, then try again.",
    });
  }
  const ur = await fetch(
    "https://graph.instagram.com/v22.0/me?fields=username&access_token=" +
      encodeURIComponent(tj.access_token)
  );
  const uj = await ur.json().catch(() => ({}));
  if (!uj.username) {
    console.log("ig-oauth: me lookup failed " + ur.status + " " + JSON.stringify(uj).slice(0, 300));
    return closeMsg({ igAuthError: "Signed in, but couldn't read your Instagram username — try again." });
  }
  console.log("ig-oauth: verified @" + uj.username + " via Sign in with Instagram");
  return closeMsg({ igUsername: uj.username });
}
