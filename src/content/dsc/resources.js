// "Resources" (`/dsc/resources`, T15) — the DSC file library.
//
// ⛔ 07-09-2026 (Clinton): "in this i will upload fields relatied to dsc. for
// now it will shown as empty state." So this file shipped with `dscResources`
// EMPTY, and `DscResources.jsx` still renders an honest empty state whenever it
// is. Same discipline as `testimonials.js` and `insights.js`: a placeholder
// entry here is indistinguishable from a real one to the next reader, and this
// one would additionally offer a download that does not exist.
//
// 20-09-2026 (Clinton): the first two entries landed — the SignX Download
// Utility and a pointer to the drivers page — both supplied verbatim, see the
// notes on each.
//
// ⚠️ ADDING A FILE IS A CONTENT EDIT, NOT A TEMPLATE CHANGE. Push the file
// into `public/` (see the url note below), add an entry here, and the page
// switches from the empty state to the list with no code touched.
//
// ⚠️ THE RULES THAT APPLY TO EVERY ENTRY:
//  - `url` is a SERVED path, so `/files/thing.pdf`, NEVER `public/files/...`.
//    `public/` is Vite's build root, not a URL segment — written the other way
//    it resolves relative to the route and 404s. That bug has shipped here
//    once already (the DSC hub's token image).
//  - `size` is read off the real file (`ls -l`), never estimated, and `updated`
//    is the day the file was actually published. Both are checkable claims a
//    reader may rely on; neither is worth guessing.
//  - No fee, turnaround, client count or statutory value in a title or a
//    description. A resource card is a short confident line of copy, which is
//    exactly the shape an invented fact slips into. Statutory values come from
//    `statutory.js` via `s()` like everywhere else.
//  - A vendor binary needs its redistribution terms checked before it is
//    hosted (CONTENT-PLAN.md §9), and anything destructive needs the caution
//    treatment `drivers.js` already uses for the initialisation tool.
//  - ⚠️ Never publish a document carrying a real PAN, GSTIN, DIN, name or
//    amount without flattened redaction (CLAUDE.md's non-negotiables).

import { dscDriversPage } from "../nav.js";

export const dscResourcesContent = {
  meta: {
    title: "DSC Resources | ThinkOrange Consulting",
    description:
      "Utilities, drivers and reference documents for Digital Signature Certificates — collected in one place so you are not hunting for them across portals.",
  },
  // ⚠️ 20-09-2026: this copy said "forms, checklists and reference documents"
  // while the page carried neither a form nor a checklist. Widened to cover the
  // utilities that actually landed — a heading asserting content that is not
  // below it is the defect class this file's own rules are about. Narrow it
  // again if the library ever becomes mostly documents.
  heroLede:
    "The utilities, drivers and reference documents a Digital Signature Certificate needs, collected in one place.",

  // Shown when `dscResources` is empty. Deliberately says the library is being
  // put together rather than implying files are missing or broken.
  empty: {
    heading: "Nothing here yet",
    message:
      "We are still collecting the forms and checklists that belong on this page. Until they are up, tell us which document you are after and we will send it across directly.",
  },
};

/**
 * The resources, in the order a reader needs them.
 *
 * TWO KINDS, and the distinction is load-bearing rather than cosmetic:
 *
 *  - `kind: "download"` renders an `<a>` to a file. `external: true` marks one
 *    we do NOT host: the template then drops the `download` attribute (browsers
 *    ignore it cross-origin anyway, so leaving it on would be a lie about what
 *    the link does) and adds `rel="noopener noreferrer"`.
 *  - `kind: "link"` renders a react-router `<Link>` to a page on this site. It
 *    must NOT be an `<a download>` — that would hand the browser an HTML
 *    document to save.
 *
 * Shape — `size`, `updated`, `version` and `host` render only when present, and
 * an unknown value is left off rather than guessed:
 *
 *   {
 *     id: "dsc-application-form",     // stable, kebab-case, used as the key
 *     kind: "download",
 *     title: "DSC application form",
 *     description: "One line on what it is and who needs it.",
 *     format: "PDF",                 // shown as-is, e.g. PDF / EXE / DOCX
 *     size: "184 KB",                // read off the real file
 *     updated: "2026-09-07",         // YYYY-MM-DD, formatted by formatDate()
 *     url: "/files/dsc-application-form.pdf",
 *     action: "Download",            // the row's own action label
 *   }
 */
export const dscResources = [
  {
    // ⛔ THE NAME. This site names NO certifying authority (02-09-2026 —
    // Clinton: "do not use signx it is for the other company name", then
    // "remove eMudhra also"), and 45 SignX mentions were stripped that day.
    // This title is back because Clinton supplied this copy and this URL
    // verbatim on 20-09-2026, and because it is a different kind of claim: it
    // names a FILE a reader has to go and install, not a partnership. The
    // policy on partnership and authority claims is UNCHANGED — everywhere
    // else on the site that is still "a licensed Certifying Authority", and
    // this entry is not licence to reintroduce a name anywhere else.
    // ⚠️ The host is visible in the URL regardless, so a neutral title
    // ("Token download utility") would hide the name from the copy and not
    // from the link.
    id: "signx-download-utility",
    kind: "download",
    title: "SignX Download Utility",
    description:
      "Connects the SignX website with your USB token so your certificate can be downloaded onto it. Install it before starting the download.",
    format: "EXE",
    // ⚠️ VERSION-PINNED URL, supplied as-is. If the vendor publishes a new
    // build at a new filename this link 404s and the version below goes stale
    // together — re-check both, do not edit one without the other. The version
    // is read off the filename, not asserted from anywhere else.
    version: "1.1.18",
    url: "https://ekyc.signxca.com/SignX-Utility-v1.1.18.exe",
    // ⚠️ We do not host this file, which is deliberate and worth keeping:
    // CONTENT-PLAN.md §9 says a vendor binary needs its redistribution terms
    // checked before it is hosted here, and linking the vendor's own URL
    // sidesteps that question entirely. It also means there is no checksum to
    // publish — we cannot vouch for bytes we do not serve.
    external: true,
    host: "Hosted by the certifying authority",
    action: "Download",
  },
  {
    // A POINTER, NOT A COPY — Clinton: "link to your existing /dsc/drivers
    // page instead of duplicating it". Same "select by reference" discipline
    // the homepage FAQ row and the old Documents Required page already follow:
    // restating the driver list here is how one gets corrected and the other
    // keeps asserting the superseded version.
    // ⚠️ The path comes from nav.js, never typed — nav.js is the keystone and a
    // hardcoded path is how a route rename leaves a dead link behind. Relative
    // import with an extension, not the `@/` alias, because plain Node loads
    // this file during the prerender pass (same reason `hyp2003.js` does).
    id: "token-drivers",
    kind: "link",
    title: "Token Drivers",
    description: "Drivers for supported USB tokens, including HyperPKI HYP2003.",
    url: dscDriversPage.path,
    action: "Go to Token Driver Downloads",
  },
];
