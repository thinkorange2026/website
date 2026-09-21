// Phase 9 — prerenders every route to static HTML and writes the retired-URL
// redirect stubs. Run via `npm run build` (wired as `postbuild`, which npm runs
// automatically once `vite build` finishes) — never directly against a stale or
// missing dist/.
//
// ⚠️ robots.txt / sitemap.xml / llms.txt ARE NO LONGER WRITTEN HERE. They moved
// to scripts/seo-files.mjs, which runs as `prebuild` and writes them into
// `public/` so they are committed and visible in the repo rather than existing
// only inside gitignored build output (Clinton, 21-09-2026). Vite copies
// `public/` into `dist/`; `assertSeoFilesShipped()` below verifies that landed.
//
// Approach (BUILD-PLAN.md §1's resolution — vite-react-ssg was ruled out
// early for pinning a react-router-dom@^6 peer range that conflicts with
// this project's locked v7 stack):
//   1. `vite build --ssr src/entry-server.jsx` compiles the app into a
//      Node-runnable SSR bundle (handles JSX/the "@/" alias/CSS imports —
//      none of which plain Node can do on its own).
//   2. Import that bundle's `render(path)` and call it once per route.
//   3. Splice the resulting body HTML and a route's resolved <head> tags
//      (src/lib/seo.js's resolveSeo — the SAME function useSeoHead() uses
//      client-side, so build-time and post-hydration <head> can't disagree)
//      into the dist/index.html template Vite already produced.
//   4. Write each route to dist/<path>/index.html (dist/index.html itself
//      for "/"), plus dist/404.html for the wildcard — the convention most
//      static hosts (Netlify, GitHub Pages, Cloudflare Pages) look for.
//
// JSON-LD needs no separate injection step here: every schema block (see
// src/components/seo/JsonLd.jsx call sites) is rendered as part of the React
// tree itself, so it's already inside the body HTML render() returns.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { site, sitemapPaths, dscRetiredRoutes } from "../src/content/nav.js";
import { generateOgImages } from "./og-images.mjs";
import { resolveSeo } from "../src/lib/seo.js";
import { ogImagePath, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "../src/lib/ogImage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SSR_OUT_DIR = "dist-server";
const SSR_OUT = path.join(ROOT, SSR_OUT_DIR);
const ORIGIN = `https://${site.domain}`;

// react-router needs a real, unmatched URL to exercise the "*" wildcard
// route — "*" itself isn't a fetchable path. resolveSeo("*") is still called
// with the literal "*" (that's the actual key nav.js's route table uses).
const NOT_FOUND_PROBE_PATH = "/__prerender_404_probe__";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHeadBlock(seo) {
  const { title, description, canonical, robots, ogImage } = seo;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const lines = [
    "<!-- SEO:START -->",
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${robots}" />`,
  ];
  if (canonical) lines.push(`<link rel="canonical" href="${canonical}" />`);
  lines.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.shortName)}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${canonical ?? `${ORIGIN}/`}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    // Declared so a scraper can lay the card out without fetching it first.
    // ⚠️ The numbers come from lib/ogImage.js, the same contract the generator
    // rasterises to — a hardcoded pair here is how the tag and the file drift.
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    // The card renders the page title as its only text, so the title IS the
    // alt text. Not a second string to keep in step.
    `<meta property="og:image:alt" content="${t}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    // X falls back to og:image, so this was working implicitly; stated
    // explicitly because "works by fallback" is not a thing to rely on.
    `<meta name="twitter:image" content="${ogImage}" />`,
    "<!-- SEO:END -->"
  );
  return lines.join("\n    ");
}

function renderHtmlFor(template, bodyHtml, seo) {
  return template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, buildHeadBlock(seo))
    .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function outputFileFor(routePath) {
  if (routePath === "*") return path.join(DIST, "404.html");
  if (routePath === "/") return path.join(DIST, "index.html");
  return path.join(DIST, routePath, "index.html");
}

/**
 * The three crawler-facing files are written into `public/` by the PREBUILD
 * step (scripts/seo-files.mjs) and reach `dist/` only because Vite copies
 * `public/` during the build. This asserts that copy actually happened.
 *
 * ⛔ WORTH A BUILD GATE because every failure mode here is SILENT. If the
 * prebuild is skipped — someone overrides Vercel's build command to bare
 * `vite build`, or runs `vite build` directly — the site deploys perfectly and
 * simply has no sitemap and no robots.txt. Nothing errors, no page 404s, and
 * the only symptom is a slow decline in Search Console weeks later. Same
 * reasoning as the og:image and dangling-fragment gates.
 */
function assertSeoFilesShipped() {
  const required = ["robots.txt", "sitemap.xml", "llms.txt"];
  const missing = required.filter((name) => !existsSync(path.join(DIST, name)));
  if (missing.length) {
    throw new Error(
      `[prerender] missing from dist/: ${missing.join(", ")}. These are written into public/ ` +
        `by the prebuild step (scripts/seo-files.mjs) and copied by Vite. Run \`npm run build\`, ` +
        `not \`vite build\` — the latter skips prebuild.`
    );
  }
}

