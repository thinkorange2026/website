# EmailJS — template creation and integration

Everything in `src/lib/emailjs.js` is already written and wired. What is missing
is **not code**: it is a service, a template and a `.env`. Until those exist,
`emailjsConfigured` is `false`, `sendEnquiry()` rejects immediately, and both
public forms show an honest "email sending isn't set up yet — reach us on
WhatsApp" toast instead of pretending to succeed.

This document is the dashboard half. Follow it end to end and the forms start
working with **zero changes to any component**.

---

## 0. What is already true, before you start

| Fact | Where |
|---|---|
| SDK installed | `@emailjs/browser@^4.4.1`, `package.json` |
| Send wrapper | `src/lib/emailjs.js` — `sendEnquiry(templateParams)` |
| Spam hardening | `src/lib/spamGuard.js` — honeypot, 3s time-gate, 3 sends / 10 min |
| Client throttle | `limitRate: { throttle: 60000 }` in `emailjs.js` |
| Two senders | `ContactForm.jsx`, `PartnerEnquiryForm.jsx` |
| Env shape | `.env.example` (committed), `.env` (gitignored, does not exist yet) |
| Destination | `site.email` = `office@thinkorange.in` (`src/content/nav.js`) |

⛔ **There is ONE `VITE_EMAILJS_TEMPLATE_ID` and TWO forms sending different
field sets.** That is a deliberate design, not an oversight — both forms send a
`form_type` string precisely so one template can serve both. Section 3 builds
that template. Section 7 has the code change if you'd rather have two.

---

## 1. Create the email service (5 minutes)

1. Sign in at <https://dashboard.emailjs.com>.
2. **Email Services → Add New Service.**
3. Pick the provider that owns `office@thinkorange.in`:
   - **Google Workspace / Gmail** → "Gmail", then OAuth-connect that mailbox.
   - **Zoho Mail** → "Zoho Mail".
   - Anything else → **"Custom SMTP"** and enter the host, port 465 (SSL) or
     587 (TLS), the full address as username, and an **app password**, not the
     account password.
4. Name it `thinkorange-site`.
5. Copy the **Service ID** — it looks like `service_ab12cde`.

> ⚠️ **Connect the mailbox mail should ARRIVE in, not a personal account.**
> EmailJS sends *from* the connected mailbox. If you connect a personal Gmail,
> every enquiry arrives from that personal address and replies go there.

> ⚠️ **Gmail/Workspace connections expire.** If enquiries silently stop
> months from now, re-authorise the service before looking anywhere else.

---

## 2. Lock the public key down — do this BEFORE going live

The public key ships in the JavaScript bundle. That is by design and is fine,
**provided you set these two dashboard controls**. Without them anyone can lift
the key and send mail through your account.

1. **Account → Security → API settings**
   - **Allow-list**: add `thinkorange.in` and `www.thinkorange.in`. Add
     `localhost` too while testing, then **remove it before launch**.
   - Leave "Use Private Key" / strict mode **OFF** — this is a browser-only
     site with no backend to hold a private key.
2. **Account → Usage / Rate limit**: set a per-key limit. Something like
   **20 requests per hour** is generous for a site that receives a handful of
   enquiries a day and still caps the damage if the key is scraped.

This is the "EmailJS's own per-key limits configured" line in CONTENT-PLAN.md
§11. It is a dashboard setting — no code can do it.

---

## 3. Create the template

**Email Templates → Create New Template.** Name it `thinkorange-enquiry`.

### 3.1 Settings tab — the four fields that matter

| Field | Value | Why |
|---|---|---|
| **To Email** | `office@thinkorange.in` *(literal — never a variable)* | ⛔ See below |
| **From Name** | `ThinkOrange website` | Distinguishes site mail from real people |
| **From Email** | leave as the service default | Provider-owned; changing it trips SPF/DKIM |
| **Reply To** | `{{email}}` | ⛔ See below |
| **Subject** | `New {{form_type}} — {{name}}` | |
| **BCC** *(optional)* | a second address | Cheap redundancy if the primary inbox breaks |

⛔ **"To Email" MUST be a hardcoded address.** If you put `{{to_email}}` there,
the *browser* decides where mail goes — and the browser is the attacker.
Anyone with your public key could then use your account and your domain's
reputation to send mail anywhere. Hardcode it.

⛔ **"Reply To" MUST be `{{email}}`.** Skip this and hitting Reply on an
enquiry replies to your own mailbox. This is the single most common EmailJS
misconfiguration and the one you will notice the day you lose a lead over it.
Both forms send `email` as a required field, so it is never empty.

### 3.2 Content tab — every variable both forms send

This is the complete union. **Contact sends 6, Partner sends 10**, and they
overlap on four (`form_type`, `name`, `phone`, `email`).

