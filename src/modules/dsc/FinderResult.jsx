import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { ArrowRight, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  certificateVariant,
  documentCount,
  documentsFor,
  kycRoutes,
} from "@/content/dsc/certificates";
import { finderUses } from "@/content/dsc/finder";
import { findBySlug } from "@/content/nav";
import { dscEnquiryHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

// THE ANSWER CARD — extracted from DscFinder.jsx on 11-09-2026 because it now
// has two consumers, and they must never diverge.
//
// ⛔ Clinton, 11-09-2026, on the first cut of the four intent pages: "the pages
// is over informative... keep and same it is showing in when select to card, no
// need to create many section, just keep it same but in different route." The
// first version of /dsc/statutory-filings and friends rebuilt the answer as a
// seven-section page — intro, portal table, per-signer breakdown, documents,
// video verification, FAQs, related. That was a different artefact wearing the
// same data. What was asked for is THIS card, on its own URL.
//
// So this is one component rendered in two places:
//   1. `DscFinder` — as the wizard's third step, after two questions.
//   2. `DscIntent` — as the whole body of /dsc/<intent>, prerendered.
//
// ⚠️ EVERY DIFFERENCE BETWEEN THE TWO IS A PROP, never a branch on which page
// we are on. `onBack` is omitted on the page (there is no previous step to go
// back to), and the cross-links take `jumpPathFor` there and `onJump` in the
// wizard — because on a page they are real navigation and in the wizard they
// are a state change. Anything else that starts to differ belongs in this list,
// not in an `isPage` flag.

// `--ease-out` from theme.css. Written as a literal here rather than exported
// from one place, because that is what this codebase already does — the same
// four numbers appear in Reveal, Stagger, SectionHeading, ScrollNav, Header and
// the homepage hero. motion needs an array and CSS custom properties are not
// readable at module scope, so a shared export would be a new convention for
// one file rather than a fix.
const EASE = [0.22, 1, 0.36, 1];


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
export function FinderResult({
  answer,
  use,
  signerLabel,
  kyc,
  onKyc,
  onJump,
  jumpPathFor,
  shareUrl,
  intentPage,
  onShare,
  onApply,
  reduceMotion,
}) {
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
      {/* ⛔ NO BACK CONTROL HERE ANY MORE (11-09-2026). The wizard that had a
          previous step is gone — a choice card on /dsc navigates straight to
          the page — and the page's own "Back" now sits in the hero, beside the
          breadcrumb, because that is what "on top" means. Two back affordances
          on one page, one of them 759px down, was the first cut. */}
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
        {/* ⛔ 11-09-2026: the answer now has a PAGE, and this is the link to
            it. The finder is the fast route to a certificate name; the intent
            page is the same answer with every signer, both verification
            checklists, the portal table and the video-verification steps — all
            of it prerendered, which is what the finder's own result can never
            be. Leading the row because it is the natural "and then?" for
            someone who wants the detail rather than the answer. */}
        {intentPage && (
          <PanelLink to={`/dsc/${intentPage.slug}`} label={`Full guide: ${intentPage.eyebrow}`} />
        )}
        {related && <PanelLink to={related.path} label={answer.link.label} />}
        {/* ⛔ 11-09-2026 (Clinton): "added a share button on left side of
            apply." The two buttons are ONE right-aligned group rather than two
            `ml-auto` siblings — `ml-auto` on each would push them apart to
            opposite ends of the row, and the pair has to read as one cluster
            with Share subordinate to Apply.

            ⚠️ Share is `secondary`, never a second filled button. It is the
            lesser of the two actions and the WhatsApp CTA has to stay the one
            emphatic thing at the foot of the answer — DESIGN.md §12.1's whole
            point, and the reason the "Buy the token" button was removed from
            this row rather than restyled. */}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <ShareButton
            url={shareUrl}
            title={`${answer.heading} — ${use.label}`}
            onShare={onShare}
          />
          {/* ⚠️ `variant="tertiary"` IS the site's WhatsApp button — the same one
              ServiceLeaf's quote CTA and DscEsign already use — not a one-off
              green. Do not hand-roll `bg-whatsapp` here; that variant carries the
              contrast fixes recorded in Button.jsx.
              ⚠️ Its text is ink-950, NOT white: white on this green measures
              1.98:1. The brand-green exception itself is the one DESIGN.md §16
              already sanctions for a WhatsApp affordance. */}
          {/* ⚠️ `dsc_finder_apply` fires ALONGSIDE the delegated
              `whatsapp_click` this anchor already produces — two event names,
              not a double count, the same arrangement TokenOrder documents.
              `whatsapp_click` answers "how many people reached out on
              WhatsApp"; this one answers "from which certificate", which the
              delegated listener cannot know and deliberately never sends (it
              transmits the link's visible text, never its href). */}
          <Button
            as="a"
            href={dscEnquiryHref(`${answer.heading} for ${use.label}`)}
            target="_blank"
            rel="noopener noreferrer"
            variant="tertiary"
            onClick={onApply}
          >
            <IconBrandWhatsapp className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
            Apply on WhatsApp
          </Button>
        </div>
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
          <p className="text-body-sm font-medium text-ink-400 xl:text-body">Not what you were after?</p>
          <ul className="mt-3 flex flex-wrap gap-x-7 gap-y-3">
            {others.map((other) => (
              <li key={other.key}>
                {/* ⛔ 07-09-2026 (Clinton): "write as direct name as write in
                    card otherwise it looks confuse." `label` — the exact string
                    on that route's choice card — never a second, reworded one.
                    A first cut used question-form `crossLabel`s and they read
                    as four new options rather than as the cards already seen.
                    The row's own label carries the question. */}
                {/* ⚠️ A LINK ON THE PAGE, A BUTTON IN THE WIZARD, and the
                    distinction is real rather than cosmetic: in the wizard
                    these change this component's state and go nowhere, so a
                    styled <Link> would announce the wrong role and offer a
                    meaningless open-in-new-tab; on /dsc/<intent> they are
                    genuine navigation to another URL, so a button would break
                    middle-click, Cmd-click and "copy link address". */}
                {jumpPathFor ? (
                  <GhostJump label={other.label} to={jumpPathFor(other.key)} />
                ) : (
                  <GhostJump label={other.label} onClick={() => onJump(other.key)} />
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Share the answer.
 *
 * ⛔ 11-09-2026 (Clinton): "added a share button on left side of apply to share
 * that selected dsc." What it hands out is the finder's own URL with the
 * selection in the query string and `#finder` on the end — see `finderUrl.js`
 * for why the fragment is part of it and why the origin is `site.domain`
 * rather than wherever this happens to be running.
 *
 * ⚠️ `navigator.share` FIRST, where it exists. On a phone that opens the OS
 * sheet, which is where a link like this is actually going — WhatsApp, a
 * colleague, an email to an accountant — and a clipboard copy there is a
 * strictly worse version of the same action. It must be called from the
 * gesture, so it is awaited inside the handler rather than deferred.
 *
 * ⚠️ NO TOAST, deliberately, though the site has one mounted. Sonner's Toaster
 * is lazy and gated on `useIdleMount`, so a toast is not guaranteed to be
 * mountable at the moment it is asked for — and "did that work?" is the one
 * question this button must always answer. An inline label change cannot fail,
 * needs no dependency, and keeps sonner out of this route's chunk.
 */
function ShareButton({ url, title, onShare }) {
  // "idle" | "copied" | "error". Not a boolean, because the failure case has
  // to say something different from the success case.
  const [status, setStatus] = useState("idle");
  const timerRef = useRef(0);

  // The timer outlives the component if a reader jumps to another answer
  // within the two seconds — `AnimatePresence` unmounts this whole subtree.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function flash(next) {
    setStatus(next);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus("idle"), 2200);
  }

  async function share() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        onShare?.("web_share");
        return;
      } catch (error) {
        // ⚠️ AbortError is the reader CLOSING the sheet, not a failure — and
        // falling through to a clipboard copy there would be doing the thing
        // they just declined. Anything else (a browser that advertises
        // `share` but refuses this payload) falls through on purpose.
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
      onShare?.("clipboard");
    } catch {
      // Reachable only outside a secure context or with the clipboard
      // permission denied — i.e. essentially never in production, which is
      // served over https. The honest fallback is to say so rather than to
      // report a copy that did not happen.
      flash("error");
    }
  }

  const label =
    status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Share";

  return (
    <Button type="button" variant="secondary" onClick={share}>
      {status === "copied" ? (
        <Check className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Share2 className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
      )}
      {/* `aria-live` because the label of a button you just pressed is not
          reliably re-announced.

          ⛔ NO WIDTH RESERVATION HERE, and the first cut was wrong to add one.
          It carried `min-w-[6ch]` to hold the box across "Share" -> "Copied",
          which left ~25px of dead space between the label and the button's
          right edge — visibly lopsided against the icon's own padding on the
          left, permanently, to fix a two-second reflow.

          The reflow it was guarding against does not happen anyway: this
          button sits in an `ml-auto` group, so the group's RIGHT edge is
          pinned and any extra width extends LEFTWARDS. The WhatsApp button
          beside it does not move — only this button's own left edge does. */}
      <span aria-live="polite">{label}</span>
    </Button>
  );
}

/**
 * A quiet in-place switch on the result.
 *
 * ⛔ 11-09-2026 (Clinton): `xl:text-body`. See the note on `DocumentPanel`'s
 * checklist for why this is a local bump on top of the sitewide xl step-up.
 * ⚠️ `AltLink` — step one's escape hatches, deliberately styled to read as the
 * same idiom as this row, with a byte-identical class string — was NOT bumped,
 * because the instruction named this row. The two are never on screen
 * together, so the divergence is invisible in practice; give `AltLink` the
 * same class if that pairing should hold at xl too.
 *
 * ⚠️ A `<button>`, not a `<Link>` — see the ⛔ note at the call site. Visual
 * treatment is `AltLink`'s so step one's escape hatches and this row read as
 * the same device; the two are separate components because one navigates and
 * one does not, and collapsing them would mean an `as` prop for two call sites.
 */
function GhostJump({ label, onClick, to }) {
  const Tag = to ? Link : "button";
  const tagProps = to ? { to } : { type: "button", onClick };
  return (
    <Tag
      {...tagProps}
      className="group inline-flex items-center gap-1.5 rounded-sm text-body-sm text-ink-500 underline-offset-4 transition-colors hover:text-ember-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 xl:text-body"
    >
      {label}
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Tag>
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
          that happens to wrap. The tick is the block's single ember element.

          ⛔ 11-09-2026 (Clinton): "i want to change the font after xl screen in
          this dsc small font use in document require[d] and Not what you were
          after?" — so the checklist, both halves of every `NoteBlock` and the
          cross-links row step up to `text-body` at xl.

          ⚠️ THIS IS ON TOP OF THE SITEWIDE XL STEP-UP, not instead of it.
          theme.css already resumes the whole scale past 1280px (body-sm
          14 -> 15.5px by 1800px), which is a token-level change and stays.
          This is a local promotion of one block from the small step to the
          body step, because this checklist is the thing a reader actually
          works from on a large screen — 15.5px across a 1296px measure is a
          caption, not a list you tick items off.

          ⚠️ `xl:` is 1280px, exactly the breakpoint theme.css's step-up uses,
          so the two start together and there is no second, closer breakpoint
          for a reader to notice on a resize. Keep them aligned. */}
      <ul className="mt-6 grid grid-cols-1 border-t border-ink-100 sm:grid-cols-2 sm:gap-x-12">
        {documents.map((item) => (
          <li
            key={item}
            className="flex gap-3 border-b border-ink-100 py-3.5 text-body-sm leading-relaxed text-ink-500 xl:text-body"
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
      <p className="text-body-sm font-medium text-ink-400 sm:col-span-3 xl:text-body">{label}</p>
      <div className="max-w-[68ch] text-body-sm leading-relaxed text-ink-500 sm:col-span-9 xl:text-body">
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
