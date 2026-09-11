import { Hero } from "@/modules/home/sections/Hero";
import { NoticeTicker } from "@/components/ui/NoticeTicker";
import { TrustStrip } from "@/modules/home/sections/TrustStrip";
import { WhatWeDo } from "@/modules/home/sections/WhatWeDo";
import { WhenToCallUs } from "@/modules/home/sections/WhenToCallUs";
import { WhoWeWorkWith } from "@/modules/home/sections/WhoWeWorkWith";
import { WhyThinkOrange } from "@/modules/home/sections/WhyThinkOrange";
import { HowWeWork } from "@/modules/home/sections/HowWeWork";
import { ComplianceCalendarHome } from "@/modules/home/sections/ComplianceCalendarHome";
import { DscBand } from "@/modules/home/sections/DscBand";
import { Faqs } from "@/modules/home/sections/Faqs";
import { DriverDownloads } from "@/modules/home/sections/DriverDownloads";
import { PartnerProgramme } from "@/modules/home/sections/PartnerProgramme";
import { Testimonial } from "@/modules/home/sections/Testimonial";
import { Insights } from "@/modules/home/sections/Insights";
import { NoticeBoard } from "@/components/ui/NoticeBoard";
import { CtaBand } from "@/modules/home/sections/CtaBand";

// T1 — the homepage. CONTENT-PLAN.md §6 is the authoritative section-by-
// section brief (fourteen rows, real content and archetypes); DESIGN.md
// §11.1's table is the abstract surface-cadence rule it has to satisfy.
//
// Faqs and Testimonial were moved above DriverDownloads (11-08-2026). The
// cadence has to hold in BOTH states, because Testimonial still renders null:
//
//   as authored:  Deep → Light → Dark → Light → Light-alt → Dark → Light →
//                 Deep → Light-alt → Deep → Light → Light-alt → Ember → Deep
//   as rendered:  … → Deep → Light-alt → Light → Light-alt → Ember → Deep
//
// Neither sequence repeats an archetype consecutively — Phase 5's done-when
// criterion, re-verified after the move.
//
// FAQ SITS BEFORE TESTIMONIAL, not after, and that ordering is forced: DscBand
// is Deep and DESIGN.md §11.1 row 9 fixes Testimonial at Deep, so putting the
// quote first would place two Deep sections back to back. A light-alt FAQ
// between them keeps the alternation and lets Testimonial keep its spec'd
// surface. Both are still above DriverDownloads, which was the requirement.
//
// TrustStrip was REPLACED by WhenToCallUs (18-08-2026, Clinton) — the
// "We work with" partner marquee is out of the homepage. Same slot (section
// 2, straight after the hero), same light surface, so the cadence above is
// unchanged. TrustStrip itself is NOT deleted, just commented out below: it
// is the only surface on the site that names the certifying-authority partnership,
// and IMAGE-PLAN.md §7.4's approved-marks note lives in that file. It has no
// other call site, so nothing else is affected.
//
// Testimonial (§11.1 row 9) and Insights are flag-gated per BUILD-PLAN.md
// Phase 5: "wired, not shipped." Both return null today because
// src/content/testimonials.js and src/content/insights.js are empty —
// CONTENT-PLAN.md §6: inventing either is "dishonest and easy to spot."
// Add real, consented content to those files and the sections switch on with
// no change here. Faqs is NOT flag-gated in the same way: its content resolves
// from already-written service leaves, so it renders today.
export default function Home() {
  return (
    <>
      <Hero />
      {/* Small infinite notice bar (Clinton, 04-09-2026). `light-alt`, so the
          cadence runs deep -> light-alt -> light rather than putting two
          dark-family surfaces under the hero. */}
      {/* <NoticeTicker /> */}
      <ComplianceCalendarHome />
      <WhatWeDo />
      <WhoWeWorkWith />
      <WhyThinkOrange />
      <HowWeWork />
      <WhenToCallUs />
      <DscBand />
      <PartnerProgramme />
      {/* <Testimonial /> */}
      <Faqs />
      {/* ⛔ 11-09-2026 (Clinton): "just above the insight keep a notice section
          and top right keep a view all section in that go to notice page."
          Same `NoticeBoard` /dsc/faqs and /notices render — one definition, not
          a homepage fork — with `scope="site"` so it shows the notices written
          for this surface rather than the DSC-specific ones.

          ⚠️ `light-alt` AND THE `Faqs` SECTION ABOVE IT MOVED TO `light` IN THE
          SAME EDIT. Inserting anything between Faqs (was light-alt) and
          Insights (light) had to differ from both; swapping Faqs was the
          quieter of the two options — the alternative was a fifth dark band
          this late in the page. It also fixes a LATENT repeat: `Testimonial`
          returns null once the placeholder quotes are removed, which would
          otherwise have left PartnerProgramme (light-alt) directly above Faqs
          (light-alt). Cadence verified in BOTH states. */}
      <NoticeBoard
        scope="site"
        surface="light-alt"
        gradientId="home-notice-board"
        eyebrow="Notices"
        heading="What we are flagging right now"
        // ⚠️ NO LEDE HERE, DELIBERATELY. The header row is `items-end`, so with
        // a lede the "View all" link aligns to the BOTTOM of the heading block
        // — level with the lede, well below the h2 — and Clinton asked for it
        // top right. Measured: with the lede the link's bottom sat 40px+ below
        // the h2's. Without one the row is eyebrow + h2, exactly like the
        // `Insights` header directly beneath it, and the link lands level with
        // the heading.
        action={{ to: "/notices", label: "View all" }}
      />
      <Insights />
      {/* <TrustStrip /> */}
      {/* <DriverDownloads /> */}
      <CtaBand />
    </>
  );
}