| Variable | Contact | Partner | Example |
|---|:--:|:--:|---|
| `form_type` | ✅ | ✅ | `Contact enquiry` / `DSC partner enquiry` |
| `name` | ✅ | ✅ | `Ramesh Kumar` |
| `phone` | ✅ | ✅ | `+91 98765 43210` |
| `email` | ✅ | ✅ | `ramesh@example.in` |
| `service` | ✅ | — | `GST Registration` |
| `message` | ✅ | — | free text |
| `firm` | — | ✅ | `Kumar & Associates` |
| `city` | — | ✅ | `Salem` |
| `practice_type` | — | ✅ | `Chartered Accountant` |
| `current_issuer` | — | ✅ | `No — this would be new` |
| `monthly_volume` | — | ✅ | `11–25 certificates` |
| `notes` | — | ✅ | free text, optional |

⚠️ **These names are the contract.** They are typed in
`ContactForm.jsx`'s and `PartnerEnquiryForm.jsx`'s `sendEnquiry({...})` calls.
Rename one in the dashboard and that field silently renders blank in the email —
nothing errors, nothing logs, and you find out from a half-empty enquiry weeks
later. If you change a name, change it in **both places in the same edit**.

### 3.3 The template body

Paste this into the template's HTML editor. It is written so that a variable
the sending form does not provide renders as an **empty line**, never as an
error — so one template genuinely serves both forms.

```html
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1a1a1a; max-width: 640px;">

  <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #c2410c;">
    {{form_type}}
  </p>
  <h2 style="margin: 0 0 20px; font-size: 20px;">{{name}}</h2>

  <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; width: 180px; color: #666; border-bottom: 1px solid #eee;">Name</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{name}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Phone / WhatsApp</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{phone}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Email</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:{{email}}">{{email}}</a></td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Service required</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{service}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Firm / company</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{firm}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">City</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{city}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Practice type</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{practice_type}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Issues DSCs today</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{current_issuer}}</td></tr>
    <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Expected monthly volume</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{monthly_volume}}</td></tr>
  </table>

  <p style="margin: 24px 0 6px; color: #666; font-size: 13px;">Message</p>
  <div style="padding: 14px 16px; background: #f6f6f4; border-left: 3px solid #f97316; white-space: pre-wrap;">{{message}}{{notes}}</div>

  <p style="margin: 28px 0 0; padding-top: 14px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
    Sent from thinkorange.in — reply directly to this email to reach the sender.
  </p>

</div>
```

⚠️ **`{{message}}{{notes}}` on one line is deliberate.** Contact sends
`message` and Partner sends `notes`; exactly one is ever non-empty, so
concatenating them prints whichever arrived with no conditional logic and no
way to get it wrong.

⚠️ **If you want the irrelevant rows to disappear** rather than sit empty,
EmailJS supports Handlebars conditionals — wrap each row in
`{{#if firm}} … {{/if}}`. **Verify it renders before relying on it**: use the
template's own *Test It* button with a payload that omits the variable, and
check the preview. An unsupported helper prints as literal text in a real
enquiry. The version above needs no conditionals at all, which is why it is
the one to start with.

### 3.4 Save and copy the Template ID

`template_xy34zab`.

---

## 4. Create `.env`

At the repo root (`/Users/clinton/Documents/Orange/ThinkOrange/.env`):

```bash
VITE_EMAILJS_SERVICE_ID=service_ab12cde
VITE_EMAILJS_TEMPLATE_ID=template_xy34zab
VITE_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQ
```

The **Public Key** is under **Account → General → Public Key**.

⛔ **`.env` is gitignored (line 9) and must stay that way.** `.env.example`
is the committed one and holds placeholders only.

⛔ **VITE ENV VARS ARE BAKED IN AT BUILD TIME, NOT READ AT RUNTIME.** Two
consequences, and the second has bitten real deployments:

1. **Restart `npm run dev` after creating or editing `.env`.** Vite does not
   pick it up on hot reload. A stale dev server is the reason a correct `.env`
   still reports "not configured".
2. **`.env` must exist on the machine that runs `npm run build`.** This site
   prerenders 63 static routes — if the deploy host or CI builds without these
   three variables, `emailjsConfigured` compiles to `false` and **every form on
   the live site shows the "not set up yet" toast**, with nothing failing in the
   build log. If you deploy from Netlify/Vercel/Cloudflare, add all three in
   that dashboard's environment-variables panel too.

---

## 5. Test it — and what a false failure looks like

```bash
npm run dev
```

Open `/contact`, fill all five fields, submit.

Expected: a green **"Message sent"** toast, and the enquiry in
`office@thinkorange.in` within seconds. Then do the same on
`/partner-with-us`.

### The four ways a working setup looks broken

| Symptom | Cause | Fix |
|---|---|---|
| **"That was fast!"** | `spamGuard`'s 3-second time-gate (`MIN_FILL_TIME_MS`) | Wait 3s after the page loads before submitting. This fires constantly when you paste-and-submit while testing. |
| **Second submit fails silently / errors** | `limitRate: { throttle: 60000 }` in `emailjs.js` | Wait 60 seconds between test sends, or use a different browser profile. |
| **"Too many submissions"** | `spamGuard` — 3 sends per 10 min, in `localStorage` | Clear the `to_submissions_*` keys in DevTools → Application → Local Storage, or use a private window. |
| **"Email sending isn't set up yet"** | `.env` missing, misnamed, or the dev server not restarted | Confirm the three names start with `VITE_EMAILJS_` **exactly**, then restart the dev server. |

