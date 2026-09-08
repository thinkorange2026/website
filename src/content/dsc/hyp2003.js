// Relative import with an explicit extension, not the "@/" alias, on purpose:
// this file is imported by lib/seo.js, which plain Node loads during the Phase 9
// prerender pass. Vite resolves the alias; Node does not.
import { s } from "../statutory.js";

// ABOUT HYP2003 — the token's own page. Added 05-09-2026 (Clinton: "i want to
// create new page call - About HYP2003 keep in the token & driver section.
// keep the layout same as it is mention in html").
//
// Source: `thinkorange-token-page.html`, supplied by Clinton. Its LAYOUT is
// reproduced section for section — hero + certification strip, why this token,
// full specification, what changes on the deadline, comparison table, who
// orders, FAQs, CTA. Its visual language is not: this file is content only and
// the template renders it in the site's own idiom.
//
// ⛔ FOUR THINGS IN THAT DOCUMENT ARE DELIBERATELY NOT PUBLISHED, and each is
// the kind of claim CLAUDE.md's non-negotiables name by hand:
//
//   1. The hero badge "[Exclusive / Authorised] distributor — [territory]".
//      An unfilled placeholder AND an authorisation claim about a commercial
//      relationship. Dropped outright rather than softened — there is no
//      honest half-version of "authorised distributor".
//   2. "We will confirm current rates and stock the same working day."
//      A turnaround guarantee, on CONTENT-PLAN.md §1.1's hold list. The CTA
//      routes through `turnaround.js` instead, like every other response-time
//      claim on this site.
//   3. "Distributor pricing" as a price claim. `fees` is null across the DSC
//      tree and stays null. The copy says partner rates exist and are quoted
//      on application — which /partner-with-us already asserts — and names no
//      figure, no range and no "from".
//   4. The document's own two dev notes, which name a certifying authority.
//      No CA is named anywhere on this site (02-09-2026, Clinton: "remove
//      eMudhra also"). Do not reintroduce one from this reference.
//
// ⛔ THE DEADLINE DATE IS INTERPOLATED, NEVER TYPED. The reference document
// carries "21 September 2026" as a literal and attaches its own warning to it
// ("verify the date before publishing. The commercial argument on this page
// depends on it"). It is now `statutory.js`'s `fips1403DscIssuance`, with its
// basis, its source and — importantly — a note recording that the CCA's own
// circular was not located. Read that note before hardening any wording here.
//
// ⚠️ EVERY SENTENCE ABOUT THE DEADLINE IS WORDED AS AN EXPECTATION, not a
// certainty ("are expected to", "is expected to"). That is not hedging for its
// own sake: the NIST sunset it derives from is primary-sourced and solid, the
// India-specific issuance rule is corroborated by industry sources only. If the
// CCA circular turns up, the wording can harden — and until it does, a
// compliance firm asserting a regulatory deadline it cannot cite is exactly the
// failure this file's discipline exists to prevent.

