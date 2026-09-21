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
/**
 * The card's pixel size. Lives here rather than in og-images.mjs because THREE
 * things now have to agree on it: the generator that rasterises the PNG, and
 * the two <head> writers that declare `og:image:width`/`height` (prerender.mjs
 * for the static HTML, RootLayout.jsx for client-side navigation). Declaring a
 * size that does not match the file is worse than declaring none — a scraper
 * that trusts the tag renders a stretched card.
 *
 * 1200x630 is the 1.91:1 ratio WhatsApp, X, LinkedIn and Facebook all render
 * large; it is what the generator has always used.
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function ogImagePath(path) {
  if (!path || path === "/") return "/og/home.png";
  const clean = path.replace(/\/+$/, "").replace(/^\/+/, "");
  // The wildcard route has no single URL; it takes the home card.
  if (!clean || clean === "*") return "/og/home.png";
  return `/og/${clean.replace(/\//g, "-")}.png`;
}
