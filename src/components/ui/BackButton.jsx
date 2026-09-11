import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

// One "Back" control, light or dark.
//
// ⛔ Extracted from the DSC finder on 11-09-2026, when its only consumer stopped
// being the finder. It was the wizard's step-back control; the wizard is gone
// (a choice card on /dsc navigates straight to the intent page now), and what
// needs it is `PageHero`, where it is a link out rather than a step back.
//
export function BackButton({ onClick, to, onDark = false }) {
  // ⚠️ A `<Link>` when it navigates, a `<button>` when it changes state. On
  // /dsc/<intent> "Back" means "back to the finder", which is a real URL —
  // middle-click, Cmd-click and "copy link address" all have to work, and the
  // announced role has to match. In the wizard it meant "back one step" and
  // went nowhere.
  const Tag = to ? Link : "button";
  const tagProps = to ? { to } : { type: "button", onClick };
  return (
    <Tag
      {...tagProps}
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
    </Tag>
  );
}
