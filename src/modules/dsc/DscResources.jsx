import { Download, FileText } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArcRings } from "@/components/ui/ArcRings";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import { dscResourcesPage } from "@/content/nav";
import { dscResources, dscResourcesContent } from "@/content/dsc/resources";
import { collectionPageJsonLd } from "@/lib/jsonld";
import { formatArticleDate } from "@/lib/formatDate";
import { dscEnquiryHref } from "@/lib/whatsapp";

// /dsc/resources — the DSC file library.
//
// ⛔ 07-09-2026 (Clinton): "i want to create a new page call Resources in dsc
// category… in this i will upload fields relatied to dsc. for now it will
// shown as empty state."
//
// ⚠️ IT SHIPS EMPTY, AND THE EMPTY STATE IS THE POINT. `dscResources` is `[]`
// (content/dsc/resources.js), so `EmptyState` renders and the list does not.
// Nothing is faked to fill the page — a placeholder resource card would offer
// a download that 404s, which is worse than an honest blank. Push files into
// that array and this page becomes the list with no change here.
//
// ⚠️ ITS OWN TEMPLATE, T15. T5/T12/T13 each resolve UNCONDITIONALLY to one
// component in `routeComponents.js`, so reusing one would have served the wrong
// page under this URL, in the bundle AND the prerendered HTML, silently.
//
// ⚠️ NO `SubNav`: one section. `SubNav` guards on `sections.length < 2` and
// would render nothing anyway, but a bar is not withheld by accident here.
//
// Surface cadence: deep (hero) → light → ember (CtaBand). No adjacent
// dark-family pair, which a check comparing adjacent TOKENS would miss.

// Quieter than CtaBand's 0.07/0.12/0.045, which stays the site's one loud band.
const PANEL_RINGS = [
  { r: 150, width: 1, opacity: 0.16 },
  { r: 108, width: 1, opacity: 0.1 },
];

// ⚠️ `data-surface="dark"` is LOAD-BEARING, not decoration: a dark panel nested
// in a light section. Without it every descendant reading
// `var(--surface-accent)` / `var(--surface-border)` gets the LIGHT values, and
// `[data-surface="dark"] h3` never supplies the canvas heading colour. That
// trap is recorded six times over in CLAUDE.md.
function EmptyState() {
  return (
    <Reveal
      data-surface="dark"
      className="panel-dark grain relative mt-10 overflow-hidden rounded-[var(--radius-lg)] p-8 md:p-12"
    >
      <ArcRings
        rings={PANEL_RINGS}
        color="var(--color-ink-600)"
        gradientId="dsc-resources-empty-arc"
        svgClassName="-right-24 -top-28 h-[340px] w-[340px]"
      />
      <div className="relative max-w-[62ch]">
        <FileText
          className="h-6 w-6 text-ember-300"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h3 className="mt-4 text-h4 text-canvas">{dscResourcesContent.empty.heading}</h3>
        <p className="mt-2 text-body text-ink-100">{dscResourcesContent.empty.message}</p>
        <div className="mt-6">
          <Button
            as="a"
            href={dscEnquiryHref("a DSC form or checklist")}
            target="_blank"
            rel="noopener noreferrer"
            variant="tertiary"
          >
            <IconBrandWhatsapp className="h-4 w-4" aria-hidden="true" />
            Ask us for a document
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

// Hairline rows rather than a card grid: a file library is one list, and a
// three-across grid of near-identical cards is the archetype DESIGN.md §16's
// tell 7 is about. The rule sits on TOP of each row, so a list of any length
// terminates cleanly instead of leaving a hairline dangling under the last one.
//
// ⚠️ ONE `Reveal` around the whole list, never one per row — a dozen lines
// resolving one by one while a reader is scanning for a file is exactly what
// "body copy never animates" protects against.
function ResourceList() {
  return (
    <Reveal className="mt-10">
      <ul>
        {dscResources.map((resource) => (
          <li key={resource.id} className="border-t border-ink-200">
            <a
              href={resource.url}
              download
              className="group flex flex-col gap-4 rounded-sm py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="max-w-[62ch]">
                <p className="text-body font-medium text-ink-600 transition-colors group-hover:text-ember-600">
                  {resource.title}
                </p>
                <p className="mt-1 text-body-sm text-ink-500">{resource.description}</p>
                {/* ⚠️ `size` and `updated` render only when present. An unknown
                    file size is left off rather than guessed — both are
                    checkable claims a reader may act on. */}
                <p className="mt-2 text-body-sm text-ink-400">
                  {[
                    resource.format,
                    resource.size,
                    resource.updated ? `Updated ${formatArticleDate(resource.updated)}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 text-body-sm font-medium text-ember-600">
                <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Download
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function DscResources({ path = dscResourcesPage.path }) {
  const hasResources = dscResources.length > 0;

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: dscResourcesPage.label,
          description: dscResourcesContent.meta.description,
          path,
        })}
      />

      <PageHero
        path={path}
        eyebrow="Digital Signatures"
        h1="DSC Resources"
        lede={dscResourcesContent.heroLede}
        texture="blueprint"
        textureId="dsc-resources-hero"
      />

      <Section surface="light">
        <Container>
          <SectionHeading
            eyebrow="Downloads"
            heading="Forms, checklists and reference documents"
            lede="Everything we hand clients during a DSC application, in the form we actually send it."
          />
          {hasResources ? <ResourceList /> : <EmptyState />}
        </Container>
      </Section>

      <CtaBand
        heading="Cannot find the document you need?"
        lede="Tell us which form or checklist you are after and what it is for, and we will send it across — or tell you which portal issues it."
      />
    </>
  );
}
