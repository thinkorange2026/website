import { Link } from "react-router-dom";
import { ArrowRight, Cpu, Info, ShieldCheck } from "lucide-react";
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
  dscHyp2003Page,
  dscHyp2003SectionIds,
  dscDriversPage,
  dscResourcesPage,
} from "@/content/nav";
import { hyp2003Page } from "@/content/dsc/hyp2003";
import { faqPageJsonLd, productJsonLd } from "@/lib/jsonld";
import { dscEnquiryHref } from "@/lib/whatsapp";

// /dsc/about-hyp2003 — THE TOKEN'S OWN PAGE.
//
// Added 05-09-2026 (Clinton): "i want to create new page call - About HYP2003
// keep in the token & driver section. keep the layout same as it is mention in
// html." Source layout: `thinkorange-token-page.html`, reproduced section for
// section — hero + certification strip, notice bar, why this token, full
// specification, what changes, comparison table, who orders, FAQs, CTA.
//
// ⛔ ITS OWN TEMPLATE (T14), NOT A T5/T12 BRANCH. T5 resolves UNCONDITIONALLY
// to `DscBuyToken` and T12 to `DscDrivers` — marking this page either would
// have served the wrong page under this URL, in the client bundle AND the
// prerendered HTML, with nothing failing and nothing logging. Same trap T11,
// T12 and T13 each record.
//
// ⚠️ WHAT WAS NOT CARRIED OVER from the reference document is listed in
// `content/dsc/hyp2003.js`'s header: the "[Exclusive / Authorised] distributor
// — [territory]" hero badge, the same-working-day stock promise, "distributor
// pricing" as a price claim, and its two dev notes naming a certifying
// authority. Read that header before adding anything back from the HTML.
//
// ⚠️ THE DEADLINE DATE IS NEVER TYPED HERE. It interpolates
// `statutory.js`'s `fips1403DscIssuance`, whose own note records that the CCA
// circular behind it was not located — which is why every sentence about it is
// worded as an expectation.

// Quieter than CtaBand's 0.07/0.12/0.045, which stays the site's one loud band.
const SPEC_ICONS = {
  Hardware: Cpu,
  "Security and compatibility": ShieldCheck,
};

export default function DscHyp2003({ path = dscHyp2003Page.path }) {
  const {
    h1,
    heroLede,
    heroSpec,
    notice,
    whyThisToken,
    specs,
    deadline,
    comparison,
    whoOrders,
    faqs,
    sourceNote,
    lastReviewed,
    meta,
  } = hyp2003Page;

  return (
    <>
      <JsonLd
        data={[
          productJsonLd({
            name: "HyperPKI HYP2003 USB Token",
            description: meta.description,
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
        h1={h1}
        lede={heroLede}
        texture="blueprint"
        textureId="hyp2003-hero"
        spec={heroSpec}
        cta={{ to: dscResourcesPage.path, label: "Order tokens" }}
        aside={
          // The real product photograph, where the reference document had a
          // "[HYP2003 product photograph]" placeholder box. `ProductShot`
          // exists for exactly this: a transparent PNG of dark hardware needs a
          // plinth and a key light, or it floats with no ground.
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
      />

      {/* ⛔ THE NOTICE BAR, directly under the hero — Clinton's instruction
          names this placement specifically. It is a plain strip, not a
          <section>: no heading, no landmark, so it stays out of the
          surface-cadence count while still supplying the fold between the
          `deep` hero and the `light` section below it. */}
      <NoticeBar label={notice.label} text={notice.text} />

      <SubNav
        sections={[
          { id: dscHyp2003SectionIds.why, label: "Why this token" },
          { id: dscHyp2003SectionIds.specs, label: "Specifications" },
          { id: dscHyp2003SectionIds.change, label: "FIPS 140-3 change" },
          { id: dscHyp2003SectionIds.compare, label: "Compare" },
          { id: dscHyp2003SectionIds.faqs, label: "FAQs" },
        ]}
      />

      {/* --- WHY THIS TOKEN ------------------------------------------------ */}
      <Section id={dscHyp2003SectionIds.why} surface="light">
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
      <Section id={dscHyp2003SectionIds.specs} surface="light-alt">
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
      <Section id={dscHyp2003SectionIds.change} surface="dark" className="surface-ambient">
        <Container>
          <SectionHeading
            dark
            eyebrow={deadline.eyebrow}
            heading={deadline.heading}
          />

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
      <Section id={dscHyp2003SectionIds.compare} surface="light">
        <Container>
          <SectionHeading
            eyebrow={comparison.eyebrow}
            heading={comparison.heading}
            lede={comparison.lede}
          />

          {/* No `Reveal` on the table: tables never animate (CLAUDE.md), and
              this is the section a reader compares a figure in. The wrapper
              scrolls, the page does not — same `overflow-x-auto` +
              `min-w-[640px]` pair the eSign and driver tables use. */}
          <div className="mt-12 overflow-x-auto rounded-[var(--radius-lg)] border border-ink-100">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-ink-50">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-body-sm font-medium text-ink-600">
                    Specification
                  </th>
                  {/* The highlighted column. A tint, not a filled ember header:
                      a full ember bar here would be a second loud orange band
                      on a page that already ends with CtaBand. */}
                  <th scope="col" className="bg-ember-50 px-5 py-3.5 text-body-sm font-medium text-ink-600">
                    HYP2003
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-body-sm font-medium text-ink-600">
                    Typical FIPS 140-2 token
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.spec} className="border-t border-ink-100">
                    <th
                      scope="row"
                      className="px-5 py-4 text-body-sm font-medium text-ink-600"
                    >
                      {row.spec}
                    </th>
                    <td className="bg-ember-50/50 px-5 py-4 text-body-sm font-medium text-ink-600">
                      {row.hyp}
                    </td>
                    <td className="px-5 py-4 text-body-sm text-ink-500">{row.other}</td>
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
      <Section id={dscHyp2003SectionIds.faqs} surface="light">
        <FaqSection
          eyebrow="Common questions"
          heading="Questions about tokens"
          intro="What a token is for, what happens when one locks, and what the FIPS 140-3 change actually asks of you."
          // ⛔ MAPPED, NOT PASSED THROUGH. The content convention across this
          // repo is `{ q, a }` — `faqPageJsonLd` reads exactly those keys — but
          // `Accordion` reads `{ question, answer }`. Passing the raw array
          // renders the right NUMBER of rows with NO TEXT IN THEM: ten empty
          // bars, no error, no warning, and the JSON-LD still correct. Caught
          // by Clinton, not by my own probe, which counted
          // `h3 > button[aria-expanded]` and never read what was inside them.
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
        heading="Order tokens or ask about volume"
        lede="Tell us the quantity, and whether certificates are needed with them. We will come back with current rates and availability."
      />
    </>
  );
}
