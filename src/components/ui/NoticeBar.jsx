import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, Megaphone } from "lucide-react";

// A single, page-specific notice, running as a ONE-LINE infinite marquee.
// Added 05-09-2026 for the About HYP2003 page (Clinton: "keep this part … as
// notice bar just below the hero section"), then moved to a carousel the same
// day ("in notification bar, show as one line in infinite carrousel") — it was
// wrapping to two lines on the full-bleed strip, which reads as a paragraph
// pinned under the hero rather than as a notice.
//
// ⚠️ DELIBERATELY NOT `NoticeBoard` AND NOT `NoticeTicker`, though all three
// render notices and this one now shares the ticker's mechanism exactly:
//   NoticeBoard   a SECTION of several rows off notices.js, with links.
//   NoticeTicker  the homepage marquee, driven by `noticesFor("site")`.
//   NoticeBar     ONE notice, taken as a PROP, because the claim belongs to the
//                 page it sits on. A notice true of every DSC surface belongs
//                 in notices.js and on the ticker instead.
//
// Everything below the prop boundary is deliberately identical to
// `NoticeTicker` — same surface, same measured duration, same margin-not-gap
// rule, same fade placement, same reduced-motion fallback. One content type
// should not carry two different grammars on two surfaces of one site. If you
// fix a marquee bug in one of these files, fix it in the other.

// ⚠️ ONE GROUP MUST BE AT LEAST AS WIDE AS THE WIDEST WINDOW THIS EVER RENDERS
// IN. `translateX(-50%)` travels exactly one group, so at the loop point the
// trailing group still has to cover the whole visible strip — otherwise there
// is dead space behind the last copy before it snaps back, which reads exactly
// as "it finishes, then starts again". This bar is FULL-BLEED, so the window is
// the viewport, not the 1800px container: budget for ~2560px.
//
// ⚠️ THIS BAR CARRIES ONE SENTENCE, so the margin for error is far thinner than
// the homepage ticker's.
//
// ⛔ RAISED 2 -> 4 ON 20-09-2026, and this was a real bug rather than padding.
// The type scale caps at 1800px (theme.css's xl step-up), so a group's width
// stops growing there while the VIEWPORT does not. Measured with the homepage
// notice at 2 passes: 2659.5px against a 2560px window — 99px of headroom, and
// NEGATIVE on any monitor wider than that. Past the loop point the window then
// needs content beyond the second group and there is none, so a visible strip
// of empty ember slides in at the right edge before it snaps back. The previous
// note only checked 2560px with a longer sentence and concluded there was
// ~1100px spare; that was true of that sentence and is not a property of the
// component.
//
// At 4 passes the same notice measures 5319px, which clears 5K (5120px). The
// cost is 4 extra spans in the DOM and a longer loop PERIOD only — `SPEED` is
// pixels per second and the duration is measured, so the strip moves at exactly
// the same visible speed.
//
// ⚠️ Still re-measure `groupWidth >= innerWidth` whenever this text changes: a
// SHORTER notice eats the headroom directly.
const GROUP_PASSES = 4;

// Pixels per second. Matches NoticeTicker: full sentences have to be readable
// in passing without the strip looking frozen.
const SPEED = 55;

