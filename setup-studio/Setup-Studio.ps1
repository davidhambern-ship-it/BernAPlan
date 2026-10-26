# BernAPlan Setup Studio 2.0.0 Beta
# Installs/updates the new browser-based Desktop Command Center without touching v0.4.2.
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$script:SetupVersion = '2.0.0-beta'
$script:InstallRoot = Join-Path $env:LOCALAPPDATA 'Programs\BernAPlan Desktop Command Center'
$script:IndexPath = Join-Path $script:InstallRoot 'index.html'
$script:BundledIndex = Join-Path $PSScriptRoot 'BernAPlan\index.html'
$script:RemoteAppUrl = 'https://raw.githubusercontent.com/davidhambern-ship-it/BernAPlan/main/prototype/index.html'
$script:DesktopShortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) 'BernAPlan Desktop Command Center.lnk'

function Get-BernAPlanBrowser {
    $pf86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
    $pf = [Environment]::GetEnvironmentVariable('ProgramFiles')
    $local = $env:LOCALAPPDATA
    $paths = @(
        (Join-Path $pf86 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $pf 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $local 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $pf86 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $pf 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $local 'Google\Chrome\Application\chrome.exe')
    )
    foreach ($candidate in $paths) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate }
    }
    return $null
}

function Test-BernAPlanHtml([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    return ($content -and $content -match '(?i)<!doctype html' -and $content -match '(?i)BernAPlan')
}

function Set-SetupStatus([string]$Message) {
    $statusLabel.Text = $Message
    $statusLabel.Refresh()
}

function Refresh-SetupStatus {
    if (Test-BernAPlanHtml $script:IndexPath) {
        $installedLabel.Text = "Installed at: $($script:InstallRoot)"
        $launchButton.Enabled = $true
        $folderButton.Enabled = $true
    } else {
        $installedLabel.Text = 'BernAPlan 2.0 is not installed yet.'
        $launchButton.Enabled = $false
        $folderButton.Enabled = $false
    }
    $installedLabel.Refresh()
}

function New-BernAPlanShortcut {
    $browser = Get-BernAPlanBrowser
    $target = $script:IndexPath
    $arguments = ''
    if ($browser) {
        $target = $browser
        $fileUri = ([System.Uri]$script:IndexPath).AbsoluteUri
        $arguments = "--app=$fileUri"
    }
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($script:DesktopShortcut)
    $shortcut.TargetPath = $target
    $shortcut.Arguments = $arguments
    $shortcut.WorkingDirectory = $script:InstallRoot
    $shortcut.Description = 'Open BernAPlan Desktop Command Center'
    if ($browser) { $shortcut.IconLocation = "$browser,0" }
    $shortcut.Save()
}

function Install-Or-UpdateBernAPlan {
    $alreadyInstalled = Test-BernAPlanHtml $script:IndexPath
    if ($alreadyInstalled) {
        $prompt = "This will update the BernAPlan 2.0 application file in place." + [Environment]::NewLine + [Environment]::NewLine +
            "Your tasks are stored separately in browser storage. Please open BernAPlan and use Backups -> Export JSON before updating if your data matters." +
            [Environment]::NewLine + [Environment]::NewLine + "Continue?"
        $answer = [System.Windows.Forms.MessageBox]::Show(
            $prompt,
            'Update BernAPlan',
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )
        if ($answer -ne [System.Windows.Forms.DialogResult]::Yes) { return }
    }

    $tempFile = Join-Path $env:TEMP ("bernaplan-update-" + [Guid]::NewGuid().ToString('N') + '.html')
    $sourceLabel = 'bundled package'

    try {
        Set-SetupStatus 'Checking GitHub for the latest BernAPlan 2.0 build...'
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
            Invoke-WebRequest -Uri $script:RemoteAppUrl -OutFile $tempFile -UseBasicParsing -TimeoutSec 45
            if (-not (Test-BernAPlanHtml $tempFile)) {
                throw 'The downloaded file did not pass the BernAPlan HTML check.'
            }
            $sourceLabel = 'latest GitHub build'
        } catch {
            if ($alreadyInstalled) {
                throw ("Could not download the latest build. Your current installation was left unchanged." + [Environment]::NewLine + [Environment]::NewLine + "Details: " + $_.Exception.Message)
            }
            if (-not (Test-BernAPlanHtml $script:BundledIndex)) {
                throw ("The download failed and the bundled BernAPlan file is missing or invalid." + [Environment]::NewLine + [Environment]::NewLine + "Details: " + $_.Exception.Message)
            }
            Copy-Item -LiteralPath $script:BundledIndex -Destination $tempFile -Force
            $sourceLabel = 'bundled build (offline fallback)'
        }

        New-Item -ItemType Directory -Path $script:InstallRoot -Force | Out-Null
        $backupFolder = Join-Path $script:InstallRoot 'backups'
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

        if (Test-Path -LiteralPath $script:IndexPath) {
            $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
            Copy-Item -LiteralPath $script:IndexPath -Destination (Join-Path $backupFolder "index-$stamp.html") -Force
        }

        $stagedFile = Join-Path $script:InstallRoot 'index.new.html'
        Copy-Item -LiteralPath $tempFile -Destination $stagedFile -Force
        if (-not (Test-BernAPlanHtml $stagedFile)) { throw 'The staged BernAPlan file failed validation.' }
        Move-Item -LiteralPath $stagedFile -Destination $script:IndexPath -Force
        New-BernAPlanShortcut
        Refresh-SetupStatus

        $message = "BernAPlan Desktop Command Center is ready." + [Environment]::NewLine + [Environment]::NewLine +
            "Source: $sourceLabel" + [Environment]::NewLine + "Installed at: $($script:InstallRoot)" +
            [Environment]::NewLine + [Environment]::NewLine + "Your existing v0.4.2 Lively Wallpaper installation was not changed."
        [System.Windows.Forms.MessageBox]::Show($message, 'BernAPlan Setup Studio', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
        Set-SetupStatus "Success — installed/updated from $sourceLabel."
    } catch {
        Set-SetupStatus 'Setup did not complete. Your existing app file was not intentionally removed.'
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Setup Error', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
    } finally {
        if (Test-Path -LiteralPath $tempFile) { Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue }
    }
}

function Launch-BernAPlan {
    if (-not (Test-BernAPlanHtml $script:IndexPath)) {
        [System.Windows.Forms.MessageBox]::Show('Install BernAPlan first.', 'BernAPlan Setup Studio', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
        return
    }
    $browser = Get-BernAPlanBrowser
    if ($browser) {
        $fileUri = ([System.Uri]$script:IndexPath).AbsoluteUri
        Start-Process -FilePath $browser -ArgumentList "--app=$fileUri"
    } else {
        Start-Process -FilePath $script:IndexPath
    }
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "BernAPlan Setup Studio $($script:SetupVersion)"
$form.Size = New-Object System.Drawing.Size(760, 540)
$form.MinimumSize = New-Object System.Drawing.Size(700, 500)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [System.Drawing.Color]::FromArgb(14, 15, 17)
$form.ForeColor = [System.Drawing.Color]::FromArgb(245, 245, 245)
$form.Font = New-Object System.Drawing.Font('Segoe UI', 10)
$form.FormBorderStyle = 'Sizable'
$form.MaximizeBox = $false

$title = New-Object System.Windows.Forms.Label
$title.Text = 'BernAPlan Setup Studio'
$title.Font = New-Object System.Drawing.Font('Segoe UI', 23, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::FromArgb(247, 117, 19)
$title.Location = New-Object System.Drawing.Point(28, 22)
$title.Size = New-Object System.Drawing.Size(690, 42)
$form.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = 'Install and update the new Desktop Command Center'
$subtitle.Font = New-Object System.Drawing.Font('Segoe UI', 12)
$subtitle.Location = New-Object System.Drawing.Point(31, 70)
$subtitle.Size = New-Object System.Drawing.Size(680, 28)
$form.Controls.Add($subtitle)

$info = New-Object System.Windows.Forms.Label
$info.Text = "NEW BERNAPLAN 2.0" + [Environment]::NewLine + "Seven-day planning • guided tasks • weekly progress • local-first data" + [Environment]::NewLine + [Environment]::NewLine + "This installs into a separate folder. It does not replace the older v0.4.2 Lively Wallpaper app."
$info.Location = New-Object System.Drawing.Point(31, 115)
$info.Size = New-Object System.Drawing.Size(680, 100)
$info.Padding = New-Object System.Windows.Forms.Padding(14)
$info.BackColor = [System.Drawing.Color]::FromArgb(27, 28, 30)
$form.Controls.Add($info)

$installedLabel = New-Object System.Windows.Forms.Label
$installedLabel.Location = New-Object System.Drawing.Point(31, 228)
$installedLabel.Size = New-Object System.Drawing.Size(680, 38)
$installedLabel.ForeColor = [System.Drawing.Color]::FromArgb(205, 205, 205)
$form.Controls.Add($installedLabel)

$installButton = New-Object System.Windows.Forms.Button
$installButton.Text = 'Install / Update Latest'
$installButton.Location = New-Object System.Drawing.Point(31, 282)
$installButton.Size = New-Object System.Drawing.Size(220, 48)
$installButton.FlatStyle = 'Flat'
$installButton.FlatAppearance.BorderSize = 0
$installButton.BackColor = [System.Drawing.Color]::FromArgb(247, 117, 19)
$installButton.ForeColor = [System.Drawing.Color]::FromArgb(18, 11, 7)
$installButton.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$installButton.Add_Click({ Install-Or-UpdateBernAPlan })
$form.Controls.Add($installButton)

$launchButton = New-Object System.Windows.Forms.Button
$launchButton.Text = 'Launch BernAPlan'
$launchButton.Location = New-Object System.Drawing.Point(267, 282)
$launchButton.Size = New-Object System.Drawing.Size(190, 48)
$launchButton.FlatStyle = 'Flat'
$launchButton.BackColor = [System.Drawing.Color]::FromArgb(38, 40, 43)
$launchButton.ForeColor = [System.Drawing.Color]::White
$launchButton.Add_Click({ Launch-BernAPlan })
$form.Controls.Add($launchButton)

$folderButton = New-Object System.Windows.Forms.Button
$folderButton.Text = 'Open Install Folder'
$folderButton.Location = New-Object System.Drawing.Point(473, 282)
$folderButton.Size = New-Object System.Drawing.Size(238, 48)
$folderButton.FlatStyle = 'Flat'
$folderButton.BackColor = [System.Drawing.Color]::FromArgb(38, 40, 43)
$folderButton.ForeColor = [System.Drawing.Color]::White
$folderButton.Add_Click({
    if (Test-Path -LiteralPath $script:InstallRoot) {
        Start-Process -FilePath 'explorer.exe' -ArgumentList ('"' + $script:InstallRoot + '"')
    }
})
$form.Controls.Add($folderButton)

$backupNote = New-Object System.Windows.Forms.Label
$backupNote.Text = 'Before updates or moving computers: open BernAPlan -> Backups -> Export JSON backup.'
$backupNote.Location = New-Object System.Drawing.Point(31, 354)
$backupNote.Size = New-Object System.Drawing.Size(680, 42)
$backupNote.ForeColor = [System.Drawing.Color]::FromArgb(255, 190, 125)
$form.Controls.Add($backupNote)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = 'Ready.'
$statusLabel.Location = New-Object System.Drawing.Point(31, 410)
$statusLabel.Size = New-Object System.Drawing.Size(680, 36)
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 205, 185)
$form.Controls.Add($statusLabel)

$footer = New-Object System.Windows.Forms.Label
$footer.Text = 'Free beta • No subscription • Does not remove BernAPlan v0.4.2'
$footer.Location = New-Object System.Drawing.Point(31, 460)
$footer.Size = New-Object System.Drawing.Size(680, 24)
$footer.ForeColor = [System.Drawing.Color]::FromArgb(145, 145, 145)
$form.Controls.Add($footer)

Refresh-SetupStatus
[void]$form.ShowDialog()
