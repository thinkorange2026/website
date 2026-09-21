// ⛔ RELATIVE, WITH THE EXTENSION — not the "@/" alias. `nav.js` imports this
// file now (to derive the notice detail routes), and `nav.js` is loaded by
// PLAIN NODE during Phase 9's prerender pass and by scripts/og-images.mjs,
// where the Vite alias does not exist. The same rule already applies to
// content/dsc/hyp2003.js for the same reason; this file only "got away with"
// the alias while nothing Node-side imported it.
import { s } from "../statutory.js";

// NOTICES — the single source behind two surfaces: the homepage's moving
// notice bar (`NoticeTicker`) and the `/dsc` notice board (`NoticeBoard`).
// Added 04-09-2026 on Clinton's request for both.
//
// ⛔ READ THIS BEFORE ADDING A NOTICE. A notice board is the single easiest
// place on a compliance firm's site to publish something unsourced, because
// the format invites short, confident, dated statements — which is exactly
// what CLAUDE.md's non-negotiables and CONTENT-PLAN.md §1.1's hold list exist
// to stop. So:
//
//   1. NEVER invent a deadline, a fee, a discount, an offer, a turnaround or a
//      "from <date>" announcement here. A statutory date or threshold goes in
//      `statutory.js` with its basis and source and is interpolated with
//      `s("key")` — never typed as a literal, exactly as in a service leaf.
//      A ThinkOrange turnaround goes in `turnaround.js` with `value: null`.
//   2. `confirmed: false` HIDES a notice from both surfaces. That is the
//      mechanism, not a formality — same discipline `testimonials.js` and
//      `home-hero.js` already carry. Draft freely with the flag off.
//   3. Every seed below RESTATES something this site already publishes and has
//      already had reviewed — see each `basis` line, which names where. Not one
//      is a new claim, and that is the only reason they could ship without
//      Clinton writing them.
//
// ⚠️ WHAT IS DELIBERATELY MISSING: dated announcements ("new rates from…",
// "office closed on…", "offer valid until…"). Those are the notices a real
// board carries and they are Clinton's to write — the shape supports them
// (`date`), and adding one is a one-line content edit. Nothing here fakes one
// in the meantime.
//
// Shape:
//   id        stable key (React key + future analytics)
//   scope     "site" (homepage bar) | "dsc" (board) | "both"
//   label     short mono tag — the practice area, not a severity
//   text      ONE sentence. The bar shows it inline; the board shows it as a
//             row. Long enough to be useful, short enough to read while moving.
//   href      optional — rendered ONLY on the board. The moving bar is
//             deliberately non-interactive; see NoticeTicker's own comment.
//   date      optional DD-MM-YYYY, rendered on the board when present.
//   confirmed false hides it everywhere.
//   basis     where this is already asserted on the site. Not rendered.
export const notices = [
  // ⛔ FIRST BY INSTRUCTION (Clinton, 20-09-2026): "i want to keep this notice
  // at top". Both surfaces render in array order, so position here IS the
  // ordering — there is no sort and no priority field. Move it and it moves on
  // the homepage bar, the /dsc/faqs board and /notices at once.
  //
  // ⚠️ THE ONLY NOTICE WITH A `detail` SLUG. That slug gives it a page of its
  // own (/notices/emsigner-3-3) and `href` is DERIVED from it below — do not
  // also write an `href` here, or the two can disagree. Everything on that page
  // is Clinton's own supplied draft, reproduced word for word; see
  // ./details.js before editing a syllable of it.
  //
  // The row text below is NOT new copy either: it is the draft's own headline
  // followed by its own sentence from "Who Must Upgrade to emSigner 3.3?",
  // joined. A notice row has to be one sentence, and this is the one the draft
  // already wrote.
  {
    id: "emsigner-3-3",
    detail: "emsigner-3-3",
    // ⛔ 20-09-2026 (Clinton): "show this notice in bar also. after hero
    // section. show this one olny." AT MOST ONE notice may carry this flag —
    // `featuredNotice()` returns the first and warns in dev about the rest, so a
    // second one silently not appearing is caught rather than shipped. The
    // homepage bar renders whatever is flagged here; it never names a slug, so
    // moving the feature is a one-line content edit.
    featured: true,
    scope: "both",
    label: "GST · DSC",
    text: "emSigner 3.3 is mandatory for all FIPS 140-3 hardware tokens — if you are using a FIPS 140-3 compliant hardware token, you must download and install emSigner 3.3.",
    // ⚠️ `title` and `meta` LIVE HERE, NOT IN ./details.js, and the split is
    // load-bearing: nav.js derives this route's label from `title` and
    // lib/seo.js resolves its <title> from `meta`, and neither may drag the
    // detail prose into the always-eager main chunk to reach them. Exactly the
    // insights/index.js ↔ insights/bodies.js arrangement.
    //
    // `text` above is the notice ROW's one sentence; `title` is the page's own
    // headline, verbatim from the draft and rendered as its <h1>.
    title: "GST Compliance Alert: emSigner 3.3 is Mandatory for All FIPS 140-3 Hardware Tokens",
    // ⚠️ SEO TAGS, NOT PAGE COPY — so these are written rather than quoted,
    // which is why "do not change a single word" is not broken by them. The
    // <title> drops the "GST Compliance Alert:" prefix the page's own eyebrow
    // and <h1> already establish, because all 88 characters of the headline are
    // truncated in every search result. The description is the draft's opening
    // sentence, shortened to fit roughly 155 characters.
    meta: {
      title: "emSigner 3.3 Required for FIPS 140-3 Tokens | ThinkOrange",
      description:
        "The GST network has released emSigner 3.3, a critical utility update for taxpayers and professionals filing returns using a Digital Signature Certificate.",
    },
    confirmed: true,
    basis:
      "ThinkOrange Content Draft — emSigner 3.3, supplied by Clinton 20-09-2026 and marked READY FOR PUBLISHING. Reproduced verbatim on /notices/emsigner-3-3; the date it turns on is statutory.js emsigner33GstEnforcement.",
  },
  {
    id: "income-tax-act-2025",
    scope: "site",
    label: "Income Tax",
    // ⚠️ The date is interpolated, never typed. `s()` is the same call every
    // service leaf uses, so a correction in statutory.js reaches this bar.
    text: `The Income Tax Act, 2025 has been in force since ${s("incomeTaxAct2025Commencement")} — "Assessment Year" is gone, replaced by "Tax Year", and sections and form numbers have changed.`,
    href: "/services/income-tax",
    confirmed: true,
    basis:
      "statutory.js incomeTaxAct2025Commencement; asserted across all four Income Tax leaves (19-08-2026).",
  },
  {
    id: "class-3-only",
    scope: "both",
    label: "DSC",
    text: "Class 3 is the only class of Digital Signature Certificate still issued — a Class 2 certificate cannot be renewed as one.",
    href: "/dsc#finder",
    confirmed: true,
    basis: "content/dsc/certificates.js — the Class 2 FAQ states this position.",
  },
  {
    id: "esign-not-dsc",
    scope: "both",
    label: "eSign",
    text: "Aadhaar eSign does not replace a Class 3 certificate on statutory portals — income tax, GST, MCA21 and e-tendering all require Class 3.",
    href: "/dsc/esign-solution",
    confirmed: true,
    // ⚠️ 07-09-2026: the comparison table this claim was drawn from is retained
    // but NO LONGER RENDERED (content/dsc/esign-solution.js), and the eSign
    // page it links to is a Coming Soon. The claim itself is unchanged and
    // still sourced — but nothing on the site currently states it in visible
    // copy, so it needs a home when the eSign page is written.
    basis:
      "Asserted three times when written: aadhaar-esign's verificationNote, the eSign comparison table, and the /dsc hub FAQ (18-08-2026).",
  },
  {
    id: "fips-token",
    scope: "dsc",
    label: "Tokens",
    text: "Every certificate we issue is installed on a FIPS 140-3 compliant USB crypto token — a certificate cannot be copied off one.",
    href: "/dsc/buy-token",
    confirmed: true,
    basis: "certificates.js tokenNote on every variant; token.js (03-09-2026).",
  },
  {
    id: "drivers-on-request",
    scope: "dsc",
    label: "Drivers",
    // ⚠️ REWRITTEN 04-09-2026, when Clinton supplied the real HYP2003
    // initialisation tool. The previous wording ("we send… the initialisation
    // tool directly rather than linking third-party installers") became false
    // the moment that file was hosted — a notice board asserting something the
    // same site contradicts two clicks away is worse than no notice. The
    // DRIVER files are still unhosted and still sent on request, so that half
    // stands; update this again when they are published.
    text: "The HYP2003 Windows installer is now a direct download — the supplied build is the initialisation utility, which erases the certificate on a token, so read the caution beside it. macOS and Linux builds are still sent on request.",
    href: "/dsc/drivers",
    confirmed: true,
    basis:
      "content/dsc/drivers.js — HYP2003's Windows row carries a real url (04-09-2026, Clinton: \"software link is for this\"); macOS, Linux and the reset-tool entry are still null.",
  },
];

