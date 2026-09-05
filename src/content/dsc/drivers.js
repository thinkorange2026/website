// T5 — Utility/download pages. CONTENT-PLAN.md §9, §11.9, DESIGN.md §2.4.
// No animated hero, no marketing chrome — download buttons above the fold,
// LCP target under 1.2s. The compliance-firm CTA card at the foot is the
// entire commercial mechanism; everything above it exists to be useful.
//
// ⚠️ VERSION / FILE SIZE / RELEASE DATE are deliberately `null`. Same
// discipline as `fees: null` — these are facts that must come from the actual
// vendor file once it is sourced and hosted (BUILD-PLAN.md Phase 7), not
// invented here. A fabricated "v5.2, 8.4 MB, released 12-03-2026" would be
// exactly the kind of invented fact this project's content rules forbid.
// CONTENT-PLAN.md §9 also flags: do not host vendor binaries without checking
// redistribution terms, and show a checksum if you do host them.
//
// OS support lists ARE stated, because they reflect the client's own prior
// draft copy for these exact products (not invented here) and match publicly
// known, stable vendor support matrices — unlike a version number, an OS
// compatibility list does not go stale week to week.

export const drivers = [
  {
    slug: "hyp2003",
    label: "HYP2003",
    h1: "HYP2003 Token Driver Downloads",
    meta: {
      title: "HYP2003 Driver Download | DSC Token Support | ThinkOrange",
      description:
        "HYP2003 USB token driver downloads and installation steps for Windows, macOS and Linux, plus troubleshooting.",
      keywords: ["hyp2003 driver download", "hyp2003 token driver windows", "hyp2003 dsc token"],
    },
    lede: "Driver downloads and installation steps for the HYP2003 USB token — the token we issue with new DSCs.",
    supportedOs: [
      { os: "Windows", versions: "11, 10, 8.1, 7" },
      { os: "macOS", versions: "Current releases" },
      { os: "Linux", versions: "Major distributions" },
    ],
    // ⛔ 05-09-2026 (Clinton), supplied directly: "Driver Tool for Mac … Driver
    // Tool for Windows … this is for hyp2003." The real HYP2003 driver builds,
    // hosted on Clinton's own Google Drive.
    //
    // ⚠️ `external: true` IS LOAD-BEARING, NOT A LABEL. `DriverPanel` and
    // `DriverPicker` render a same-origin file as `<a download>` — and the
    // `download` attribute is SILENTLY IGNORED by every browser on a
    // cross-origin URL. Left as a plain download link these buttons would say
    // "Download for Windows" and then navigate instead, with nothing failing.
    // The flag makes both components emit `target="_blank" rel="noopener
    // noreferrer"` and no `download`, so the markup matches what actually
    // happens.
    //
    // ⚠️ THE URL IS THE DIRECT-DOWNLOAD ENDPOINT, NOT THE `/file/d/<id>/view`
    // LINK CLINTON SENT. A `/view` URL opens Drive's preview page, where a
    // 12 MB zip cannot be previewed and the reader has to find a second
    // download button — a button labelled "Download for Windows" that opens a
    // web page is the same class of small lie as the `download` attribute
    // above. `uc?export=download` 303s straight to the file (verified: 200,
    // `content-disposition: attachment`). Same file id either way, so
    // reverting to `/view` is a one-word change if Google ever breaks this.
    //
    // ⚠️ NO `sha256` ON THESE TWO, and that is correct rather than an
    // omission. CONTENT-PLAN.md §9 asks for a checksum when you HOST the
    // binary; we do not host these, and a hash we published without holding
    // the file could not be re-verified when the file behind the link changed.
    // The reset tool below is hosted and does carry one.
    //
    // `fileSizeApprox` was READ OFF THE LINK'S OWN RESPONSE HEADERS
    // (`content-length` 12,424,136 and 14,794,107), not estimated. `version`
    // stays null: "FIPS140-3" in the filenames is a standard the token
    // validates against, not a build number.
    //
    // ⛔ LINUX STAYS NULL. Only Mac and Windows builds were supplied, and
    // `supportedOs` says Linux is supported — so the panel's "Linux builds are
    // not hosted here" line renders, which is the honest state. Do not point
    // it at either of these: both are platform-specific installers.
    downloads: [
      {
        platform: "Windows",
        version: null,
        fileSizeApprox: "14.1 MB",
        releaseDate: null,
        external: true,
        url: "https://drive.google.com/uc?export=download&id=1Ai84Icg2kAxl13GurfjVzrhjtLAuCOo-",
      },
      {
        platform: "macOS",
        version: null,
        fileSizeApprox: "11.8 MB",
        releaseDate: null,
        external: true,
        url: "https://drive.google.com/uc?export=download&id=10lOIOCX1WdJ89pjKcTcuXAVk6TFHyYmE",
      },
      { platform: "Linux", version: null, fileSizeApprox: null, releaseDate: null, url: null },
    ],
    // ⛔ `sourceNote` DELETED 05-09-2026. It said the driver "ships with the
    // token" and to ask us for a build — false now that two are linked. It
    // would have auto-hidden (DriverPanel renders it only while every url is
    // null), but a stale sentence left in a content file is how the wrong
    // claim comes back. Linux is covered by the panel's own missing-platform
    // line, which is derived from the rows rather than written by hand.
    installSteps: [
      { step: 1, title: "Close any open signing application", desc: "Close your browser and any portal session before installing, so the driver isn't loading against an already-open token session." },
      { step: 2, title: "Run the installer", desc: "Run the downloaded installer as administrator on Windows, or follow the package prompts on macOS/Linux." },
      { step: 3, title: "Insert the token", desc: "Insert the HYP2003 token after installation completes, not before — installing with the token already plugged in is a common cause of it not being detected." },
      { step: 4, title: "Confirm detection", desc: "Open the token management utility installed alongside the driver and confirm the token and certificate are both visible." },
    ],
    troubleshooting: [
      { issue: "Token not detected", fix: "Try a different USB port, preferably directly on the machine rather than through a hub. Confirm the driver installed without error before assuming a hardware fault." },
      { issue: "Driver installation fails", fix: "Confirm you are running the installer as administrator, and that any previous version of the driver has been fully uninstalled first — a partial old install is the most common cause." },
      { issue: "Browser can't see the certificate", fix: "Restart the browser after installing the driver — most browsers cache the available certificate list at launch and won't pick up a newly installed token until restarted." },
      { issue: "Portal or Java-based signing fails", fix: "Some government portals use a Java applet or local signing utility that needs to be restarted after the driver installs. Confirm you're running the portal's currently supported browser version." },
    ],
  },

  // ⛔ 03-09-2026 (Clinton): "in the driver download i want to added a new
  // driver that is maily use for reset token, name it call Initization Tool or
  // Reset Tools."
  //
  // ⚠️ THIS IS NOT A DRIVER, and the entry says so rather than pretending
  // otherwise. A driver lets a machine talk to the token; this WIPES it. It
  // sits in the same list because that is where a reader looks for it, and
  // `kind: "utility"` is what lets the page treat it differently.
  //
  // ⛔ NOTHING ABOUT THE FILE IS INVENTED — and as of 04-09-2026 some of it no
  // longer has to be, because Clinton supplied the real binary
  // (`public/software/HYP2003_Initialization_Tool.exe`). EVERY VALUE NOW SET
  // BELOW WAS READ OFF THAT FILE, not guessed:
  //   platform "Windows"  — `file` reports "PE32 executable (GUI) Intel 80386,
  //                         for MS Windows".
  //   "32-bit"            — same line: PE32 / Intel 80386.
  //   fileSizeApprox      — 234,128 bytes.
  //   sha256              — `shasum -a 256` of the committed file.
  // `version` and `releaseDate` are STILL null: the filename carries neither
  // and the binary was not interrogated for one. Same discipline as `fees:
  // null` — a plausible "v1.2" is exactly the invented fact this file exists to
  // prevent.
  //
  // ⚠️ THE URL IS `/software/…`, NOT `public/software/…`. `public/` is Vite's
  // build ROOT, not a URL segment; written the other way it resolves relative
  // to the route and 404s. That exact bug shipped once on the DSC hub's token
  // image (19-08-2026).
  //
  // ⚠️ CONTENT-PLAN.md §9 says: do not host vendor binaries without checking
  // redistribution terms, and show a checksum if you do host them. The checksum
  // is below and rendered on the page. **The redistribution question is
  // Clinton's — he supplied the file — and is flagged in MISSING-PAGES.md
  // rather than assumed settled.**
  //
  // ⚠️ THE FILENAME MAKES THIS THE HYP2003 BUILD, so the copy says so. An
  // initialisation utility is token-specific; a reader who runs the wrong one
  // is the failure case this whole entry is written around.
  //
  // Still outstanding: the exact vendor tool name, a version, and macOS/Linux
  // builds if they exist. Logged in MISSING-PAGES.md.
  //
  // ⚠️ THE WARNING IS NOT A PRODUCT SPEC, it is what the word "initialise"
  // means for a crypto token: the operation erases the token's contents,
  // including the certificate on it. That is safe to state because it is true
  // of the operation rather than of any particular build, and it is the single
  // most important thing a reader can be told before running one.
  {
    slug: "initialisation-tool",
    kind: "utility",
    label: "Initialisation & Reset Tool",
    h1: "Token Initialisation & Reset Tool",
    meta: {
      title: "DSC Token Initialisation & Reset Tool | ThinkOrange",
      description:
        "The utility that resets a USB crypto token to factory state. Resetting erases the certificate on it — talk to us before you run it.",
      keywords: ["dsc token reset tool", "token initialisation tool", "reset usb crypto token"],
    },
    lede:
      "Resets a token to its factory state — used when a token is locked out by wrong PIN attempts, or is being reissued to a different holder.",
    // ⛔ 05-09-2026: populated again, from the binary itself. `file` reports
    // "PE32 executable (GUI) Intel 80386, for MS Windows" — hence Windows and
    // 32-bit. NOTHING about macOS or Linux is listed, because nothing is known:
    // most vendor initialisation utilities are Windows-only, but "most" is not
    // a fact about this one.
    supportedOs: [{ os: "Windows", versions: "32-bit build; runs on 64-bit Windows" }],
    // ⛔ 05-09-2026 (Clinton): "that software i have put in public is for reset
    // tool… keep at reset tool." The binary is back here, and HYP2003 has none.
    // Published ONCE, under the name that matches what it does.
    //
    // Every value was read off the file, not guessed: 234,128 bytes → "229 KB",
    // and the hash is `shasum -a 256` of the committed file. `version` and
    // `releaseDate` stay NULL — the filename carries neither, and a plausible
    // "v1.2" is exactly the invented fact this file exists to prevent.
    //
    // ⚠️ THE URL IS `/software/…`, NOT `public/software/…`. `public/` is Vite's
    // build ROOT, not a URL segment; written the other way it resolves relative
    // to the route and 404s — the bug that shipped once on the DSC hub's token
    // image (19-08-2026).
    //
    // ⚠️ ONE ROW, NOT THREE. No macOS or Linux row is listed even as a null:
    // a null row makes the page say that build "is not hosted here", which
    // asserts we expect one to exist. We do not know that. See `supportedOs`.
    //
    // ⚠️ NO PER-FILE `note` HERE, deliberately. The entry-level `warning` says
    // the same thing and `DriverPanel` renders it ABOVE the download button —
    // measured on 04-09-2026 — so a second copy beside the button is noise on
    // the one message that must not become wallpaper.
    //
    // ⚠️ CONTENT-PLAN.md §9: show a checksum when you host the binary (done,
    // and rendered), and do not host a vendor binary without checking
    // redistribution terms. The second half is Clinton's call — he supplied the
    // file — and is flagged in MISSING-PAGES.md rather than assumed settled.
    // RECOMPUTE THE HASH whenever the file is replaced: one that does not match
    // its file is worse than none, since it tells a careful reader the download
    // has been tampered with.
    downloads: [
      {
        platform: "Windows",
        version: null,
        fileSizeApprox: "229 KB",
        releaseDate: null,
        url: "/software/HYP2003_Initialization_Tool.exe",
        sha256: "8fa82dff03966d85c12115105d2a329e6b12908d91f1b2bccbb0102bd59bcf58",
      },
    ],
    warning:
      "This is the initialisation tool for the HYP2003 token. Initialising a token ERASES everything on it, including the certificate. There is no undo, and a certificate destroyed this way has to be re-issued from scratch — with fresh verification and a fresh fee. Talk to us before you run it, especially if the certificate on the token is still valid, and do not run it against a token of a different make.",
    // What the tool is for, stated as situations rather than as steps. These
    // are the cases a reader arrives with, not a procedure for a build we have
    // not documented.
    useCases: [
      "The token is locked after too many wrong PIN attempts and no longer accepts the correct one.",
      "The certificate on it has expired and the same token is being reused for a fresh issuance.",
      "The token is being handed to a different signatory and must not carry the previous holder's certificate.",
    ],
    // ⛔ `sourceNote` DELETED 05-09-2026 rather than left to auto-hide. It said
    // we do not publish this file and to ask us for it; this entry now hosts
    // it, so the sentence is false. DriverPanel would have hidden it (it only
    // renders while every download is null), but a stale sentence sitting in a
    // content file is how the wrong claim comes back — the same reason
    // HYP2003's was deleted when the file first landed.
    installSteps: [],
    troubleshooting: [],
  }
];

