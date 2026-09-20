import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { Img } from "@/components/ui/Img";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/jsonld";
import { formatArticleDate } from "@/lib/formatDate";
import { site } from "@/content/nav";
import { noticesFor } from "@/content/notices/index.js";
import { getNoticeDetail } from "@/content/notices/details.js";

// T18 — /notices/:slug. Added 20-09-2026 (Clinton): "in details page show the
// details that mention in pdf. keeps the wording same do not change a single
// word."
//
// ONE component for every notice that carries a body, driven entirely by
// content: no per-slug branching, the same discipline T2/T10/T16 keep. The
// blocks are an ORDERED list in details.js, so reading order is the content's
// decision rather than this file's — which is what lets the callout sit
// between two headings without a special case here.
//
// ⛔ THIS TEMPLATE ADDS NO WORDS TO THE PAGE. Every rendered string comes from
// ./../../content/notices/details.js (the supplied draft, verbatim) or from the
// notice entry in notices/index.js. The only text this file owns is the "Back
// to all notices" control and the fallback below, neither of which is part of
// the notice.
//
// ⚠️ SURFACE CADENCE: deep → light → ember. PageHero is `deep`, the body is
// `light`, CtaBand is `ember` — no consecutive repeat and no adjacent
// dark-family pair. Adding a section here means re-checking that.
export default function NoticeDetail({ path }) {
  const slug = path.replace("/notices/", "");
  const notice = noticesFor("all").find((entry) => entry.detail === slug);
  const detail = notice ? getNoticeDetail(slug) : undefined;

  // A route derived from a notice whose body is missing is a content bug, not a
  // user-facing state — but it must not blank the page. Falls back to the same
  // honest shape PendingLeaf / PendingArticle / PendingLegal already use.
  if (!notice || !detail) return <PendingNotice path={path} title={notice?.title} />;

  return (
    <>
      {/* BlogPosting only — NOT a BreadcrumbList as well. `Breadcrumbs.jsx`,
          rendered inside PageHero, already emits one from the same trail, so
          adding a second here is a duplicate. That shipped once on the article
          template and was only caught by counting ld+json @types on the live
          page. */}
      <JsonLd
        data={articleJsonLd({
          headline: notice.title,
          description: notice.meta.description,
          path,
          datePublished: detail.published,
        })}
      />

      {/* PageHero, i.e. the standard compact DARK hero, rather than the article
          template's light editorial header. Two reasons: this page opens under
          the fixed transparent header like ~40 others, so it needs no
          `lightTop` variant in nav.js and no header change; and a notice is an
          alert rather than an essay, so the dark bar reads as the right
          register for it. The `h1` is the draft's own headline in full. */}
      <PageHero
        path={path}
        eyebrow={detail.eyebrow}
        h1={notice.title}
        lede={detail.lede}
        ringsId={`notice-${slug}-hero-rings`}
      />

      <Section surface="light">
        <Container>
          {/* The advisory graphic. NOT wrapped in a Reveal and marked
              `priority`: on this page it is the LCP element, so an opacity-0
              start would gate the largest paint behind hydration. Same call
              the article template's header photograph makes.

              ⚠️ `ratio` is the file's REAL pixel ratio. <Img>'s inner img is
              object-cover, which only equals contain — i.e. only leaves the
              graphic uncropped — while the box matches the file's own aspect.
              A "nicer" design ratio silently crops the artwork, and this one
              carries text. */}
          {detail.image && (
            <Img
              src={detail.image.src}
              width={detail.image.width}
              height={detail.image.height}
              alt={detail.image.alt}
              ratio={`${detail.image.width} / ${detail.image.height}`}
              priority
              className="w-full rounded-[var(--radius-lg)] border border-ink-100"
            />
          )}

          {/* ⚠️ TWO COLUMNS, and the rail is not decoration. The measure is
              capped at ~68ch because the point of an 1800px container is
              generous gutters rather than a 140-character line of body copy —
              but a lone 68ch column leaves the right half of the container
              empty, which is the "empty half" fault FaqSection, StepFlow and
              the /contact rebuild each exist to fix. The article template
              answers it the same way, with the same sticky offset. */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-12">
            <article className="max-w-[68ch] lg:col-span-8">
              {detail.published && (
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
                  {/* ink-400, not ink-300: ink-300 measures ~3.4:1 for small text
                    on a light surface, under the 4.5:1 floor. */}
                  Published {formatArticleDate(detail.published)}
                </p>
              )}

              {detail.blocks.map((block, index) => (
                <Block key={index} block={block} first={index === 0} />
              ))}

              {/* The one control this template owns. Not `navigate(-1)`: a reader
                arriving from a shared link or a search result has no history to
                go back to, and browser-back would take them off the site. */}
              <Link
                to="/notices"
                className="mt-14 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-sm font-medium text-ember-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all notices
              </Link>
            </article>

            {/* ⚠️ SITE CHROME, NOT NOTICE COPY — which is why writing it does
                not break "do not change a single word". Both strings are lifted
                verbatim from the article template's own rail rather than
                drafted here, so the two adjacent long-form templates offer the
                reader the same escape hatch in the same words.

                `lg:top-32` is the offset the article's rail and T2's enquiry
                card already use: the fixed header plus its clearance, so
                neither overlaps it. */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Card surface="light" interactive={false}>
                  <h2 className="text-h4 text-ink-600">Rather just ask?</h2>
                  <p className="mt-2 text-body-sm text-ink-500">
                    Send us your situation and we will tell you what applies to it.
                  </p>
                  <a
                    href={site.whatsappHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-sm text-body-sm font-medium text-ember-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300"
                  >
                    Message us on WhatsApp
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Card>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ⛔ THE DRAFT'S OWN CLOSING PANEL IS NOT REPRODUCED. Its second line is
          corrupted in the source PDF — see details.js — so it ends mid-clause,
          and finishing the sentence would be writing copy and attributing it to
          Clinton. CtaBand's copy is already approved and does the same job. */}
      <CtaBand />
    </>
  );
}

/**
 * One content block. Every branch renders content and nothing else — no
 * headings, labels or connective prose are added here.
 */
function Block({ block, first }) {
  switch (block.type) {
    case "heading":
      return (
        <Reveal>
          <h2 className={`${first ? "" : "mt-12 "}text-h3 text-ink-600`}>{block.text}</h2>
        </Reveal>
      );

    case "paragraph":
      return (
        <Reveal>
          <p
            className={`mt-5 ${
              block.lead ? "text-body-lg text-ink-600" : "text-body text-ink-500"
            }`}
          >
            <RichText content={block.content} />
          </p>
        </Reveal>
      );

    case "callout":
      return (
        <Reveal>
          {/* The draft sets this block on a tinted panel with an ember rule down
              its left edge; this is that, in tokens. ember-50 is the warm end
              of the ramp — note there is no `bg-ember-950`, the ramp stops at
              700, and a class for an undefined token compiles to nothing at all
              with no error. */}
          <div className="mt-12 rounded-r-[var(--radius-md)] border-l-2 border-ember-400 bg-ember-50 p-6 md:p-8">
            <h3 className="flex items-start gap-2.5 text-h4 text-ink-600">
              {/* The draft prefixes the heading with a ⚠ character. Rendered as
                  an icon and aria-hidden, so the accessible name stays the
                  words rather than "warning sign Note for Early Adopters". */}
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-ember-600"
                strokeWidth={2}
              />
              {block.heading}
            </h3>
            {block.content.map((para, index) => (
              <p key={index} className="mt-4 text-body text-ink-500">
                <RichText content={para} />
              </p>
            ))}
          </div>
        </Reveal>
      );

    case "specs":
      // ⚠️ A <dl>, not a <table>. The data is term → detail pairs, which a
      // description list expresses just as correctly and which — unlike a table
      // — needs no `overflow-x-auto` + `min-w-*` pair to survive 375px. The
      // /dsc comparison table had to be rebuilt to stop a phone reader having
      // to scroll sideways to see a column; this avoids the problem rather than
      // solving it twice.
      //
      // ONE Reveal around the whole list, never one per row: rows resolving one
      // by one while a reader is checking their machine against them is exactly
      // what "body copy never animates" protects against.
      return (
        <Reveal>
          <dl className="mt-8 border-t border-ink-100">
            {block.rows.map((row) => (
              <div
                key={row.term}
                className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-ink-100 py-5 sm:grid-cols-[minmax(0,10rem)_1fr]"
              >
                <dt className="text-body font-medium text-ink-600">{row.term}</dt>
                <dd className="text-body text-ink-500">
                  <RichText content={row.content} />
                  {row.warning && (
                    // Set in red in the draft. --color-danger is the site's own
                    // token for it; this is the only place that colour appears
                    // on the page.
                    <span className="mt-2 block text-[color:var(--color-danger)]">
                      {row.warning}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      );

    default:
      return null;
  }
}

/**
 * A `content` value is either a plain string or an array of `{ text, strong }`
 * segments. The segment form exists because the draft bolds phrases INSIDE
 * sentences and that emphasis is part of the copy — this is the renderer for
 * it, deliberately not a Markdown parser.
 */
function RichText({ content }) {
  if (typeof content === "string") return content;
  return content.map((segment, index) =>
    segment.strong ? (
      <strong key={index} className="font-semibold text-ink-600">
        {segment.text}
      </strong>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  );
}

function PendingNotice({ path, title }) {
  return (
    <>
      <PageHero
        path={path}
        eyebrow="Notices"
        h1={title ?? "Notice"}
        lede="This notice is still being written. The notice board carries everything we are currently flagging."
        cta={{ label: "All notices", to: "/notices" }}
      />
      <CtaBand />
    </>
  );
}
