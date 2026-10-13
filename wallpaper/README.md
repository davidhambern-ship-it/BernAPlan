# BernAPlan — Lively Wallpaper beta

This folder provides a **standalone offline HTML wallpaper** compatible with Lively Wallpaper. The prepackaged user-ready ZIP (with a PNG gallery preview) was attached in the ChatGPT conversation.

## Try it
1. Export JSON from the current BernAPlan browser prototype if you need to preserve existing tasks.
2. Download/import the Lively ZIP from the conversation, or save this folder and add `index.html` to Lively.
3. Apply wallpaper. In Lively select **Settings → Wallpaper → Interaction → Wallpaper Input → Keyboard** for interactive forms.
4. Right-click wallpaper in Lively gallery → **Customise** to set accent color, current time highlight, clock and larger card text.
5. Use the BernAPlan **Backups → Import JSON** function inside the wallpaper to restore a prior plan.

## Scope and safety
- Lively web wallpaper: calendar and Missions work locally with browser localStorage.
- **Windows icons and taskbar remain above the wallpaper.** They may intercept interactions.
- Lively has its own browser storage, different from Edge/Chrome. Importing old data requires manual backup/restore. Export ongoing backups; reimporting/removing wallpapers can erase local data.
- Original BernAPlan v0.4.2 installer and BernANotifier are **not touched**. Native notifier integration awaits inspection of its original source or installer.
- No native Windows notification integration, cloud/device sync, paid API, background daemon, or cross-app data sharing in this release.
- Browser smoke tests validate the HTML/JS but do not establish verified installation/behavior on an actual Windows machine.
