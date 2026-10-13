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

## Desktop polish / free fonts (October 2026)
- Full-screen toolbar button removed for Lively wallpaper mode.
- Time rail now shows sunrise, daytime sun, sunset, and moon icons based on the configured time for each row.
- Customize → Appearance now includes separate font families for headings and task instructions, adjustable text size, and a local `.ttf`/`.otf`/`.woff`/`.woff2` import picker. A compatible imported font is stored in this wallpaper’s local IndexedDB and is **not part of a BernAPlan JSON backup**; re-import after moving wallpaper installs or devices.
- Never bundle font binaries with the repository, beta ZIP, or downloaded materials. Users choose their own locally held files; PFM/FON are not supported.
- For commercial use, verify font licenses. Some fonts marked Demo may have restrictions.
- Browser smoke checks confirmed the time icons, appearance selectors, save/reopen, and parsing of two supplied test fonts. Actual Lively file picker and IndexedDB persistence still require hands-on Windows verification.

## Personal font menu

The Appearance settings offer a built-in dropdown listing 17 distinct font names from the user's submitted collection (plus five standard typefaces). These are **font name references only**: no third-party font binaries are embedded or redistributed. To display one of these typefaces, it must already be installed in Windows, or the user may import their own TTF/OTF in the application. When missing, the UI falls back to readable standard typefaces. Two legacy source files (PFM/FON) are excluded. Both headings and body text can use independent selections. This remains free and offline. Font license responsibility stays with whoever provides/installs the fonts.

## Font-loading fix (2.0.3 beta)
The font dropdown alone cannot guarantee a font is available to the wallpaper renderer. Use **Customize → Appearance → Import your font collection** and select the user-owned TTF/OTF files in one batch. Recognized filenames now connect automatically to the 17 named styles, and options display ✓ Ready only after the font file has loaded. Built-in serif, monospace, and poster styles apply immediately without importing fonts. The importer works in memory even when IndexedDB is unavailable; on contexts without font storage, re-import after restart. No font binaries are bundled or published. The user-supplied `The 2K12.ttf` did not pass Chromium's font parser and remains unavailable until they supply a working file. Note: persistence inside the Lively runtime still requires hands-on Windows confirmation.

## Lively font interaction fix — 2.0.4 beta

The native HTML `<select>` font dropdowns were losing focus in Lively and letting the desktop capture clicks. The Appearance screen now displays in-page font **buttons/tiles**, one panel for headings and one for body text; the text size control uses three buttons too. Clicking a tile updates a live preview; clicking Apply appearance saves the selection. Built-in fonts require no import. A user-owned TTF/OTF file is still needed before a custom style shows **Ready**. The import process updates visible tiles without reinstating OS select popups. This package does not distribute font files. Browser smoke tests verified selection, preview, persistence and `Robotica.ttf` local import. Actual Lively input still needs testing on Windows; preserve prior wallpaper and export a JSON backup first.

## My Font Library — v2.0.5

**Fonts are managed inside BernAPlan, not installed into Windows.** In Customize → Appearance → My Font Library, users import permitted TTF, OTF, WOFF, or WOFF2 font files once. Imported fonts are loaded with FontFace and saved into this wallpaper's local IndexedDB when available; saved font data is reloaded on subsequent launches of this same wallpaper. The UI explicitly reports if persistence is blocked; fonts then work only for the current session.

The library lists each loaded font, offers individual removal, and provides **Back up my font library** and **Restore font-library backup** controls. These create/read a private JSON containing the user's own binary font data; these files are separate from BernAPlan's task JSON backup. Users should keep both before updating/replacing Lively wallpaper instances, because local storage can be isolated or erased. Do not share backups without font redistribution rights. **No font binaries are shipped or uploaded by BernAPlan.** PFM/FON remain unsupported; one submitted The 2K12.ttf was rejected by Chromium's parser in earlier tests. Appearance controls stay readable when decorative fonts are selected.

Browser tests using a simulated IndexedDB exercised import, selection, saving, export, removal, restoring and reloading previously saved font records without JavaScript errors. These checks **do not verify persistence within Lively on the user's Windows system**, which remains the next hands-on test. The original Windows v0.4.2 beta is unchanged; no paid APIs or services are required.
