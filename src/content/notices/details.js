// LONG-FORM NOTICE BODIES — the content behind /notices/:slug.
//
// ⛔ SEPARATE FROM ./index.js ON PURPOSE, exactly as insights/bodies.js is
// separate from insights/index.js. `nav.js` imports the index to derive these
// routes, and `nav.js` is in the always-eager main chunk — so every route on
// the site would pay for this prose if it lived there. Only the notice-detail
// template imports this file, so it lands in that route's own lazy chunk.
//
// ⛔⛔ EVERY RENDERED WORD BELOW IS CLINTON'S OWN SUPPLIED COPY, REPRODUCED
// VERBATIM. Instruction, 20-09-2026: "show the details that mention in pdf.
// keeps the wording same do not change a single word." Source document:
// "ThinkOrange Content Draft - emSigner 3.3.pdf", marked STATUS: READY FOR
// PUBLISHING. Do not tighten, re-punctuate, Anglicise or house-style any of
// it — the American spellings ("recognize"), the unspaced em dashes and the
// US date format are all as written. If it needs changing, it is Clinton's to
// change in the draft first.
//
// ⚠️ WHAT IS *NOT* PAGE COPY, and so is written rather than quoted: the `meta`
// title and description (SEO tags, drawn from the draft's own sentences), the
// image `alt` (a transcription of the graphic, see its note), and `published`.
//
// ⛔ THE DRAFT'S LAST BLOCK IS MISSING AND WAS NOT RECONSTRUCTED. Page 2 ends
// with a "Need Technical Support?" panel whose second line is CORRUPTED IN THE
// SOURCE PDF — the export dropped all but a handful of glyphs, leaving
// "l i Si J i ll GST li h" where a sentence should be. Recoverable text stops
// mid-clause at "...configuring your FIPS 140-3 tokens,". Inventing the rest
// would be writing copy and calling it Clinton's, so the page closes with the
// site's own CtaBand instead. Ask Clinton for that sentence and add it here.
//
// ---------------------------------------------------------------------------
// SHAPE
//   `blocks` is an ORDERED list, so reading order is data rather than template
//   logic — the callout genuinely sits between two headings in the draft, and a
//   fixed template shape would have had to special-case that.
//
//   Block types: "paragraph" | "heading" | "callout" | "specs"
//
//   Rich text: a `content` value is either a plain string, or an array of
//   segments `{ text, strong? }`. The segment form exists because the draft
//   bolds phrases INSIDE sentences, and emphasis is part of the copy it asked
//   to keep — a mini-Markdown string would have meant a parser, and this repo
//   already uses the segment shape for Typewriter's headline lines.
// ---------------------------------------------------------------------------
import { s } from "../statutory.js";

// ⛔ THE DATE IS INTERPOLATED, NEVER TYPED — the same rule every service leaf
// and every insights article follows. See statutory.js `emsigner33GstEnforcement`,
// which also records why that key exists alongside `fips1403DscIssuance`
// instead of reusing it (one fact, two typographies, because this copy is not
// mine to reformat).
const ENFORCEMENT_DATE = s("emsigner33GstEnforcement"); // "September 21, 2026"

// The draft names the same date twice, the second time without the year.
// DERIVED by dropping the year rather than typed as a second literal, so one
// correction in statutory.js reaches both sentences. A date with no trailing
// year is left untouched.
const ENFORCEMENT_DATE_SHORT = ENFORCEMENT_DATE.replace(/,\s*\d{4}$/, "");

