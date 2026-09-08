// "eSign Solution" (`/dsc/esign-solution`, T11). Written 18-08-2026 as
// "eSign or DSC — Which Do You Need?", a decision-helper comparing Aadhaar
// eSign against a Class 3 DSC.
//
// ⛔ 07-09-2026 (Clinton): "in esign-or-dsc page change it into esign-solution
// and here we are not going to show about comparision." The page is no longer
// a comparison, so `meta` and `heroLede` were rewritten to stop framing it as
// one, and the route was renamed to match (nav.js, with a redirect stub for
// the old URL).
//
// ⚠️ `comparisonRows`, `decisionGuide` and `faqs` are RETAINED and simply not
// rendered — the same discipline `portalGuide`, `afterIssue`, `switching` and
// `earnings` already carry elsewhere in this codebase. Every row is a factual,
// sourced distinction (Aadhaar eSign's OTP/biometric per-transaction model vs
// a Class 3 DSC's token-based multi-year certificate; statutory portals
// mandating Class 3 specifically), not a ThinkOrange operational claim, so
// nothing here needs to route through turnaround.js. Do NOT prune them on a
// later tidy-up pass; a future eSign page that needs any of this has reviewed
// copy waiting for it. `DscEsign.jsx`'s commented-out body still reads them.
export const esignSolutionContent = {
  meta: {
    title: "eSign Solution | ThinkOrange Consulting",
    description:
      "Aadhaar-based electronic signing for the documents that accept it — no USB token to carry and no certificate to issue in advance. Tell us what you need signed.",
  },
  heroLede:
    "Aadhaar-based electronic signing for the documents that accept it — nothing to carry, and no certificate held in advance.",

  comparisonRows: [
    {
      criterion: "How you authenticate",
      esign: "Aadhaar OTP to your linked mobile, or biometric, at the moment you sign",
      dsc: "Your private key, held on a physical USB token, every time you sign",
    },
    {
      criterion: "What you need on hand",
      esign: "Just your Aadhaar-linked mobile number",
      dsc: "The physical token — misplace it and you can't sign anything",
    },
    {
      criterion: "Set-up before you can sign",
      esign: "None — no advance issuance, you authenticate at the point of signing",
      dsc: "Certificate issuance first, including video verification, before you can sign anything",
    },
    {
      criterion: "Validity",
      esign: "Attaches to the one document you signed — nothing to renew afterward",
      dsc: "1 to 3 years, then it stops working and needs renewal or re-issue",
    },
    {
      criterion: "Statutory portals — income tax, GST, MCA21/ROC, e-tendering/GeM",
      esign: "Not accepted",
      dsc: "Required — this is the only form these portals accept",
    },
    {
      criterion: "Private contracts & agreements",
      esign: "Accepted wherever the other party agrees to it",
      dsc: "Also accepted, though usually unnecessary overhead for a simple contract",
    },
  ],

  decisionGuide: [
    "Filing on a government portal — income tax, GST, MCA21/ROC, e-tendering or GeM — you need a Class 3 DSC. There's no eSign alternative for these; the portal simply won't accept anything else.",
    "Signing an offer letter, vendor agreement, NDA or similar contract where the other party accepts an Aadhaar-based signature, eSign is faster and needs no certificate held in advance.",
    "Signing regularly across the year, on a token you already carry, a DSC's multi-year certificate means one issuance covers everything until it expires — worth it once you're signing often enough that a fresh eSign authentication each time would be the slower path.",
    "Not sure which a specific portal or counterparty actually wants — check their own stated requirement before assuming; a rejected submission because the wrong signature type was used costs more time than checking first.",
  ],

  faqs: [
    {
      q: "Can I use Aadhaar eSign instead of a DSC to save money?",
      a: "Only where the portal or counterparty actually accepts it. For statutory filings — income tax, GST, MCA21/ROC, e-tendering and GeM — the portal requires a Class 3 DSC specifically and will reject an Aadhaar eSign outright, regardless of cost.",
    },
    {
      q: "Is one more legally valid than the other?",
      a: "No — both are recognised electronic signatures under the Information Technology Act 2000 and carry equal legal standing for the documents they're used on. The difference is about where each is ACCEPTED, not which one counts more in law.",
    },
    {
      q: "Can I have both, and use whichever fits a given situation?",
      a: "Yes, and many of our clients do exactly that — a Class 3 DSC for portal filings that require it, and Aadhaar eSign for the contracts and agreements where it's accepted. They aren't mutually exclusive.",
    },
    {
      q: "If I already have a DSC, is there any reason to also set up eSign?",
      a: "If most of your signing is on statutory portals, probably not. It becomes worth it if you regularly send contracts or agreements to people who'd rather sign with an Aadhaar OTP than install anything or wait for you to courier a signed copy.",
    },
  ],
};
