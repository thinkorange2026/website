import { Link } from "react-router-dom";
import { ArrowRight, Check, Cpu, Info, ShieldCheck } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { SubNav } from "@/components/layout/SubNav";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NoticeBar } from "@/components/ui/NoticeBar";
import { FaqSection } from "@/components/ui/FaqSection";
import { ProductShot } from "@/components/ui/ProductShot";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import {
  dscBuyTokenSectionIds,
  dscDriversPage,
  dscFaqsPage,
  dscSectionIds,
} from "@/content/nav";
import { tokenProduct } from "@/content/dsc/token";
import { hyp2003Token } from "@/content/dsc/hyp2003";
import { TokenOrder } from "@/modules/dsc/TokenOrder";
import { faqPageJsonLd, productJsonLd } from "@/lib/jsonld";
import { dscEnquiryHref } from "@/lib/whatsapp";

// /dsc/buy-token — ORDER THE TOKEN, THEN EVERYTHING ABOUT IT.
//
// ⛔ MERGED 11-09-2026 (Clinton): "i want to merge Buy token and about HYP2003
// like in given html. but order form in top below hero section." Source:
// `thinkorange-buy-token-merged.html`. /dsc/about-hyp2003 (T14) is gone — its
// template file deleted, its id retired in `routeComponents.js`, both routers
// and `lib/seo.js`, and its URL a redirect stub landing on the specifications
// section here.
//
// ⚠️ THE ORDER PANEL IS THE FIRST SECTION, ABOVE EVERY EXPLANATION. The
// instruction names that placement, and it is also right: someone arriving on a
// tab labelled "Buy Token" should not scroll past a specification sheet to
// reach the thing they came for. The reference goes further and puts the order
// card inside the hero itself; here it is the section immediately below, so the
// hero keeps its product shot and the panel keeps a full column to breathe in.
// The hero's own button jumps straight to it.
//
// ⚠️ WHAT THE REFERENCE ASKS FOR AND THIS PAGE WILL NOT SAY is listed in
// `content/dsc/token.js`'s header — the exclusive-distributor badge, the
// in-stock/same-day-dispatch promise, the ₹[X] price and sticky buy-bar, and
// the unfilled replacement window. Read that before adding anything back from
// the HTML.
//
// ⚠️ SURFACE CADENCE, measured off the live DOM: deep → light-alt → light →
// light-alt → light → dark → light → light-alt → light → ember. Zero
// consecutive repeats and no adjacent dark-family pair.
// ⚠️ THE SECOND ENTRY IS `NoticeBar`, WHICH IS ITSELF A `<section
// data-surface="light-alt">` (05-09-2026) — it is easy to read this file and
// count nine surfaces when the page has ten. Re-run the cadence probe after
// adding or reordering ANY section here; inserting one shifts every surface
// below it.
//
// ⚠️ THE DEADLINE DATE IS NEVER TYPED. It interpolates statutory.js's
// `fips1403DscIssuance`.
// ⛔ IT IS STATED AS FACT, NOT AS AN EXPECTATION — 11-09-2026 (Clinton): "it is
// not expected it is offical so write in terms of that." Do not soften it back
// without asking him. What is still outstanding is the CITATION, not the fact:
// that entry's `source` is a DSC-industry write-up rather than the CCA's own
// circular.

// The comparison table's shared cell classes. Module-level constants rather
// than repeated literals so the three column headers cannot drift apart.
// ⚠️ EVERY HEADER CARRIES THE 2px TOP BORDER, transparent on the two that are
// not highlighted. The rule marking the HYP2003 column adds 2px of box, and
// without the placeholder on its neighbours that column's label sat a pixel
// lower than the other two — a visible wobble along the header row.
// ⚠️ The border colour is spelled out per call site rather than overridden with
// `!`: these class strings do not go through `cn()`/twMerge, so two
// `border-*` utilities in one attribute are resolved by SOURCE ORDER IN THE
// COMPILED CSS, not by the order they appear here.
const COL_HEAD =
  "border-t-2 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400";
// Mobile-only per-cell label. `md:hidden` — the desktop table has real column
// headers, so rendering these there would say each column name twice per row.
const CELL_LABEL =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] md:hidden";