The real errors print to the console in dev only (`if (import.meta.env.DEV)
console.error(error)` in both forms). Read them there:

- **422 "The recipients address is empty"** → *To Email* in the template is
  blank or points at a variable you are not sending. Hardcode it (§3.1).
- **400 "The Public Key is invalid"** → wrong key, or you pasted the *Private*
  key.
- **403 / "API calls are disabled for non-browser applications"** → the
  allow-list from §2 does not include the origin you are testing from. Add
  `localhost` while testing.

### Check the analytics side too

Both forms fire GA4 events. A successful send emits
`lead_submitted{form_name}`; a failure emits `lead_failed{form_name, reason}`
where `reason` flips from `not_configured` to `send_error` the moment `.env`
lands. **After going live, `not_configured` should never appear again** — if it
does in a GA4 report, a build shipped without the env vars (§4, consequence 2).

⚠️ Analytics only send in a production build (`SEND = import.meta.env.PROD` in
`src/lib/analytics.js`), so dev testing will not pollute the live property and
will not confirm the events either.

---

## 6. Before this goes live

⛔ **`/privacy-policy` is still `sections: null`.** Both forms already carry the
line *"your details are sent to us via a third-party email service"* and link to
that page — which currently renders a "being finalised" placeholder. Turning
EmailJS on means names, phone numbers and email addresses start transiting a
third party for real, alongside the GA4 tag that is already live. The real
policy must name **both** EmailJS and Google Analytics.
`src/content/legal/privacy-policy.js`'s header comment already records this.

Also: remove `localhost` from the allow-list (§2), and confirm the rate limit
is set.

---

## 7. Optional — two templates instead of one

One template is the right default: one place to edit, one ID, and the
`form_type` line at the top already distinguishes the two. Split only if the
two emails need genuinely different structure (or different recipients — e.g.
partner applications going to a different inbox).

`sendEnquiry` takes no template argument today. The change:

```js
// src/lib/emailjs.js
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PARTNER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_PARTNER_TEMPLATE_ID;

export const emailjsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export function sendEnquiry(templateParams, templateId = TEMPLATE_ID) {
  // …unchanged…
  return emailjs.send(SERVICE_ID, templateId, templateParams, { … });
}
```

Then `PartnerEnquiryForm.jsx`:

```js
await sendEnquiry({ /* …params… */ }, PARTNER_TEMPLATE_ID);
```

⚠️ Export `PARTNER_TEMPLATE_ID` from `emailjs.js` — the form must not read
`import.meta.env` directly, or the "is it configured?" question ends up answered
in two places that can disagree. And add the fourth variable to `.env.example`
in the same edit, or the next person setting this up from scratch gets a form
that fails with no explanation.

---

## 8. Optional — auto-reply to the person who wrote in

A second template that emails the **submitter** a "we've got it" acknowledgement.

1. New template `thinkorange-autoreply`, with **To Email = `{{email}}`** — this
   is the one case where a variable there is correct, because the whole point is
   to reply to the sender.
2. Body: short, no commitments. ⛔ **Do not write "we'll respond within one
   working day"** — a turnaround guarantee is on CONTENT-PLAN.md §1.1's hold
   list, and the site uses `turnaround.enquiryResponseTime` (value `null` →
   "We respond fast") everywhere else for exactly this reason. Keep it to
   "We've received your enquiry and will be in touch."
3. Fire it after the main send, and **never let its failure fail the form** —
   the enquiry already reached you, so the visitor must still see success:

```js
await sendEnquiry({ /* …main params… */ });
sendEnquiry({ name: form.name, email: form.email }, AUTOREPLY_TEMPLATE_ID)
  .catch(() => {}); // best-effort; the enquiry is already delivered
```

⚠️ Each auto-reply is a second request against the same quota and the same
rate limit — an auto-reply doubles your EmailJS usage. Check the free tier's
monthly allowance before enabling it.

---

## Summary checklist

- [ ] Service created, connected to the mailbox mail should arrive in
- [ ] Allow-list set to `thinkorange.in` (+ `localhost` while testing only)
- [ ] Per-key rate limit set in the dashboard
- [ ] Template created; **To Email hardcoded**, **Reply To = `{{email}}`**
- [ ] All 12 variables present in the body
- [ ] `.env` created locally with the three `VITE_EMAILJS_*` values
- [ ] Same three variables added to the deploy host's environment panel
- [ ] Dev server restarted; both forms tested, both emails received
- [ ] Reply tested — it goes to the visitor, not to yourself
- [ ] `localhost` removed from the allow-list
- [ ] Privacy policy written, naming EmailJS and GA4