export const noticeDetails = {
  "emsigner-3-3": {
    // ⚠️ `title` AND `meta` ARE NOT HERE — they live on the notice entry in
    // ./index.js, because nav.js derives this route's label from the headline
    // and lib/seo.js resolves its <title>, and neither may pull this file's
    // prose into the main chunk to get them. Same split insights/index.js and
    // insights/bodies.js already make.

    // The draft's own "CATEGORY:" line, title-cased for an eyebrow.
    eyebrow: "Tax & Compliance Updates",

    // ⚠️ The day this went live, not the advisory's own date and not
    // backdated — the same discipline insights/index.js records for
    // `published`. The advisory reproduced in the graphic is dated
    // 19 September 2026; that is the GRAPHIC's claim, not this page's.
    published: "2026-09-20",

    // Draft page 1, paragraph 1 — verbatim. Rendered as the hero lede.
    lede: "The Goods and Services Tax (GST) network has released emSigner version 3.3, a critical utility update for taxpayers and professionals filing returns using Digital Signature Certificates (DSC).",

    // The advisory graphic, supplied by Clinton at this exact path
    // (20-09-2026). It is a served file under public/, so the URL is
    // "/images/..." and NEVER "public/images/..." — `public/` is Vite's build
    // root, not a URL segment, and written the other way it resolves relative
    // to the route and 404s. That bug has shipped on this site once already.
    //
    // ⚠️ `width`/`height` are the file's REAL pixel dimensions. <Img> requires
    // them so the box is reserved before load and CLS stays at zero, and the
    // inner <img> is object-cover — which only leaves the graphic uncropped
    // while the rendered ratio matches the file's own.
    //
    // ⚠️ THE ALT TEXT TRANSCRIBES THE GRAPHIC, so it carries the date as a
    // LITERAL and must not be interpolated. The date is baked into the PNG;
    // pointing it at statutory.js would let the words disagree with the
    // picture they describe the moment that key changed.
    image: {
      src: "/images/notice/notice-token.png",
      width: 1672,
      height: 941,
      alt: "GST Portal Advisory, 19 September 2026: using a FIPS 140-3 token? Install emSigner 3.3. For new DSC USB tokens issued from 21 September 2026, emSigner 3.3 is required for signing on the GST Portal. Backward compatible with existing tokens. Two HYPERSECU HYP2003 USB crypto tokens sit beside a laptop showing the Goods and Services Tax portal.",
    },

    blocks: [
      {
        type: "paragraph",
        lead: true,
        content: [
          { text: `While recent advisories highlight ${ENFORCEMENT_DATE}, as a key enforcement date, the most important factor is the ` },
          { text: "type of hardware pendrive", strong: true },
          { text: " you are holding, not the date you downloaded your certificate." },
        ],
      },

      { type: "heading", text: "Who Must Upgrade to emSigner 3.3?" },
      {
        type: "paragraph",
        content: [
          { text: "If you are using a " },
          { text: "FIPS 140-3 compliant hardware token", strong: true },
          { text: " (such as the latest generation of HYP2003 or Proxkey devices, pictured in the advisory graphic above), you must download and install emSigner 3.3." },
        ],
      },
      {
        type: "paragraph",
        content:
          "Older versions of the utility simply will not recognize the newly issued hardware. This portal update supports the broader industry shift toward stricter encryption and compliance standards for digital signatures.",
      },

      // The draft prefixes this heading with a ⚠ character. Rendered as a real
      // icon instead — aria-hidden, so the heading's accessible name stays the
      // words themselves rather than "warning sign Note for Early Adopters".
      {
        type: "callout",
        heading: "Note for Early Adopters",
        content: [
          [
            { text: "Many businesses proactively secured FIPS 140-3 tokens in recent months to get ahead of the September compliance mandate. " },
            { text: `Even if your certificate was downloaded onto a 140-3 token before ${ENFORCEMENT_DATE_SHORT}`, strong: true },
            { text: ", you still need this software update." },
          ],
          "Older versions of emSigner lack the technical compatibility to recognize FIPS 140-3 encryption. Without the upgrade, your DSC simply will not appear for selection when trying to file your returns on the GST portal.",
        ],
      },

      { type: "heading", text: "What If You Have an Older FIPS 140-2 Token?" },
      {
        type: "paragraph",
        content:
          "If your current certificate is valid and housed on an older FIPS 140-2 token, you are not strictly required to upgrade immediately. Your setup remains valid until the certificate's natural expiration.",
      },
      {
        type: "paragraph",
        content:
          "However, if you start encountering signing failures or your token is no longer detected—even with the correct token drivers installed—upgrading to version 3.3 is the primary troubleshooting step. The new version is fully backwards-compatible and will safely support your older hardware.",
      },

      { type: "heading", text: "Pre-Installation Checklist" },
      {
        type: "paragraph",
        content:
          "Before downloading the update directly from the official GST portal, ensure your office workstation meets the mandated technical specifications to prevent installation errors:",
      },
      // ⚠️ NOT statutory values. Operating-system versions, RAM and a Java
      // release are PRODUCT SPECIFICATIONS — the same category as drivers.js's
      // `supportedOs` and the HYP2003 spec table, both of which are typed
      // directly in content. statutory.js is for rupee amounts, day counts,
      // form codes, penalties, thresholds and deadlines.
      {
        type: "specs",
        rows: [
          {
            term: "Operating System",
            content: "Windows 10 or 11 (64-bit), macOS 10.6 and above, or Ubuntu 18 and above.",
          },
          {
            term: "Hardware Specs",
            content: "Minimum 8 GB of RAM and 64 GB of storage space.",
          },
          {
            term: "Software Dependency",
            content: [
              { text: "Java 1.8 (Oracle or OpenJDK)", strong: true },
              { text: " must be pre-installed." },
            ],
            // Set in red in the draft, so it renders in --color-danger — the
            // one place on this page that colour appears.
            warning:
              "Crucial note: Java 9 and newer versions are explicitly not supported by this utility and will cause fatal installation failures.",
          },
        ],
      },
    ],
  },
};

/**
 * The body for one notice slug, or undefined.
 *
 * ⚠️ ALWAYS VIA THIS FUNCTION, never by indexing `noticeDetails` directly: a
 * notice whose `detail` slug has no entry here resolves to `undefined`, which
 * the template turns into an honest fallback rather than a blank page.
 */
export function getNoticeDetail(slug) {
  return noticeDetails[slug];
}