export const hyp2003Page = {
  slug: "about-hyp2003",
  meta: {
    title: "About the HYP2003 USB Token | FIPS 140-3 | ThinkOrange",
    description:
      "The HyperPKI HYP2003 USB crypto token — FIPS 140-3 Level 3, CCA India approved, 64 KB, Windows, macOS and Linux. Full specification, and what the FIPS 140-3 change means for your certificate.",
    keywords: [
      "hyp2003 token",
      "fips 140-3 dsc token",
      "hyp2003 specification",
      "dsc token india",
    ],
  },
  h1: "HYP2003 — a FIPS 140-3 token, ready for the September change",
  heroLede: `New Digital Signature Certificates are expected to require a FIPS 140-3 token from ${s(
    "fips1403DscIssuance"
  )}. The HyperPKI HYP2003 is validated to FIPS 140-3 Level 3 and lists CCA India among its certifications — so a certificate issued on it today will still be issuable after the change.`,

  // The hero's four-tile certification strip. Every value is a specification
  // off the manufacturer's datasheet, not a ThinkOrange claim — no client
  // count, no years, no turnaround, which is what a spec row is most likely to
  // smuggle in.
  heroSpec: [
    { label: "FIPS 140-3", value: "Level 3 validated" },
    { label: "CCA India", value: "Listed on the datasheet" },
    { label: "Storage", value: "64 KB" },
    { label: "Data retention", value: "10+ years" },
  ],

  // The notice bar, directly under the hero (Clinton, 05-09-2026). One
  // sentence of consequence, one of reassurance — the reassurance half matters
  // as much as the warning, because the commonest wrong reaction to this
  // change is replacing a token that does not need replacing.
  notice: {
    label: "FIPS 140-3",
    text: `FIPS 140-3 is expected to become mandatory for new DSC issuance from ${s(
      "fips1403DscIssuance"
    )}. Certificates can no longer be downloaded onto FIPS 140-2 tokens after that date. Existing certificates on 140-2 tokens keep working until they expire.`,
  },

  whyThisToken: {
    eyebrow: "Why this token",
    heading: "What the specification actually buys you",
    lede: "Token choice looks like a commodity decision until something goes wrong. Three specifications on this datasheet are the ones that matter in practice.",
    points: [
      {
        key: "onboard",
        title: "Onboard key generation",
        body: "The private key is generated and used inside the token and never leaves it. This is not a convenience feature — it is what makes the signature trustworthy, and why a certificate cannot be held as a file on a computer.",
      },
      {
        key: "fips",
        title: "FIPS 140-3 Level 3",
        body: "Level 3 adds physical tamper resistance and identity-based authentication over Level 2. Most tokens in this market are validated to the older FIPS 140-2 standard; this one is validated to 140-3.",
      },
      {
        key: "middleware",
        title: "Middleware that installs itself",
        body: "An onboard auto-run partition installs the driver automatically. Driver installation is where most support calls in this business originate, so this removes the commonest failure point — particularly for clients you never meet in person.",
      },
    ],
  },

  // ⚠️ Two groups, rendered as description lists rather than a table: these are
  // label/value pairs, and a <dl> can be laid out in columns where a
  // two-column table strands itself at a third of the container. Same call the
  // T2 timeline section already made.
  specs: {
    eyebrow: "Specifications",
    heading: "HYP2003 full specification",
    lede: "As published by the manufacturer in the HyperPKI HYP2003 datasheet.",
    groups: [
      {
        title: "Hardware",
        rows: [
          { label: "Dimensions", value: "53 × 16.5 × 8.5 mm" },
          { label: "Weight", value: "6 g" },
          { label: "Storage", value: "64 KB for signing and encryption" },
          { label: "Connectivity", value: "USB 2.0 compliant" },
          { label: "Data retention", value: "At least 10 years" },
          { label: "Rewrite cycles", value: "At least 500,000" },
          { label: "Storage temperature", value: "−20°C to 70°C" },
          { label: "Humidity", value: "0–100% RH" },
        ],
      },
      {
        title: "Security and compatibility",
        rows: [
          { label: "FIPS 140-3", value: "Security Level 3" },
          {
            label: "Certifications",
            value: "FIPS 140-3 Level 3 · CCA India · FCC/CE/ICES · RoHS/REACH",
          },
          { label: "Algorithms", value: "RSA 2048–4096, AES, SHA, ECDSA" },
          { label: "Hash", value: "SHA-256, SHA-384, SHA-512" },
          { label: "Operating systems", value: "Windows, Linux, macOS" },
          {
            label: "Standards",
            value:
              "Microsoft CAPI/CNG · PKCS#11 v2.20 · Smart Card Minidriver · PC/SC, CCID · SSL v3 · IPSec/IKE",
          },
          {
            label: "Middleware",
            value: "Onboard auto-run partition, automatic install",
          },
        ],
      },
    ],
    note: "Operating temperature range is stated in the manufacturer's datasheet. Confirm the current figure with us before specifying the token for an unusual environment.",
  },

  deadline: {
    eyebrow: "The FIPS 140-3 change",
    heading: "The token rule is changing. Here is what it means for you.",
    cards: [
      {
        key: "buying",
        title: "If you are buying a certificate now",
        body: "Ask which token it will be issued onto. A certificate issued onto a FIPS 140-2 token before the change stays valid for its full term — but when it comes up for renewal, you will need new hardware.",
      },
      {
        key: "holding",
        title: "If you already hold a certificate",
        body: "Nothing stops working. Your existing certificate on a 140-2 token runs to expiry as normal. Plan for a new token at renewal rather than replacing anything today.",
      },
      {
        key: "issuing",
        title: "If you issue for clients",
        body: "Check your stock. Any 140-2 tokens still on the shelf after the change cannot take a new certificate. Partners ordering through us are supplied on FIPS 140-3 hardware.",
      },
    ],
    note: "A 140-3 token costs no more than a 140-2 token and saves replacing it at your next renewal. That is the entire practical difference — there is no reason to buy the older hardware at this point.",
  },

  comparison: {
    eyebrow: "Comparison",
    heading: "HYP2003 against a typical FIPS 140-2 token",
    lede: "A handful of tokens cover most Class 3 certificates issued in India, and on most specifications they are close. One row on this table is about to matter far more than the rest.",
    rows: [
      { spec: "FIPS validation", hyp: "140-3, Level 3", other: "140-2, Level 3" },
      {
        spec: "Issuable after the change",
        hyp: "Yes",
        other: "No — new certificates are expected to require a 140-3 token",
      },
      { spec: "Key sizes", hyp: "RSA 2048–4096, ECDSA", other: "Commonly RSA up to 2048" },
      { spec: "PKCS#11 support", hyp: "v2.20", other: "Commonly v2.10" },
      { spec: "Rewrite cycles", hyp: "500,000+", other: "Varies — 100,000 upward" },
      { spec: "Storage capacity", hyp: "64 KB", other: "Varies — some offer more" },
      { spec: "Operating systems", hyp: "Windows, macOS, Linux", other: "Usually all three" },
      { spec: "Onboard key generation", hyp: "Yes", other: "Yes — required for a Class 3 certificate" },
      { spec: "Auto-install middleware", hyp: "Yes, onboard partition", other: "Usually yes" },
      { spec: "Data retention", hyp: "10+ years", other: "Usually 10 years" },
    ],
    // ⚠️ The first note is the most important paragraph on this page and it
    // argues AGAINST the product. Keep it. A comparison table on a page selling
    // the thing in the highlighted column is only worth reading if it concedes
    // where the thing does not win — and this one genuinely does not win on
    // storage. Deleting it would turn an honest comparison into a spec sheet
    // wearing a table's clothes.
    notes: [
      "Being straight about this: most crypto tokens sold for Indian DSCs are broadly similar. They all keep the private key non-exportable, they all install without much fuss, and they all outlast the certificates you will put on them. On storage capacity the HYP2003 is not the largest available, and capacity is rarely the constraint anyway.",
      "Where it genuinely leads is validation standard, supported key sizes and PKCS#11 version. Once the change takes effect, the validation row stops being a specification comparison and becomes the difference between a token that can take a new certificate and one that cannot.",
      "The right-hand column describes FIPS 140-2 tokens generally, not any particular product. Using a specific token and want to know where it stands? Send us the model and we will tell you plainly, including when the answer is that it is fine as it is.",
    ],
  },

  whoOrders: {
    eyebrow: "Who orders from us",
    heading: "Single tokens and bulk supply",
    cards: [
      {
        key: "with-certificate",
        title: "With a new certificate",
        body: "Ordering a Class 3, Combo or DGFT certificate through us? The token comes with it, pre-checked, and we install the driver with you. Nothing to source separately.",
      },
      {
        key: "replacement",
        title: "Replacing a token",
        body: "Lost, damaged or locked? A new token is needed, and the certificate has to be re-issued onto it — a certificate cannot be copied across. Tell us what happened and we will handle both.",
      },
      {
        key: "bulk",
        title: "Bulk and partner supply",
        body: "Consultants and DSC partners ordering in volume are supplied at partner rates, quoted on application.",
        link: { to: "/partner-with-us", label: "See the partner programme" },
      },
    ],
  },

  faqs: [
    {
      q: "Why does a certificate need a USB token at all?",
      a: "Because the private key has to be non-exportable. A key held as a file on a computer could be copied without your knowledge, which would make the signature meaningless. The HYP2003 generates and uses the key onboard, so it never leaves the device — that is the whole basis on which a digital signature is trusted.",
    },
    {
      q: "Is the HYP2003 approved for use in India?",
      a: "The manufacturer's datasheet lists CCA India among its certifications, alongside FIPS 140-3 Level 3, FCC, CE, ICES and RoHS/REACH.",
    },
    {
      q: "Will it work on a Mac?",
      a: "Yes — Windows, Linux and macOS are all supported, and the token carries an onboard partition that installs the middleware automatically. Worth flagging, because macOS support is where token choice most often catches people out.",
    },
    {
      q: "How many certificates fit on one token?",
      a: "The HYP2003 has 64 KB for signing and encryption, which holds multiple certificates. Useful where one person signs in more than one capacity — an individual certificate for their own filings and an organisation certificate for the company.",
    },
    {
      q: "Does the token expire?",
      a: "No. The certificate expires; the token does not. With at least ten years of data retention and 500,000 rewrite cycles, the same token carries you through several renewal cycles.",
    },
    {
      q: "My token is locked. Can it be unlocked?",
      a: "No. Cryptographic tokens lock permanently after a set number of incorrect password attempts — that is a security feature, not a fault. The certificate cannot be recovered and must be re-issued onto a new token. If you are close to the attempt limit, stop guessing and call us.",
    },
    {
      q: "What changes when FIPS 140-3 becomes mandatory?",
      a: `From ${s(
        "fips1403DscIssuance"
      )}, Certifying Authorities are expected to stop issuing new Digital Signature Certificates onto FIPS 140-2 tokens, so fresh issuance and renewals will need a FIPS 140-3 token. Certificates already sitting on a 140-2 token continue to work normally until they expire — nothing is switched off. What changes is that at your next renewal you will need 140-3 hardware.`,
    },
    {
      q: "Do I need to replace my token right now?",
      a: "No. If you hold a working certificate on a FIPS 140-2 token, use it until it expires. The time to move is at renewal. If you are buying a new certificate today, though, ask for a 140-3 token — it costs no more and saves you buying hardware twice.",
    },
    {
      q: "Is the HYP2003 FIPS 140-3?",
      a: "Yes. The manufacturer's datasheet states FIPS 140-3 Security Level 3, validated by NIST, and lists CCA India among its certifications. That is why we stock it — a certificate issued onto it today will still be issuable after the change.",
    },
    {
      q: "Can I use a token I already have?",
      a: "Usually, if it is a compliant crypto token in working order and not locked. Send us the model and we will confirm before you order anything.",
    },
  ],

  // ⚠️ Provenance, rendered. The datasheet revision is as Clinton supplied it
  // and has not been independently verified — flagged in MISSING-PAGES.md
  // rather than dropped, because a checkable document reference is worth more
  // than a vague "per the manufacturer".
  sourceNote:
    "Specifications sourced from the HyperPKI HYP2003 datasheet, HSTE-NB0026 RV 3.1-IND.",
  lastReviewed: "05-09-2026",
};
