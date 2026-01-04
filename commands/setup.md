---
description: Configure claude-hud as your statusline (plugin:claude-hud@claude-hud)
allowed-tools: Bash, Read, Edit, Write, AskUserQuestion
---

# Claude HUD Setup

This setup configures the Claude HUD statusline with optional Nerd Font installation for enhanced icons.

## Step 1: Detect Platform

First, determine the platform:
- **Windows**: Check if running PowerShell or cmd
- **macOS**: Check for Darwin platform
- **Linux**: Default fallback

## Step 2: Ask About Nerd Font

Ask the user: "Would you like to install JetBrainsMono Nerd Font for enhanced icons? (Recommended)"

### If Yes - Install Nerd Font

**Windows (PowerShell):**
```powershell
$fontUrl = "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip"
$tempDir = Join-Path $env:TEMP "nerd-font-install-$(Get-Random)"
$fontDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Fonts"

New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $fontUrl -OutFile "$tempDir\JetBrainsMono.zip" -UseBasicParsing
Expand-Archive -Path "$tempDir\JetBrainsMono.zip" -DestinationPath "$tempDir\fonts" -Force

if (-not (Test-Path $fontDir)) { New-Item -ItemType Directory -Force -Path $fontDir | Out-Null }

$regPath = "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
Get-ChildItem "$tempDir\fonts\*.ttf" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $fontDir $_.Name) -Force
    New-ItemProperty -Path $regPath -Name "$($_.BaseName) (TrueType)" -Value (Join-Path $fontDir $_.Name) -PropertyType String -Force | Out-Null
}
Remove-Item -Recurse -Force $tempDir
Write-Host "JetBrainsMono Nerd Font installed!"
```

**macOS (Homebrew):**
```bash
brew install --cask font-jetbrains-mono-nerd-font
```

**Linux:**
```bash
mkdir -p ~/.local/share/fonts
curl -fsSL "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip" -o /tmp/font.zip
unzip -o /tmp/font.zip -d /tmp/fonts
cp /tmp/fonts/*.ttf ~/.local/share/fonts/
fc-cache -fv
rm -rf /tmp/font.zip /tmp/fonts
```

## Step 3: Create HUD Configuration

Create `~/.claude/claude-hud.json` with:

```json
{
  "iconMode": "nerd",
  "colorMode": "256",
  "animationsEnabled": true,
  "spinnerStyle": "braille"
}
```

If user declined Nerd Font, use `"iconMode": "unicode"` instead.

## Step 4: Configure StatusLine

Add to `~/.claude/settings.json`:

**Windows:**
```json
{
  "statusLine": {
    "type": "command",
    "command": "node C:/DEV/claude-hud/dist/index.js"
  }
}
```

**macOS/Linux (using plugin cache):**
```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"$(ls -td ~/.claude/plugins/cache/claude-hud/claude-hud/*/ 2>/dev/null | head -1)dist/index.js\""
  }
}
```

Merge with existing settings. Do not overwrite other fields.

## Step 5: Terminal Font Configuration

If Nerd Font was installed, inform the user:

**Windows Terminal:**
> Add `"font": { "face": "JetBrainsMono Nerd Font" }` to your Windows Terminal profile, or go to Settings > Profiles > Defaults > Appearance > Font face.

**iTerm2 (macOS):**
> Go to Preferences > Profiles > Text > Font and select "JetBrainsMono Nerd Font"

**Other terminals:**
> Configure your terminal to use "JetBrainsMono Nerd Font"

## Step 6: Completion

The HUD appears immediately - no restart needed (except for font changes).

Tell the user:
- Installation complete
- If font was installed, they may need to restart their terminal to see the new font
- The statusline shows: context usage, active tools, running agents, and todo progress

## Optional: Star the Repository

Ask the user: "Would you like to ⭐ star the repository to support the project?"

Only if they explicitly agree, run:
```bash
gh api -X PUT /user/starred/jarrodwatts/claude-hud
```

Never run this automatically without user consent.
