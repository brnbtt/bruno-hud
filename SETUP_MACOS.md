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

Add or update the `statusLine` field:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/bruno-hud/dist/index.js"
  }
}
```

**Important**: Merge with existing settings. Do not overwrite other fields.

### Step 3: Install Nerd Font (Optional but Recommended)

```bash
# Install JetBrainsMono Nerd Font via Homebrew
brew install --cask font-jetbrains-mono-nerd-font
```

After installation, inform the user they need to:
1. Open their terminal preferences (iTerm2: Preferences > Profiles > Text)
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

- **Icons look wrong**: User needs to set terminal font to a Nerd Font
- **No output**: Check that Node.js 18+ is installed (`node --version`)
- **Build fails**: Run `npm ci` again, ensure npm is up to date

## Done

After completing all steps, inform the user:
- The HUD is now active and will appear in Claude Code
- If they installed the Nerd Font, they need to update their terminal font settings
- The HUD refreshes automatically during Claude Code activity
