import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { SubNav } from "@/components/layout/SubNav";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductShot } from "@/components/ui/ProductShot";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import {
  dscDriverSectionIds,
  dscDriversPage,
  dscBuyTokenPage,
} from "@/content/nav";
import { drivers, driversPage, hyp2003Downloads } from "@/content/dsc/drivers";
import { collectionPageJsonLd, howToJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/cn";
import heroPicture from "@/assets/drivers/drivers-hero.jpg?w=768;1280;1920&format=avif;webp;jpg&as=picture";

// /dsc/drivers — HYP2003 DRIVERS, UTILITIES AND SETUP HELP.
//
// ⛔ REBUILT 31-10-2026 (Clinton): "i want to create it same like official
// website — https://taxpro.co.in/hyp2003-drivers". It follows that page's
// STRUCTURE — about the token with its NIST certificate, a driver matrix with
// FIPS 140-3 and FIPS 140-2 columns per operating system, then a utilities
// table — in this site's own visual language. What was and was not taken from
// it (prose, images, the signer.digital section) is recorded at
// `hyp2003Downloads` in content/dsc/drivers.js.
//
// ⚠️ It replaces the old one-row disclosure list. The install steps and
// troubleshooting it held were KEPT — the reference has none, and they are what
// a stuck reader actually needs — and now sit in their own "Setup help"
// section.
//
// Cadence: deep → light → light-alt → light → light-alt → ember. Zero repeats,
// and no two dark-family surfaces adjacent (the hero is the only dark one
// before CtaBand, and a light-alt section separates them).
//
// ⚠️ NO `Reveal` ON EITHER TABLE. Tables never animate (CLAUDE.md), and this is
// the page someone opens at 9pm because their token stopped working.

const COL_HEAD =
  "border-t-2 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400";
// Mobile-only per-cell label — the desktop table has real column headers.
const CELL_LABEL =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] md:hidden";

// ⛔ EVERY FILE HERE IS CROSS-ORIGIN, so none of these links carries the
// `download` attribute — browsers silently ignore it off-origin, and a button
// that says "Download" and then navigates is a lie. `_blank` because the
// target is a raw file on another host, and replacing this page with it would
// strand the reader.
const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" };

