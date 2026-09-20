// DSC DOCUMENT MATRIX — what a certifying authority asks for when the
// certificate is issued to an ORGANISATION, broken down by how that
// organisation is constituted.
//
// 20-09-2026 (Clinton): "analyse https://www.signxca.com/resources.php … i want
// to show the resource details like this in my resource page after this tools
// download."
//
// ⛔ THE SUBSTANCE IS THEIRS, THE WORDING IS OURS — deliberately, and both
// halves matter. Which documents a CA requires per entity type is a fact that
// follows from CCA guidance; the sentences on that page are their expression of
// it, and copying them wholesale would put a third party's copy on this site.
// Every line below was rewritten: sentence case, -ise spelling, their typos
// gone ("Authroised", "orgnaization"), and "NA" turned into a real statement of
// what is not required. If you ever re-check this against their page, compare
// the REQUIREMENTS, not the strings.
//
// ⚠️ NO CERTIFYING AUTHORITY IS NAMED HERE, and that is the site's standing
// rule (02-09-2026). Every reference is "a certifying authority" / "the
// certifying authority". Do not attribute this matrix to a named CA.
//
// ⛔ THIS IS UNREVIEWED THIRD-PARTY-DERIVED PROCEDURE, NOT ThinkOrange's own
// confirmed checklist. It sits beside `certificates.js`'s per-certificate
// lists, which are shorter and are what we actually ask a client for; this is
// the fuller picture a CA works from. They do not contradict each other — this
// one adds the alternatives (GST certificate in place of a bank statement, the
// signatory branches) that the short list rolls up. **If a line here ever
// disagrees with `certificates.js`, `certificates.js` wins** and this file is
// the one to correct. Listed in MISSING-PAGES.md for CA sign-off.
//
// ⚠️ TWO THINGS TO CONFIRM, flagged rather than silently "corrected":
//  1. The source matrix asks for a "list of directors" for an LLP, where the
//     register actually names designated partners. Reproduced as given.
//  2. It lists a service tax / VAT / sales tax registration certificate as an
//     accepted address proof. Those taxes were subsumed by GST in 2017, so the
//     line is probably legacy. Kept faithful; confirm before relying on it.
//
// ⚠️ SHAPE. `organisation`, `signatory` and `applicant` are each a list of
// GROUPS — `{ when?, items }` — so a conditional requirement ("if the signatory
// is a partner… if not…") and a plain list are the same structure and the
// template needs no special case. `null` means genuinely not required, and the
// panel says so rather than rendering an empty block.

const BANK_STATEMENT =
  "Original bank statement covering the last three months, signed by the bank and in the organisation's name. A signed letter from the bank confirming the account and the organisation's name is accepted instead.";
const GST_CERTIFICATE = "GST registration certificate in the organisation's name";
const APPLICANT_STANDARD = [
  {
    items: [
      "Proof of the applicant's association with the organisation, or a letter of authorisation from the authorised signatory",
    ],
  },
];
const DIRECTOR_BRANCHES = [
  {
    when: "If the authorised signatory is a director",
    items: ["Copy of the list of directors"],
  },
  {
    when: "If the authorised signatory is not a director",
    items: [
      "A board resolution, or a power of attorney, in the certifying authority's prescribed format",
    ],
  },
];

