# BernAPlan 2.0 — Desktop Command Center (Phase 1 prototype)

This is a **working, independent, static prototype** of the new weekly calendar—not a patch to the existing v0.4.2 desktop installer. The original GitHub release and any existing Windows user data are untouched.

## Try it

**Fixed local-opening build:** `index.html` is now self-contained with its styling and JavaScript embedded. Download/open that single file directly in Edge or Chrome; you do not need any other files beside it. The separate `app.js` and `styles.css` are retained as editable source files. There are no dependencies, installs, API keys, paid services, accounts, builds, or backend calls. Optionally, serve it locally with `python -m http.server 8000` and open `http://localhost:8000/`. The previous unstyled-screen issue happened when `index.html` was opened without its referenced assets.

On first launch, use the **five-step guided wizard**: choose a life/work category, the goal that matters most, your biggest planning obstacle, and how many work blocks to schedule. Review a real example before creating your playbook. Common blocks use curated, specific beginner-friendly instructions (not a paid AI service); unfamiliar custom titles receive editable starter guidance. No HireBerna-specific business task list is imposed.

## Implemented
- Seven-day Monday–Sunday calendar, editable time rows, previous/next week
- Task blocks; click for unique objectives, guided instructions, realistic examples, professional planning tips, a next-action coach, checklists, notes
- Create, edit, delete, mark completed; user-specific tasks
- Weekly completion tracking, configurable scoreboard, editable result logging, non-negotiables
- Free color and logo customization (stored locally)
- Five-step interactive setup wizard with user-driven task selection, selectable goals/obstacles/pace, and preview
- Safe upgrade of unmodified older generic task instructions while preserving customized task text and notes\n- Offline localStorage persistence, JSON export/import
- Meeting/deadline/reminder: explicit one-time `.ics` calendar export (not live sync)
- Responsive browser layout; desktop board fits the screen at standard viewport sizes, grid can scroll horizontally when space is limited

## Not yet implemented
- Integration/migration of v0.4.2 Windows/Lively Wallpaper/BernANotifier (source not yet available here)
- Google/Outlook/Apple live synchronization, account login, server backup, and cross-device sync
- Android launcher and iOS Home Screen widgets (separate upcoming platforms)
- Premium subscriptions, multiple command centers or HQ

## Privacy and backup
- The prototype saves on **this browser, on this device** (`localStorage` key `bernaplan.desktop.v2.prototype.1`).
- No data is transmitted off-device.
- Clearing browser storage, private/incognito use, or moving devices can remove data. Use **Backups → Export JSON backup**.
- The code neither reads nor modifies the existing desktop beta's persisted data.
- Calendar `.ics` export generates a local file; the user imports it into an external calendar manually.

## Next phase
Audit the original Windows release's *editable source*, then integrate this calendar without breaking the current native/desktop experience. Add selective authenticated calendar sync and Android/iPhone surfaces only after testing a sustainable $0 operational path.
## Existing prototype users

The new build uses the same localStorage key, but browser files opened from different local paths can have separate storage contexts. Export a JSON backup from the older prototype before switching if your work matters. If you choose **Build a guided weekly plan** again under **Customize → My schedule**, it replaces the task layout **only after a confirmation**; export a backup first. Custom instructions are not silently overwritten by the automatic generic-template guidance upgrade.

## ACTION System update (Phase 2 prototype)
- **Start Block** provides a local 5/15/25-minute focus session and the next checklist action.
- **I don't feel like doing this** adapts encouragement to overwhelm, uncertainty, distractions, low energy, or fear of imperfect work.
- **Show my results & finish** distinguishes self-reported completion from user-documented results (description or link). No claim of independent verification.
- **Weekly Reality Check** records actual wins, obstacles, and a suggested adjustment without automatically overwriting the user's plan.
- The weekly scoreboard now counts documented outcomes separately from completed blocks.
- The HTML is standalone (all scripts and styles inlined) and has zero paid dependencies.
- Existing browser saves use the same storage key and support the new optional proof/session/review fields. Back up data before opening the HTML from a new file location.
- **Not yet delivered:** native Windows wallpaper integration, Android launcher, native iOS widgets, live calendar APIs, independent proof verification, cross-device sync.

## Clear agenda correction (October 13, 2026)
- **Original playbook restored:** seven days across and five populated time rows by default; lighter setup modes show focused blocks plus explicitly labeled lighter/catch-up/rest activities rather than blank cells.
- **Action + target on every starter card:** 126 curated task recipes spanning everyday, business, school and creator playbooks. E.g. “Find opportunities” points to Upwork/Contra/LinkedIn and specifies a target of 10 viable opportunities.
- **Full-width calendar:** weekly scoreboard moved below the grid to preserve readable card width. The full five-row board was tested at 1366×768, 1440×810, 1700×900 and 1920×1080 without calendar scrolling.
- **Saved data respected:** auto-migrate old 14/21-task generated light/balanced plans only when they retain the original generated layout. Keep prior task IDs, progress, notes, and user-entered evidence. Only replace recognizably generic auto-generated card descriptions; preserve custom edits.
- **Task editor:** editable action and outcome/target fields; ACTION coach, motivation, checklist, completion evidence and weekly review still present.

Open **`prototype/index.html`** (standalone; CSS and JS bundled inline). The extracted `app.js` and `styles.css` files are editable source copies. No backend, paid service, or user account is required. This is still a browser prototype and does not replace the existing Windows v0.4.2 beta.

## Guided Mission: Earn Your First $20 (experimental)

The standalone `prototype/index.html` includes a free, offline **Missions** wizard. Choose a small beginner service (graphics, writing, spreadsheet organization, or skill discovery), available device, daily minutes, and focus time. A fixed Monday–Sunday calendar displays seven required milestones plus clearly labeled optional support cells. Each primary task has unique detailed instructions, checklists, examples, and accountability.

The mission scoreboard records **user-reported** prospects, offers, replies, agreed customers, and money *actually received*. These are not independently verified; completing a task does not create earnings or send messages. Users may correct the last logged entry, view rules-based next steps, and approve a single next-week-only adjustment. Existing boards are snapshotted before replacement and can be restored. Basic mission operation requires no cloud services, paid AI, API keys, or payment account.

The mission does **not** promise sales, replace employment income, perform outreach, process payments, or access third-party calendars. It is still a browser prototype, not the Lively Wallpaper installation or Android launcher. The user's own browser stores progress; exporting a JSON backup is strongly recommended before switching builds or clearing storage.
