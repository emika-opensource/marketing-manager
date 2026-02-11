# Marketing Manager — Audit Report

**Date:** 2026-02-11
**Auditor:** AI Audit Agent
**Focus:** Time-to-first-value improvements

---

## 1. First-Run Experience

**Verdict: Poor. Zero onboarding in the UI.**

When a new user opens the dashboard for the first time, they see:
- All KPIs showing `$0`, `0%`, `0` — a wall of zeros
- Empty channel performance chart
- Empty influencer pipeline (all zeros)
- "No campaigns yet" empty state

**There is no onboarding wizard, welcome screen, guided tour, or even a "Getting Started" prompt.** The user lands on an empty dashboard with no indication of what to do first or where to start.

The BOOTSTRAP.md contains a conversational onboarding flow (10 questions), but this is AI-agent-facing only — the user in the web UI gets nothing. If a user opens the dashboard without first chatting with the AI agent, they're completely lost.

**Time-to-first-value:** Effectively infinite via the UI alone. The user must already know to go to Brand & ICP → fill in brand → create audiences → add channels → etc. There's no suggested order, no progress indicator, no "complete your setup" CTA.

**Steps to first meaningful value (if you know what you're doing):**
1. Navigate to Brand & ICP → Edit brand (fill ~10 fields)
2. Create at least one audience segment (~15 fields)
3. Add a channel
4. Set budget
5. Create a campaign

That's 5 pages and ~30+ form fields before the dashboard shows anything useful. Way too many.

---

## 2. UI/UX Issues

### Critical
- **No onboarding/welcome flow** — first-time user sees a dead dashboard
- **No guidance on workflow order** — should I set up brand first? Channels? Budget? No clue
- **Ad Accounts "Connect" is fake** — clicking "Connect" just asks for an account ID string. There's no OAuth, no real integration. It's a glorified text field pretending to be a connection. Misleading.
- **Influencer search is a stub** — `POST /api/influencers/search` returns a static "use the AI assistant" message. The search button in the UI doesn't exist, but the API endpoint is misleading
- **Messages in influencer detail require a deal first** — user types a message, hits send, gets "Create a deal first to track messages" error. Unintuitive — why can't I send an outreach message before creating a formal deal?

### Major
- **No loading states on page transitions** — clicking nav items shows stale content briefly then flashes to new content. No skeleton/spinner during data fetches
- **Dashboard KPIs are misleading when empty** — showing "0% ROI" and "$0 spend" looks like the system is broken, not just empty
- **Campaign metrics are all manually entered** — there's no actual integration pulling real data. User has to manually update impressions, clicks, conversions via API. The UI doesn't even expose metric editing
- **Creative Studio requires FAL_KEY but doesn't tell you upfront** — user clicks "Generate", fills out the form, hits generate, THEN gets an error about missing API key. Should check on page load or show a setup banner
- **No confirmation or success feedback on some actions** — deleting items shows toast, but the `confirm()` dialogs are native browser alerts (ugly, inconsistent with the polished dark UI)
- **`saveAdAccount` has a bug** — `onclick="saveAdAccount($('#ad-platform')?.value)"` inside a string — the `$` function call happens at template time, not click time, and the `?.` won't work in an onclick string attribute

### Minor
- **Color inputs in brand editor** — tiny color pickers, no hex input visible, hard to paste exact brand colors
- **No image upload for brand assets** — multer is imported and configured but never used in any route
- **Pipeline visualization is static** — can't click pipeline stages to filter
- **Influencer avatars are just initials** — no image upload support despite the UI having avatar circles
- **Tables have `cursor: pointer` globally** — even non-clickable rows look clickable
- **No pagination** — all lists load everything. Will break with 100+ items
- **No search/filter on Brand & ICP page** — can't search audiences
- **Mobile responsive is minimal** — sidebar collapses to icons but content doesn't reflow well

---

## 3. Feature Completeness

### Fully Implemented
- Brand profile CRUD ✅
- Audience segment CRUD ✅
- Campaign CRUD (data entry only) ✅
- Influencer CRUD + scoring ✅
- Influencer deal management ✅
- Channel CRUD ✅
- Budget tracking ✅
- Creative generation via fal.ai ✅
- Analytics aggregation ✅
- Settings (FAL key) ✅

### Stubbed / Fake
- **Ad account "connections"** — just stores a string, no real integration
- **Influencer search** — returns static suggestions, no actual search
- **Campaign metrics** — no real data source, all zeros unless manually set via API
- **Multer upload** — configured but no upload routes exist
- **Notifications setting** — checkbox exists but notifications aren't implemented anywhere
- **Channel performance data** — manually entered, no integrations

### Missing Entirely
- No data import/export
- No reporting/PDF generation
- No email integration
- No calendar/scheduling for campaigns
- No A/B test tracking
- No competitor monitoring
- No social media post scheduling
- No webhook/integration framework
- No multi-user/auth

---

## 4. Error Handling

**Verdict: Minimal.**

- **API errors:** Server returns `{ error: 'Not found' }` with 404 — adequate but basic
- **Client-side:** No try/catch around any `api.get/post/put/del` calls. If the server is down or returns an error, the UI silently fails or shows broken HTML
- **Empty states:** Present on most pages ✅ — this is good
- **Loading states:** None. No spinners during data fetches, no skeleton screens
- **Creative generation:** Has a polling mechanism and spinner ✅, but errors are displayed as tiny red text easily missed
- **Form validation:** Zero. Every form submits regardless of content. Empty brand name, zero-budget campaigns, influencers with no name — all accepted
- **Network errors:** Not handled at all. No retry, no "connection lost" banner

---

## 5. Code Quality

### Bugs
- **`saveAdAccount` onclick** — `$('#ad-platform')?.value` evaluated at wrong time in `connectAdAccountCustom`
- **Creative error status** — when generation fails, status is set to `'ready'` instead of `'error'`, making failed creatives look successful
- **Race condition in creative generation** — async IIFE reads/writes `creatives.json` without locking. Concurrent requests could lose data
- **`ad-accounts/guides` route conflict** — Express matches `/api/ad-accounts/guides` against the CRUD `GET /api/ad-accounts/:id` route first (since `crudRoutes` is registered before the guides route). The guides endpoint may never be reached. **This is a real bug.**

### Anti-patterns
- **Global `window.*` function assignments** — every page route dumps functions onto `window`. These persist across navigations, polluting global scope and potentially causing stale closures
- **Inline `onclick` handlers everywhere** — mixed with the SPA pattern, makes debugging hard
- **No input sanitization** — `esc()` is used for display but raw user input goes straight to JSON files
- **Synchronous file I/O** — `readJsonSync`/`writeJsonSync` on every request blocks the event loop
- **No request validation middleware** — any shape of JSON is accepted by all endpoints
- **`uuid()` is not actually a UUID** — collision probability is low but non-zero for high-traffic use

### Security
- **No authentication** — anyone with the URL can read/write all data
- **FAL API key stored in plain JSON** — readable by any request to `/api/config` (masked in GET, but the raw file is on disk)
- **XSS potential** — while `esc()` is used in most places, some dynamic HTML construction might miss edge cases (e.g., `style` attributes with user data)
- **No CSRF protection**
- **No rate limiting**

---

## 6. BOOTSTRAP.md Quality

**Verdict: Decent structure, wrong medium.**

**Strengths:**
- Good conversational flow — 10 questions covering essential marketing info
- Clear mapping of answers → API calls
- Example first message provided
- Logical progression from brand → audience → channels → budget

**Weaknesses:**
- **Entirely AI-chat dependent** — if user opens the web UI first (likely!), none of this happens
- **Too many questions upfront** — 10 questions before any value is delivered. Should be 2-3 to get started, then progressive disclosure
- **No mention of FAL_KEY setup** — creative generation will fail without it
- **"Delete this file after onboarding"** instruction is good but assumes the AI follows through
- **No fallback** — if user doesn't answer all questions, there's no partial setup path

---

## 7. SKILL.md Quality

**Verdict: Excellent depth, good API docs.**

**Strengths:**
- Comprehensive marketing knowledge — ad platforms, influencer pricing, budget frameworks
- All API endpoints documented with request/response formats
- Outreach templates provided
- Scoring methodology clearly explained
- Human-in-the-loop protocol for deal approvals ✅
- Proactive opportunity suggestions listed

**Weaknesses:**
- **No mention of what's fake vs real** — AI doesn't know ad account "connections" don't actually connect. It might tell users their Google Ads account is "connected" when it's just a text field
- **No error handling guidance** — what should the AI do when fal.ai is down? When data files are corrupted?
- **Missing workflow guidance** — what order should setup happen? What's the minimum viable setup?
- **TOOLS.md is just an API reference table** — duplicates SKILL.md content without adding value

---

## 8. Specific Improvements (Ranked by Impact)

### 🔴 Critical (Do These First)

1. **Add a first-run welcome/setup wizard in the UI** — Detect empty brand profile, show a 3-step setup: (1) Brand name + industry, (2) One target audience, (3) Set budget. This alone cuts time-to-first-value from "never" to 2 minutes.

2. **Fix the ad-accounts/guides route ordering bug** — Move the `GET /api/ad-accounts/guides` route BEFORE `crudRoutes('ad-accounts', ...)` or the guides endpoint is shadowed by the `:id` param route.

3. **Fix creative generation error status** — Change `items[i].status = 'ready'` to `items[i].status = 'error'` in the catch block and when result format is unrecognized.

4. **Add client-side error handling** — Wrap all `api.*` calls in try/catch. Show toast on failure. Display a "couldn't load data" state instead of blank/broken pages.

5. **Add basic form validation** — Required fields (brand name, campaign name, influencer name) should be enforced before submission. Highlight empty required fields.

### 🟡 High Impact

6. **Show a "Getting Started" checklist on the dashboard when empty** — e.g., "☐ Set up your brand ☐ Define your audience ☐ Add a channel ☐ Set your budget ☐ Create first campaign" with links to each page. Disappears once all are done.

7. **Add loading spinners to page transitions** — Show a spinner in the content area while fetching data. Simple: `content().innerHTML = '<div class="spinner"></div>';` at the top of each route handler.

8. **Pre-populate with example/demo data option** — "Load example data" button that creates a sample brand, audience, channel, and campaign so users can see what a populated dashboard looks like before committing their own data.

9. **Check FAL_KEY on Creative Studio page load** — Show a banner "Set up your fal.ai API key in Settings to generate creatives" instead of letting users fill out the form and fail.

10. **Make campaign metrics editable in the UI** — Currently metrics can only be set via API. Add an "Update Metrics" button/modal on each campaign so the dashboard actually shows data.

### 🟢 Medium Impact

11. **Decouple influencer messages from deals** — Allow sending outreach messages to an influencer before creating a formal deal. The current flow is backwards (you shouldn't need a contract to say hello).

12. **Add honest labels to ad account connections** — Instead of "Connect", say "Track Account" or "Add Account Reference". Don't use connection language for a text field.

13. **Switch to async file I/O** — Replace `readJsonSync`/`writeJsonSync` with async versions to avoid blocking the event loop.

14. **Add pagination to all list endpoints** — `?page=1&limit=20` query params. Lists will break at scale.

15. **Reduce BOOTSTRAP.md to 3 essential questions** — Brand name + industry, primary audience description, monthly budget. Everything else can be progressive. Get the dashboard showing *something* in under 60 seconds.

16. **Add "Quick Actions" to the dashboard** — Buttons for the most common tasks: "Add Campaign", "Generate Creative", "Add Influencer" right on the dashboard so users don't have to navigate.

17. **Update SKILL.md to document what's real vs simulated** — The AI needs to know ad accounts aren't really connected so it doesn't mislead users.

18. **Add authentication** — Even basic token auth. Currently anyone can access all data.

19. **Implement actual file upload routes** — Multer is configured but unused. Add brand logo upload, creative upload, influencer profile photo upload.

20. **Add keyboard shortcuts** — `n` for new item, `/` for search, `Esc` to close modals. Power users will appreciate it.

---

## Summary

The Marketing Manager has a **solid feature surface area** and a **polished dark UI**, but it suffers from a **fatal first-run experience problem**. A new user opening the dashboard sees nothing useful and has no guidance on how to get started. The BOOTSTRAP.md onboarding is AI-chat-only and too long.

**The single highest-impact change** is adding a UI-based setup wizard that captures brand name, one audience, and budget in 3 steps. This would transform time-to-first-value from "infinite" to "2 minutes."

Secondary priorities are fixing real bugs (route ordering, error statuses), adding error handling/validation, and being honest about what's a real integration vs. a data entry field.

The SKILL.md is the strongest part of this repo — it gives the AI agent genuinely useful marketing knowledge. The code quality is acceptable for an MVP but has several bugs that need fixing before production use.

---

## Fixes Applied

**Date:** 2026-02-11

### 🔴 Critical Fixes

1. **Added 3-step UI setup wizard** — First-time users (empty brand) now see a guided wizard: Brand (name + industry) → Audience (name + demographics) → Budget. Time-to-first-value reduced from "infinite" to ~60 seconds.

2. **Fixed route ordering bug** — Moved `GET /api/ad-accounts/guides` route BEFORE `crudRoutes('ad-accounts', ...)` so the guides endpoint is no longer shadowed by the `:id` param route.

3. **Fixed creative generation error status** — Changed `status = 'ready'` to `status = 'error'` in both the catch block and the unrecognized response format branch of the creative generation async handler.

4. **Added client-side error handling** — All `api.get/post/put/del` methods now check `res.ok` and throw on failure. Every route handler is wrapped in try/catch with user-visible error states.

5. **Added basic form validation** — Required fields enforced before submission: brand name, audience name, campaign name, influencer name, channel name, ad account ID, budget amount.

### 🟡 High Impact Fixes

6. **Added "Getting Started" checklist on dashboard** — When setup is incomplete, dashboard shows a checklist: brand, audience, channel, budget, campaign — with links to each page. Disappears when all are done.

7. **Added loading spinners to all page transitions** — Every route handler now shows a spinner via `showLoading()` while fetching data.

8. **FAL_KEY check on Creative Studio page load** — Shows a warning banner with link to Settings when fal.ai API key is not configured.

9. **Fixed `saveAdAccount` onclick evaluation timing bug** — Replaced inline `$('#ad-platform')?.value` in onclick string attribute with a proper function call that reads the value at click time.

### 🟢 Medium Impact Fixes

10. **Honest labels for ad account connections** — Changed "Connect" button to "Track Account", "Connected Accounts" header to "Tracked Accounts" with "(reference only — no live integration)" note.

11. **Compressed BOOTSTRAP.md** — Reduced from 10 questions to 3 essential questions. Added notes about the UI wizard, FAL_KEY requirement, and ad account limitations.

12. **Updated SKILL.md with real vs simulated documentation** — Added a "What's Real vs Simulated" section so the AI knows which features have real integrations vs reference-only data entry, and instructs the AI to be transparent about limitations.

13. **Added error handling to all delete/toggle/approve actions** — All destructive and state-changing operations now have try/catch with error toasts.

### Summary of Changes

| File | Changes |
|------|---------|
| `server.js` | Route ordering fix (guides before CRUD), creative error status fix |
| `public/app.js` | Setup wizard, loading states, error handling, form validation, FAL_KEY check, saveAdAccount bug fix, honest labels |
| `BOOTSTRAP.md` | Compressed to 3 questions, added notes about UI wizard and limitations |
| `skill/SKILL.md` | Added "What's Real vs Simulated" section |
| `AUDIT.md` | This fixes section |