/** Organisation types, in the order the source matrix lists them. */
export const dscOrganisationTypes = [
  {
    key: "individual",
    label: "Individual or proprietorship firm",
    meta: "The proprietor signs for the business",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [
          BANK_STATEMENT,
          "Business registration certificate for the firm, including a Shops and Establishments registration",
        ],
      },
    ],
    signatory: [
      {
        items: [
          "Business registration certificate naming the proprietor, confirming that the authorised signatory owns the business",
        ],
      },
    ],
    // The proprietor is the applicant, so there is nothing separate to prove.
    applicant: null,
  },
  {
    key: "partnership",
    label: "Partnership firm",
    meta: "Signed by a partner, or by someone a partner authorises",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [
          BANK_STATEMENT,
          "Business registration certificate for the firm, including a Shops and Establishments registration",
          "PAN of the firm",
        ],
      },
    ],
    signatory: [
      {
        when: "If the authorised signatory is a partner",
        items: [
          "Copy of the list of partners from the partnership deed — the first page, and the pages naming the authorised signatory",
        ],
      },
      {
        when: "If the authorised signatory is not a partner",
        items: [
          "An authorisation letter signed by a partner, in the certifying authority's prescribed format",
        ],
      },
    ],
    applicant: APPLICANT_STANDARD,
  },
  {
    key: "corporate",
    label: "Company",
    meta: "Private limited, public limited and other corporate entities",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [BANK_STATEMENT, "Certificate of incorporation", "PAN of the company"],
      },
    ],
    signatory: DIRECTOR_BRANCHES,
    applicant: APPLICANT_STANDARD,
  },
  {
    key: "association",
    label: "Association of persons",
    meta: "Societies and other bodies of individuals",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [
          BANK_STATEMENT,
          "Certificate of incorporation and registration, issued by an authority such as the Registrar",
          "PAN of the association",
        ],
      },
    ],
    signatory: [
      {
        items: ["A resolution from the association or society authorising the signatory"],
      },
    ],
    applicant: APPLICANT_STANDARD,
  },
  {
    key: "llp",
    label: "Limited liability partnership",
    meta: "Signed by a designated partner, or by someone the board authorises",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [BANK_STATEMENT, "Certificate of incorporation", "PAN of the LLP"],
      },
    ],
    // ⚠️ "Director" is the source matrix's own wording for an LLP — see the
    // header. Confirm before rewording; an LLP's register names designated
    // partners.
    signatory: DIRECTOR_BRANCHES,
    applicant: APPLICANT_STANDARD,
  },
  {
    key: "ngo-trust",
    label: "NGO or trust",
    meta: "Non-government organisations, trusts and foundations",
    organisation: [
      {
        when: "If registered under GST",
        items: ["A GST certificate is not asked for from this type of organisation"],
      },
      {
        when: "Documents required",
        items: [
          BANK_STATEMENT,
          "Certificate of incorporation or registration",
          "PAN of the organisation",
        ],
      },
    ],
    signatory: [
      { items: ["A resolution from the NGO or trust authorising the signatory"] },
    ],
    applicant: APPLICANT_STANDARD,
  },
  {
    key: "banking",
    label: "Banking organisation",
    meta: "Banks and licensed banking entities",
    organisation: [
      { when: "If registered under GST", items: [GST_CERTIFICATE] },
      {
        when: "If not registered under GST",
        items: [
          "PAN of the bank",
          "Certificate of incorporation, or the banking licence certificate",
        ],
      },
    ],
    signatory: [
      { items: ["Bank ID card of the authorised signatory, or of the bank manager"] },
    ],
    applicant: [
      {
        items: [
          "Bank ID card, or a letter of authorisation from the authorised signatory",
        ],
      },
    ],
  },
  {
    key: "government",
    label: "Government organisation",
    meta: "Departments, ministries and government bodies",
    // Neither branch asks for organisation documents — the signatory's own
    // identity and authorisation carry the application.
    organisation: null,
    signatory: [
      {
        items: [
          "Organisational ID card of the authorised signatory, an identity letter issued by the organisation, or other proof of their association with it",
          "A letter from the authorised signatory to the certifying authority for eSign or DSC, in the prescribed format",
          "The authorised signatory must also meet the remaining requirements of Annexure V",
        ],
      },
    ],
    applicant: APPLICANT_STANDARD,
  },
];

/**
 * Accepted address proofs. Shared across every organisation type, which is why
 * it is its own row rather than repeated eight times.
 */
export const dscAddressProofOptions = [
  "Aadhaar, through the eKYC service",
  "Telephone bill",
  "Electricity bill",
  "Water bill",
  "Gas connection",
  "Bank statement signed by the bank",
  // ⚠️ Legacy — see the header's note 2.
  "Service tax, VAT or sales tax registration certificate",
  "Driving licence, or a vehicle registration certificate",
  "Voter ID card",
  "Passport",
  "Property tax, corporation or municipal corporation receipt",
  "Any government-issued photo ID showing both name and address",
];

export const dscDocumentMatrixContent = {
  eyebrow: "Documents",
  heading: "What an organisation certificate asks for",
  lede: "A certifying authority checks three things separately — the organisation, the person authorising the certificate, and the applicant it is issued to. What it asks for depends on how the organisation is constituted. Open your type to see all three.",
  // ⚠️ Not a hedge. This is the matrix a CA works from, and the set confirmed
  // against a particular application can be shorter or ask for an alternative.
  // Saying so is honest; implying the list is exhaustive is not.
  note: "The exact set is confirmed when your application is raised, and an alternative document is often accepted. Send us what you have and we will tell you what is missing.",
};
