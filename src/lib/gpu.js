// HARDWARE-GPU DETECTION — 21-09-2026, PageSpeed Insights (desktop 53 /
// mobile 28, TBT 20,260ms desktop and 11,130ms mobile).
//
// ⛔ WHY THIS EXISTS, and it corrects a conclusion recorded three times in
// CLAUDE.md (Phase 4, the DarkVeil session, Phase 10): that low fps measured
// under software rendering is "a harness artefact — disregard". That was true
// of a locally-launched `--use-angle=swiftshader` Chrome and FALSE as a general
// rule. **PageSpeed Insights runs exactly that environment**, and so does a
// low-end Android phone. The numbers were never noise; they were a preview.
//
// What PSI measured: main-thread "Other" (rasterisation) 27,811ms on desktop
// and 33,007ms on mobile, against just 736ms / 1,318ms of script evaluation.
// Not a JavaScript problem at all — the DarkVeil CPPN's per-pixel maths
// landing on the main thread because there is no GPU to do it in parallel.
// Long tasks were ~600ms each, repeating every ~600ms from 3.7s to 22.3s: a
// render loop where each frame costs 600ms.
//
// Reproduced locally against the production build under
// `--use-angle=swiftshader`, three arms, frame time measured over 8s:
//     A  as shipped ................. 10.5 fps   (95ms/frame)
//     B  veil canvas removed ........ 33.3 fps   (30ms/frame)
//     C  B + all animation disabled .. 58.8 fps  (17ms/frame)
// i.e. the shader alone costs ~65ms/frame and every other animation on the
// page combined costs ~13ms. It is ~5x everything else put together.
//
// ⚠️ This is NOT only a synthetic-benchmark fix. The same check catches real
// devices with no usable GPU acceleration, which on this site's audience
// (pan-India, mobile-heavy) is a material share of real traffic. They get the
// static `--gradient-deep` base layer instead, which is the same fallback
// `prefers-reduced-motion` already ships — so there is nothing new to design
// and nothing that can look half-built.

// Software renderers, by the string they report. SwiftShader is Chrome's own
// (and what PSI runs); llvmpipe/softpipe are Mesa's; "Microsoft Basic Render
// Driver" is Windows WARP, which is what a machine with no working display
// driver falls back to.
const SOFTWARE = /swiftshader|llvmpipe|softpipe|soft(ware)?\s*render|basic\s*render|mesa\s*offscreen|generic\s*renderer/i;

let cached;

/**
 * True when WebGL is available AND backed by real hardware.
 *
 * Memoised — it creates a throwaway context, which is not free, and the answer
 * cannot change within a page's lifetime.
 *
 * ⚠️ Returns FALSE when WebGL is missing entirely, and TRUE when the renderer
 * string is unavailable but a context was created. That asymmetry is
 * deliberate: some privacy-hardened browsers (Firefox with
 * `privacy.resistFingerprinting`, Brave at its strictest) mask
 * WEBGL_debug_renderer_info, and those users overwhelmingly do have a GPU —
 * punishing them for a masked string would cost the effect on real hardware to
 * chase a case we cannot detect. PSI's own Chrome reports the string plainly
 * ("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device ...)"), verified, so the
 * case this exists for is covered.
 */
export function hasHardwareGpu() {
  if (cached !== undefined) return cached;
  if (typeof document === "undefined") return false; // SSR — never cache this

  let gl = null;
  try {
    const canvas = document.createElement("canvas");
    // `failIfMajorPerformanceCaveat` asks the browser to refuse a context it
    // would only be able to back with software. Support is uneven, so it is a
    // first line of defence, not the whole check — the renderer string below
    // is what actually decides.
    const attrs = { failIfMajorPerformanceCaveat: true, depth: false, antialias: false };
    gl = canvas.getContext("webgl2", attrs) || canvas.getContext("webgl", attrs);
  } catch {
    // Some browsers throw rather than returning null when WebGL is blocked.
    // `gl` is still null from its initialiser, so there is nothing to reset.
  }

  if (!gl) {
    cached = false;
    return cached;
  }

  let renderer = "";
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "");
  } catch {
    renderer = "";
  }

  // Release the probe context immediately. Browsers cap the number of live
  // WebGL contexts (~16 in Chrome) and silently drop the OLDEST when that cap
  // is hit — leaving this one alive would spend one of those for the life of
  // the page, for a question already answered.
  try {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* nothing to do — the context is garbage either way */
  }

  cached = renderer ? !SOFTWARE.test(renderer) : true;
  return cached;
}
