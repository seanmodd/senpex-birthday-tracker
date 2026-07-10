// "Sign in with X" (OAuth 2.0 + PKCE).

import { b64url } from "../lib/util.js";

export async function xAuthStart(request, env) {
  if (!env.X_CLIENT_ID)
    return new Response("X sign-in isn't configured yet.", { status: 503 });
  const origin = new URL(request.url).origin;
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const challenge = b64url(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  );
  const auth = new URL("https://x.com/i/oauth2/authorize");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("client_id", env.X_CLIENT_ID);
  auth.searchParams.set("redirect_uri", origin + "/auth/x/callback");
  auth.searchParams.set("scope", "users.read tweet.read");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", challenge);
  auth.searchParams.set("code_challenge_method", "S256");
  return new Response(null, {
    status: 302,
    headers: {
      location: auth.toString(),
      "set-cookie":
        "xoauth=" + verifier + "." + state +
        "; Max-Age=600; Path=/auth/x; HttpOnly; Secure; SameSite=Lax",
    },
  });
}

export async function xAuthCallback(request, env) {
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
  const cookie = (request.headers.get("cookie") || "").match(/(?:^|;\s*)xoauth=([^;]+)/);
  if (!code || !state || !cookie)
    return closeMsg({ xAuthError: "X sign-in was cancelled or timed out — try again." });
  const parts = cookie[1].split(".");
  if (state !== parts[1])
    return closeMsg({ xAuthError: "Sign-in session mismatch — try again." });

  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: url.origin + "/auth/x/callback",
    client_id: env.X_CLIENT_ID,
    code_verifier: parts[0],
  });
  const headers = { "content-type": "application/x-www-form-urlencoded" };
  if (env.X_CLIENT_SECRET)
    headers.authorization = "Basic " + btoa(env.X_CLIENT_ID + ":" + env.X_CLIENT_SECRET);
  const tr = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers,
    body: form,
  });
  const tj = await tr.json();
  if (!tj.access_token) {
    console.log("x-oauth: token exchange failed " + tr.status + " " + JSON.stringify(tj).slice(0, 300));
    return closeMsg({ xAuthError: "X sign-in failed at the token step — try again." });
  }
  const ur = await fetch("https://api.x.com/2/users/me", {
    headers: { authorization: "Bearer " + tj.access_token },
  });
  const uj = await ur.json();
  const username = uj.data && uj.data.username;
  if (!username) {
    console.log("x-oauth: users/me failed " + ur.status + " " + JSON.stringify(uj).slice(0, 300));
    return closeMsg({ xAuthError: "Signed in, but couldn't read your X profile — try again." });
  }
  console.log("x-oauth: verified @" + username + " via Sign in with X");
  return closeMsg({ xUsername: username });
}
