import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Gavel,
  Globe,
  ShieldCheck,
  Ship,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  finderAltLinks,
  finderAnswer,
  finderSigners,
  finderUse,
  finderUses,
} from "@/content/dsc/finder";
import {
  certificateVariant,
  documentCount,
  documentsFor,
  kycRoutes,
} from "@/content/dsc/certificates";
import {
  dscDriversPage,
  dscFaqSectionIds,
  dscFaqsPage,
  findBySlug,
} from "@/content/nav";
import { dscEnquiryHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

// THE DSC FINDER — what for, who signs, your certificate.
//
// ⛔ REBUILT 03-09-2026 against Clinton's `dsc-finder-preview.html`. Its data
// model, its step labels and its copy are in `content/dsc/finder.js`, with the
// one content conflict this raised recorded at the top of that file. What is
// here is the behaviour and this site's design; none of the reference's own
// styling was carried over.
//
// What the reference added that the previous version did not have, in order of
// how much it matters:
//
//  1. **A VERIFICATION-ROUTE TOGGLE on the document checklist.** Aadhaar eKYC
//     and PAN-based need genuinely different documents, and every checklist on
//     this site previously assumed Aadhaar while also listing a photograph —
//     wrong on both routes at once. See `kycRoutes` in certificates.js.
//  2. A document COUNT, so the reader can judge the effort before reading.
//  3. Per-route document notes (the foreign route's scan and translation
//     rules), which have nowhere else to live.
//  4. Escape hatches under question one, for a reader who is renewing, chasing
//     a driver, or does not recognise any of the three purposes.
//
// ⚠️ THE RESULT IS RENDERED ON DEMAND, NOT PRERENDERED, and that stays safe
// only while nothing is reachable ONLY through the finder. /dsc's documents
// section carries every checklist and the portal guide as ordinary visible
// content, and the Buy Token page carries the drivers and renewal material. If
// that stops being true, these results have to be rendered statically instead.
//
// ⚠️ NO URL HASH SYNC, deliberately. The reference pushes `#dsc/gst/org` as you
// answer; here the hash is already spoken for by the sub-nav, the footer's DSC
// column and every retired-URL redirect, and `RootLayout` scrolls on it.

// Content names an icon; the component owns which glyph that is, so
// `finder.js` stays a plain-data file the Node scripts can read. Never index
// this directly — `<undefined />` is a hard React crash, not a blank.
const ICONS = { file: FileText, gavel: Gavel, ship: Ship, globe: Globe };
const finderIcon = (key) => ICONS[key] ?? ShieldCheck;

const EASE = [0.22, 1, 0.36, 1];

export function DscFinder() {
  const [useKey, setUseKey] = useState(null);
  const [signer, setSigner] = useState(null);
  // Which way a panel slides: forward when answering, backward on Back.
  // Without it, going back animates like going forward and the gesture
  // contradicts what just happened.
  const [direction, setDirection] = useState(1);
  const [kyc, setKyc] = useState(kycRoutes[0].key);
  const reduceMotion = useReducedMotion();

  // Focus moves to the panel when it changes, or a keyboard or screen-reader
  // user presses a card and nothing announces — the page has changed several
  // hundred pixels below where their focus still sits.
  const panelRef = useRef(null);

  const activeUse = useKey ? finderUse(useKey) : null;
  const skips = Boolean(activeUse?.skipsSigner);
  const signerKey = skips ? "any" : signer;
  const answer = activeUse && signerKey ? finderAnswer(activeUse.key, signerKey) : null;

  const step = answer ? "result" : activeUse ? "signer" : "uses";

  // ⛔ THE SCROLL EFFECT KEYS ON THIS, NOT ON `step`, and the difference only
  // shows up on a cross-link jump (07-09-2026). A jump from one result to
  // another leaves `step` at "result", so a step-keyed effect returns early and
  // the reader is left wherever they were — typically deep in the OLD answer's
  // document list, watching it change under them with the new heading and spec
  // row off-screen above. The `aria-live` region announces the change, but a
  // sighted reader gets no explanation for it. Keying on the identity of the
  // answer fires the same re-landing a step change already gets.
  //
  // ⚠️ IT DELIBERATELY DOES NOT INCLUDE `kyc`. The verification toggle changes
  // the checklist and the count, but the reader is looking straight at the
  // control when they press it — scrolling then would yank the page out from
  // under their own click.
  const screen = step === "result" ? `result:${activeUse.key}|${signerKey}` : step;
  // ⚠️ SEEDED WITH THE CURRENT SCREEN, and it has to be declared after
  // `screen` for that. `useRef(null)` would not match on the first run, so the
  // scroll effect below would fire on mount and move a reader who has not
  // touched the finder. A ref's argument is only read on the first render, so
  // this is stable.
  const screenRef = useRef(screen);

  function advance(fn) {
    setDirection(1);
    fn();
  }

  // ⛔ 07-09-2026 (Clinton): "i want add ghoast to redirect to other dsc from
  // main details section … so that user no need to go back and select again."
  // The result's cross-links call this: it swaps the PURPOSE and leaves
  // everything else to the state machine.
  //
  // ⚠️ IT DELIBERATELY DOES NOT TOUCH `signer`, and that is the whole trick.
  //   - Target skips question two (filings, foreign) → `signerKey` resolves to
  //     "any" on its own, so the reader lands straight on the new result.
  //   - Target asks it and a signer is already held → the answer resolves and
  //     they land straight on the new result too. This is the case the
  //     instruction is about: tender|company → exim|company in one click.
  //   - Target asks it and no signer is held (they came from a skipping route)
  //     → `step` becomes "signer" and they are asked question two with the
  //     purpose already chosen. One click instead of three, and it does NOT
  //     invent an answer they never gave.
  // Clearing `signer` here would break the middle case, which is the point of
  // the feature; carrying it also means a reader who jumps away and back keeps
  // their answer.
  //
  // ⚠️ The verification route DOES reset. It belongs to the checklist of the
  // certificate being left, and a reader silently still on the PAN route for a
  // different certificate is shown a document count that is not theirs — the
  // same reasoning `back()` already carries.
  function jumpTo(nextUseKey) {
    setDirection(1);
    setKyc(kycRoutes[0].key);
    setUseKey(nextUseKey);
  }

  // ⛔ 05-09-2026 (Clinton): "here instead of start over show back button, in 3
  // step it start from starting no need to do process from starting." The
  // control used to be `reset()` on every step — from the answer it threw away
  // BOTH answers and sent the reader back to question one, so changing just
  // the signer meant re-picking the purpose as well.
  //
  // It now steps back exactly one screen.
  //
  // ⚠️ "ONE SCREEN BACK" IS NOT ALWAYS "ONE ANSWER BACK", and that is the whole
  // subtlety here. A `skipsSigner` use (statutory filings) never showed
  // question two — dropping only `signer` there would land the reader on a
  // question they were never asked, which reads as the finder inventing a step.
  // So a skipping answer goes back to the purpose cards, which IS its previous
  // screen. The rail already shows 2 steps for those routes for the same
  // reason; this keeps the two consistent.
  //
  // ⚠️ The verification route resets on every step back, so a reader who
  // changes their purpose or signer is not silently still on the PAN route
  // they picked for the answer they just left.
  function back() {
    setDirection(-1);
    setKyc(kycRoutes[0].key);
    if (answer && !skips) {
      setSigner(null);
      return;
    }
    setUseKey(null);
    setSigner(null);
  }

  // ⛔ 03-09-2026 (Clinton): "in the phone or tab view optimise the focus and
  // auto scroll smooth to area where need to focus."
  //
  // This used to be a bare `panelRef.current.focus()`, and the bug is in what
  // the browser does with that: focus scrolls the MINIMUM amount to bring the
  // element into view, so for a tall element it aligns the BOTTOM edge. On a
  // phone the result panel is several screens high, so answering a question
  // landed the reader at the FOOT of their own answer — past the heading, the
  // spec row and the checklist. It only looked acceptable on a wide screen,
  // where the panel is a short column beside a sticky rail.
  //
  // So the scroll is now deliberate rather than incidental: `preventScroll`
  // takes the browser out of it, and the panel's TOP is placed just under the
  // fixed header and the sticky sub-nav.
  //
  // ⚠️ THE CLEARANCE IS READ OFF THE ELEMENT'S OWN `scroll-margin-top`, never
  // typed here. `scroll-mt-32` is already on that div for anchor navigation, so
  // reading it back means the keyboard path and this path cannot drift — and
  // changing the header or the sub-nav height is still a one-place edit.
  //
  // ⚠️ Runs on SCREEN change (see `screen` above — the step, plus which answer
  // for a result), so Back and a cross-link jump both re-land the panel. On a
  // phone the old behaviour left a reader stranded where the previous answer's
  // foot had been. `screenRef` seeds with the first screen so nothing fires on
  // mount; the finder is above the fold on /dsc and moving a reader who has not
  // touched it would be its own bug.
  useEffect(() => {
    if (screenRef.current === screen) return;
    screenRef.current = screen;

    const node = panelRef.current;
    if (!node) return;
    node.focus({ preventScroll: true });

    const clearance = parseFloat(getComputedStyle(node).scrollMarginTop) || 0;

    // ⛔ ONE `scrollTo` IS NOT ENOUGH, and this is the whole reason for the
    // observer below. `AnimatePresence mode="wait"` means the step that is
    // LEAVING is still mounted when this runs, so the document is still as tall
    // as the old step — and the steps differ enormously (the result panel is
    // several screens on a phone; question two is a few hundred pixels). Scroll
    // to a target computed against the old height and the browser CLAMPS it to
    // whatever the document allows once the content shrinks. Measured on a
    // 390px viewport: the panel landed at top 671 instead of the 128 it asked
    // for, i.e. the reader was left short of their own answer — the same class
    // of failure this effect exists to fix.
    //
    // So the position is re-asserted as the panel resizes, until it settles or
    // the cap expires. The first pass still runs immediately, so the scroll
    // starts on the tap rather than after the transition.
    let cancelled = false;
    const settle = () => {
      if (cancelled) return;
      const top = node.getBoundingClientRect().top;
      // Already parked where it belongs — re-scrolling would be motion for its
      // own sake, and would restart the smooth animation every resize tick.
      if (Math.abs(top - clearance) <= 2) return;
      window.scrollTo({
        top: Math.max(0, window.scrollY + top - clearance),
        // Honours the same preference `html { scroll-behavior: smooth }` gives
        // up under §9.6's reduced-motion floor.
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    settle();

    // ⚠️ CAPPED, deliberately. Without the cap this would keep re-centring the
    // panel for as long as anything resized it — including a reader opening
    // something themselves — which is a page that fights you. 700ms comfortably
    // covers the 280ms exit plus the enter and one layout pass.
    const observer = new ResizeObserver(settle);
    observer.observe(node);
    const stop = window.setTimeout(() => {
      cancelled = true;
      observer.disconnect();
    }, 700);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(stop);
    };
  }, [screen, reduceMotion]);

  // One transition for the whole panel: a short directional slide plus a fade.
  // `mode="wait"` so the outgoing panel is gone before the incoming one
  // measures — these panels are very different heights, and cross-fading them
  // makes the section jump.
  const panelMotion = reduceMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, x: direction * 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -16 },
        transition: { duration: 0.28, ease: EASE },
      };

  // 40ms, deliberately below the 60ms Stagger uses elsewhere: this is a
  // control, and waiting to be able to choose is lag rather than polish.
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
      {/* ⛔ 07-09-2026 (Clinton): "remove this part complete and keep the
          layout like this: label / heading / 4 card." The lede AND the step
          rail are GONE — not hidden, removed — and the 4/8 sticky-rail split
          went with them. What is left is a single stacked flow: eyebrow,
          heading, then the choices.

          ⚠️ THE RAIL COLUMN EXISTED ONLY TO HOLD THOSE TWO THINGS. `FaqSection`
          and `StepFlow` use the same 4/8 split because their left column
          carries a heading plus supporting copy beside a narrow-measure panel;
          with the lede and rail deleted there was nothing left to make sticky,
          and a lone eyebrow+h2 pinned in a 4-column track beside the cards is
          the empty-half problem that split exists to avoid, in reverse.

          ⚠️ `StepRail` IS DELETED, and with it the only visible progress
          indicator. The answer panel is still an `aria-live="polite"` region,
          so a screen reader is told when the step changes; a sighted reader now
          has the `activeUse` eyebrow on step two and the Back button as their
          only sense of place. That is the accepted cost of this instruction,
          not an oversight — restoring a progress indicator means rebuilding
          `StepRail` from git history, and it should go ABOVE the cards in this
          layout rather than beside them.

          ⚠️ `headingClassName="max-w-[18ch]"` is GONE too. It forced "Which DSC
          do you need?" onto two lines to fit a 4-column track; at full width
          `SectionHeading`'s standard 32ch measure sets it on one. */}
      <SectionHeading eyebrow="Find your certificate" heading="Which DSC do you need?" />

      <div
        ref={panelRef}
        tabIndex={-1}
        // Politely announced, not assertively: the reader pressed a button
        // and is expecting this, so it must not interrupt them.
        aria-live="polite"
        className="mt-10 scroll-mt-32 focus:outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {step === "uses" && (
            <motion.div key="uses" {...panelMotion}>
              {/* ⚠️ FOUR ACROSS AT xl, NOT A STACKED LIST. In the old
                  8-column track a single column gave each card a ~830px
                  measure; full width that is ~1700px, which leaves a small
                  icon and two lines of copy adrift in a very wide box. The
                  four choices are peers, so a row of four reads as the
                  question's answer set. `items-stretch` + the card's own
                  `h-full` keep them a common height. */}
              <ul className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
                {finderUses.map((item, index) => (
                  <motion.li key={item.key} {...cardMotion(index)}>
                    <ChoiceCard
                      item={item}
                      icon={finderIcon(item.icon)}
                      onClick={() => advance(() => setUseKey(item.key))}
                    />
                  </motion.li>
                ))}
              </ul>

              {/* ⛔ 03-09-2026 (Clinton): "remove this show as 4 card no
                  need to sperate." The foreign-national route used to sit
                  under a labelled rule ("Or, if the applicant is a foreign
                  national") as a separate card below this list. It is the
                  fourth card in the list above now — one `finderUses`
                  array, one map — so there is no second render path to
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
            </motion.div>
          )}

          {step === "signer" && (
            <motion.div key="signer" {...panelMotion}>
              <BackButton onClick={back} />
              <p className="mt-5 font-mono text-eyebrow uppercase tracking-[0.12em] text-ember-600">
                {activeUse.label}
              </p>
              <h3 className="mt-2 text-h3 text-ink-600">Who signs on the portal?</h3>
              <p className="mt-2 max-w-[62ch] text-body text-ink-500">
                A certificate always belongs to a named person — what matters is whether they
                sign personally or on behalf of an entity.
              </p>
              <ul className="mt-7 flex flex-wrap gap-3">
                {finderSigners.map((option, index) => (
                  <motion.li key={option.key} {...cardMotion(index)}>
                    <SignerChip
                      label={option.label}
                      onClick={() => advance(() => setSigner(option.key))}
                    />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div key="result" {...panelMotion}>
              <FinderResult
                answer={answer}
                use={activeUse}
                signerLabel={
                  skips
                    ? null
                    : finderSigners.find((option) => option.key === signer)?.label
                }
                kyc={kyc}
                onKyc={setKyc}
                onBack={back}
                onJump={jumpTo}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
}

// Built here rather than typed in `finder.js`, so a section id can never be
// spelled wrong in content — every one comes from nav.js. A fragment naming a
// section that does not exist scrolls nowhere and the link audit cannot catch
// it, which is the failure this repo has already shipped twice.
const ALT_PATHS = {
  // ⛔ 03-09-2026: both retargeted when Buy Token split into three pages.
  // Renewal is a section of the FAQ page now; drivers has a page of its own.
  renewal: `${dscFaqsPage.path}#${dscFaqSectionIds.renewal}`,
  drivers: dscDriversPage.path,
  contact: "/contact",
};


/**
 * One purpose. `.card-premium` is the light-surface card wash the DSC and
 * services cards already use. Its own press feedback is selected through
 * `a:active > .card-premium` — this is a BUTTON, not a link wrapping a card,
 * so that rule can never fire here and the `active:` utilities supply it
 * instead. Deliberately not hover-gated: Tailwind v4 wraps every `hover:` in
 * `@media (hover: hover)`, so without them a touch user gets nothing back.
 *
 * The `pill` names the certificate this route leads to, up front — the
 * reference's idea, and a good one: it lets a reader who already knows what
 * they need confirm it without answering anything.
 */
function ChoiceCard({ item, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
    </button>
  );
}

/** Question two's answers. Chips rather than cards: three short labels with no
 *  supporting line, where a card's box would be an empty frame. */
function SignerChip({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-ink-200 bg-white px-5 py-3 text-body-sm font-medium text-ink-600 shadow-sm transition-[color,border-color,transform] duration-[var(--dur-fast)] hover:border-ember-300 hover:text-ember-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

function AltLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 rounded-sm text-body-sm text-ink-500 underline-offset-4 transition-colors hover:text-ember-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
    >
      {label}
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

function BackButton({ onClick, onDark = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2",
        // The result panel is dark; question two sits on the light section.
        // Same control, two surfaces, so the tone is passed rather than
        // assumed — ink-400 on ink is 2.63:1 and would be near-invisible.
        onDark
          ? "text-ink-300 hover:text-ember-200 focus-visible:ring-offset-ink-950"
          : "text-ink-400 hover:text-ember-600"
      )}
    >
      <ArrowLeft
        className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      {/* ⛔ 05-09-2026: was "Start over" on both steps, which was only ever
          accurate on question two — from the answer it discarded both choices.
          It steps back one screen now, so it says so. */}
      Back
    </button>
  );
}

/**
 * The answer.
 *
 * ⚠️ SELECTS BY REFERENCE. The validity options, the verification note and the
 * document checklist are resolved out of `certificates.js` from the answer's
 * `certificate` key — they are NOT restated in `finder.js`. The foreign route
 * is the single exception and carries its own `documents`, because a passport
 * route is not one of the five certificates and there is nothing to resolve
 * it against.
 */
function FinderResult({ answer, use, signerLabel, kyc, onKyc, onBack, onJump, reduceMotion }) {
  const variant = answer.certificate ? certificateVariant(answer.certificate) : null;
  const related = answer.link ? findBySlug(answer.link.slug) : null;

  // ⚠️ The route toggle is hidden, not disabled, where no second route exists
  // — a control with one option is a control that lies about being a choice.
  const noKyc = Boolean(use.noKyc) || Boolean(answer.documents);
  // Every purpose except the one on screen. Derived, so a fifth purpose added
  // to `finderUses` appears here with no change in this file.
  const others = finderUses.filter((item) => item.key !== use.key);
  const documents = answer.documents ?? documentsFor(variant?.documentCore, kyc);

  // The answer's own internal cascade, so it assembles rather than arriving as
  // one slab. Short, and only after the panel itself has landed.
  const beat = (index) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: EASE, delay: 0.1 + index * 0.07 },
        };

  return (
    // ⛔ 03-09-2026 (Clinton): "in finder make the last step light and do not
    // confine in card." The answer used to be a `.panel-dark` card — a dark
    // slab dropped on this light section, which is what gave it weight. There
    // is no card and no surface now, so the weight has to come from the light
    // idiom this site already uses on `WhoWeWorkWith` and `WhyThinkOrange`:
    // hairlines, the type scale, mono labels, generous whitespace, and ONE
    // ember element per block.
    //
    // ⚠️ EVERY COLOUR IN HERE HAD TO BE RE-TONED, not just the wrapper. The
    // surface system covers headings and `var(--surface-*)` accents — it does
    // NOT cover the plain `text-ink-*` / `text-canvas` utilities this panel is
    // built from, so leaving them would have put canvas text on canvas. Same
    // trap already recorded for `GroupHeading`, `Breadcrumbs` and
    // `DriverPanel`. `BackButton` and `PanelLink` are shared with the dark
    // steps and take a tone rather than assuming one.
    <div>
      <BackButton onClick={onBack} />

      <motion.p
        {...beat(0)}
        className="mt-5 font-mono text-body-sm uppercase tracking-[0.14em] text-ember-600"
      >
        {use.label}
        {signerLabel && <span className="text-ink-400"> · {signerLabel}</span>}
      </motion.p>
      <motion.h3 {...beat(1)} className="mt-2 max-w-[26ch] text-h2 text-ink-600">
        {answer.heading}
      </motion.h3>

      {/* The reference's facts list, as a hairline spec row rather than pills —
          a pill beside body copy reads as a button, and there are real buttons
          at the foot of this block.
          ⚠️ EVERY VALUE IS DERIVED OR ALREADY ASSERTED. Validity comes off the
          certificate, "On request" is the fees: null discipline, and the timing
          comes from turnaround.js. The reference's own result card carries
          "₹[X]" and "[X hrs]"; neither is a fact and neither was carried over. */}
      <motion.dl
        {...beat(2)}
        // ⚠️ SIX TRACKS, NOT TWO, even though the four cells here are now all
        // half width. The track count is kept at six so an odd number of cells
        // can be laid out at a third each without restructuring the grid — that
        // is what it was for when this row carried five. ANY CELL ADDED OR
        // REMOVED HERE HAS TO KEEP THE SPANS SUMMING TO A MULTIPLE OF 6, or a
        // row stops part-way across and takes its hairline with it, which reads
        // as content that failed to load.
        //
        // ⚠️ HORIZONTAL RULES ONLY, and that is what lets the cells sit FLUSH
        // LEFT. A first cut drew a full hairline mesh (`gap-px` over
        // `bg-ink-100`), which needs horizontal padding on every cell so the
        // text does not touch a vertical rule — and a grid item cannot know
        // which row it is in, so `first:pl-0` clears the first cell of the GRID
        // only and row two's leading cell keeps its inset. The two rows then
        // disagree with each other and with the heading above. Dropping the
        // vertical rules removes the reason for the padding, so every cell can
        // be `pl-0` unconditionally and both columns line up with the h3 by
        // construction. Each cell draws its own `border-b`, which reads as one
        // continuous rule per row because the cells of a row tile the width.
        className="mt-9 grid grid-cols-1 border-t border-ink-200 sm:grid-cols-6"
      >
        <SpecCell label="In whose name" value={answer.name} span="sm:col-span-3" />
        <SpecCell label="Covers" value={answer.covers} span="sm:col-span-3" />
        <SpecCell
          label="Validity"
          value={variant?.validityOptions?.join(" · ") ?? "Confirm with us"}
          span="sm:col-span-3"
        />
        <SpecCell label="Professional fees" value="On request" span="sm:col-span-3" />
        {/* ⛔ 07-09-2026 (Clinton): "Issued in / Confirm with us — remove all
            this in dsc finder." The turnaround cell is gone, and the four
            remaining cells were REBALANCED 2×2 (3+3 / 3+3) in the same edit —
            leaving them at 3+3+2+2 sums to 10, not a multiple of 6, so the
            second row would have stopped two thirds of the way across and its
            hairline with it.

            ⚠️ `turnaround.dscIssuanceTurnaround` is UNCHANGED and still
            `value: null`. Nothing was resolved by removing this cell — the real
            issuance time is still unconfirmed, and if it ever wants to be shown
            again it goes back through `t()`, never typed as a literal. The
            `t` import went out with the cell. */}
      </motion.dl>

      <motion.div {...beat(3)}>
        <DocumentPanel
          documents={documents}
          notes={answer.documentNotes}
          noKyc={noKyc}
          kyc={kyc}
          onKyc={onKyc}
          verificationNote={variant?.verificationNote}
          verification={variant?.verification}
        />
      </motion.div>

      {/* ⛔ 03-09-2026 (Clinton): "remove warning note and buy token." The
          ember-tinted caution callout that sat here is gone, and with it the
          answer's last filled area — the block is now entirely hairlines and
          type.

          ⚠️ `answer.warn` IS STILL WRITTEN ON EVERY ANSWER in finder.js and is
          simply no longer rendered. Do NOT prune those strings as dead content:
          they are the one thing that goes wrong per route (encryption cannot be
          added to a signing-only certificate; the DGFT name must match the PAN
          database exactly), and restoring the callout is a render-only change.

          ⚠️ SIDE EFFECT WORTH KNOWING: the `filings` warn was the half of the
          unresolved portalGuide contradiction that this page actually rendered
          (see the ⛔⛔ block at the top of finder.js). With it unrendered, /dsc
          no longer asserts both sides — but the conflict itself is NOT settled,
          and restoring this callout brings it straight back. */}

      {/* beat(4), not beat(5): the warn callout that used to hold index 4 is
          gone, and leaving the hole would idle the cascade for one extra 70ms
          step before the only actions on the page appear.

          ⛔ 03-09-2026 (Clinton): "keep apply on whatsapp button right and
          green color." The related-service link leads, the button is pushed to
          the far edge by `ml-auto` — which also puts it right when there is NO
          related link, where `justify-between` alone would leave it on the
          left. */}
      <motion.div
        {...beat(4)}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-ink-200 pt-8"
      >
        {/* ⛔ 03-09-2026: the "Buy the token" secondary button is gone on an
            earlier instruction the same day. /dsc/buy-token is still reachable
            from the nav panel, the footer's DSC column, and this page's own
            "Token drivers and downloads" alt link on step one. */}
        {related && <PanelLink to={related.path} label={answer.link.label} />}
        {/* ⚠️ `variant="tertiary"` IS the site's WhatsApp button — the same one
            ServiceLeaf's quote CTA and DscEsign already use — not a one-off
            green. Do not hand-roll `bg-whatsapp` here; that variant carries the
            contrast fixes recorded in Button.jsx.
            ⚠️ Its text is ink-950, NOT white: white on this green measures
            1.98:1. The brand-green exception itself is the one DESIGN.md §16
            already sanctions for a WhatsApp affordance. */}
        <Button
          as="a"
          href={dscEnquiryHref(`${answer.heading} for ${use.label}`)}
          target="_blank"
          rel="noopener noreferrer"
          variant="tertiary"
          className="ml-auto"
        >
          <IconBrandWhatsapp className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
          Apply on WhatsApp
        </Button>
      </motion.div>

      {/* ⛔ 07-09-2026 (Clinton): the cross-links. Every route EXCEPT the one
          being shown, so a reader who has landed on the wrong answer switches
          in one click rather than Back, Back, re-pick.

          ⚠️ DERIVED FROM `finderUses`, never a per-answer list. A hand-written
          set of alternatives on each of the ten answers is ten places to update
          when a fifth purpose is added, and nine of them would be missed —
          `finderUses` is already the one definition of what the purposes are.

          ⚠️ Ghost BUTTONS, not links. They change this component's state; they
          do not navigate. A `<Link>` styled to look the same would be a lie to
          a keyboard user (no href to open in a new tab, wrong role announced)
          and would need a real route to point at, which these do not have.
          Styling matches step one's `AltLink` so the two quiet rows read as one
          idiom.

          ⚠️ The row sits BELOW the actions, on its own hairline. Above them it
          would offer a reader a different answer before they have finished
          reading this one — the WhatsApp CTA is the primary action and has to
          stay the last emphatic thing on the page. */}
      {others.length > 0 && (
        <motion.div
          {...beat(5)}
          className="mt-8 border-t border-ink-100 pt-6"
        >
          <p className="text-body-sm font-medium text-ink-400">Not what you were after?</p>
          <ul className="mt-3 flex flex-wrap gap-x-7 gap-y-3">
            {others.map((other) => (
              <li key={other.key}>
                {/* ⛔ 07-09-2026 (Clinton): "write as direct name as write in
                    card otherwise it looks confuse." `label` — the exact string
                    on that route's choice card — never a second, reworded one.
                    A first cut used question-form `crossLabel`s and they read
                    as four new options rather than as the cards already seen.
                    The row's own label carries the question. */}
                <GhostJump label={other.label} onClick={() => onJump(other.key)} />
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/**
 * A quiet in-place switch on the result.
 *
 * ⚠️ A `<button>`, not a `<Link>` — see the ⛔ note at the call site. Visual
 * treatment is `AltLink`'s so step one's escape hatches and this row read as
 * the same device; the two are separate components because one navigates and
 * one does not, and collapsing them would mean an `as` prop for two call sites.
 */
function GhostJump({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 rounded-sm text-body-sm text-ink-500 underline-offset-4 transition-colors hover:text-ember-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
    >
      {label}
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * THE DOCUMENT PANEL — "make it look premium step document showing section"
 * (Clinton, 03-09-2026).
 *
 * A nested surface inside the result panel rather than a bare list, because
 * this is the part a reader acts on: they read it, gather things, and come
 * back to it. It carries its own header with a live count, its own control,
 * and its own footer link to the full checklists.
 *
 * ⚠️ THE SEGMENTED CONTROL USES `aria-pressed`, NOT `role="radio"`. Radios
 * carry a keyboard contract — arrow keys move between them under a roving
 * tabindex, and Tab enters the group once — that these do not implement. A
 * `role="radiogroup"` whose members only respond to Tab and Enter is a worse
 * lie to a screen-reader user than two honest toggle buttons in a labelled
 * group, which still announce their pressed state. Same pattern `TokenOrder`
 * already uses for its platform and quantity options.
 *
 * ⚠️ Numbers are `tabular-nums`: the count changes as the route changes (3 on
 * Aadhaar, 4 on PAN for an individual), and proportional digits make the
 * header shift under the reader's eye when it does.
 */
function DocumentPanel({ documents, notes, noKyc, kyc, onKyc, verificationNote, verification }) {
  const docCount = documentCount(documents);

  return (
    // ⛔ 07-09-2026 (Clinton): heading is "Documents Required", was "What to
    // have ready".
    // ⚠️ `aria-labelledby` POINTING AT THE HEADING, not a duplicated
    // `aria-label` — this landmark carried its own copy of the old string, so a
    // copy change had to be made in two places or the accessible name and the
    // visible heading would disagree. That is the label-content-name-mismatch
    // class of defect Phase 10 fixed on the logo. The name is now the heading
    // itself and cannot drift.
    <section
      aria-labelledby="finder-documents-heading"
      className="mt-10 border-t border-ink-200 pt-7"
    >
      {/* ⛔ 03-09-2026: was a mono uppercase label. It is a real heading — the
          reader stops here and starts gathering things — so it now reads as
          one: sans, `text-h4`, sentence case. `tabular-nums` stays on the
          count, which changes with the verification route (3 on Aadhaar, 4 on
          PAN for an individual); proportional digits make the row shift under
          the reader's eye when it does. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h4 id="finder-documents-heading" className="text-h4 text-ink-600">
          Documents Required
        </h4>
        {/* ⛔ 07-09-2026 (Clinton): "in document count, do not count email and
            phone number as document." `documentCount` filters the contact
            lines OUT OF THE COUNT ONLY — they still render in the list below,
            because an applicant does have to supply both. The predicate and the
            one false positive it had to be written around live in
            certificates.js. */}
        <p className="text-body-sm tabular-nums text-ink-400">
          {docCount} document{docCount === 1 ? "" : "s"}
        </p>
      </div>

      {!noKyc && <KycToggle value={kyc} onChange={onKyc} />}

      {/* Hairline-separated rows rather than a bulleted list: with no card
          around them the rules are what hold the checklist together as one
          object, and they also stop the two columns reading as one paragraph
          that happens to wrap. The tick is the block's single ember element. */}
      <ul className="mt-6 grid grid-cols-1 border-t border-ink-100 sm:grid-cols-2 sm:gap-x-12">
        {documents.map((item) => (
          <li
            key={item}
            className="flex gap-3 border-b border-ink-100 py-3.5 text-body-sm leading-relaxed text-ink-500"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-ember-600"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* ⛔ 05-09-2026 (Clinton): "from finder remove On this route all this
          section." The "On this route" block — the one that explained what the
          selected verification route changes — is GONE. The two remaining
          blocks answer different questions and each stays a labelled block on
          its own hairline, so a reader can skip the one that is not theirs.

          ⚠️ `kycRoutes[].note` is STILL WRITTEN in certificates.js and is now
          unrendered, the same discipline `portalGuide` / `afterIssue` /
          `answer.warn` already carry in this tree. Do not prune it on a later
          tidy-up — restoring this block is render-only.

          ⚠️ CONSEQUENCE, flagged rather than worked around: the KYC toggle is
          still here, so a reader can switch route and see the checklist and
          count change with no sentence saying WHY. That is the one thing this
          block was doing. */}
      {notes?.length > 0 && (
        <NoteBlock label="How to send them">
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span aria-hidden="true" className="text-ink-400">
                  —
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </NoteBlock>
      )}

      {/* ⛔ 07-09-2026 (Clinton): Statutory Filings' "Before you apply" is a
          structured block, not a sentence. `verification` (an object) and
          `verificationNote` (a string) are mutually exclusive per certificate —
          only `class-3-individual` carries the object today, and the other four
          keep their own one-line, non-video warnings. **No branching on slug**:
          the renderer picks on which field the resolved variant actually has.

          ⚠️ IT RENDERS AS FOUR `NoteBlock`s, not one, and that is the point of
          reusing the device. Each of the four answers a different question, so
          each keeps its own label in the 3-column rail and a reader can skip
          the ones that are not theirs — the same readability fix that split the
          old run-on grey paragraphs.

          ⚠️ NOTHING HERE IS FILLED. The answer panel is deliberately hairlines
          and type, with the KYC toggle's track as its only filled area (03-09).
          The example script is set off by a LEFT RULE, never a tinted box. */}
      {verificationNote && (
        <NoteBlock label="Before you apply">{verificationNote}</NoteBlock>
      )}

      {verification && <VerificationNotes verification={verification} hasNote={Boolean(verificationNote)} />}

      {/* ⛔ 03-09-2026: the "Full checklist and notes" link is GONE. It pointed
          at `/dsc#documents`, a section removed on Clinton's instruction the
          same day — and a link to a fragment that names nothing scrolls nowhere
          while looking like a real destination. This block IS the checklist
          now; there is nothing fuller to link to. */}
    </section>
  );
}

/**
 * One labelled note under the checklist. A 3/9 split so the labels line up in
 * their own column and the prose keeps a single left edge — three unlabelled
 * paragraphs stacked was the readability complaint this answers.
 *
 * ⚠️ Sans, not mono. See the ⛔ note on `SpecCell`.
 */
function NoteBlock({ label, children }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1.5 border-t border-ink-100 pt-5 sm:grid-cols-12">
      <p className="text-body-sm font-medium text-ink-400 sm:col-span-3">{label}</p>
      <div className="max-w-[68ch] text-body-sm leading-relaxed text-ink-500 sm:col-span-9">
        {children}
      </div>
    </div>
  );
}

/**
 * The video-verification block — see the ⛔ note at the call site.
 *
 * ⚠️ `hasNote` EXISTS TO STOP TWO BLOCKS CARRYING THE SAME LABEL. Three
 * certificates opt into this block and two of them ALSO keep their own
 * `verificationNote`, which already renders under "Before you apply" — so the
 * summary takes "Video verification" beside it, and only borrows "Before you
 * apply" on the certificate that has no note of its own (which is the
 * statutory/foreign case Clinton first specified). It keys on whether the note
 * is there, never on a slug.
 *
 * ⚠️ Every sub-block is guarded, so a variant may carry `summary` alone. A
 * heading rendered over an empty list reads as content that failed to load,
 * which is the defect `DriverPanel` had to be fixed for.
 */
function VerificationNotes({ verification, hasNote }) {
  const { summary, how, before, rejections } = verification;

  return (
    <>
      {summary && (
        <NoteBlock label={hasNote ? "Video verification" : "Before you apply"}>
          {summary}
        </NoteBlock>
      )}

      {how?.steps?.length > 0 && (
        <NoteBlock label={how.label}>
          {/* A real <ol>: these are three steps in order, and the numbers are
              the content rather than decoration, so they are not aria-hidden
              glyphs the way StepFlow's are. */}
          <ol className="space-y-2">
            {how.steps.map((step, index) => (
              <li key={step} className="flex gap-2.5">
                <span className="tabular-nums text-ink-400">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {how.script && (
            <>
              {how.scriptIntro && <p className="mt-4">{how.scriptIntro}</p>}
              {/* Left rule, not a tinted box. `<q>` would add the browser's own
                  quote marks on top of the ones the sentence needs; a
                  blockquote is what this is. */}
              <blockquote className="mt-3 border-l-2 border-ember-400 pl-4 text-ink-600">
                “{how.script}”
              </blockquote>
              {how.scriptNote && <p className="mt-3">{how.scriptNote}</p>}
            </>
          )}
        </NoteBlock>
      )}

      {before?.body && <NoteBlock label={before.label}>{before.body}</NoteBlock>}

      {rejections?.items?.length > 0 && (
        <NoteBlock label={rejections.label}>
          <ul className="space-y-2">
            {rejections.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="text-ink-400">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {rejections.closing && <p className="mt-3">{rejections.closing}</p>}
        </NoteBlock>
      )}
    </>
  );
}

function KycToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Verification route"
      className="mt-5 inline-flex gap-1 rounded-full border border-ink-200/15 bg-ink-50 p-1"
    >
      {kycRoutes.map((route) => {
        const active = route.key === value;
        return (
          <button
            key={route.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(route.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2",
              // ⛔ 03-09-2026 (Clinton): "for the white color i have use in tab
              // keep as it is." The active pill is WHITE on ember-400, changed
              // by Clinton directly, and it is to stay. Measured statically it
              // is **3.15:1** — under the 4.5:1 AA floor, and the exact pairing
              // CLAUDE.md's first non-negotiable forbids. It is kept on explicit
              // instruction, the same standing exception `Chip.jsx`'s active
              // variant already carries. ⚠️ DO NOT "FIX" THIS BACK TO ink-950;
              // it has been asked for by name. Flagged, not changed.
              //
              // The INACTIVE half is ink-500, not ink-400: it sits on ink-50,
              // where ink-400 is under the floor.
              active ? "bg-ember-400 text-white shadow-sm" : "text-ink-500 hover:text-ink-600"
            )}
          >
            {route.label}
          </button>
        );
      })}
    </div>
  );
}

function PanelLink({ to, label }) {
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

function SpecCell({ label, value, span }) {
  return (
    // `bg-canvas` matches the `light` section exactly (Section.jsx), which is
    // what makes the `gap-px` mesh above read as hairlines rather than as a
    // tinted table. Change the section's surface and this has to change with it.
    // No left padding and no background: see the grid's own note. `pr-8` is the
    // gutter between columns, and it is on every cell rather than being a
    // `last:` exception for the same reason — a grid item cannot know whether
    // it ends a row.
    <div className={cn("border-b border-ink-200 py-5 pr-8", span)}>
      {/* ⛔ 03-09-2026 (Clinton): "do not use font mono and fixed the font
          weight also… show details properly right now it look confusion to
          read." These labels were mono UPPERCASE with letter-spacing — five of
          them stacked in one grid, which is a lot of shouting above the values
          a reader is actually here for. Plain sans, sentence case, and the
          EMPHASIS IS INVERTED: the label is now the quiet half (regular weight,
          ink-400) and the value the loud one (medium, ink-600). It was the
          other way round. */}
      <dt className="text-body-sm text-ink-400">{label}</dt>
      <dd className="mt-1.5 text-body font-medium leading-relaxed text-ink-600">{value}</dd>
    </div>
  );
}
