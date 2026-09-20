import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { arcPath } from "../src/lib/arc.js";
import { ogImagePath } from "../src/lib/ogImage.js";
import { resolveSeo } from "../src/lib/seo.js";
import { site, sitemapPaths } from "../src/content/nav.js";

// PER-PAGE OPEN GRAPH CARDS.
//
// ⛔ 11-09-2026. Before this, ONE `og:image` was used on every route — the
// homepage hero photograph — so pasting any link into WhatsApp showed the same
// picture whatever you were actually sending. (The title and description were
// already per-page and correct; only the image was generic.)
//
// ⚠️ NO BROWSER, NO HEADLESS CHROME. The card is an SVG composed here and
// rasterised by sharp, which is already installed for vite-imagetools. A build
// step that needs Chrome is a build step that breaks on a deploy host.
//
// ⚠️ THE TYPEFACE IS NOT SATOSHI, deliberately. librsvg resolves fonts through
// fontconfig, i.e. fonts installed on the machine — the site's self-hosted
// Satoshi in public/fonts is invisible to it, and wiring a per-machine
// fontconfig into the build to fix that is exactly the fragility this avoids.
// The cards are recognisable through the ember arc, the ink ground and the
// layout rather than through the typeface. Consequence to know: two machines
// with different fonts produce visually slightly different cards. They are
// regenerated on every build, so they never disagree with the HTML.

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const W = 1200;
const H = 630;
const PAD = 88;
const TEXT_W = 1024;   // the safe measure, well clear of the arc on the right
const TEXT_MAX_H = 250;

// Tokens, copied from theme.css rather than imported — theme.css is CSS, and
// these five values are the whole palette this card uses.
const INK_950 = "#070c1c";
const INK_900 = "#0b1329";
const INK_300 = "#7a88af";
const EMBER_400 = "#f26522";
const CANVAS = "#fbf9f5";

const FONT = "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif";

const esc = (s) =>
  String(s).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]
  );

/** The section a route belongs to — the card's eyebrow. */
function sectionLabel(path) {
  if (path === "/") return site.shortName;
  if (path.startsWith("/dsc")) return "Digital Signatures";
  if (path.startsWith("/services")) return "Services";
  if (path.startsWith("/insights")) return "Insights";
  if (path.startsWith("/partner")) return "Partner Programme";
  if (path.startsWith("/contact")) return "Contact";
  if (path.startsWith("/about")) return "About";
  return site.shortName;
}

/**
 * The page's title with the brand dropped — the card already says ThinkOrange,
 * in the eyebrow and in the domain line.
 *
 * ⚠️ SPLIT ON THE PIPE, don't strip a suffix. Most titles are "Page |
 * ThinkOrange Consulting", but the HOMEPAGE has it the other way round
 * ("ThinkOrange Consulting | GST, Income Tax & Compliance Advisory — Salem"),
 * so a suffix-only rule left the brand AND a dangling pipe in the middle of
 * that one card. Dropping whichever segment IS the brand handles both.
 */
function cardTitle(path) {
  const title = resolveSeo(path).title;
  const kept = title
    .split("|")
    .map((part) => part.trim())
    .filter((part) => part && !/^ThinkOrange\b/i.test(part));
  // A title that is nothing BUT the brand keeps it, rather than emitting a card
  // with no title at all.
  return kept.length > 0 ? kept.join(" — ") : title.trim();
}

/** Greedy wrap on an estimated advance — the measured fit below is what
 *  actually guarantees it stays inside the box, so this only has to be close. */
function wrap(text, size, maxLines) {
  const perLine = Math.max(8, Math.floor(TEXT_W / (size * 0.52)));
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s—-]+$/, "")}…`;
    return kept;
  }
  return lines;
}

function titleSvg(lines, size, fill) {
  const leading = size * 1.16;
  return lines
    .map(
      (line, i) =>
        `<text x="0" y="${(i * leading + size * 0.8).toFixed(1)}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="${fill}">${esc(line)}</text>`
    )
    .join("");
}

/**
 * ⛔ THE FIT IS MEASURED, NOT ESTIMATED, and that is the whole reason these
 * cards are safe to generate for a route whose title nobody has looked at.
 * Character-width estimates are wrong by whatever the actual font turns out to
 * be, and an overflowing title is invisible until someone shares the page. So
 * the text is rendered ALONE on a transparent ground and the raw alpha channel
 * scanned for its true ink extent; if it spills, the size drops and it is
 * measured again.
 */
async function measureInk(innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g transform="translate(0,0)">${innerSvg}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y += 1) {
    const row = y * info.width * info.channels;
    for (let x = 0; x < info.width; x += 1) {
      if (data[row + x * info.channels + 3] > 8) {
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { maxX, maxY };
}

async function fitTitle(title) {
  for (const size of [58, 52, 46, 41, 36]) {
    const lines = wrap(title, size, 4);
    const { maxX, maxY } = await measureInk(titleSvg(lines, size, "#ffffff"));
    if (maxX <= TEXT_W && maxY <= TEXT_MAX_H) return { lines, size };
  }
  // Every candidate overflowed — take the smallest and truncate harder rather
  // than emitting a card with the title running off the edge.
  const size = 36;
  return { lines: wrap(title, size, 3), size };
}

function cardSvg({ eyebrow, lines, size }) {
  // The site's ONE repeated shape, from lib/arc.js, so the card carries the
  // same crescent the hero and the CTA band do rather than a lookalike.
  // Bled off the right edge, well clear of the text measure.
  const rings = [176, 138, 104]
    .map(
      (r, i) =>
        `<path d="${arcPath(r)}" fill="none" stroke="${EMBER_400}" stroke-width="${[16, 10, 6][i]}" stroke-linecap="round" opacity="${[0.16, 0.1, 0.06][i]}"/>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK_900}"/>
      <stop offset="1" stop-color="${INK_950}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <g transform="translate(${W - 250} ${H / 2 - 200}) scale(1.05)">${rings}</g>
  <rect x="0" y="0" width="${W}" height="6" fill="${EMBER_400}"/>
  <g transform="translate(${PAD} ${PAD + 8})">
    <text x="0" y="0" font-family="${FONT}" font-size="22" font-weight="600" letter-spacing="3.2" fill="${EMBER_400}">${esc(eyebrow.toUpperCase())}</text>
  </g>
  <g transform="translate(${PAD} ${PAD + 96})">${titleSvg(lines, size, CANVAS)}</g>
  <g transform="translate(${PAD} ${H - PAD + 6})">
    <text x="0" y="0" font-family="${FONT}" font-size="24" font-weight="500" fill="${INK_300}">${esc(site.domain)}</text>
  </g>
</svg>`;
}

export async function generateOgImages({ outDir, quiet = false } = {}) {
  const dir = join(outDir ?? join(ROOT, "dist"), "og");
  await mkdir(dir, { recursive: true });

  // Every route that gets a page, plus the wildcard — which `ogImagePath`
  // folds onto the home card, so it needs no file of its own.
  const paths = sitemapPaths();
  const written = new Set();

  for (const path of paths) {
    const file = ogImagePath(path).replace(/^\/og\//, "");
    if (written.has(file)) continue;
    const title = cardTitle(path);
    const { lines, size } = await fitTitle(title);
    const png = await sharp(Buffer.from(cardSvg({ eyebrow: sectionLabel(path), lines, size })))
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(join(dir, file), png);
    written.add(file);
  }

  if (!quiet) console.log(`[og] wrote ${written.size} cards to dist/og/`);
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await generateOgImages();
}
