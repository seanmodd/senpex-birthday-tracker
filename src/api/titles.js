// The approved job-title library, served to the form's autocomplete.

import { TITLE_LIBRARY } from "../lib/titles.js";

export function listTitles() {
  return new Response(JSON.stringify({ groups: TITLE_LIBRARY }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
