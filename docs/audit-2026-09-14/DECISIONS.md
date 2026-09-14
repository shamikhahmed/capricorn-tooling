# Cap Fleet Finish Program — Owner Decisions

Updated: 2026-09-14T13:32:00Z

Owner fills answers below. Cursor never waits — parks blocked items and continues.

## Decision register

### D-01 · Store submission plan
**Status:** OPEN  
**Question:** Which apps are submitted to App Store / Google Play and in what order? (All apps still must reach Tier 1.)  
**Options:** A) Stagger ScentCap → VaultCap first, ≤3 native at once · B) Different order · C) PWA-only forever for named apps  
**Recommendation:** A  
**Blocks:** Store packs, native shell work prioritization (not Tier 1 quality work)

### D-02 · IdeaCap baseline
**Status:** OPEN  
**Question:** Recover v2.0.0 "production-overhaul" work from another machine/remote, or redo from disk 1.2.1?  
**Options:** A) Recover v2.0.0 · B) Redo from 1.2.1 · C) Hybrid  
**Recommendation:** Search remotes/backups first; if none within 48h → B  
**Blocks:** FLT-03, full IdeaCap Tier 1 baseline truth  
**Meanwhile:** IDEA-P0-01 (remove client AI keys) proceeds on 1.2.1 disk

### D-03 · PulseCap 102 deletions
**Status:** OPEN  
**Question:** Were the 102 tracked deletions intentional (move into docs/) or damage? Working tree is missing `js/app.js`, most CSS, VERSION.json, CI, README, etc. while HEAD still has them. `docs/` only has notes — not a relocated app.  
**Options:** A) Damage → restore from HEAD (`git restore .`) · B) Intentional move → complete move with `git mv` semantics · C) Other (describe)  
**Recommendation:** A (evidence: app broken on disk; docs/ is not the app)  
**Blocks:** FLT-02, PLS-P0-01  
**Meanwhile:** Dirty state preserved on `preserve/pre-finish-2026-09-14`; finish work starts from `origin/main` tree

### D-04 · DeePonyCap IP
**Status:** OPEN  
**Question:** Remove all My Little Pony/Hasbro names & imagery and reposition as generic collectible tracker, or keep private/unlisted?  
**Options:** A) Generic reposition · B) Private/unlisted forever · C) Other  
**Recommendation:** A if public; B if not ready  
**Blocks:** PONY-P0-01, HUB catalog claims for DeePony

### D-05 · SoulCap clinical/legal
**Status:** OPEN  
**Question:** Crisis-resource policy (region-aware helplines vs "local emergency services" only), qualified reviewer sign-off, 18+ gate wording.  
**Options:** A) Region-aware approved list · B) Emergency-services-only · C) Draft pending clinician  
**Recommendation:** C then A  
**Blocks:** SOUL-P0-02 final copy (structure can be built)

### D-06 · PrismCap game names
**Status:** OPEN  
**Question:** Rename Connect Four / Codenames / Taboo variants?  
**Options:** A) Rename all three · B) Rename + change distinctive rules · C) Other  
**Recommendation:** A + B  
**Blocks:** PRSM-P0-01, hub catalog game names

### D-07 · Naming TravelOS / PrismOS / "OS"
**Status:** OPEN  
**Question:** TravelOS vs TravelCap; PrismOS remnants; "OS" suffixes in marketing.  
**Options:** A) Cap suffix everywhere · B) Keep TravelOS · C) Mixed  
**Recommendation:** A  
**Blocks:** TRVL-P1-01, HUB-P0-01 partial

### D-08 · VaultCap network features
**Status:** OPEN  
**Question:** Logo proxy and LLM import — strictly opt-in with consent, or remove?  
**Options:** A) Opt-in default off · B) Remove · C) Keep default-on (not recommended)  
**Recommendation:** A  
**Blocks:** VLT-P0-02 final behavior

### D-09 · LedgerCap data sources & store
**Status:** OPEN  
**Question:** Licensing for PSX/Yahoo data; drop public CORS proxies (P0 does this); is LedgerCap ever a store app?  
**Options:** A) Worker-only + PWA forever · B) Licensed feed + store later · C) Other  
**Recommendation:** A near-term  
**Blocks:** Store path; not LDG-P0-01 (proceeding)

### D-10 · DeeFoodieApp distribution
**Status:** OPEN  
**Question:** TestFlight/private vs public App Store; auth provider?  
**Options:** A) TestFlight/private · B) Public App Store + real auth · C) Other  
**Recommendation:** A  
**Blocks:** Full account-deletion / SIWA work; DFD-P0-03 localhost bind proceeds

### D-11 · Monetization / IAP
**Status:** OPEN  
**Question:** Free vs IAP for VaultPro / AuraCap Pro / ScentCap LAUNCH_PREVIEW in native builds.  
**Options:** A) Free · B) IAP · C) PWA paid outside stores only  
**Recommendation:** A until store plan clear  
**Blocks:** Paid unlock UX in native builds

### D-12 · Legal identity
**Status:** OPEN  
**Question:** Publisher name (Capricorn Systems vs personal), support email, privacy-policy host, data-controller address.  
**Options:** A) Capricorn Systems + support@… · B) Personal · C) Draft  
**Recommendation:** A  
**Blocks:** Final privacy/support URLs copy; drafts can use placeholders marked DRAFT

### D-13 · Website source of truth
**Status:** OPEN  
**Question:** capricorn-lab or capricorn-os-next builds the live hub?  
**Options:** A) lab · B) os-next · C) hub repo only  
**Recommendation:** Need live-deploy path verification; park HUB-P1-01 until answered  
**Blocks:** Retiring the other repo; dual prep allowed until then

## Open questions (Cursor-added)

### Q-1 · PulseCap · FLT-02 · D-03
See D-03. Evidence: 102 deletions leave a non-runnable tree; HEAD@6c78172 still has full app. Preserve branch pushed with dirty state. Finish branch uses restored `origin/main` tree pending owner answer.

### Q-2 · IdeaCap · FLT-03 · D-02
Disk is v1.2.1; Brain claims v2.0.0. No alternate remote branch found yet during FLT-00. IDEA-P0-01 proceeds on 1.2.1.
