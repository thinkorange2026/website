import { useSyncExternalStore } from "react";

// Nothing to subscribe to — the answer flips exactly once, when React commits
// the hydration render, and React re-reads the snapshot itself at that point.
// Must be module-scope stable or React resubscribes on every render.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during SSR **and during the client's hydration render**; true from the
 * first commit afterwards.
 *
 * ⛔ THIS IS THE FIX FOR THE SITEWIDE REACT #418, and the distinction it draws
 * is the whole point. `typeof document !== "undefined"` answers "am I in a
 * browser", which is TRUE on the client's very first render — so a subtree
 * guarded that way is absent from the prerendered HTML and present the instant
 * React hydrates. That is a mismatch, and it is the first bullet in React's own
 * error text ("a server/client branch `if (typeof window !== 'undefined')`").
 *
 * What is needed instead is "has hydration finished", which is false on both
 * sides during the hydration pass and therefore cannot mismatch.
 *
 * ⚠️ `useSyncExternalStore`, not `useState` + `useEffect`: a synchronous
 * setState in an effect body is rejected by `react-hooks/set-state-in-effect`
 * (the rule that caught `useMountedAt` in Phase 8 and `useHardwareGpu`'s first
 * draft). `getServerSnapshot` is the supported way to say "render this as the
 * server would until hydration is done".
 *
 * Use it for anything that genuinely cannot exist server-side — a portal into
 * `document.body`, a measurement of the real viewport. Do NOT reach for it to
 * paper over a mismatch whose real cause is non-deterministic content; that
 * hides the bug and costs a second render.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
