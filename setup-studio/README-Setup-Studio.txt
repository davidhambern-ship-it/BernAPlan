BernAPlan Setup Studio 2.0.0 Beta
=================================

This is the NEW setup package for the new BernAPlan Desktop Command Center.

It installs the browser-based BernAPlan 2.0 weekly planner from prototype/index.html.
It does NOT install the old v0.4.2 Lively Wallpaper package and does NOT remove or
overwrite that older installation.

INSTALL
1. Extract the entire ZIP to a folder.
2. Double-click Start-Setup-Studio.cmd.
3. Click "Install / Update Latest".
4. Click "Launch BernAPlan" when installation finishes.

UPDATE
1. Open Setup Studio again from the extracted folder.
2. Click "Install / Update Latest". It downloads the latest new BernAPlan HTML build.
3. Launch BernAPlan from Setup Studio or from the desktop shortcut.

IMPORTANT DATA NOTE
BernAPlan 2.0 stores planning data in the browser's local storage, not in the HTML file.
The installer keeps the app at the same local path during updates and does not delete
browser data. Before updates or moving to another computer, open BernAPlan and use
Backups -> Export JSON backup. Keep that backup somewhere safe.

WHAT THIS PACKAGE DOES
- Installs the new interactive seven-day Desktop Command Center.
- Creates a desktop shortcut that opens BernAPlan in an Edge/Chrome app-style window
  when a supported browser is found.
- Updates the installed HTML from the latest main/prototype/index.html on GitHub.
- Keeps a timestamped copy of the previous HTML file before replacing it.
- Does not require administrator rights, paid services, accounts, API keys, or a build.

CURRENT LIMITATIONS
This is the free, local-first browser prototype. It does not yet integrate the old
native Windows/Lively Wallpaper/BernANotifier installation. It does not provide live
Google/Outlook/Apple calendar synchronization or cross-device sync. Those are separate
future development tasks.

SOURCE
https://github.com/davidhambern-ship-it/BernAPlan
