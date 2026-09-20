// Homepage hero content — the stat row (DESIGN.md §11.4's hairline treatment,
// pulled up into the hero) and the capability card that sits over the hero
// image slot. Neither holds a statutory value (no rupee amounts, form codes,
// penalties or deadlines), so nothing here belongs in statutory.js.

import { site } from "./nav.js";

// ✅ SIGNED OFF 11-09-2026. `clients` and `years` were placeholders from
// 11-08-2026 — dummy figures Clinton asked for to judge the hero layout, which
// is why they are round. They carried `confirmed: false` for a month and
// `content:check` warned on every run.
//
// Asked directly, with the row listed as a launch blocker and the options
// spelled out (publish / delete / different numbers), Clinton answered "the
// figures are accurate — publish them". That is the deliberate sign-off the
// flag was waiting for, as distinct from the earlier values given in passing
// while looking at a layout.
//
// ⚠️ THESE ARE NOW PUBLISHED CLAIMS ABOUT THE BUSINESS, on the homepage hero
// and on /about. Client count and years of experience are both on
// CONTENT-PLAN.md §1.1's hold list and nav.js's confirmed-facts block, so this
// is the one place either is allowed to exist — do not restate them anywhere
// else, and do not let a future edit change a value without the same
// confirmation. The client count has already moved 250+ → 500+ → 1000+.
//
// The `confirmed` flag and `confirmedHeroStats()` stay: they are the mechanism,
// and a future stat added speculatively must default to `false` so
// `content:check` catches it the same way.
export const heroStats = [
  // ⚠️ The value lives HERE, not on /about, and that page reads this same entry
  // — the homepage already renders it, so two pages stating the figure from two
  // places is a contradiction waiting to be shipped. One number, one source.
  { id: "clients", value: "1000+", label: "Clients served", confirmed: true },
  { id: "years", value: "10+", label: "Years of practice", confirmed: true },
  // Both below are confirmed: pan-India service scope is already asserted in
  // index.html's meta description, and the location comes from nav.js.
  {
    id: "reach",
    value: "15+",
    label: "States & UTs served",
    confirmed: true,
  },
  {
    id: "base",
    value: `${site.locality}, TN`,
    label: "Head office",
    confirmed: true,
  },
];

/** Stats safe to render right now. */
export function confirmedHeroStats() {
  return heroStats.filter((stat) => stat.confirmed);
}

/** Stats still awaiting founder sign-off — surfaced by content:check. */
export function unconfirmedHeroStats() {
  return heroStats.filter((stat) => !stat.confirmed);
}

// The hero's rotating H1 (17-08-2026). Each headline types in, holds, erases,
// and hands over to the next, round-robin, in the page's main heading itself.
//
// Approved copy, not drafted here: Clinton picked the "X, without the Y"
// pattern on 17-08-2026. All three are used, the original "Compliance,
// without the scramble." first.
//
// ⚠️ THE 3-LINE SHAPE IS LOAD-BEARING, NOT FORMATTING. At display-xl over the
// hero's 7-column measure, a headline allowed to wrap naturally rewraps
// mid-phrase and the typing loses its per-line structure — this was already
// true of the pre-typewriter LineMask version. Every entry is therefore
// pre-broken into exactly three lines, and every entry's SECOND line is the
// same word ("without"). That is what keeps the heading's height and its
// visual rhythm identical across the rotation, so nothing below it shifts
// when a headline swaps. A new entry must keep both properties.
//
// Same discipline as heroCapabilities below — these are rhetorical framings
// of service scope, not claims. No fee, turnaround, count, deadline or form
// code appears in any of them, so nothing here belongs in statutory.js or
// turnaround.js. Keep it that way: "Filed in 3 days, without the follow-ups"
// would be an invented turnaround guarantee wearing a slogan's clothes.
//
// `emphasis` is the trailing word rendered in serif italic ember — the
// established treatment for the headline's last word.
export const heroHeadlines = [
  { lines: ["Compliance,", "without"], lead: "the ", emphasis: "scramble." },
  { lines: ["Deadlines,", "without"], lead: "the ", emphasis: "dread." },
  { lines: ["Filings,", "without"], lead: "the ", emphasis: "follow-ups." },
];

// Plain-language summaries of the six service clusters in nav.js. Descriptive
// scope only — deliberately no counts, no fees, no turnaround claims, and no
// form codes, so this stays outside statutory.js's remit. Keep each to one
// line; this card is scannable, not a services page.
export const heroCapabilities = [
  "GST returns, refunds & departmental notices",
  "Income tax filing and year-round planning",
  "Company, LLP & MSME incorporation",
  "Internal audit and monthly bookkeeping",
  "GeM registration and tender documentation",
  "Class 3 & DGFT Digital Signature Certificates",
];