export default function DscDrivers({ path = dscDriversPage.path }) {
  const { certificate, columns, drivers: driverRows, utilities } = hyp2003Downloads;
  // The install steps and troubleshooting are the HYP2003 entry's own, from the
  // same `drivers` array the rest of the site reads — nothing restated.
  const hyp = drivers.find((d) => d.slug === "hyp2003");
  const windows = driverRows.find((row) => row.platform === "Windows");

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: dscDriversPage.label,
            description: driversPage.meta.description,
            path,
          }),
          // Schema sits where the steps render — the Setup help section below.
          hyp?.installSteps.length > 0
            ? howToJsonLd({
                name: "Installing the HYP2003 token driver",
                description: driversPage.meta.description,
                steps: hyp.installSteps,
                path,
              })
            : null,
        ].filter(Boolean)}
      />

      <PageHero
        path={path}
        eyebrow="Digital Signatures"
        h1={driversPage.h1}
        lede={driversPage.lede}
        // ⛔ 31-10-2026 (Clinton): "in header bg use image". A licensed
        // Unsplash photo (src/assets/drivers/ATTRIBUTION.txt) — a GENERIC USB
        // stick in a laptop, NOT the HYP2003, so it is atmosphere under
        // PageHero's scrim. The real token photo moved to the About section.
        // No `texture`: a motif over a photograph is two backdrops at once.
        background={{ picture: heroPicture, alt: "" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {windows?.fips1403 && (
            <Button as="a" href={windows.fips1403} {...EXTERNAL} variant="primary">
              <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Windows driver (FIPS 140-3)
            </Button>
          )}
          {/* A plain fragment link: same page, so a react-router <Link> would
              not scroll (RootLayout's scroll effect keys on pathname). */}
          <Button
            as="a"
            href={`#${dscDriverSectionIds.drivers}`}
            variant="secondary"
            tone="dark"
          >
            All drivers
          </Button>
        </div>
      </PageHero>

      <SubNav
        sections={[
          { id: dscDriverSectionIds.about, label: "About the token" },
          { id: dscDriverSectionIds.drivers, label: "Drivers" },
          { id: dscDriverSectionIds.utilities, label: "Utilities" },
          ...(hyp?.installSteps.length > 0
            ? [{ id: dscDriverSectionIds.setup, label: "Setup help" }]
            : []),
        ]}
      />

      {/* ---- About the token + its NIST certificate ------------------------ */}
      <Section id={dscDriverSectionIds.about} surface="light">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="HYP2003 (ePass) token"
                heading="One token, its drivers, and the tools around it"
              />
              <Reveal className="mt-6 space-y-4">
                {hyp2003Downloads.about.map((para) => (
                  <p key={para} className="max-w-[68ch] text-body text-ink-500">
                    {para}
                  </p>
                ))}
              </Reveal>

              {/* The NIST certificate, compacted to one hairline-framed row now
                  that the right column carries the token photo (31-10-2026).
                  It is the one claim here a reader can check independently,
                  so the link goes to nist.gov itself, never a reseller's copy. */}
              <Reveal delay={0.08} className="mt-8 max-w-[68ch]">
                <div className="flex flex-col gap-4 border-y border-ink-100 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <BadgeCheck
                      className="h-8 w-8 shrink-0 text-ember-600"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-body font-medium text-ink-600">
                        NIST CMVP certificate #{certificate.number}
                      </p>
                      <p className="mt-0.5 text-body-sm text-ink-500">
                        {certificate.standard} · {certificate.level} · {certificate.status}
                      </p>
                    </div>
                  </div>
                  <a
                    href={certificate.url}
                    {...EXTERNAL}
                    className="inline-flex shrink-0 items-center gap-2 rounded-sm text-body-sm font-medium text-ember-700 transition-colors hover:text-ember-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
                  >
                    View on nist.gov
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* ⛔ 31-10-2026 (Clinton): "in right side show pendrive". Our own
                token photograph, on ProductShot's plinth — a transparent PNG of
                dark hardware floats with no ground on a light section without
                it. `ratio` is the file's real pixel size, or object-cover crops
                the product. */}
            <Reveal delay={0.12} className="lg:col-span-5">
              <ProductShot
                src="/images/drivers/dsc-card.png"
                alt="The HYP2003 USB crypto token"
                width={1143}
                height={370}
                caption={`HYP2003 · ${certificate.standard} ${certificate.level}`}
                gradientId="drivers-shot"
                className="px-6 py-10 md:px-10 md:py-14"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---- Driver matrix ------------------------------------------------- */}
      <Section id={dscDriverSectionIds.drivers} surface="light-alt">
        <Container>
          <SectionHeading
            eyebrow="Drivers"
            heading="Token drivers"
            lede={hyp2003Downloads.columnNote}
          />
          {/* RESTACKS INSTEAD OF SCROLLING, same pattern as Buy Token's
              comparison table: one <table> in the DOM, each row a card below
              `md` with a real (md:hidden) label per cell. No horizontal scroll
              anywhere at 375px. */}
          <div className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white">
            <table className="w-full border-collapse text-left">
              <thead className="hidden md:table-header-group">
                <tr className="bg-ink-50">
                  <th scope="col" className={`${COL_HEAD} border-transparent`}>
                    Operating system
                  </th>
                  {columns.map((col) => (
                    // Every header carries the 2px top border (transparent when
                    // not highlighted) so all three labels sit on one baseline.
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        COL_HEAD,
                        col.highlight
                          ? "border-ember-400 bg-ember-50 text-ember-700"
                          : "border-transparent",
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {driverRows.map((row) => (
                  <tr
                    key={row.platform}
                    className="block border-t border-ink-100 p-5 first:border-t-0 md:table-row md:border-t md:p-0"
                  >
                    <th
                      scope="row"
                      className="block md:table-cell md:px-5 md:py-4 md:align-middle"
                    >
                      <span className="block text-h4 font-medium text-ink-600 md:text-body">
                        {row.platform}
                      </span>
                      {row.detail && (
                        <span className="mt-0.5 block text-body-sm font-normal text-ink-400">
                          {row.detail}
                        </span>
                      )}
                    </th>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "mt-4 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-middle",
                          col.highlight && "md:bg-ember-50/60",
                        )}
                      >
                        <span
                          className={cn(
                            CELL_LABEL,
                            col.highlight ? "text-ember-700" : "text-ink-400",
                          )}
                        >
                          {col.label}
                        </span>
                        <FileLink
                          url={row[col.key]}
                          name={`${row.platform} ${col.label}`}
                          primary={col.highlight}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-[84ch] text-body-sm text-ink-400">
            {hyp2003Downloads.source}
          </p>
        </Container>
      </Section>

      {/* ---- Utilities ----------------------------------------------------- */}
      <Section id={dscDriverSectionIds.utilities} surface="light">
        <Container>
          <SectionHeading
            eyebrow="Utilities"
            heading="Tools for the token"
            lede="Updaters, format tools, the Windows runtime the driver depends on, and the developer SDKs."
          />
          {/* ⛔ THE CAUTION RENDERS ABOVE THE TABLE, so anyone reaching a format
              tool's download link has passed it on the way. The two format rows
              also carry their own inline flag. */}
          <p className="mt-8 flex max-w-[84ch] gap-3 rounded-[var(--radius-md)] border-l-2 border-ember-400 bg-ember-50 px-5 py-4 text-body-sm leading-relaxed text-ink-600">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-ember-600"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>{hyp2003Downloads.destructiveWarning}</span>
          </p>
          <ul className="mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-ink-100 bg-white">
            {utilities.map((tool) => (
              <li
                key={tool.label}
                className="flex flex-col gap-4 border-t border-ink-100 p-5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body font-medium text-ink-600">
                    {tool.label}
                    {tool.destructive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ember-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ember-700">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Erases the token
                      </span>
                    )}
                  </p>
                  <p className="mt-1 max-w-[70ch] text-body-sm text-ink-500">
                    {tool.desc}
                  </p>
                </div>
                <FileLink url={tool.url} name={tool.label} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---- Setup help (kept from the old page) --------------------------- */}
      {hyp?.installSteps.length > 0 && (
        <Section id={dscDriverSectionIds.setup} surface="light-alt">
          <Container>
            <SectionHeading
              eyebrow="Setup help"
              heading="Installing it, and when it will not work"
            />
            <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-h4 font-medium text-ink-600">Installation</h3>
                <ol className="mt-5 space-y-5">
                  {hyp.installSteps.map((step) => (
                    <li key={step.step} className="flex gap-4 border-t border-ink-100 pt-5 first:border-t-0 first:pt-0">
                      <span className="shrink-0 font-mono text-body-sm tabular-nums text-ember-600">
                        {String(step.step).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-body font-medium text-ink-600">
                          {step.title}
                        </span>
                        <span className="mt-1 block text-body-sm text-ink-500">
                          {step.desc}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              {hyp.troubleshooting.length > 0 && (
                <div>
                  <h3 className="text-h4 font-medium text-ink-600">
                    If something goes wrong
                  </h3>
                  <dl className="mt-5 space-y-5">
                    {hyp.troubleshooting.map((item) => (
                      <div
                        key={item.issue}
                        className="border-t border-ink-100 pt-5 first:border-t-0 first:pt-0"
                      >
                        <dt className="text-body font-medium text-ink-600">{item.issue}</dt>
                        <dd className="mt-1 max-w-[68ch] text-body-sm text-ink-500">
                          {item.fix}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6">
              <p className="max-w-[62ch] text-body text-ink-500">
                Need the token itself rather than the software? It is ordered on
                its own page.
              </p>
              <Link
                to={dscBuyTokenPage.path}
                className="group inline-flex items-center gap-2 rounded-sm text-body font-medium text-ember-600 transition-colors hover:text-ember-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
              >
                {dscBuyTokenPage.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        heading="Token not being detected? Send us a screenshot."
        lede="Driver problems are the single most common thing we are called about, and most of them are fixed in minutes. Tell us your operating system and what the portal is saying."
      />
    </>
  );
}

/**
 * One file link. Visible text is "Download"; the accessible name carries what
 * is being downloaded, because a column of identical "Download" links is the
 * vague-link-text failure axe flags. A null url renders an explicit
 * "Not available", never an empty cell.
 */
function FileLink({ url, name, primary = false }) {
  if (!url) {
    return (
      <span className="inline-flex items-center text-body-sm text-ink-400">
        <span aria-hidden="true">—</span>
        <span className="ml-2">Not available</span>
      </span>
    );
  }
  return (
    <a
      href={url}
      {...EXTERNAL}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-body-sm font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2",
        primary
          ? "bg-ember-400 text-ink-950 hover:bg-ember-500"
          : "border border-ink-200 text-ink-600 hover:border-ember-400 hover:text-ember-700",
      )}
    >
      <Download
        className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover:translate-y-0.5"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      Download<span className="sr-only"> {name}</span>
    </a>
  );
}
