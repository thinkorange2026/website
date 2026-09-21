// Structured-data (JSON-LD) builders — CONTENT-PLAN.md §14.2, BUILD-PLAN.md
// Phase 9. Pure data builders, no JSX, no React import: they run identically
// inside a component (via the <JsonLd> wrapper in components/seo/JsonLd.jsx)
// and, if a future script ever needs one directly, under plain Node — same
// "relative import, explicit extension" discipline as src/content/*.js so
// nothing here breaks that path.
//
// Consolidates what were THREE separately hand-rolled FAQPage builders
// (ServiceLeaf.jsx, DscProduct.jsx, home/sections/Faqs.jsx) into one — see
// each call site's comment. One definition means a future schema.org field
// addition (e.g. `dateModified`) happens once, not three times with the risk
// of drifting between copies.
import { site } from "../content/nav.js";

const ORIGIN = `https://${site.domain}`;

export function absoluteUrl(path) {
  if (!path) return ORIGIN;
  return path === "/" ? `${ORIGIN}/` : `${ORIGIN}${path}`;
}

/** Sitewide identity — CONTENT-PLAN.md §14.2 "All" row. Rendered once per
 * page (RootLayout), not per-section, so every page is independently
 * verifiable by a crawler that only fetches that one URL. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${ORIGIN}/#organization`,
    name: site.legalName,
    alternateName: site.shortName,
    url: `${ORIGIN}/`,
    telephone: site.phoneDisplay,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.registeredAddress.line1}, ${site.registeredAddress.line2}`,
      postalCode: site.registeredAddress.postalCode,
      addressLocality: site.locality,
      addressRegion: site.region,
      addressCountry: "IN",
    },
    // ⛔ THE CLIENT'S OWN LOGO FILE, named by Clinton on 21-09-2026
    // ("public/images/logo.png ... this are my icon so use this icon").
    // Do not swap this for logo-black.png or for anything generated — a
    // knowledge panel renders whatever this points at, so it has to be the
    // real thing. Transparent PNG is fine: Google composites it on the white
    // ground of a SERP, where both the navy "T" and the ember "O" read.
    logo: absoluteUrl("/images/logo.png"),
    // ⛔ STILL NO `sameAs`, AND IT IS THE BIGGEST REMAINING GAP IN THIS FILE.
    // `sameAs` is what links this site to the Google Business Profile,
    // LinkedIn, Facebook and Instagram as ONE entity, which is what produces a
    // knowledge panel on a branded search. It needs real, confirmed profile
    // URLs from Clinton — inventing or guessing them is the same failure as
    // inventing a fee. Add them here the day they are supplied.
  };
}

/** The local-search half of the entity: the registered office as a place.
 *
 * ⛔ THIS DOCBLOCK USED TO CLAIM `streetAddress`/`postalCode` WERE HERE AND
 * THEY WERE NOT — the builder emitted locality only, so the one schema type
 * that actually feeds local results carried no address. It also said geo
 * coordinates "were never supplied"; they were, on 20-08-2026, as
 * `site.registeredAddress.mapsQuery` — the pin behind the map embed. Both
 * fixed 21-09-2026. CLAUDE.md repeated the same false claim, so reading either
 * note was not enough; the built HTML was what settled it. Check the emitted
 * JSON-LD, not the comment.
 *
 * ⚠️ `AccountingService`, not the generic `LocalBusiness` it was, and NOT
 * `ProfessionalService` — schema.org marks that one as deprecated for local
 * businesses precisely because it was confused with `Service`.
 * `AccountingService` is a live `LocalBusiness` subtype, so everything below is
 * still valid, and it is the nearest accurate type for a practice whose core is
 * GST, income tax, accounting and audit. The firm does more than accounting
 * (company formation, tenders, DSC issuance); no single schema type covers that
 * spread, and a precise type beats a vague one.
 *
 * ⚠️ SALEM HERE IS THE REGISTERED OFFICE, NOT THE MARKET. See CLAUDE.md's
 * "Scope is pan-India" rule: the address stays exactly because it is what makes
 * the business verifiable and what local search reads, while `areaServed` leads
 * with India. Do not strip the address to make the firm look national, and do
 * not add a second city we do not have an office in.
 *
 * ⚠️ NO `priceRange` and NO `openingHours`. Both are standard on this type and
 * both would have to be invented — `fees` is null across the site and office
 * hours are still on CONTENT-PLAN.md §1.1's hold list. An absent property is
 * correct; a guessed one is a published claim. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${ORIGIN}/#localbusiness`,
    name: site.legalName,
    image: absoluteUrl("/images/home/home-hero.jpg"),
    logo: absoluteUrl("/images/logo.png"),
    telephone: site.phoneDisplay,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.registeredAddress.line1}, ${site.registeredAddress.line2}`,
      postalCode: site.registeredAddress.postalCode,
      addressLocality: site.locality,
      addressRegion: site.region,
      addressCountry: "IN",
    },
    // DERIVED from the one coordinate pair in the content layer — the same
    // string the map embed drops its pin on, so the schema and the visible map
    // can never point at different buildings. Split rather than restated: a
    // second literal here is a second thing to correct.
    geo: (() => {
      const [latitude, longitude] = site.registeredAddress.mapsQuery.split(",");
      return { "@type": "GeoCoordinates", latitude, longitude };
    })(),
    hasMap: site.registeredAddress.mapsUrl,
    // ⚠️ India FIRST — the firm is pan-India and Tamil Nadu is where the office
    // happens to be, not the limit of who it serves (CLAUDE.md, 21-09-2026).
    // The State entry stays because it is true and it supports local intent.
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "State", name: site.region },
    ],
    // Ties the place to the company so both resolve as one entity rather than
    // two businesses that share a phone number.
    parentOrganization: { "@id": `${ORIGIN}/#organization` },
    url: `${ORIGIN}/`,
  };
}

/** BreadcrumbList from the same `trail` Breadcrumbs.jsx already renders —
 * built there, not here, so the visible trail and the structured data read
 * off one array and can never disagree (same discipline as the homepage
 * FAQ row's "select by reference" rule). */
