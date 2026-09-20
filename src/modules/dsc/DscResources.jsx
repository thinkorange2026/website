import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Download,
  FileText,
  HeartHandshake,
  Landmark,
  MapPin,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import {
  dscAddressProofOptions,
  dscDocumentMatrixContent,
  dscOrganisationTypes,
} from "@/content/dsc/document-matrix";
import { Disclosure } from "@/components/ui/Disclosure";
import { collectionPageJsonLd } from "@/lib/jsonld";
import { formatArticleDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";
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
const ROW_CLASS =
  "group flex flex-col gap-4 rounded-sm py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between";

function ResourceBody({ resource }) {
  // ⚠️ The meta line renders only when it has something in it. An empty `<p>`
  // still occupies a line box, so a row with no format/size/version would sit
  // a line lower than its neighbours — the "heading over nothing" defect class
  // `DriverPanel` had to be fixed for.
  const meta = [
    resource.format,
    resource.version ? `Version ${resource.version}` : null,
    resource.size,
    resource.updated ? `Updated ${formatArticleDate(resource.updated)}` : null,
    resource.host,
  ].filter(Boolean);

  const isLink = resource.kind === "link";
  const ActionIcon = isLink ? ArrowRight : Download;

  return (
    <>
      <div className="max-w-[62ch]">
        <p className="text-body font-medium text-ink-600 transition-colors group-hover:text-ember-600">
          {resource.title}
        </p>
        <p className="mt-1 text-body-sm text-ink-500">{resource.description}</p>
        {meta.length > 0 ? (
          <p className="mt-2 text-body-sm text-ink-400">{meta.join(" · ")}</p>
        ) : null}
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-body-sm font-medium text-ember-600">
        <ActionIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {resource.action}
      </span>
    </>
  );
}

// ⚠️ THREE ROW SHAPES, AND THE DIFFERENCES ARE NOT COSMETIC:
//  - An internal destination is a react-router `<Link>`, never `<a download>` —
//    that would hand the browser an HTML page to save. It also has to be a Link
//    rather than a plain `<a>` so it navigates in-app like every other internal
//    link on the site.
//  - A file we do NOT host drops the `download` attribute: browsers ignore it
//    cross-origin, so keeping it would claim behaviour the link does not have.
//    `rel="noopener noreferrer"` goes on instead.
//  - A file we host keeps `download`.
function ResourceRow({ resource }) {
  if (resource.kind === "link") {
    return (
      <Link to={resource.url} className={ROW_CLASS}>
        <ResourceBody resource={resource} />
      </Link>
    );
  }

  if (resource.external) {
    return (
      <a
        href={resource.url}
        rel="noopener noreferrer"
        className={ROW_CLASS}
      >
        <ResourceBody resource={resource} />
      </a>
    );
  }

  return (
    <a href={resource.url} download className={ROW_CLASS}>
      <ResourceBody resource={resource} />
    </a>
  );
}

function ResourceList() {
  return (
    <Reveal className="mt-10">
      <ul>
        {dscResources.map((resource) => (
          <li key={resource.id} className="border-t border-ink-200">
            <ResourceRow resource={resource} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

// ── Document matrix ────────────────────────────────────────────────────────
//
// 20-09-2026 (Clinton): "show some details and + on right side while click
// expand and show the whole details… keep the design like the tools and driver
// download." So this reuses `Disclosure` — the same open-one-at-a-time row with
// the `+` that rotates to a `×` that /dsc/drivers and /dsc already use — rather
// than a second expand treatment for the same gesture.
//
// ⚠️ ICONS ARE RESOLVED THROUGH A MAP WITH A FALLBACK, never by indexing it. An
// unmapped key evaluates to `<undefined />`, which is a hard React crash rather
// than a missing glyph — that bug has shipped from a slug-keyed icon map here
// once already (DscBand, 17-08-2026).
const TYPE_ICONS = {
  individual: User,
  partnership: Users,
  corporate: Building2,
  association: UsersRound,
  llp: Briefcase,
  "ngo-trust": HeartHandshake,
  banking: Banknote,
  government: Landmark,
};

function typeIcon(key) {
  return TYPE_ICONS[key] ?? FileText;
}

// One labelled block per group. `when` renders only when a requirement is
// conditional, so a plain list and an if/else read as the same structure
// without an empty label above the plain one.
function DocumentGroups({ groups, empty }) {
  if (!groups) {
    return <p className="text-body-sm text-ink-500">{empty}</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.when ?? "only"}>
          {group.when ? (
            <p className="font-mono text-body-sm uppercase tracking-[0.08em] text-ink-400">
              {group.when}
            </p>
          ) : null}
          <ul className={cn("space-y-2", group.when && "mt-2")}>
            {group.items.map((item) => (
              <li key={item} className="flex gap-3 text-body-sm text-ink-500">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ⚠️ THE THREE COLUMNS ARE THE POINT. A certifying authority checks the
// organisation, the signatory and the applicant separately, and rolling them
// into one list is what makes a reader send the wrong paperwork. Each column
// keeps its heading even when the answer is "not required", so nothing reads as
// a block that failed to load.
function TypePanel({ type }) {
  const columns = [
    { label: "Organisation", groups: type.organisation, empty: "No organisation documents are asked for." },
    { label: "Authorised signatory", groups: type.signatory, empty: "Nothing separate is asked for." },
    { label: "Applicant", groups: type.applicant, empty: "Nothing separate — the signatory is the applicant." },
  ];

  return (
    <div className="grid gap-8 pb-8 md:grid-cols-3 md:gap-10">
      {columns.map((column) => (
        <div key={column.label}>
          <h4 className="text-h4 text-ink-600">{column.label}</h4>
          <div className="mt-4">
            <DocumentGroups groups={column.groups} empty={column.empty} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Shared across every type, so it is one row rather than the same twelve lines
// repeated eight times.
function AddressProofPanel() {
  return (
    <div className="pb-8">
      <p className="max-w-[68ch] text-body-sm text-ink-500">
        Any one of these, in the applicant&rsquo;s name. Aadhaar covers it on its own where the
        eKYC route is used.
      </p>
      <ul className="mt-5 grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {dscAddressProofOptions.map((option) => (
          <li key={option} className="flex gap-3 text-body-sm text-ink-500">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
            <span>{option}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocumentMatrix() {
  return (
    <>
      <SectionHeading
        eyebrow={dscDocumentMatrixContent.eyebrow}
        heading={dscDocumentMatrixContent.heading}
        lede={dscDocumentMatrixContent.lede}
      />
      {/* ⚠️ `Disclosure` keeps every panel MOUNTED while collapsed, which is
          what puts all eight types in the prerendered HTML. It also means a
          link inside a panel would stay in the tab order — there are none
          here, and there must not be. */}
      <Disclosure
        items={[
          ...dscOrganisationTypes.map((type) => ({
            key: type.key,
            anchorId: `documents-${type.key}`,
            label: type.label,
            meta: type.meta,
            icon: typeIcon(type.key),
            panel: <TypePanel type={type} />,
          })),
          {
            key: "address-proof",
            anchorId: "documents-address-proof",
            label: "Address proof",
            meta: "Accepted for every organisation type",
            icon: MapPin,
            panel: <AddressProofPanel />,
          },
        ]}
      />
      <Reveal className="mt-8">
        <p className="max-w-[68ch] text-body-sm text-ink-400">
          {dscDocumentMatrixContent.note}
        </p>
      </Reveal>
    </>
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
            heading="Utilities, drivers and reference documents"
            lede="The tools a certificate needs on the machine it is downloaded to, and the documents we hand clients during an application."
          />
          {hasResources ? <ResourceList /> : <EmptyState />}
        </Container>
      </Section>

      <Section surface="light-alt">
        <Container>
          <DocumentMatrix />
        </Container>
      </Section>

      <CtaBand
        heading="Cannot find the document you need?"
        lede="Tell us which form or checklist you are after and what it is for, and we will send it across — or tell you which portal issues it."
      />
    </>
  );
}
