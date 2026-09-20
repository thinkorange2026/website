import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/modules/home/sections/CtaBand";
import { BackButton } from "@/components/ui/BackButton";
import { FinderResult } from "@/modules/dsc/FinderResult";
import { dscIntent, dscIntentForUse } from "@/content/dsc/intents";
import { kycRoutes } from "@/content/dsc/certificates";
import { finderAnswer, finderSigners, finderUse } from "@/content/dsc/finder";
import { dscSectionIds } from "@/content/nav";
import { serviceJsonLd } from "@/lib/jsonld";
import { trackEvent } from "@/lib/analytics";
import { finderShareUrl } from "@/modules/dsc/finderUrl";

// T16 — THE FOUR DSC INTENT PAGES: /dsc/statutory-filings, /dsc/tenders,
// /dsc/dgft, /dsc/foreign-national.
//
// ⛔ WHY THEY EXIST. The finder's answers had no URL. Its result renders on
// demand in JavaScript behind two clicks, so every checklist it resolves was in
// no page's served HTML — measured before this: zero checklist lines in
// `dist/dsc/index.html`. The usual reassurance ("Google renders JS") does not
// apply, because nothing crawls a wizard.
//
// ⛔ WHAT THEY ARE, after Clinton's correction on 11-09-2026: "the pages is over
// informative... keep and same it is showing in when select to card, no need to
// create many section, just keep it same but in different route."
//
// The first cut rebuilt the answer as a seven-section page — intro, portal
// table, per-signer breakdown, documents, video verification, FAQs, related. It
// was a different artefact wearing the same data. This is the SAME CARD the
// finder shows, on its own URL: hero, the card, CTA band. `FinderResult` was
// extracted for exactly this, so the two can never drift.
//
// ⚠️ CONSEQUENCES OF THAT, RECORDED RATHER THAN QUIETLY ABSORBED:
//   1. `intents.js` still carries `intro`, `portals` and `faqs`. They are
//      written and no longer rendered — the same discipline `portalGuide`,
//      `afterIssue` and `answer.warn` already carry in this tree. Do NOT prune
//      them; restoring any of it is render-only.
//   2. The page no longer emits FAQPage schema, because it no longer shows
//      FAQs. Schema must describe what is actually on the page.
//   3. Only the DEFAULT verification route is in the prerendered HTML, because
//      the card resolves its checklist from a toggle. Both were static in the
//      first cut. Still a strict improvement on before — one full checklist is
//      crawlable where none was — but it is less than the first version had.