// ⛔ `href` MAKES THE WHOLE STRIP THE CLICK TARGET, never the moving words
// (Clinton, 20-09-2026: "while click redirect to details page"). That is the
// only way this can be a link and still be usable: a target that is physically
// sliding out from under the cursor is hostile, and the track is DUPLICATED for
// the loop, so a link inside it would exist twice in the tab order pointing at
// one place — `aria-hidden` silences a screen reader but does NOT remove
// anything from the tab order. `NoticeTicker`'s own header records why it
// refuses links for exactly this reason; wrapping the window rather than the
// content is what sidesteps it.
//
// The accessible name comes from the single `sr-only` copy inside, so the link
// is announced once, in full, with the notice's real words.
export function NoticeBar({ label, text, href }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef(null);

  // ⚠️ DURATION IS MEASURED, NOT HAND-COMPUTED. TrustStrip's hand-tuned value
  // was tied to a group width that later changed and quietly slowed it to
  // ~15px/s; here the element measures itself, so editing the copy can never
  // leave the speed wrong.
  //
  // Written straight to the DOM in an effect rather than through state: it must
  // not differ between the server render and the client's first pass, or it is
  // a hydration mismatch. SSR and first render both use the CSS default.
  useEffect(() => {
    const node = trackRef.current;
    if (!node || reduceMotion) return;
    const setDuration = () => {
      // scrollWidth is BOTH halves; one group is half of it.
      const groupWidth = node.scrollWidth / 2;
      if (groupWidth > 0) node.style.setProperty("--marquee-duration", `${groupWidth / SPEED}s`);
    };
    setDuration();
    // Fonts swap and the viewport changes; both move the measured width.
    const observer = new ResizeObserver(setDuration);
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  if (!text) return null;

  const group = Array.from({ length: GROUP_PASSES }, () => null);
  const track = [...group, ...group];

  const inner = (
    <>
      {reduceMotion ? (
        // DESIGN.md §9.6: reduced motion gets the static equivalent, not a
        // marquee frozen mid-slide — the global floor would otherwise collapse
        // the animation to its END state, i.e. the track parked at -50%. Here
        // the notice is allowed to wrap, because it is no longer moving.
        <div className="mx-auto flex max-w-[1800px] px-6 md:px-10 lg:px-18">
          <Notice label={label} text={text} href={href} static />
        </div>
      ) : (
        <>
          {/* Decorative and duplicated — the single real copy is below, in
              sr-only, so a screen reader hears the notice exactly once. */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="flex w-max animate-[marquee_var(--marquee-duration,60s)_linear_infinite] hover:[animation-play-state:paused]"
          >
            {track.map((_, index) => (
              <Notice key={index} label={label} text={text} href={href} />
            ))}
          </div>
          <p className="sr-only">
            Notice: {label} — {text}
          </p>
        </>
      )}
    </>
  );

  return (
    <section
      data-surface="light-alt"
      aria-label="Notice"
      // ⚠️ `.marquee-fade` BELONGS ON THIS WINDOW, NOT ON THE TRACK. The mask
      // resolves against the element carrying it — put it on the sliding `w-max`
      // track and the soft edges slide with the content instead of staying
      // pinned to the viewport edges.
      // ⚠️ ember-50 costs NOTHING against the ~12% orange ceiling: at 0.09
      // saturation it is below the 0.35 threshold the hue census counts as ember
      // at all. Measured on this tint: body ink-500 9.41:1, label ember-600
      // 4.79:1. It also has to be `light-alt` rather than anything dark — the
      // hero above is `deep`, and two adjacent dark-family surfaces read as one
      // slab with no fold, which a cadence check comparing TOKENS passes.
      className="marquee-fade relative overflow-hidden border-y border-ember-100 bg-ember-50 py-3.5"
    >
      {href ? (
        // ⚠️ The focus ring is INSET. This section is `overflow-hidden` (the
        // marquee window), so an ordinary outline on a child that fills it is
        // clipped away and the control looks unfocusable to a keyboard user.
        // `hover:` is Tailwind-gated to real pointers, so `active:` supplies the
        // only feedback a touch user gets from a tap.
        <Link
          to={href}
          className="block transition-colors duration-[var(--dur-fast)] hover:bg-ember-100 active:bg-ember-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember-500"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </section>
  );
}

function Notice({ label, text, href, static: isStatic }) {
  return (
    // ⚠️ `mr-14` on the ITEM, never a `gap` on the parent, and it is
    // load-bearing rather than stylistic. A seamless -50% loop needs the two
    // halves to be exact pixel mirrors; flex `gap` sits BETWEEN items, so a
    // doubled N-item row has (2N-1) gaps — an odd count for an even total — and
    // half the row's width lands half a gap short of where the second copy must
    // start. Margin gives every item its own trailing space, so the row really
    // is 2x one group and -50% is exact. (Learned the hard way in TrustStrip;
    // do not "tidy" this into a gap.)
    <span className={isStatic ? "flex items-center gap-3" : "mr-14 flex shrink-0 items-center gap-3"}>
      {/* ⛔ ember-700, NOT the ember-600 this file used until 20-09-2026 and
          that NoticeBoard's rows still use. MEASURED: the 11px label at
          ember-600 is 4.79:1 on the bar's own ember-50 ground — a pass — but
          only 4.04:1 once a LINKED bar deepens to ember-100 on hover, under the
          4.5:1 floor. WCAG applies to every state, so the resting pass was not
          enough. ember-700 is 6.64:1 at rest and 5.60:1 on hover.
          ⚠️ Applied to BOTH instances rather than only the linked one: a third
          label colour inside one component is drift, and this strictly improves
          the unlinked bar too. NoticeBoard is untouched — its rows sit on WHITE,
          where the pair is a different measurement. */}
      <Megaphone
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-ember-700"
        strokeWidth={1.75}
      />
      {label && (
        <span className="shrink-0 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ember-700">
          {label}
        </span>
      )}
      {/* ⛔ ONE LINE — `whitespace-nowrap` on the moving copy is the whole
          instruction. In the static reduced-motion row it must be allowed to
          wrap, or a long notice runs off the side with no way to read it. */}
      <span className={isStatic ? "text-body-sm text-ink-500" : "whitespace-nowrap text-body-sm text-ink-500"}>
        {text}
      </span>
      {/* Only when the bar leads somewhere, so an unlinked bar is unchanged.
          Duplicated with the track, which is harmless — the whole track is
          aria-hidden and the sr-only copy carries the real name. */}
      {href && (
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-ember-700"
          strokeWidth={1.75}
        />
      )}
    </span>
  );
}