/**
 * Redirect stubs for retired URLs.
 *
 * ⛔ 02-09-2026: the five DSC certificate pages were merged into /dsc. Those
 * paths are live, are in the currently-deployed sitemap.xml, and are linked
 * from elsewhere — deleting them outright would 404 every one.
 *
 * This is a static host, so there is no server to answer 301 with. The stub
 * does the two things a static page can:
 *   - `<meta name="robots" content="noindex,follow">`, so the stub itself
 *     never competes with the page it points at while still passing the link
 *     on;
 *   - a `<meta http-equiv="refresh" content="0">` plus a `location.replace`,
 *     which moves a real visitor immediately and does not leave the stub in
 *     their back-button history the way `location.href` would.
 *
 * A visible link is rendered too, for the case where both JS and the refresh
 * are unavailable — a blank page with no way forward is the one outcome worth
 * ruling out.
 *
 * ⛔ THE `rel="canonical"` THAT USED TO BE HERE WAS REMOVED 21-09-2026, and it
 * should not come back. Two reasons, either sufficient:
 *   1. Google's own guidance is not to combine `noindex` with `rel=canonical`
 *      — they are contradictory instructions ("do not index me" against
 *      "credit this other page"), and the conflict can cause the canonical to
 *      be discarded rather than honoured.
 *   2. Every one of them pointed at a URL WITH A FRAGMENT
 *      (`https://thinkorange.in/dsc#finder`). Canonical URLs are compared after
 *      the fragment is stripped, so the fragment was never doing anything.
 * The meta-refresh is already read as a redirect, which is what consolidates
 * these to their destination. `to` is still used by the visible fallback link.
 *
 * These paths are deliberately NOT added to sitemap.xml: `sitemapPaths()`
 * derives from `allRoutes`, which no longer contains them, and asking a
 * crawler to index a noindex redirect is a contradiction.
 */
