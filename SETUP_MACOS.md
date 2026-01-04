# Bruno HUD - macOS Setup Guide

This guide is for Claude Code to automatically set up Bruno HUD on macOS.

## Instructions for Claude

Follow these steps in order. Execute each command and verify success before proceeding.

### Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/brnbtt/bruno-hud.git ~/bruno-hud

# Install dependencies and build
cd ~/bruno-hud && npm ci && npm run build
```

Verify: Check that `~/bruno-hud/dist/index.js` exists.

### Step 2: Configure Claude Code Statusline

Read the current `~/.claude/settings.json` file (create if it doesn't exist).

Add or update the `statusLine` field using **absolute paths**:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/opt/homebrew/bin/node /Users/USERNAME/bruno-hud/dist/index.js"
  }
}
```

**Important**:
- Use absolute paths for both `node` and the script. The `~` shortcut and `node` command may not resolve correctly when Claude Code executes the statusline.
- Find the node path with: `which node` (commonly `/opt/homebrew/bin/node` on Apple Silicon or `/usr/local/bin/node` on Intel Macs)
- Replace `USERNAME` with the actual username (get it with `whoami`)
- Merge with existing settings. Do not overwrite other fields.

### Step 3: Install Nerd Font (Optional but Recommended)

**Option A: Via Homebrew**

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

**Option B: Manual Download (if Homebrew fails)**

On newer macOS versions, Homebrew may have compatibility issues. Install manually:

```bash
# Download the font
curl -fLO https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip -o /tmp/JetBrainsMono.zip

# Unzip and install to user fonts
cd /tmp && unzip -o JetBrainsMono.zip -d JetBrainsMono
cp /tmp/JetBrainsMono/*.ttf ~/Library/Fonts/

# Clean up
rm -rf /tmp/JetBrainsMono /tmp/JetBrainsMono.zip
```

After installation, inform the user they need to:
1. Open their terminal preferences
   - **iTerm2**: Preferences > Profiles > Text > Font
   - **Terminal.app**: Preferences > Profiles > Font > Change
2. Set the font to "JetBrainsMono Nerd Font"

### Step 4: Create HUD Configuration

Create `~/.claude/claude-hud.json` with:

```json
{
  "iconMode": "nerd",
  "colorMode": "256",
  "animationsEnabled": false
}
```

If the user doesn't want Nerd Font icons, use `"iconMode": "unicode"` instead.

### Step 5: Verify Installation

Test the HUD by running:

```bash
echo '{"model":{"display_name":"Test"},"context_window":{"current_usage":{"input_tokens":50000},"context_window_size":200000}}' | node ~/bruno-hud/dist/index.js
```

You should see a box with borders containing model info and a progress bar.

## Troubleshooting

- **HUD not showing after restart**: Ensure `settings.json` uses absolute paths for both `node` and the script. The `~` shortcut and bare `node` command don't resolve in the statusline context.
- **Icons look wrong**: User needs to set terminal font to a Nerd Font in their terminal preferences.
- **No output**: Check that Node.js 18+ is installed (`node --version`). If `node` isn't found, use the full path (e.g., `/opt/homebrew/bin/node`).
- **Build fails**: Run `npm ci` again, ensure npm is up to date. If npm isn't found, use `/opt/homebrew/bin/npm` or add `/opt/homebrew/bin` to PATH.
- **Homebrew errors on newer macOS**: Homebrew may not support very new macOS versions yet. Use manual font installation (Option B in Step 3).

## Done

After completing all steps, inform the user:
- The HUD is now active and will appear in Claude Code
- If they installed the Nerd Font, they need to update their terminal font settings
- The HUD refreshes automatically during Claude Code activity
