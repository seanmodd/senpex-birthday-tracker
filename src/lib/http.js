// Response helpers.

import { BUILD_NOTE } from "../config.js";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Serve one of the HTML pages: build-info stamped in, never cached.
export function htmlPage(html) {
  return new Response(html.replace("__BUILDINFO__", BUILD_NOTE), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
