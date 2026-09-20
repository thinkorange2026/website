// WHERE A ROUTE'S OG CARD LIVES — one function, because two things have to
// agree on it and they run in different processes: `resolveSeo` writes the
// `og:image` tag into every page's <head>, and `scripts/og-images.mjs` writes
// the file. A tag pointing at a file nobody generated is a broken preview that
// nothing else on this site would catch, so `prerender.mjs` asserts the two
// match at build time.
//
// ⚠️ Plain Node-importable: no JSX, no aliases, explicit extensions. Both
// callers are Node scripts.

/**
 * `/dsc/tenders` -> `/og/dsc-tenders.png`.
 *
 * ⚠️ The trailing slash is stripped for the same reason `normalisePath` exists
 * in analytics.js: a hard load of a prerendered route arrives as `/dsc/` and an
 * in-app navigation as `/dsc`, and the client-side <head> sync resolves this
 * from the live pathname. Without it, half the visits would point at
 * `/og/dsc-.png`, which does not exist.
 */
export function ogImagePath(path) {
  if (!path || path === "/") return "/og/home.png";
  const clean = path.replace(/\/+$/, "").replace(/^\/+/, "");
  // The wildcard route has no single URL; it takes the home card.
  if (!clean || clean === "*") return "/og/home.png";
  return `/og/${clean.replace(/\//g, "-")}.png`;
}