const SPEC_ICONS = {
  Hardware: Cpu,
  "Security and compatibility": ShieldCheck,
};

export default function DscBuyToken({ path }) {
  const {
    notice,
    whyThisToken,
    specs,
    deadline,
    comparison,
    whoOrders,
    faqs,
    sourceNote,
    lastReviewed,
  } = hyp2003Token;

  return (
    <>
      <JsonLd
        data={[
          // ⚠️ Product, not CollectionPage. This page now describes and sells
          // one specific product, so the schema says so — and `brand` is
          // "HyperSecu", not ThinkOrange: we resell a manufacturer's product,
          // and asserting our own brand on it is a plain untruth to a crawler.
          productJsonLd({
            name: "HyperPKI HYP2003 USB Token",
            description: tokenProduct.meta.description,
            path,
            brand: "HyperSecu",
          }),
          // Built from the SAME array the accordion renders, so the structured
          // data can never assert a question the page does not show.
          faqPageJsonLd(faqs),
        ]}
      />

      <PageHero
        path={path}
        eyebrow="Token & Driver"
        h1={tokenProduct.h1}
        lede={tokenProduct.lede}
        texture="blueprint"
        textureId="dsc-buy-token-hero"
        // ⛔ 11-09-2026 (Clinton): "remove this" — the four-tile certification
        // strip (FIPS 140-3 / CCA India / Storage / Data retention) is gone
        // from the hero. Nothing was lost: all four values are rows in the
        // specifications section below, so the hero no longer states them twice
        // in one scroll. ⚠️ `hyp2003Token.heroSpec` is still written and
        // exported — restoring the strip is `spec={heroSpec}` and re-adding it
        // to the destructure above, nothing more.
        aside={
          // The real product photograph, where the reference document had a
          // "[Product photograph]" placeholder box. `ProductShot` exists for
          // exactly this: a transparent PNG of dark hardware needs a plinth and
          // a key light, or it floats with no ground.
          // ⚠️ `ratio` is the file's REAL pixel dimensions — `<Img>`'s inner
          // img is object-cover, and cover only leaves a transparent product
          // uncropped when the box matches the file's own aspect.
          <ProductShot
            src="/images/drivers/dsc-card.png"
            alt="The HYP2003 USB crypto token"
            width={1143}
            height={370}
            caption="HYP2003 · 53 × 16.5 × 8.5 mm · 6 g"
            gradientId="hyp2003-shot"
            className="px-6 py-10 md:px-10 md:py-14"
          />
        }
      >
        {/* ⚠️ A PLAIN <a href="#order">, NOT `cta` (which renders a react-router
            <Link>). The target is on this same page: a Link would push a new
            location whose pathname is unchanged, so RootLayout's scroll effect
            — which keys on pathname — never fires and nothing moves. A native
            same-document fragment link scrolls on its own, and works before
            hydration and with no JS at all. */}
        <Button as="a" href={`#${dscBuyTokenSectionIds.order}`} variant="primary">
          Order now
        </Button>
      </PageHero>

      {/* ⛔ THE NOTICE BAR, directly under the hero — Clinton's original
          instruction for this strip names that placement, and the reference
          document puts its countdown bar in the same position. It is a plain
          strip, not a <section>: no heading, no landmark, so it stays out of
          the surface-cadence count while still supplying the fold between the
          `deep` hero and the `light` section below it. */}
      <NoticeBar label={notice.label} text={notice.text} />

      <SubNav
        sections={[
          { id: dscBuyTokenSectionIds.order, label: "Order" },
          { id: dscBuyTokenSectionIds.why, label: "Why this token" },
          { id: dscBuyTokenSectionIds.specs, label: "Specifications" },
          { id: dscBuyTokenSectionIds.change, label: "FIPS 140-3 change" },
          { id: dscBuyTokenSectionIds.compare, label: "Compare" },
          { id: dscBuyTokenSectionIds.faqs, label: "FAQs" },
        ]}
      />

      {/* --- ORDER --------------------------------------------------------
          First, by instruction. */}
      <Section id={dscBuyTokenSectionIds.order} surface="light">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Order a token"
                heading="Tell us where to send it"
                // ⚠️ The lede no longer mentions an operating system. That field
                // is gone (it was a support question inside a purchase, and
                // drivers have their own page), so a lede promising it would be
                // describing a form that is not there.
                lede="The token is the same for everyone. Your details and the quantity are all we need to quote and dispatch."
              />
              <ul className="mt-8 space-y-3">
                {tokenProduct.buyingFor.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-ink-500">
                    <Check
                      className="mt-1.5 h-4 w-4 shrink-0 text-ember-600"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* The two sibling pages. A quiet hairline row rather than cards
                  — the split only works if none of the pages starts rebuilding
                  the others. */}
              <div className="mt-10 border-t border-ink-200 pt-6">
                <ul className="flex flex-wrap gap-x-8 gap-y-3">
                  <li>
                    <PageLink to={dscDriversPage.path} label="Token drivers & setup" />
                  </li>
                  <li>
                    <PageLink to={dscFaqsPage.path} label={dscFaqsPage.label} />
                  </li>
                  <li>
                    <PageLink to={`/dsc#${dscSectionIds.finder}`} label="Which DSC do I need?" />
                  </li>
                </ul>
              </div>
            </div>
            <Reveal delay={0.1} className="lg:col-span-6">
              <TokenOrder />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --- WHY THIS TOKEN ------------------------------------------------ */}
      <Section id={dscBuyTokenSectionIds.why} surface="light-alt">
        <Container>
          <SectionHeading
            eyebrow={whyThisToken.eyebrow}
            heading={whyThisToken.heading}
            lede={whyThisToken.lede}
          />

          {/* Plain grid + per-item `Reveal`, never `<Stagger>`: Stagger wraps
              each child in its own motion.div, which becomes the real grid
              item — so `first:`/`nth-child` exceptions silently match every
              item. Recorded four times in CLAUDE.md; `Reveal` forwards
              className onto the element it renders, so the item IS the grid
              item. */}
          <div className="mt-12 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-3">
            {whyThisToken.points.map((point, index) => (
              <Reveal key={point.key} delay={index * 0.06}>
                {/* ⚠️ ink-400, NOT ink-300. These are visible ordinals a
                    reader counts by, so they carry the 4.5:1 floor — measured,
                    ink-300 on canvas is 3.35:1 and ink-400 is 7.2:1. Same
                    failure the T2 documents checklist already hit once. */}
                <p className="font-mono text-body-sm tabular-nums text-ink-400">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-h4 text-ink-600">{point.title}</h3>
                <p className="mt-3 text-body text-ink-500">{point.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- SPECIFICATIONS ------------------------------------------------ */}
      <Section id={dscBuyTokenSectionIds.specs} surface="light">
        <Container>
          <SectionHeading
            eyebrow={specs.eyebrow}
            heading={specs.heading}
            lede={specs.lede}
          />

          {/* Two <dl>s, not a table: these are label/value pairs, and a
              description list lays out in two columns where a two-column table
              strands itself at a third of the container. Nothing here animates
              per row — this is the section a reader lands on to check a figure
              against a datasheet. */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {specs.groups.map((group) => {
              const Icon = SPEC_ICONS[group.title] ?? Info;
              return (
                <Reveal
                  key={group.title}
                  className="card-premium relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white p-7 md:p-9"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember-50">
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5 text-ember-600"
                        strokeWidth={1.75}
                      />
                    </span>
                    <h3 className="text-h4 text-ink-600">{group.title}</h3>
                  </div>

                  <dl className="mt-7">
                    {group.rows.map((row, index) => (
                      <div
                        key={row.label}
                        // Rule on the TOP of every row but the first: a bottom
                        // rule dangles under the last row inside the card's own
                        // border.
                        className={`flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-3.5 ${
                          index === 0 ? "" : "border-t border-ink-100"
                        }`}
                      >
                        <dt className="text-body-sm text-ink-400">{row.label}</dt>
                        <dd className="min-w-0 flex-1 text-right text-body-sm font-medium text-ink-600">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-8">
            <p className="max-w-[76ch] text-body-sm text-ink-400">{specs.note}</p>
          </Reveal>
        </Container>
      </Section>

      {/* --- WHAT CHANGES --------------------------------------------------
          The page's one dark band. Without it this runs six light-family
          surfaces in a row — the flatness diagnosis already recorded for /dsc
          and /about. It is also the right section for it: this is the part a
          reader most needs to stop and read.

          ⚠️ EVERY COLOUR IN HERE IS SET FOR THE DARK SURFACE. The surface
          system covers headings and `var(--surface-*)` accents, NOT plain
          `text-ink-*` utilities — the trap CLAUDE.md records six times over. */}
      <Section
        id={dscBuyTokenSectionIds.change}
        surface="dark"
        className="surface-ambient"
      >
        <Container>
          <SectionHeading dark eyebrow={deadline.eyebrow} heading={deadline.heading} />

          <div className="mt-12 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-3">
            {deadline.cards.map((card, index) => (
              <Reveal key={card.key} delay={index * 0.06}>
                <p className="font-mono text-body-sm tabular-nums text-ember-300">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-h4 text-canvas">{card.title}</h3>
                <p className="mt-3 text-body text-ink-100">{card.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <p className="max-w-[80ch] border-t border-ink-700 pt-7 text-body text-ink-100">
              {deadline.note}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* --- COMPARISON ---------------------------------------------------- */}
      <Section id={dscBuyTokenSectionIds.compare} surface="light">
        <Container>
          <SectionHeading
            eyebrow={comparison.eyebrow}
            heading={comparison.heading}
            lede={comparison.lede}
          />

          {/* ⛔ NO HORIZONTAL SCROLL ON A PHONE — 11-09-2026 (Clinton): "in
              phone view it make user to scroll horizontally i want to fixed
              this issue." The old `overflow-x-auto` + `min-w-[640px]` pair put
              a 640px table inside a 327px container, so the whole comparison
              lived behind a sideways gesture a reader has no reason to try.

              THE TABLE RESTACKS INSTEAD OF SCROLLING. One `<table>` in the DOM,
              `display` switched per breakpoint: below `md` every row is a card
              (spec name, then the two values each under their own label), and
              from `md` up it is an ordinary three-column table. The reference
              document does the same thing.

              ⚠️ THE MOBILE COLUMN LABELS ARE REAL `<span>`s, NOT `::before`
              GENERATED CONTENT. The reference uses `content: attr(data-l)`;
              generated content is announced inconsistently and carries meaning
              that vanishes with the stylesheet. These are `md:hidden`, so
              desktop never renders them.

              ⚠️ ONE DOM, NOT TWO. The obvious alternative — a table for `md`+
              and a separate card list for mobile, one of them `hidden` — puts a
              SECOND copy of every value in the prerendered HTML. Same reason
              `.value-sizer` uses a pseudo-element rather than a ghost span.

              ⚠️ `<thead>` is `display: none` below `md`, so the browser drops
              the table roles and a screen reader reads the rows linearly. That
              is the right outcome here: a table whose column headers are hidden
              has nothing to associate cells with, and the visible per-cell
              labels say the same thing in reading order.

              No `Reveal`: tables never animate (CLAUDE.md), and this is the
              section a reader compares a figure in. */}
          <div className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white">
            <table className="w-full border-collapse text-left">
              <thead className="hidden md:table-header-group">
                <tr className="bg-ink-50">
                  <th scope="col" className={`${COL_HEAD} border-transparent`}>
                    Specification
                  </th>
                  {/* The highlighted column. A tint plus a hairline ember rule
                      along its top, not a filled ember header: a full ember bar
                      would be a second loud orange band on a page that already
                      ends with CtaBand. */}
                  <th
                    scope="col"
                    className={`${COL_HEAD} border-ember-400 bg-ember-50 text-ember-700`}
                  >
                    HYP2003
                  </th>
                  <th scope="col" className={`${COL_HEAD} border-transparent`}>
                    Typical FIPS 140-2 token
                  </th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {comparison.rows.map((row) => (
                  <tr
                    key={row.spec}
                    // `first:border-t-0` resolves correctly because these <tr>s
                    // are genuine siblings — no `Stagger` wrapper between them,
                    // which is what silently makes `first:` match every item.
                    className="block border-t border-ink-100 p-5 first:border-t-0 md:table-row md:border-t md:p-0"
                  >
                    <th
                      scope="row"
                      className="block text-h4 font-medium text-ink-600 md:table-cell md:px-5 md:py-4 md:align-top md:text-body-sm"
                    >
                      {row.spec}
                    </th>
                    <td className="mt-3 block rounded-[var(--radius-md)] border-l-2 border-ember-400 bg-ember-50 px-4 py-3 md:mt-0 md:table-cell md:rounded-none md:border-l-0 md:bg-ember-50/60 md:px-5 md:py-4 md:align-top">
                      <span className={`${CELL_LABEL} text-ember-700`}>HYP2003</span>
                      <span className="block text-body-sm font-medium text-ink-600">{row.hyp}</span>
                    </td>
                    {/* ⚠️ NO horizontal padding below `md`. The row already has `p-5`, so
                        a `px-4` here indented this value 16px past the spec name above
                        it and left the card ragged down its left edge. The ember block
                        above keeps its inset because it IS a panel. */}
                    <td className="mt-3 block py-1 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className={`${CELL_LABEL} text-ink-400`}>Typical FIPS 140-2</span>
                      <span className="block text-body-sm text-ink-500">{row.other}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-4">
            {comparison.notes.map((note) => (
              <p key={note} className="max-w-[84ch] text-body-sm text-ink-400">
                {note}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- WHO ORDERS ---------------------------------------------------- */}
      <Section surface="light-alt">
        <Container>
          <SectionHeading eyebrow={whoOrders.eyebrow} heading={whoOrders.heading} />

          <div className="mt-12 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-3">
            {whoOrders.cards.map((card, index) => (
              <Reveal key={card.key} delay={index * 0.06} className="flex flex-col">
                <h3 className="text-h4 text-ink-600">{card.title}</h3>
                <p className="mt-3 text-body text-ink-500">{card.body}</p>
                {card.link && (
                  // `mt-auto` so the action row lands on the column's floor
                  // whatever the copy length — rows landing at different
                  // heights across a set is what makes it look untended.
                  <Link
                    to={card.link.to}
                    className="group mt-auto inline-flex items-center gap-2 pt-5 text-body-sm font-medium text-ember-600 transition-colors duration-[var(--dur-fast)] hover:text-ember-700"
                  >
                    {card.link.label}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </Link>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <div className="flex flex-wrap gap-3">
              <Button
                as="a"
                href={dscEnquiryHref("HYP2003 token pricing")}
                target="_blank"
                rel="noopener noreferrer"
                variant="tertiary"
              >
                <IconBrandWhatsapp className="h-4 w-4" stroke={1.75} aria-hidden="true" />
                Ask about pricing
              </Button>
              <Button as={Link} to={dscDriversPage.path} variant="secondary">
                Driver downloads
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* --- FAQs ---------------------------------------------------------- */}
      <Section id={dscBuyTokenSectionIds.faqs} surface="light">
        <FaqSection
          eyebrow="Common questions"
          heading="Questions about tokens"
          intro="What a token is for, what happens when one locks, and what the FIPS 140-3 change actually asks of you."
          // ⛔ MAPPED, NOT PASSED THROUGH. The content convention across this
          // repo is `{ q, a }` — `faqPageJsonLd` reads exactly those keys — but
          // `Accordion` reads `{ question, answer }`. Passing the raw array
          // renders the right NUMBER of rows with NO TEXT IN THEM: ten empty
          // bars, no error, no warning, and the JSON-LD still correct. Caught
          // by Clinton, not by a probe that counted rows without reading them.
          // `DscFaqs` already does this same map — do not "simplify" it away.
          items={faqs.map((faq, index) => ({
            id: index,
            question: faq.q,
            answer: faq.a,
          }))}
        />

        {/* Provenance, rendered rather than kept in a comment: a specification
            page that does not say where its numbers came from is asking to be
            taken on trust. */}
        <Container>
          <p className="mt-12 max-w-[84ch] text-body-sm text-ink-400">
            {sourceNote} Last reviewed: {lastReviewed}.
          </p>
        </Container>
      </Section>

      <CtaBand
        heading="Ordering more than a handful?"
        lede="Tell us how many and who they are for. Bulk orders are quoted together and dispatched together, rather than one at a time."
      />
    </>
  );
}

function PageLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 rounded-sm text-body-sm font-medium text-ember-600 transition-colors hover:text-ember-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
    >
      {label}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