function writeRedirects() {
  for (const route of dscRetiredRoutes) {
    const to = `${ORIGIN}${route.redirectTo}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — ${route.label} | ThinkOrange Consulting</title>
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0; url=${route.redirectTo}">
<script>location.replace(${JSON.stringify(route.redirectTo)});</script>
</head>
<body>
<p>${route.label} is now part of <a href="${route.redirectTo}">Digital Signature Certificates</a>.</p>
</body>
</html>
`;
    const outFile = path.join(DIST, route.path.replace(/^\//, ""), "index.html");
    mkdirSync(path.dirname(outFile), { recursive: true });
    writeFileSync(outFile, html, "utf-8");
  }
}

/**
 * Fail the build on a DANGLING INTERNAL FRAGMENT — a link to `/some/page#id`
 * whose target page has no element with that id.
 *
 * ⛔ Added 03-09-2026 after the second instance of this exact bug. Nothing
 * errors, nothing logs, and a link-integrity scan PASSES it, because the path
 * is real and only the fragment is dead: the reader simply lands at the top of
 * a long page. Twice now a section was deleted from a template while the ids
 * naming it survived in nav.js — first as `/dsc#undefined` (a missing key),
 * then as `/dsc#certificates` (a key naming a deleted section, pointed at by
 * five redirect stubs, the homepage DSC band and the mega panel).
 *
 * Runs over the emitted HTML, which is the only place the question can
 * actually be answered — nav.js knows what it links to, and only the rendered
 * page knows what ids exist.
 */
/**
 * Every `og:image` a page points at must exist on disk.
 *
 * ⛔ A BROKEN PREVIEW IS INVISIBLE FROM INSIDE THE SITE. The page renders
 * perfectly, nothing errors, no link is dead and the link-integrity scan passes
 * — the only symptom is that a shared link previews as a blank card, which you
 * discover when a client pastes it into WhatsApp. `resolveSeo` and
 * `og-images.mjs` derive the filename from the same `ogImagePath`, so this can
 * only fail if one of them stops being run or a path slips past the generator;
 * that is precisely the failure worth catching at build time.
 *
 * Same shape as the fragment gate below, and for the same reason: a whole class
 * of silent breakage, checked against the RENDERED output rather than against
 * intentions.
 */
function assertOgImagesExist(paths) {
  const missing = [];
  for (const routePath of paths) {
    const file = ogImagePath(routePath).replace(/^\//, "");
    if (!existsSync(path.join(DIST, file))) missing.push(`${routePath} -> /${file}`);
  }
  if (missing.length > 0) {
    throw new Error(
      `[prerender] ${missing.length} route(s) point at an og:image that was not generated:\n  ${missing.join("\n  ")}`
    );
  }
  console.log(`[prerender] og:image present for all ${paths.length} routes`);
}

function assertNoDanglingFragments(paths) {
  const idsFor = new Map();
  const idsIn = (file) => {
    if (!idsFor.has(file)) {
      const html = readFileSync(file, "utf-8");
      idsFor.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsFor.get(file);
  };

  const bad = [];
  for (const routePath of paths) {
    const file = outputFileFor(routePath);
    const html = readFileSync(file, "utf-8");
    for (const match of html.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
      const [, target, fragment] = match;
      // Only same-site page fragments are checkable here. A fragment on a page
      // that is not itself prerendered (a redirect stub, say) has no rendered
      // HTML to look in.
      const targetFile = outputFileFor(target === "" ? "/" : target);
      if (!existsSync(targetFile)) continue;
      if (!idsIn(targetFile).has(fragment)) {
        bad.push(`${routePath} -> ${target}#${fragment}`);
      }
    }
  }

  if (bad.length) {
    throw new Error(
      `dangling fragment link(s) — the path exists but the target id does not:\n  ${[
        ...new Set(bad),
      ].join("\n  ")}`
    );
  }
}

async function main() {
  if (!existsSync(path.join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found — run `vite build` before prerendering.");
  }

  console.log("[prerender] building SSR bundle...");
  execSync(`npx vite build --ssr src/entry-server.jsx --outDir ${SSR_OUT_DIR} --logLevel warn`, {
    cwd: ROOT,
    stdio: "inherit",
  });

  const { render } = await import(pathToFileURL(path.join(SSR_OUT, "entry-server.js")));
  const template = readFileSync(path.join(DIST, "index.html"), "utf-8");
  const paths = sitemapPaths(); // crawlable routes, excludes "*"

  for (const routePath of paths) {
    const bodyHtml = await render(routePath);
    const html = renderHtmlFor(template, bodyHtml, resolveSeo(routePath));
    const outFile = outputFileFor(routePath);
    mkdirSync(path.dirname(outFile), { recursive: true });
    writeFileSync(outFile, html, "utf-8");
  }

  // 404 last, and separately: it renders off a probe path (see the constant
  // above) but its HEAD tags come from resolveSeo("*") — the real nav.js key.
  const notFoundBody = await render(NOT_FOUND_PROBE_PATH);
  const notFoundHtml = renderHtmlFor(template, notFoundBody, resolveSeo("*"));
  writeFileSync(outputFileFor("*"), notFoundHtml, "utf-8");

  assertNoDanglingFragments(paths);

  // ⚠️ AFTER the routes are written and BEFORE the assertion below: the cards
  // are built from `resolveSeo`'s own titles, so they cannot drift from the
  // <head> tags that reference them.
  await generateOgImages({ outDir: DIST, quiet: true });
  assertOgImagesExist(paths);

  writeRedirects();
  assertSeoFilesShipped();

  rmSync(SSR_OUT, { recursive: true, force: true });

  console.log(
    `[prerender] wrote ${paths.length} routes + ${dscRetiredRoutes.length} redirects + 404.html`
  );
}

main().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exitCode = 1;
});
