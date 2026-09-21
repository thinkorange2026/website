// Generates the square favicon / app-icon set FROM THE CLIENT'S OWN MARK.
//
// ⛔ THE SOURCE IS `public/favicon.svg` AND NOTHING ELSE. Clinton, 21-09-2026:
// "this are my icon so use this icon do not user generate logo. if need to
// generate according to size change from this icons." An earlier version of
// this script drew its own arc plate; that is gone and must not come back.
// This script only ever RESIZES and PADS the supplied artwork — it never draws.
//
// ⚠️ NOT wired into `npm run build`. The mark does not change between deploys,
// so rasterising five byte-identical files every time is waste. Run it by hand
// (`node scripts/icons.mjs`) whenever `public/favicon.svg` changes, and commit
// the output.
//
// ---------------------------------------------------------------------------
// WHY THE OUTPUT IS SQUARE AND WHITE, when the source is neither
//
// 1. SQUARE. The supplied mark is 634x379 (1.67:1) with a transparent ground.
//    Every icon slot on every platform is a SQUARE box, and a browser does not
//    crop a favicon intelligently — it fits the whole thing, so a wide source
//    renders as a letterboxed sliver with empty bands above and below. So the
//    mark is centred on a square canvas with real padding instead.
//
// 2. WHITE. MEASURED, not chosen by taste. The mark's "T" is #0A2957, a very
//    dark navy. Against the site's ink-950 (#070C1C) that is **1.36:1** — for
//    practical purposes invisible, so half the logo would vanish on a dark
//    plate. Against white it is 14.31:1. The "O" (#FF8302) reads on both
//    (7.88:1 on ink, 2.47:1 on white); the O is a large solid shape rather than
//    text, and the T is what anchors the monogram, so white is the only ground
//    on which the WHOLE mark survives. Transparent is not an option either:
//    iOS composites a transparent apple-touch-icon unpredictably, and a
//    maskable icon must be fully opaque by spec.
// ---------------------------------------------------------------------------
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public", "favicon.svg");
const OUT = path.join(ROOT, "public", "icons");

const PLATE = "#FFFFFF";
const svg = readFileSync(SRC);
const { width: SRC_W, height: SRC_H } = await sharp(svg).metadata();
const AR = SRC_H / SRC_W;

/**
 * @param markRatio  the mark's width as a fraction of the canvas.
 *   0.78 for ordinary icons — comfortable optical padding.
 *   ⚠️ 0.62 for MASKABLE. Android may crop a maskable icon to a circle of
 *   diameter 0.8 x the canvas, so a centred rectangle has to fit inside that
 *   circle by its CORNERS, not its edges: w² + (w·AR)² <= (0.8·size)² gives a
 *   ceiling of ~0.86 x 0.8 = 0.68 for this aspect ratio. 0.62 keeps margin.
 * @param radius  corner rounding. 0 for plates the OS masks itself (apple,
 *   maskable, PWA) — a pre-rounded plate shows as a pale halo inside the
 *   platform's own mask. Browsers do NOT round favicons, so the favicon plate
 *   rounds itself.
 */
async function icon({ name, size, markRatio, radius }) {
  const markW = Math.round(size * markRatio);
  const markH = Math.round(markW * AR);
  // Downscaling from 634px natural width in every case, so no upscale blur.
  const mark = await sharp(svg).resize(markW, markH, { fit: "contain" }).png().toBuffer();
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${radius}" fill="${PLATE}"/>` +
      `</svg>`
  );
  const buf = await sharp(plate)
    .composite([{ input: mark, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(path.join(OUT, name), buf);
  console.log(`[icons] ${name.padEnd(26)} ${size}x${size}  mark ${markW}x${markH}  ${(buf.length / 1024).toFixed(1)}KB`);
}

/** A SQUARE vector favicon, built by re-wrapping the supplied paths — not
 * redrawn. Browsers prefer an SVG icon when one is offered, and this keeps the
 * mark crisp at any size while fixing the aspect-ratio problem above. */
function squareSvg() {
  const inner = String(svg).replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  const SIZE = 640;
  const scale = (SIZE * 0.78) / SRC_W;
  const tx = (SIZE - SRC_W * scale) / 2;
  const ty = (SIZE - SRC_H * scale) / 2;
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<rect width="${SIZE}" height="${SIZE}" rx="96" fill="${PLATE}"/>
<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})">
${inner}
</g>
</svg>
`;
  writeFileSync(path.join(OUT, "icon.svg"), out, "utf-8");
  console.log(`[icons] icon.svg                   ${SIZE}x${SIZE}  vector    ${(out.length / 1024).toFixed(1)}KB`);
}

mkdirSync(OUT, { recursive: true });
console.log(`[icons] source: public/favicon.svg (${SRC_W}x${SRC_H})`);
squareSvg();
await icon({ name: "favicon-96.png", size: 96, markRatio: 0.78, radius: 14 });
await icon({ name: "apple-touch-icon.png", size: 180, markRatio: 0.78, radius: 0 });
await icon({ name: "icon-192.png", size: 192, markRatio: 0.78, radius: 0 });
await icon({ name: "icon-512.png", size: 512, markRatio: 0.78, radius: 0 });
await icon({ name: "icon-maskable-512.png", size: 512, markRatio: 0.62, radius: 0 });
