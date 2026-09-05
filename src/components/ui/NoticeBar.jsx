import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Megaphone } from "lucide-react";

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
// the homepage ticker's. MEASURED at a 2560px viewport: one group (2 passes of
// the current notice) is 3664px, so it clears the window with ~1100px to spare.
// A SHORTER notice eats that headroom directly — re-measure `groupWidth >=
// innerWidth` at 2560px whenever this text changes, and raise this to 3 if it
// no longer holds.
const GROUP_PASSES = 2;

// Pixels per second. Matches NoticeTicker: full sentences have to be readable
// in passing without the strip looking frozen.
const SPEED = 55;

export function NoticeBar({ label, text }) {
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
      {reduceMotion ? (
        // DESIGN.md §9.6: reduced motion gets the static equivalent, not a
        // marquee frozen mid-slide — the global floor would otherwise collapse
        // the animation to its END state, i.e. the track parked at -50%. Here
        // the notice is allowed to wrap, because it is no longer moving.
        <div className="mx-auto flex max-w-[1800px] px-6 md:px-10 lg:px-18">
          <Notice label={label} text={text} static />
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
              <Notice key={index} label={label} text={text} />
            ))}
          </div>
          <p className="sr-only">
            Notice: {label} — {text}
          </p>
        </>
      )}
    </section>
  );
}

function Notice({ label, text, static: isStatic }) {
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
      <Megaphone
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-ember-600"
        strokeWidth={1.75}
      />
      {label && (
        <span className="shrink-0 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ember-600">
          {label}
        </span>
      )}
      {/* ⛔ ONE LINE — `whitespace-nowrap` on the moving copy is the whole
          instruction. In the static reduced-motion row it must be allowed to
          wrap, or a long notice runs off the side with no way to read it. */}
      <span className={isStatic ? "text-body-sm text-ink-500" : "whitespace-nowrap text-body-sm text-ink-500"}>
        {text}
      </span>
    </span>
  );
}
