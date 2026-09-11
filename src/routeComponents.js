// Maps a nav.js route entry to its template component — the one piece of
// logic router.jsx (client, lazy chunks) and router-static.jsx (Phase 9 SSR,
// eager imports) must share rather than each maintaining its own copy of the
// same switch statement. A route resolving to the wrong template in one but
// not the other is exactly the kind of drift neither file's own build would
// catch — the client bundle would render fine, and the prerendered HTML
// would silently be for the wrong page.
//
// Takes the actual components as a parameter rather than importing them
// itself, so each caller controls HOW its components are loaded (lazy vs.
// eager) without this file caring. No JSX here on purpose — kept a plain .js
// module so nothing about it depends on react-jsx transform specifics.
export function resolveComponent(entry, components) {
  const {
    Home,
    ServicesHub,
    CategoryHub,
    ServiceLeaf,
    DscHub,
    DscBuyToken,
    DscEsign,
    DscDrivers,
    DscFaqs,
    DscResources,
    Notices,
    DscIntent,
    About,
    PartnerWithUs,
    Contact,
    LegalPage,
    InsightsIndex,
    InsightArticle,
    NotFound,
  } = components;

  switch (entry.template) {
    case "T1":
      return Home;
    case "T2":
      return ServiceLeaf;
    case "T3":
      if (entry.path === "/services") return ServicesHub;
      if (entry.path === "/dsc") return DscHub;
      return CategoryHub;
    // ⛔ 02-09-2026: T4 (DSC product) is retired — the five certificate pages
    // and the token page are gone, and `DscProduct.jsx` with them. T5 was
    // retired alongside them and then brought back the same day for exactly
    // one route: /dsc/resources, the technical tab that keeps /dsc minimal.
    case "T5":
      return DscBuyToken;
    // T11 — /dsc/esign-solution, unpaused 03-09-2026, renamed 07-09-2026. Its own template rather
    // than a T5 branch, because T5 resolves unconditionally to DscBuyToken now
    // that the DSC tree is two pages: marking this T5 would have served the
    // Buy Token page under the eSign URL, in both the client bundle AND the
    // prerendered HTML, with nothing failing.
    case "T11":
      return DscEsign;
    // T12 / T13 — /dsc/drivers and /dsc/faqs, split off Buy Token 03-09-2026.
    // Their own branches for the same reason T11 has one: T5 resolves
    // unconditionally to DscBuyToken, so reusing it would have served the order
    // page under both URLs, in the bundle AND the prerendered HTML, silently.
    case "T12":
      return DscDrivers;
    case "T13":
      return DscFaqs;
    // ⛔ T14 IS RETIRED (11-09-2026). /dsc/about-hyp2003 merged into
    // /dsc/buy-token, so the id resolves to nothing and the URL is a redirect
    // stub. Do not reuse "T14" for a new page — an old `template: "T14"` left
    // anywhere would then silently render it.
    // T15 — /dsc/resources, the DSC file library (07-09-2026). Own branch for
    // the same reason T11–T13 each have one: T5, T12 and T13 all resolve
    // unconditionally, so reusing any of them would serve the wrong page under
    // this URL in the bundle AND the prerendered HTML, silently.
    // T16 — the four DSC intent pages (/dsc/statutory-filings, /dsc/tenders,
    // /dsc/dgft, /dsc/foreign-national), 11-09-2026. One component, four
    // routes, dispatching on `path`. Its own branch for the same reason every
    // DSC template since T11 has one: T5, T12, T13 and T15 all resolve
    // UNCONDITIONALLY, so reusing any of them would serve the wrong page under
    // all four URLs, in the client bundle AND the prerendered HTML, with
    // nothing failing and nothing logging.
    case "T16":
      return DscIntent;
    case "T15":
      return DscResources;
    // T17 — /notices, every confirmed notice in one list (11-09-2026). Own
    // branch for the same reason T11–T13 and T15 each have one: every other id
    // resolves unconditionally, so reusing any of them would serve the wrong
    // page under this URL in the bundle AND the prerendered HTML, silently.
    // ⚠️ T17, NOT T16 — T16 was already taken by the DSC intent pages above.
    // Grep for `case "T` before claiming a new id; this collided on the first
    // attempt and nothing would have failed, it would just have served the
    // wrong page.
    case "T17":
      return Notices;
    case "T6":
      return entry.path === "/about" ? About : PartnerWithUs;
    case "T7":
      return Contact;
    case "T8":
      return LegalPage;
    // T10 — the index and the articles share a template family and branch on
    // path, the same way T3 (/services, /dsc, category hubs) and T6
    // (/about, /partner-with-us) already do.
    case "T10":
      return entry.path === "/insights" ? InsightsIndex : InsightArticle;
    case "T9":
    default:
      return NotFound;
  }
}
