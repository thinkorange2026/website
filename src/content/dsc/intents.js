import { certificateFaqs, portalGuide } from "./certificates.js";

// THE FOUR INTENT PAGES — /dsc/statutory-filings, /dsc/tenders, /dsc/dgft,
// /dsc/foreign-national.
//
// ⛔ 11-09-2026. WHY THESE EXIST, because it is not "more pages for the sake of
// more pages". Since /dsc was trimmed to the finder (03-09-2026), the document
// checklists have been reachable ONLY by answering two questions in a
// JavaScript wizard. Verified in the built output before this change:
// `dist/dsc/index.html` contained ZERO checklist lines — not "Aadhaar card",
// not "Address proof", not "Passport-sized photograph". CLAUDE.md had already
// flagged that as a known regression.
//
// The usual objection ("Google renders JavaScript") is beside the point: the
// results are gated behind two CLICKS, and no crawler clicks. Interaction-gated
// content is never rendered, by anyone, ever. So content we had already written
// and had reviewed simply had no address to rank at, and a shared link previewed
// as the generic site card.
//
// ⚠️ EVERYTHING HERE IS A POINTER. Not one checklist, validity option,
// verification note or certificate name is restated in this file — the page
// resolves all of it from `certificates.js` and `finder.js` at render time, the
// same "select by reference, never fork" rule the homepage FAQ row and the old
// documents page already follow. What this file owns is only what is genuinely
// new: each page's own title, lede and search intent, and WHICH existing rows
// belong on it.
//
// ⚠️ `key` IS THE FINDER'S `use` KEY AND THE SLUG IS NOT. `exim` is the data
// model's name for the DGFT route and `tender` is singular; the URLs are
// `/dsc/dgft` and `/dsc/tenders` because that is what people search. Keep both
// — renaming the data key to match the URL would touch every answer in
// finder.js for a cosmetic gain.
//
// ⛔⛔ READ BEFORE EDITING `statutory-filings`. finder.js's `filings|any` answer
// carries a blanket claim — that one Class 3 INDIVIDUAL certificate covers GST,
// income tax, MCA/ROC, EPFO/ESIC and trademark "whether you are a proprietor, a
// company or an LLP" — which `portalGuide` contradicts in two rows (GST needs
// an Organisation certificate for companies and LLPs; for EPFO "a personal
// certificate will not work"), and which `certificateFaqs` contradicts too
// (Q: "Which certificate do I need — Individual or Organisation?" — "Organisation,
// if you are signing on behalf of a company or LLP … company GST or EPFO
// submissions"). TWO independently reviewed sources agree with each other and
// the finder's one sentence is the outlier.
//
// So this page states the portalGuide/FAQ position, per portal, and never
// restates the finder's blanket sentence. That is not a judgement call I made
// about tax practice — it is publishing the reviewed content that agrees with
// itself, and declining to publish the sentence that disagrees with both.
// `finderAnswers["filings|any"].warn` and `.name` still carry the outlier
// wording and are STILL UNRENDERED anywhere (the warn callout was removed on
// 03-09-2026), so nothing on the site asserts it today. It should be corrected
// in finder.js to match — flagged in MISSING-PAGES.md, not done here, because
// rewriting a reviewed answer is Clinton's call rather than a side effect of a
// routing change.

// ⛔ 11-09-2026, SAME DAY, after Clinton saw the first cut: "the pages is over
// informative... keep and same it is showing in when select to card, no need to
// create many section, just keep it same but in different route." The pages are
// now the finder's own answer card on their own URL, so `intro`, `portals` and
// `faqs` below are WRITTEN AND NO LONGER RENDERED — the same discipline
// `portalGuide`, `afterIssue` and `answer.warn` already carry in this tree.
//
// ⚠️ DO NOT PRUNE THEM as dead content. Restoring any of it is render-only, and
// the FAQ and portal pointers are the reviewed rows that answer this page's
// search intent if it ever wants them back. `nameFromPortals` on the statutory
// intent is likewise inert now that no portal table renders — see the ⛔⛔ note
// above, and MISSING-PAGES.md for what happens to it when the conflict is
// settled.

const bySlug = (rows, portals) =>
  portals.map((name) => rows.find((row) => row.portal === name)).filter(Boolean);

/**
 * ⚠️ FAQs are selected BY QUESTION TEXT, never by index, so the FAQ set can be
 * reordered during review without silently swapping what a page shows. An
 * unresolvable pointer is dropped with a dev-only warning — a shorter list
 * beats a blank accordion row. Same contract as `content/faqs/home.js`.
 */
function pick(questions) {
  return questions
    .map((q) => {
      const found = certificateFaqs.find((faq) => faq.q === q);
      if (!found && import.meta.env?.DEV) {
        console.warn(`[intents] no certificate FAQ matches: ${q}`);
      }
      return found;
    })
    .filter(Boolean);
}

