import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { NoticeBoard } from "@/components/ui/NoticeBoard";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionPageJsonLd } from "@/lib/jsonld";
import { noticesFor } from "@/content/notices";
import { meta as siteMeta } from "@/content/meta";

// T16 — /notices. Added 11-09-2026 (Clinton): "just above the insight keep a
// notice section and top right keep a view all section in that go to notice
// page for that create a new all notice page."
//
// ⚠️ IT IS THE SAME `NoticeBoard` THE HOMEPAGE AND /dsc/faqs RENDER, with
// `scope="all"`. A separate list component here would be a second definition of
// one row treatment, and the three would drift — the discipline `.card-dark`,
// `Accordion` and `StepFlow` already carry. All this page adds is the hero and
// the empty state.
//
// ⛔ THIS PAGE INVENTS NO NOTICE. Everything on it comes from `notices.js`,
// where `confirmed: false` hides an entry and every published entry carries a
// `basis` line naming where the site already asserts it. Read that file's
// header before adding one — a notice board is the easiest place on a
// compliance firm's site to publish something unsourced.
//
// ⚠️ SURFACE CADENCE: deep → light-alt → ember. `NoticeBoard` defaults to
// `light-alt`, which is what this page wants anyway — `deep` above it and the
// CTA band below, so no consecutive repeat and no adjacent dark-family pair.
export default function Notices({ path }) {
  const description = siteMeta["/notices"].description;
  const count = noticesFor("all").length;

  return (
    <>
      <JsonLd data={collectionPageJsonLd({ name: "Notices", description, path })} />

      {/* No eyebrow: on every other template it names the parent category, and
          here it would repeat the H1 word for word. Same call `/insights`
          makes. */}
      {/* ⛔ `ringsId`, NOT THE DEFAULT LONE CRESCENT — 11-09-2026 (Clinton:
          "fixed the hero section of notice page"). PageHero's own header
          records why the default fails on a page with no other backdrop: it is
          a single 16px stroke at a flat 12% ember, hung off the corner at a
          size that puts its brightest part behind the fixed header, so it reads
          as one dull circle that has been cut off rather than as a corner
          composition. `ArcRings` fixes that by construction — the shared
          gradient fades each stroke along its own length, so the set resolves
          into the surface instead of ending at the clip edge. Same crescent
          geometry either way (`lib/arc.js`), so §3.1's "one specific shape"
          still holds. /about made exactly this swap on 21-08-2026.

          ⚠️ The id must be unique per mounted hero: `url(#id)` resolves
          document-wide, not per-`<svg>`.

          ⚠️ NO `texture` HERE, deliberately. The four SurfaceTexture variants
          are DSC motifs and the six service ones are practice-area motifs — a
          guilloché means "certificate" — so any of them on this page would say
          something untrue about it. Same call /about made.

          A ringed hero also picks up `.surface-ambient` + `isolate`, i.e. §7.2
          compliance, so the fold is not a flat slab. */}
      <PageHero
        path={path}
        h1="Notices"
        lede="Changes and requirements worth knowing about before they affect a filing, a certificate or a token. Each one links to the page that explains it in full."
        ringsId="notices-hero-rings"
      />

      {/* ⚠️ NO `action` HERE. This IS the "view all" destination, so a link
          back to itself would be a loop. */}
      <NoticeBoard
        scope="all"
        gradientId="all-notices-board"
        eyebrow="Notice board"
        heading="Everything we are currently flagging"
        lede="Every notice we have out, across GST, income tax, Digital Signature Certificates and tokens."
      />

      {/* ⚠️ Gated on the SAME count the board reads, so the two can never both
          render or both vanish. `NoticeBoard` returns null when there is
          nothing confirmed, and a page with a hero and then nothing reads as
          broken rather than as empty — the honesty-first pattern the Resources
          page's own empty state already uses. */}
      {count === 0 && <EmptyState />}

      <CtaBand />
    </>
  );
}

function EmptyState() {
  return (
    <Section surface="light">
      <Container>
        {/* `data-surface="dark"` is load-bearing on a dark panel inside a light
            section: without it every descendant reading `var(--surface-*)` gets
            the LIGHT values, and `[data-surface="dark"] h2` never supplies the
            canvas heading colour. Recorded seven times in CLAUDE.md. */}
        <div
          data-surface="dark"
          className="panel-dark grain relative isolate overflow-hidden rounded-[var(--radius-lg)] p-8 md:p-12"
        >
          <h2 className="text-h3">Nothing to flag right now</h2>
          <p className="mt-3 max-w-[62ch] text-body text-ink-100">
            When a rule, a deadline or a requirement changes in a way that affects our clients, it
            appears here first.
          </p>
        </div>
      </Container>
    </Section>
  );
}