/**
 * Where a notice's own page lives. ONE definition, because three things have to
 * agree on it and none of them can see the others: the row's `href` below,
 * nav.js's derived route, and the template that reads the slug back off the
 * pathname. A second spelling anywhere is a row linking at a 404.
 */
export function noticeDetailPath(slug) {
  return `/notices/${slug}`;
}

// A notice with a `detail` slug gets its `href` COMPUTED, never authored, so a
// renamed slug moves the route and the link together. Mapped once at module
// scope rather than inside `noticesFor`, so object identity stays stable across
// calls — `NoticeTicker` holds these in a ref and measures off them.
const visible = notices
  .filter((notice) => notice.confirmed)
  .map((notice) =>
    notice.detail ? { ...notice, href: noticeDetailPath(notice.detail) } : notice
  );

/**
 * The one notice the homepage bar carries, or undefined.
 *
 * ⚠️ READ OFF `visible`, so `confirmed: false` takes it off the homepage along
 * with everything else — the flag stays the single mechanism. Returns the
 * notice with its DERIVED `href`, which is what makes the bar clickable without
 * the homepage knowing anything about notice detail routes.
 */
export function featuredNotice() {
  const featured = visible.filter((notice) => notice.featured);
  if (import.meta.env?.DEV && featured.length > 1) {
    // Loud in dev, silent in production: a second `featured: true` renders
    // nothing at all, which looks like the flag not working rather than like a
    // slot that is already taken.
    console.warn(
      `[notices] ${featured.length} notices are marked \`featured\`; only "${featured[0].id}" is shown. Clear the flag on the others.`
    );
  }
  return featured[0];
}

/**
 * Confirmed notices that have a page of their own, for nav.js's route table.
 *
 * ⚠️ DERIVED FROM `visible`, so `confirmed: false` withholds the ROUTE as well
 * as the row. A hidden notice with a live, crawlable, prerendered page would
 * defeat the flag entirely — it is the one mechanism standing between this file
 * and an unreviewed claim on the site.
 */
export function noticesWithDetail() {
  return visible.filter((notice) => notice.detail);
}

/**
 * Notices for one surface. "both" appears on either.
 *
 * `"all"` is not a value any notice carries — it is the read-side request for
 * every confirmed notice regardless of scope, which is what the /notices page
 * needs (added 11-09-2026 with that page). Kept here rather than as a second
 * exported helper so there is ONE place that decides what "visible" means.
 *
 * ⚠️ Returns a NEW array each call but the SAME objects, so it is safe to map
 * over in render and safe to hold in a ref. Callers must not mutate entries.
 */
export function noticesFor(scope) {
  if (scope === "all") return [...visible];
  return visible.filter((notice) => notice.scope === scope || notice.scope === "both");
}
