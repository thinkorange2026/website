// "Resources" (`/dsc/resources`, T15) — the DSC file library.
//
// ⛔ 07-09-2026 (Clinton): "in this i will upload fields relatied to dsc. for
// now it will shown as empty state." So this file ships with `dscResources`
// EMPTY, and `DscResources.jsx` renders an honest empty state rather than
// placeholder cards. Same discipline as `testimonials.js` and `insights.js`:
// a placeholder entry in a content file is indistinguishable from a real one
// to the next reader, and this one would additionally offer a download that
// does not exist.
//
// ⚠️ ADDING A FILE IS A CONTENT EDIT, NOT A TEMPLATE CHANGE. Push the file
// into `public/` (see the url note below), add an entry here, and the page
// switches from the empty state to the list with no code touched.
//
// ⚠️ THE RULES THAT APPLY TO EVERY ENTRY:
//  - `url` is a SERVED path, so `/files/thing.pdf`, NEVER `public/files/...`.
//    `public/` is Vite's build root, not a URL segment — written the other way
//    it resolves relative to the route and 404s. That bug has shipped here
//    once already (the DSC hub's token image).
//  - `size` is read off the real file (`ls -l`), never estimated, and `updated`
//    is the day the file was actually published. Both are checkable claims a
//    reader may rely on; neither is worth guessing.
//  - No fee, turnaround, client count or statutory value in a title or a
//    description. A resource card is a short confident line of copy, which is
//    exactly the shape an invented fact slips into. Statutory values come from
//    `statutory.js` via `s()` like everywhere else.
//  - A vendor binary needs its redistribution terms checked before it is
//    hosted (CONTENT-PLAN.md §9), and anything destructive needs the caution
//    treatment `drivers.js` already uses for the initialisation tool.
//  - ⚠️ Never publish a document carrying a real PAN, GSTIN, DIN, name or
//    amount without flattened redaction (CLAUDE.md's non-negotiables).

export const dscResourcesContent = {
  meta: {
    title: "DSC Resources | ThinkOrange Consulting",
    description:
      "Forms, checklists and reference documents for Digital Signature Certificates — collected in one place so you are not hunting for them across portals.",
  },
  heroLede:
    "Forms, checklists and reference documents for Digital Signature Certificates, collected in one place.",

  // Shown when `dscResources` is empty. Deliberately says the library is being
  // put together rather than implying files are missing or broken.
  empty: {
    heading: "Nothing here yet",
    message:
      "We are still collecting the forms and checklists that belong on this page. Until they are up, tell us which document you are after and we will send it across directly.",
  },
};

/**
 * The downloadable files, newest first.
 *
 * Shape — every field is required except `size` and `updated`, which render
 * only when present (an unknown size is left off, never guessed):
 *
 *   {
 *     id: "dsc-application-form",     // stable, kebab-case, used as the key
 *     title: "DSC application form",
 *     description: "One line on what it is and who needs it.",
 *     format: "PDF",                 // shown as-is, e.g. PDF / DOCX / XLSX
 *     size: "184 KB",                // read off the real file
 *     updated: "2026-09-07",         // YYYY-MM-DD, formatted by formatDate()
 *     url: "/files/dsc-application-form.pdf",
 *   }
 */
export const dscResources = [];
