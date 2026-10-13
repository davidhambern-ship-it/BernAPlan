# BernAPlan 2.0 — Desktop Command Center (Phase 1 prototype)

This is a **working, independent, static prototype** of the new weekly calendar—not a patch to the existing v0.4.2 desktop installer. The original GitHub release and any existing Windows user data are untouched.

## Try it

Open `index.html` in a modern browser (Edge or Chrome). There are no dependencies, installs, API keys, paid services, accounts, builds, or backend calls. All files work from a local folder. Optionally, serve them with `python -m http.server 8000` and open `http://localhost:8000/`.

On first launch, choose an Everyday, Business, Student, Creator, or Blank template. All templates have **generic user tasks**, never HireBerna's personal to-do list. Customize them after setup.

## Implemented
- Seven-day Monday–Sunday calendar, editable time rows, previous/next week
- Task blocks; click for objective, instructions, tips, checklists, notes
- Create, edit, delete, mark completed; user-specific tasks
- Weekly completion tracking, configurable scoreboard, editable result logging, non-negotiables
- Free color and logo customization (stored locally)
- Editable starter templates and onboarding flow
- Offline localStorage persistence, JSON export/import
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