export function breadcrumbListJsonLd(trail) {
  if (!trail || trail.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** FAQPage — CONTENT-PLAN.md §14.2 (T2 + T4) and §486 (homepage FAQ row).
 * The one FAQPage builder for the whole site; see file header. */
export function faqPageJsonLd(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/** Service — T2 service leaves. `areaServed` mirrors LocalBusiness rather
 * than repeating a street address that doesn't exist in the content layer. */
export function serviceJsonLd({ name, description, path, categoryLabel }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": `${ORIGIN}/#organization` },
    areaServed: { "@type": "Country", name: "India" },
    ...(categoryLabel ? { serviceType: categoryLabel } : {}),
  };
}

/** CollectionPage — T3 category hubs, the top-level /services hub, and /dsc.
 * CONTENT-PLAN.md §14.2 pairs this with BreadcrumbList, which templates
 * already get for free by rendering <Breadcrumbs> via PageHero. */
/**
 * BlogPosting for an /insights article (T10). `Article` would also validate,
 * but BlogPosting is the narrower type and these are dated editorial posts
 * rather than reference documents.
 *
 * No `author` beyond the organisation itself: the articles carry no personal
 * byline on the page either, and naming an individual here would assert a
 * person's authorship in structured data that the page never states — the same
 * reason team names are on CONTENT-PLAN.md §1.1's hold list.
 *
 * `dateModified` deliberately mirrors `datePublished` rather than being stamped
 * at build time: a rebuild is not an edit, and a modification date that moves
 * every deploy is a false freshness signal.
 */
/**
 * @param image  OPTIONAL. Either a served path (`"/images/x.png"`) or
 *   `{ src, width, height }`. Emitted as a full `ImageObject` when dimensions
 *   are known, because that is strictly more useful to a consumer than a bare
 *   URL and both call sites already hold the numbers.
 *
 * ⚠️ `image` IS WHAT MAKES THE PAGE ELIGIBLE FOR AN ARTICLE RICH RESULT — the
 * thumbnail in search, and in Discover. Without it the page still ranks, it
 * just renders as a plain blue link. It was absent from every BlogPosting on
 * this site until 21-09-2026 while the photographs were sitting on the pages
 * all along, declared nowhere.
 *
 * ⚠️ OMITTED, NOT SUBSTITUTED, when a caller has no image. The tempting
 * fallback is that route's generated OG card, which always exists — but that
 * card is a TEXT card, and handing Google a rendered headline as the article's
 * representative photograph produces a worse rich result than no photograph at
 * all. Let Google pick from the page instead.
 *
 * ⚠️ Google wants at least 1200px wide. The article photos resolve to 1600px
 * and the notice graphic to 1672px, both checked. Anything narrower added here
 * should be checked too.
 */
export function articleJsonLd({ headline, description, path, datePublished, image }) {
  const src = typeof image === "string" ? image : image?.src;
  const width = typeof image === "string" ? undefined : image?.width;
  const height = typeof image === "string" ? undefined : image?.height;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    url: absoluteUrl(path),
    ...(src
      ? {
          image:
            width && height
              ? { "@type": "ImageObject", url: absoluteUrl(src), width, height }
              : absoluteUrl(src),
        }
      : {}),
    datePublished,
    dateModified: datePublished,
    author: { "@type": "Organization", name: site.legalName, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: site.legalName, url: absoluteUrl("/") },
    inLanguage: "en-IN",
  };
}

export function collectionPageJsonLd({ name, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${ORIGIN}/#organization` },
  };
}

/** Product — T4 DSC products. No `offers`/price block: DSC pricing is
 * "on request" everywhere (same discipline as `fees: null`), and a Product
 * schema with no `offers` is valid — Rich Results simply won't show a price
 * snippet, which is correct here rather than a gap. */
// ⚠️ `brand` defaults to site.shortName so every existing call site is
// byte-identical, but it is overridable — the HYP2003 page describes a
// MANUFACTURER'S product we resell, and asserting ThinkOrange as its brand in
// structured data would be a plain untruth to a crawler.
export function productJsonLd({ name, description, path, brand = site.shortName }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: absoluteUrl(path),
    brand: { "@type": "Organization", name: brand },
  };
}

/** HowTo — T5 driver install steps, CONTENT-PLAN.md §14.2's fastest-growing
 * lane (§14.1's "national" strategy). `step.desc` doubles as both the
 * visible copy and the schema text, so the two can't drift. */
export function howToJsonLd({ name, description, steps, path }) {
  if (!steps?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url: absoluteUrl(path),
    step: steps.map((step) => ({
      "@type": "HowToStep",
      position: step.step,
      name: step.title,
      text: step.desc,
    })),
  };
}
