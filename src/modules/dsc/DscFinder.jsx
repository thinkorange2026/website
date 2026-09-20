import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, FileText, Gavel, Globe, ShieldCheck, Ship } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { finderAltLinks, finderUses } from "@/content/dsc/finder";
import { dscIntentForUse } from "@/content/dsc/intents";
import { dscDriversPage, dscFaqSectionIds, dscFaqsPage } from "@/content/nav";

// THE DSC FINDER — "what are you signing for?", and nothing else.
//
// ⛔ 11-09-2026 (Clinton): "instead of Or read the full guide direct redirect
// while click to card." THIS IS NO LONGER A WIZARD. A card used to advance to
// question two ("who signs?") and then render the answer in place; it now
// navigates straight to that purpose's page, which asks the signer question as
// a control and renders the same answer card.
//
// ⚠️ WHAT THAT RETIRED, so nobody goes looking for it: the step machine and its
// directional panel transitions, the signer chips, the in-place result, the
// `?use=`/`?signer=` URL mirroring on /dsc, the scroll-and-focus effect that
// re-landed the panel on every step change, the cross-link "jump" buttons, and
// the `dsc_finder_result` event fired from here. None of it is lost — every one
// of those jobs now belongs to `DscIntent`, which does it on a real URL. Git
// history has the wizard if it is ever wanted back.
//
// ⚠️ AND WHAT THAT FIXED, which is the reason it is an improvement rather than
// a simplification: the answer used to exist only after two clicks, in
// JavaScript, on a page whose served HTML contained none of it. Nothing crawls
// a wizard, and a shared link previewed as the generic /dsc card. Four answers
// with no address were the whole problem; four addresses are the whole fix.
//
// ⚠️ The "Or read the full guide" row added earlier the same day is GONE with
// this change — it existed to reach these pages past the wizard, and the cards
// are the way now. The escape-hatch row below is back to its original
// unlabelled form for the same reason: there is no second list beside it to be
// confused with.

// Content names an icon; the component owns which glyph that is, so
// `finder.js` stays a plain-data file the Node scripts can read. Never index
// this directly — `<undefined />` is a hard React crash, not a blank.
const ICONS = { file: FileText, gavel: Gavel, ship: Ship, globe: Globe };
const finderIcon = (key) => ICONS[key] ?? ShieldCheck;

const EASE = [0.22, 1, 0.36, 1];

// Built here rather than typed in `finder.js`, so a section id can never be
// spelled wrong in content — every one comes from nav.js. A fragment naming a
// section that does not exist scrolls nowhere and the link audit cannot catch
// it, which is the failure this repo has already shipped twice.
const ALT_PATHS = {
  renewal: `${dscFaqsPage.path}#${dscFaqSectionIds.renewal}`,
  drivers: dscDriversPage.path,
  contact: "/contact",
};

export function DscFinder() {
  const reduceMotion = useReducedMotion();

  // 40ms, deliberately below the 60ms Stagger uses elsewhere: these are
  // controls, and waiting to be able to choose is lag rather than polish.
  const cardMotion = (index) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.32, ease: EASE, delay: 0.04 + index * 0.04 },
        };

  return (
    <Container>
      <SectionHeading eyebrow="Find your certificate" heading="Which DSC do you need?" />

      <div className="mt-10">
        {/* ⚠️ FOUR ACROSS AT xl, NOT A STACKED LIST. In the old 8-column track a
            single column gave each card a ~830px measure; full width that is
            ~1700px, which leaves a small icon and two lines of copy adrift in a
            very wide box. The four choices are peers, so a row of four reads as
            the question's answer set. `items-stretch` + the card's own `h-full`
            keep them a common height. */}
        <ul className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
          {finderUses.map((item, index) => (
            <motion.li key={item.key} {...cardMotion(index)}>
              {/* ⚠️ DERIVED, not a hardcoded path: a purpose with no page would
                  render no card at all rather than linking to a 404. All four
                  have one today. */}
              <ChoiceCard
                item={item}
                icon={finderIcon(item.icon)}
                to={`/dsc/${dscIntentForUse(item.key)?.slug ?? ""}`}
              />
            </motion.li>
          ))}
        </ul>

        {/* ⛔ 03-09-2026 (Clinton): "remove this show as 4 card no need to
            sperate." The foreign-national route used to sit under a labelled
            rule ("Or, if the applicant is a foreign national") as a separate
            card below this list. It is the fourth card above now — one
            `finderUses` array, one map — so there is no second render path to
            keep in step. Do not reinstate the divider. */}
        <motion.ul
          {...cardMotion(finderUses.length)}
          className="mt-7 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink-100 pt-6"
        >
          {finderAltLinks.map((link) => (
            <li key={link.key}>
              <AltLink to={ALT_PATHS[link.key]} label={link.label} />
            </li>
          ))}
        </motion.ul>
      </div>
    </Container>
  );
}

/**
 * One purpose, as a link to its page.
 *
 * ⛔ IT IS A `<Link>` NOW, NOT A `<button>` (11-09-2026). It genuinely
 * navigates, so it has to be an anchor: middle-click, Cmd-click, "open in new
 * tab" and "copy link address" all work, a crawler can follow it, and the role
 * announced matches what happens. A button that called `navigate()` would look
 * identical and be wrong in all five ways.
 *
 * `.card-premium` stays ON the link itself, and so do the `active:` utilities
 * that supply its press feedback. That class's own `a:active > .card-premium`
 * rule needs the card to be a CHILD of the anchor; here the card IS the anchor,
 * so the rule cannot fire and the utilities are still what a touch user gets
 * back from a tap — Tailwind v4 wraps every `hover:` in `@media (hover: hover)`,
 * so without them a phone gets no feedback at all.
 *
 * The `pill` names the certificate this route leads to, up front — the
 * reference's idea, and a good one: it lets a reader who already knows what
 * they need confirm it without opening anything.
 */
function ChoiceCard({ item, icon: Icon, to }) {
  return (
    <Link
      to={to}
      className="card-premium group relative flex h-full w-full items-start gap-4 rounded-[var(--radius-md)] border border-ink-100 bg-white p-5 text-left shadow-sm transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-ember-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] sm:p-6 lg:rounded-[var(--radius-lg)]"
    >
      {/* Filled disc on a light surface, ringed on dark — the established
          pairing. A ring plus a tint on white is two treatments doing one job. */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-50">
        <Icon className="h-4.5 w-4.5 text-ember-600" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-h4 text-ink-600 transition-colors group-hover:text-ember-600">
          {item.label}
        </span>
        <span className="mt-1 block text-body-sm text-ink-400">{item.desc}</span>
        {item.pill && (
          <span className="mt-3 inline-block rounded-[var(--radius-sm)] bg-ember-50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ember-700">
            {item.pill}
          </span>
        )}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition-[transform,color] duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:text-ember-600"
        strokeWidth={2}
      />
    </Link>
  );
}

function AltLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 rounded-sm text-body-sm text-ink-500 underline-offset-4 transition-colors hover:text-ember-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 xl:text-body"
    >
      {label}
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
