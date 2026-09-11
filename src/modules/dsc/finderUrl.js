import { finderSigners, finderUse, finderUses } from "@/content/dsc/finder";
import { kycRoutes } from "@/content/dsc/certificates";
import { dscIntentForUse } from "@/content/dsc/intents";
import { dscSectionIds, site } from "@/content/nav";

// THE FINDER'S URL CONTRACT — one place, because three consumers have to agree
// on it: the finder writes it as the reader answers, the finder reads it back
// on a shared link, and GA4 / Search Console report on whatever it emits.
//
// ⛔ QUERY PARAMS, NEVER THE HASH. `DscFinder.jsx` has always carried a note
// that the reference implementation pushes `#dsc/gst/org` and that this site
// deliberately does not: the hash on /dsc is already spoken for by the sticky
// sub-nav, the footer's DSC column, the mega panel's deep links and every
// retired-DSC redirect stub, and `RootLayout` scrolls the page on it. Writing
// selection state there would fight all five. A query string is inert to every
// one of them.
//
// ── SEO ──────────────────────────────────────────────────────────────────
// ⚠️ THESE PARAMS MUST NEVER SPLIT /dsc's RANKING, and the reason they do not
// is worth stating rather than assuming. Phase 9 prerenders ONE file per
// route, so every parameterised URL is served byte-identical `dist/dsc/
// index.html` — including its `<link rel="canonical" href=".../dsc">`, which
// `resolveSeo` builds from the PATHNAME alone. So Google consolidates every
// `?use=…` variant onto /dsc, and Search Console reports them as that one page.
// Two consequences to keep true:
//   1. `resolveSeo` must keep ignoring the query string. If a future change
//      ever makes the canonical reflect `location.href`, these URLs
//      immediately become duplicate-content variants of the page.
//   2. `sitemapPaths()` must never emit a parameterised URL. It builds from
//      nav.js, which knows nothing about these params, so this holds by
//      construction — do not "helpfully" add share links to the sitemap.
//
// ── ANALYTICS ────────────────────────────────────────────────────────────
// gtag's own `config` page_view sends `page_location`, i.e. the FULL href, so
// an arrival on a shared link is already catchable in GA4 with no extra code:
// filter page_location for `?use=`. The finder additionally fires
// `dsc_finder_result` (with a `source` telling a shared-link arrival apart
// from a live selection) and a GA4-recommended `share` event — see DscFinder.
// That is why the values below are stable lowercase keys with no spaces or
// punctuation: they are report dimensions as much as they are state.

/** The param names. Changing one breaks every link already shared. */
export const FINDER_PARAMS = {
  use: "use",
  signer: "signer",
  kyc: "kyc",
};

const DEFAULT_KYC = kycRoutes[0].key;

const isUse = (key) => finderUses.some((item) => item.key === key);
const isSigner = (key) => finderSigners.some((item) => item.key === key);
const isKyc = (key) => kycRoutes.some((item) => item.key === key);

/**
 * Read a selection back out of a query string.
 *
 * ⚠️ EVERY VALUE IS VALIDATED against the content model rather than trusted.
 * A URL is reader-editable and reaches us from anywhere, so an unknown `use`
 * has to degrade to "no selection" — not to a broken screen. An unrecognised
 * value is dropped silently: there is nothing useful to tell someone who
 * hand-edited a link, and the finder's first question is a perfectly good
 * place to land.
 *
 * ⚠️ A `signer` on a route that never asks question two is DROPPED, not kept.
 * Carrying it would let a shared link imply an answer the reader was never
 * asked for, and `signerKey` resolves to "any" on those routes anyway.
 */
export function parseFinderParams(search) {
  const params = new URLSearchParams(search || "");
  const useKey = params.get(FINDER_PARAMS.use);
  if (!isUse(useKey)) return { useKey: null, signer: null, kyc: null };

  const signer = params.get(FINDER_PARAMS.signer);
  const kyc = params.get(FINDER_PARAMS.kyc);
  const skips = Boolean(finderUse(useKey)?.skipsSigner);

  return {
    useKey,
    signer: !skips && isSigner(signer) ? signer : null,
    kyc: isKyc(kyc) ? kyc : null,
  };
}

/**
 * The query string for a selection — `""` when nothing has been chosen, so
 * a reader who backs out to question one gets a clean `/dsc` again.
 *
 * ⚠️ ONLY WHAT IS MEANINGFUL IS EMITTED. The signer is omitted on a route that
 * skips question two, and the verification route is omitted when it is the
 * default or when the certificate has no toggle at all. A shared link should
 * carry the reader's answers and nothing else — every extra param is one more
 * thing to read, to mistype, and to explain in a report.
 */
export function finderSearch({ useKey, signer, kyc }) {
  if (!isUse(useKey)) return "";

  const use = finderUse(useKey);
  const params = new URLSearchParams();
  params.set(FINDER_PARAMS.use, useKey);
  if (!use.skipsSigner && isSigner(signer)) params.set(FINDER_PARAMS.signer, signer);
  if (!use.noKyc && isKyc(kyc) && kyc !== DEFAULT_KYC) params.set(FINDER_PARAMS.kyc, kyc);

  return `?${params.toString()}`;
}

/**
 * The absolute URL the share button hands out.
 *
 * ⛔ 11-09-2026: THIS IS NOW THE INTENT PAGE, NOT THE FINDER. It used to be
 * `/dsc?use=…&signer=…#finder`, which previewed as the generic /dsc card
 * because the answer itself was not on that page in any form a link preview
 * (or a crawler) could see — the whole reason the four intent pages were built.
 * `/dsc/tenders` has its own title, its own description and its own OG card, so
 * the recipient sees what they were actually sent.
 *
 * ⚠️ The SIGNER survives as `?signer=company`, so precision is not lost. It was
 * a FRAGMENT (`#signer-company`) in the first cut, when the page rendered all
 * three signers as sections; once the page became the card — which shows one
 * signer at a time — there was no element with that id and the link would have
 * landed at the top of the page with nothing to say it had failed. The build's
 * dangling-fragment gate would not have caught it either: it scans emitted
 * HTML, and this URL is composed at runtime.
 *
 * The VERIFICATION ROUTE is still dropped: it is a toggle on the card and the
 * reader can flip it in one click.
 *
 * ⚠️ Built on `site.domain`, never `window.location.origin`: a link shared from
 * a preview host, a staging deploy or a laptop is a link nobody else can open.
 *
 * Falls back to the finder itself for a `use` with no intent page, so adding a
 * fifth purpose to `finderUses` cannot produce a link to a route that does not
 * exist.
 */
export function finderShareUrl({ pathname, useKey, signer, kyc }) {
  const intent = isUse(useKey) ? dscIntentForUse(useKey) : null;
  if (intent) {
    const use = finderUse(useKey);
    const query =
      !use.skipsSigner && isSigner(signer) ? `?${FINDER_PARAMS.signer}=${signer}` : "";
    return `https://${site.domain}/dsc/${intent.slug}${query}`;
  }

  const path = (pathname || "/dsc").replace(/\/+$/, "") || "/dsc";
  return `https://${site.domain}${path}${finderSearch({ useKey, signer, kyc })}#${dscSectionIds.finder}`;
}