export const dscIntents = [
  {
    key: "filings",
    slug: "statutory-filings",
    eyebrow: "Statutory filings",
    h1: "Which DSC you need for statutory filings",
    lede:
      "GST, income tax, MCA and ROC, EPFO and ESIC, trademark. Which certificate each portal accepts, whose name it has to be in, and what you send us to get it issued.",
    meta: {
      title: "DSC for GST, Income Tax, MCA and EPFO Filings | ThinkOrange Consulting",
      description:
        "Which Class 3 digital signature each statutory portal accepts — GST, income tax, MCA and ROC, EPFO and ESIC, trademark — whose name it must carry, and the documents required on the Aadhaar and PAN routes.",
    },
    intro: [
      "Most statutory portals in India accept a Class 3 signature certificate. What changes between them is whose name the certificate has to be in — your own, or your organisation's — and that depends on the portal and on how you are constituted.",
      "The table below is the portal-by-portal position. If your situation spans more than one of these, one certificate will usually cover several of them; send us the list and we will tell you before you order rather than after.",
    ],
    // ⚠️ The portal table is what answers this page's search intent, and it is
    // `portalGuide` — existing reviewed content that had no URL at all before
    // this page. See the ⛔⛔ note above for why this page leads with it.
    portals: ["GST portal", "MCA / ROC", "Income tax", "EPFO / ESIC", "Trademark (IP India)"],
    // ⛔ THE ONE FLAG THAT KEEPS THE DISPUTED SENTENCE OFF THIS PAGE. Every
    // other intent answers "whose name" either per signer (tenders, DGFT) or
    // in one line from its own answer (foreign national). This one answers it
    // per PORTAL, from the table above, because `finderAnswers["filings|any"]
    // .name` is the outlier wording described in the ⛔⛔ note at the top of
    // this file. Remove this flag and that sentence goes straight onto the
    // page's spec row.
    nameFromPortals: true,
    faqs: [
      "Which certificate do I need — Individual or Organisation?",
      "I'm a director. Do I need an Organisation certificate for MCA filings?",
      "Can one certificate be used on more than one portal?",
      "What is the video verification step, and can it be skipped?",
      "Do I have to visit your office?",
    ],
  },
  {
    key: "tender",
    slug: "tenders",
    eyebrow: "Tenders and procurement",
    h1: "Which DSC you need for tenders and procurement",
    lede:
      "GeM, CPPP, Railways and the state tender portals need a certificate that can both sign and encrypt. Here is what that means, whose name it goes in, and what to send us.",
    meta: {
      title: "DSC for GeM and Government Tenders (Class 3 Combo) | ThinkOrange Consulting",
      description:
        "Bidding on GeM, CPPP, Railways or a state tender portal needs a Class 3 Combo digital signature — signing and encryption. Whose name it carries, the documents required, and why encryption cannot be added later.",
    },
    intro: [
      "Procurement portals require a bid to be signed and encrypted before it is submitted, so a signing-only certificate is not enough on its own. Encryption cannot be added to a certificate after it has been issued.",
      "That single fact is what makes this the most expensive thing to get wrong in the DSC tree: discovering it on the closing day means buying again from scratch, and a tender does not wait.",
    ],
    portals: ["GeM & e-tendering"],
    faqs: [
      "Which certificate do I need for GeM and government tenders?",
      "Do I need a USB token?",
      "Can one certificate be used on more than one portal?",
      "What is the video verification step, and can it be skipped?",
    ],
  },
  {
    key: "exim",
    slug: "dgft",
    eyebrow: "DGFT and exports",
    h1: "DGFT digital signature — which certificate, and what documents",
    lede:
      "DGFT licences, ICEGATE, RCMC and EPCG. The portal validates your certificate against your IEC profile, so the name on it has to match — here is exactly what that means.",
    meta: {
      title: "DGFT Digital Signature — Documents Required and Which Certificate | ThinkOrange Consulting",
      description:
        "Which Class 3 certificate the DGFT portal accepts for IEC, ICEGATE, RCMC and EPCG, the documents required on the Aadhaar and PAN routes, and why the name on the certificate has to match your IEC profile exactly.",
    },
    intro: [
      "The DGFT portal does not simply check that you hold a certificate — it validates it against the PAN recorded in your IEC profile. A certificate that is perfectly valid elsewhere is rejected here if that name or PAN does not match.",
      "This is where exporters most often overspend, buying a dedicated DGFT token when an ordinary Class 3 certificate matching the IEC would have done. It is worth asking before you order.",
    ],
    portals: ["DGFT", "ICEGATE / customs"],
    faqs: [
      "Do I need a dedicated DGFT certificate?",
      "Which certificate do I need — Individual or Organisation?",
      "Can one certificate be used on more than one portal?",
      "What is the video verification step, and can it be skipped?",
    ],
  },
  {
    key: "foreign",
    slug: "foreign-national",
    eyebrow: "Foreign nationals",
    h1: "Digital signature certificate for foreign nationals",
    lede:
      "Identity is verified against a passport rather than Aadhaar, and the whole process can be completed from outside India. Here is the route, the documents, and the attestation rules.",
    meta: {
      title: "Digital Signature Certificate for Foreign Nationals (Passport Route) | ThinkOrange Consulting",
      description:
        "How a foreign national gets an Indian Class 3 digital signature without Aadhaar: the passport-based verification route, the documents required, attestation and translation rules, and what changes if the applicant is outside India.",
    },
    intro: [
      "A foreign applicant cannot use the Aadhaar route, so identity is established from the passport with attested supporting documents instead. The certificate itself is the same Class 3 certificate a domestic applicant gets, and it works on the same portals.",
      "What differs is the paperwork and the time it takes. The attestation route depends on the applicant's country — apostille where it is party to the Hague Convention, otherwise attestation by the Indian Embassy or Consulate — so confirm which applies before preparing anything.",
    ],
    portals: [],
    faqs: [
      "Can a foreign national get an Indian DSC without Aadhaar?",
      "What is the video verification step, and can it be skipped?",
      "Do I need a USB token?",
      "Do I have to visit your office?",
    ],
  },
];

export function dscIntent(slug) {
  return dscIntents.find((intent) => intent.slug === slug);
}

/** The intent a finder `use` key leads to — how the finder links to its page. */
export function dscIntentForUse(useKey) {
  return dscIntents.find((intent) => intent.key === useKey);
}

/** Resolved, never restated: the portal rows and FAQs this page shows. */
export function intentPortals(intent) {
  return bySlug(portalGuide, intent.portals ?? []);
}

export function intentFaqs(intent) {
  return pick(intent.faqs ?? []);
}
