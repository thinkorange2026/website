import { useSyncExternalStore } from "react";
import { hasHardwareGpu } from "@/lib/gpu";

// The capability never changes within a page's lifetime, so there is nothing
// to subscribe to — but useSyncExternalStore still requires a subscribe
// function, and it must be module-scope stable or React resubscribes on every
// render. Returning a no-op unsubscribe is the documented shape for a store
// that never emits.
const subscribe = () => () => {};
const getSnapshot = () => hasHardwareGpu();
const getServerSnapshot = () => false;

/**
 * False on the server and during hydration; true afterwards only if WebGL is
 * backed by real hardware. See src/lib/gpu.js for the measurements.
 *
 * ⚠️ `useSyncExternalStore`, NOT `useState` + `useEffect`, and not a bare call
 * during render. Three constraints have to hold at once and this is the only
 * shape that meets all three:
 *
 *  1. HYDRATION. Every route is prerendered (Phase 9) and `document` does not
 *     exist in that pass, so the server can only answer "no". Reading the real
 *     answer during the client's first render would make the two disagree on
 *     any machine that does have a GPU — a mismatch on the busiest route on
 *     the site. `getServerSnapshot` is what React uses while hydrating, so the
 *     first client render matches the server by construction and the real
 *     value arrives in the commit straight after.
 *  2. `react-hooks/set-state-in-effect`. A `setState` sitting synchronously in
 *     an effect body is rejected outright — it triggers a cascading render.
 *     (The same rule caught `useMountedAt` in Phase 8 and the mega-panel's ref
 *     sync; this hook's first draft walked into it too.)
 *  3. CONSISTENCY. React may call `getSnapshot` several times in one render
 *     and requires the same value each time. `hasHardwareGpu()` memoises after
 *     its first call, so it is stable from the second onward and the one-time
 *     context creation happens once per page, not once per render.
 */
export function useHardwareGpu() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
