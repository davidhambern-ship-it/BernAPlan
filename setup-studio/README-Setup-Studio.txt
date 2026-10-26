BernAPlan Setup Studio — Browser Edition
========================================

This package uses setup.html instead of a Windows installer.

START
1. In File Explorer, choose Extract all for the ZIP and extract the whole folder somewhere permanent.
2. Open setup.html in Microsoft Edge or Chrome.
3. Choose "Open BernAPlan" to launch the bundled version.

INSTALL OR UPDATE
1. Open setup.html.
2. Choose "Download latest package".
3. Extract the new ZIP to a temporary folder.
4. Copy the new ZIP’s BernAPlan/index.html over the existing app file in your permanent BernAPlan folder.
5. Open the updated index.html from File Explorer.

IMPORTANT DATA NOTE
BernAPlan stores planner data in browser local storage. Before replacing the app, open your current BernAPlan and use Backups -> Export JSON backup. Keep the backup somewhere safe. Updating the same file in the same location helps preserve the local browser data.

SECURITY AND LIMITATIONS
- The ZIP does not include a PowerShell launcher or CMD installer.
- No administrator rights or Windows security changes are required.
- Updates are delivered in a ZIP. Extract it, then replace only the existing BernAPlan/index.html with the updated copy.
- This is a local-first browser app. It does not yet provide native Lively Wallpaper integration, native Windows reminders, or Google/Outlook/Apple calendar synchronization.

SOURCE
https://github.com/davidhambern-ship-it/BernAPlan