// ⛔ 02-09-2026 (Clinton): "remove the data from epass, watchdata, mtoken."
// Those three driver entries are DELETED. HYP2003 is the token ThinkOrange
// actually stocks and issues certificates onto — which is what `buy-tokens`'
// own copy always said — so the page now describes the one token we sell
// rather than four we do not. Their content is recoverable from git history.
//
// ⚠️ Consumers are count-aware rather than hardcoded to four: the homepage
// driver row, the Buy Token hero's driver row and the driver disclosure all
// map over this array. Adding a token back is a content edit, not a code one.

// ⛔ 03-09-2026: the drivers page's own copy. It used to be a SECTION of Buy
// Token, so it had no page-level h1, lede or meta of its own — those came from
// `tokenProduct`, which is about the hardware rather than the software. Kept
// here beside the drivers it describes, not in `token.js`.
export const driversPage = {
  h1: "Token Driver Downloads",
  lede:
    "The driver has to be installed before any portal can see your token. Setup steps and the fixes for the things that usually go wrong.",
  meta: {
    title: "DSC Token Driver Downloads & Setup | ThinkOrange",
    description:
      "Install steps and troubleshooting for the USB token we issue Digital Signature Certificates onto — for Windows, macOS and Linux.",
    keywords: ["dsc token driver", "hyp2003 driver download", "token not detected dsc"],
  },
};

export function getDriver(slug) {
  return drivers.find((d) => d.slug === slug);
}
