BernAPlan Setup Studio — Browser Edition
========================================

This package uses setup.html instead of a Windows installer.

START
1. In File Explorer, choose Extract all for the ZIP and extract the whole folder somewhere permanent.
2. Open setup.html in Microsoft Edge or Chrome.
3. Choose "Open BernAPlan" to launch the bundled version.

INSTALL OR UPDATE
1. Open setup.html.
2. Choose "Install / Update Latest".
3. For a new install, save the file as index.html inside a folder named BernAPlan. For an update, choose your existing BernAPlan/index.html and confirm replacement.
4. If your browser does not support the file-save dialog, it downloads index.html to Downloads; move it into your BernAPlan folder and replace the old file.
5. Open the updated index.html from File Explorer.

IMPORTANT DATA NOTE
BernAPlan stores planner data in browser local storage. Before replacing the app, open your current BernAPlan and use Backups -> Export JSON backup. Keep the backup somewhere safe. Updating the same file in the same location helps preserve the local browser data.

SECURITY AND LIMITATIONS
- The ZIP does not include a PowerShell launcher or CMD installer.
- No administrator rights or Windows security changes are required.
- The setup page fetches the latest app HTML and saves it using your browser file picker when available. The full ZIP is available as a fallback.
- This is a local-first browser app. It does not yet provide native Lively Wallpaper integration, native Windows reminders, or Google/Outlook/Apple calendar synchronization.

SOURCE
https://github.com/davidhambern-ship-it/BernAPlan