export function DscIntent({ path }) {
  const slug = path.replace(/\/+$/, "").split("/").pop();
  const intent = dscIntent(slug);

  const use = intent ? finderUse(intent.key) : null;
  const skipsSigner = Boolean(use?.skipsSigner);

  // ⚠️ THE SIGNER IS STATE, NOT A ROUTE. Two of the four intents ask "who
  // signs?" and the answer changes whose name goes on the certificate — so the
  // page has to pick one. Twelve routes instead of four would be four pages
  // saying the same thing three times each; the card shows one answer with the
  // same chips the wizard's question two uses.
  const [signer, setSigner] = useState(skipsSigner ? "any" : finderSigners[0].key);
  const [kyc, setKyc] = useState(kycRoutes[0].key);

  // ⛔ READ IN AN EFFECT, NEVER DURING RENDER. Phase 9 prerenders this page
  // once, with no query string, so a first client render that read `?signer=`
  // would paint a different answer than the markup it is hydrating against.
  // That is also why the share link carries a QUERY and not a fragment: a
  // fragment needs a real element id per signer, and the card renders one
  // signer at a time.
  //
  // ⚠️ Written as a SUBSCRIPTION to the address bar rather than a bare
  // mount-time `setState` — what `react-hooks/set-state-in-effect` asks for,
  // and the honest description of what the URL is here. Identical shape to
  // `DscFinder`'s own restore.
  useEffect(() => {
    if (skipsSigner) return undefined;
    const sync = () => {
      const wanted = new URLSearchParams(window.location.search).get("signer");
      if (finderSigners.some((option) => option.key === wanted)) setSigner(wanted);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [skipsSigner]);

  const answer = intent ? finderAnswer(intent.key, signer) : null;

  // ⛔ `dsc_finder_result` FIRES HERE NOW. It used to come from the wizard's
  // in-page result, which no longer exists — a choice card navigates straight
  // to this page (11-09-2026). Without this move the highest-value funnel on
  // the site would have gone dark the moment the wizard did.
  //
  // ⚠️ `source: "page"` distinguishes it from the wizard's own historical
  // rows, so a report spanning the change does not silently merge two
  // different journeys. Keyed on the answer, so switching signer records the
  // new one rather than firing on every render.
  useEffect(() => {
    if (!answer) return;
    trackEvent("dsc_finder_result", {
      use: intent?.key,
      signer,
      certificate: answer.certificate,
      source: "page",
      page_path: path,
    });
  }, [answer, intent?.key, signer, path]);

  if (!intent || !answer) return null;

  const signerLabel = skipsSigner
    ? null
    : finderSigners.find((option) => option.key === signer)?.label;


  const eventParams = (extra) => ({
    use: intent.key,
    signer,
    certificate: answer.certificate,
    page_path: path,
    ...extra,
  });

  return (
    <>
      {/* ⚠️ Service + the BreadcrumbList `PageHero` already emits. No FAQPage:
          this page does not render FAQs any more. */}
      <JsonLd
        data={serviceJsonLd({
          name: intent.h1,
          description: intent.meta.description,
          path,
          categoryLabel: "Digital Signature Certificates",
        })}
      />

      <PageHero
        path={path}
        eyebrow="Digital Signatures"
        h1={intent.h1}
        lede={intent.lede}
        // ⚠️ NO hero CTA and no hero Back. The CTA said "Not sure? Use the
        // finder" and pointed at `/dsc#finder`, which is exactly where the Back
        // link at the top of the body below goes — two controls to one
        // destination on one page is clutter, and the prominent one was the
        // wrong shape anyway: this page IS the answer, so the emphatic action
        // belongs at its foot.
        ringsId={`intent-${intent.slug}-hero`}
      />

      {/* One section, `light`, because that is the surface the card is designed
          for — it is the finder's own surface on /dsc. Cadence is
          deep → light → ember. */}
      <Section surface="light">
        <Container>
          {/* ⛔ 11-09-2026 (Clinton): "show the back button at top like above
              Who signs on the portal?" — so it is the first thing in the body,
              above the signer question, not in the hero. An earlier cut put it
              under the hero's breadcrumb; that is higher on the page but it is
              chrome, and what a reader wants a way back FROM is the answer.

              ⚠️ A `<Link>` to `/dsc#finder`, never `navigate(-1)`: someone
              arriving from a shared link or a search result has no history, and
              browser-back would take them off the site entirely.

              ⚠️ Light tone (the default) — this section is `light`. The `onDark`
              variant is ink-300 and would be far too faint here. */}
          <div className="mb-8">
            <BackButton to={`/dsc#${dscSectionIds.finder}`} />
          </div>

          {!skipsSigner && (
            <SignerChoice value={signer} onChange={setSigner} />
          )}
          <FinderResult
            answer={answer}
            use={use}
            signerLabel={signerLabel}
            kyc={kyc}
            onKyc={setKyc}
            shareUrl={finderShareUrl({
              pathname: path,
              useKey: intent.key,
              signer,
              kyc,
            })}
            // No `intentPage`: this IS the intent page, and a "Full guide" link
            // pointing at the page you are already on is a dead end.
            jumpPathFor={(useKey) => {
              const target = dscIntentForUse(useKey);
              return target ? `/dsc/${target.slug}` : `/dsc#${dscSectionIds.finder}`;
            }}
            onShare={(method) =>
              trackEvent(
                "share",
                eventParams({
                  method,
                  content_type: "dsc_intent_page",
                  item_id: answer.certificate,
                })
              )
            }
            onApply={() => trackEvent("dsc_finder_apply", eventParams())}
            reduceMotion={false}
          />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}

/**
 * Question two, as a control rather than a step — the wizard asks it before
 * showing an answer; here the answer is already on screen and this switches it.
 *
 * ⚠️ `aria-pressed`, NOT `role="radio"`. Radios carry a keyboard contract —
 * arrow keys under a roving tabindex — that these do not implement, and a
 * `radiogroup` whose members only answer Tab is a worse lie to a screen-reader
 * user than two honest toggle buttons in a labelled group. Same call
 * `TokenOrder` and the card's own verification toggle already make.
 */
function SignerChoice({ value, onChange }) {
  return (
    <div className="mb-10 border-b border-ink-100 pb-8">
      <p id="signer-choice-label" className="text-body-sm font-medium text-ink-400">
        Who signs on the portal?
      </p>
      <div
        role="group"
        aria-labelledby="signer-choice-label"
        className="mt-4 flex flex-wrap gap-3"
      >
        {finderSigners.map((option) => {
          const active = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.key)}
              className={
                active
                  ? "rounded-full border border-ember-400 bg-ember-400 px-5 py-3 text-body-sm font-medium text-ink-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2"
                  : "rounded-full border border-ink-200 bg-white px-5 py-3 text-body-sm font-medium text-ink-600 shadow-sm transition-[color,border-color,transform] duration-[var(--dur-fast)] hover:border-ember-300 hover:text-ember-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 focus-visible:ring-offset-2 active:scale-[0.98]"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Default export for both routers: `router.jsx` lazy-loads it and
// `router-static.jsx` imports it eagerly, and both need a default.
export default DscIntent;
