// SEO meta for standalone routes that have no other natural content-file
// home — CONTENT-PLAN.md §14, BUILD-PLAN.md Phase 9. Everything else pulls
// its meta from where it already lives: service leaves and DSC
// products/drivers carry their own `meta`, category hubs carry it in
// category-content.js / dsc/hub-content.js, About/Partner-With-Us carry it
// in their own content files, and legal pages carry `metaDescription`
// directly (see each file). Consumed by src/lib/seo.js — the single
// resolver every route (client-side head sync AND the Phase 9 prerender
// script) goes through.
//
// Relative imports only, no JSX — plain-Node-importable, same discipline as
// every other file under src/content/ (see gst-registration.js's comment).
export const meta = {
  "/": {
    title: "GST, Income Tax & DSC Services in Salem | ThinkOrange",
    description:
      "GST, income tax, business setup, accounting, audit, tenders and Digital Signature Certificates — from Salem, Tamil Nadu, for clients across India.",
  },
  "/services": {
    title: "All Services | ThinkOrange",
    description:
      "GST, income tax, business setup, registrations and licences, accounting and payroll, and tenders and finance — every practice area, for clients across India.",
  },
  "/insights": {
    title: "Insights | ThinkOrange",
    description:
      "Plain explanations of GST registration, entity choice, Digital Signature Certificates and tendering — written for business owners, not other accountants.",
  },
  "/notices": {
    title: "Notices | ThinkOrange",
    description:
      "Current notices on GST, income tax, Digital Signature Certificates and tokens — the changes and requirements our clients most often need flagged.",
  },
  "/contact": {
    title: "Contact ThinkOrange | Salem, Tamil Nadu",
    description:
      "Reach us by phone, WhatsApp or email, or send your enquiry direct. GST, income tax, accounting, audit and DSC support from Salem, across India.",
  },
  "*": {
    title: "Page Not Found | ThinkOrange",
    description: "The page you're looking for doesn't exist. Find your way back to ThinkOrange Consulting's services, DSC pages or contact details.",
  },
};

/** Generic fallback for a route this map and every other content file miss —
 * should not normally be hit, but resolveSeo() needs to never throw. */
export const defaultMeta = {
  title: "ThinkOrange Consulting | Tax, Compliance & DSC, Salem",
  description:
    "ThinkOrange Consulting Private Limited — GST, income tax, business setup, accounting & audit, government tenders, and Digital Signature Certificates.",
};
