# Bruno HUD Windows Setup Instructions

## Step 1: Clone and Build

```powershell
git clone https://github.com/brnbtt/bruno-hud.git $HOME\bruno-hud
cd $HOME\bruno-hud
npm ci
npm run build
```

Verify that `%USERPROFILE%\bruno-hud\dist\index.js` exists after completion.

## Step 2: Configure Claude Code Statusline

Edit `%USERPROFILE%\.claude\settings.json` and add:

```json
{
  "statusLine": {
    "type": "command",
    "command": "C:/Users/USERNAME/bruno-hud/run-hud.cmd"
  }
}
```

**Critical:** Replace `USERNAME` with your actual Windows username (run `echo %USERNAME%` to find it).

**Note:** The `run-hud.cmd` batch wrapper is required on Windows to properly handle stdin piping. This file is included in the repository.

## Step 3: Install Nerd Font (Optional)

**Via winget:**
```powershell
winget install JetBrains.JetBrainsMono.NerdFont
```

**Manual installation:**
1. Download from https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
2. Extract the ZIP file
3. Select all `.ttf` files, right-click, and choose "Install" or "Install for all users"

Then update your terminal font settings to "JetBrainsMono Nerd Font".

## Step 4: Create HUD Configuration

Create `%USERPROFILE%\.claude\claude-hud.json`:

```json
{
  "iconMode": "nerd",
  "colorMode": "256",
  "animationsEnabled": false
}
```

Use `"iconMode": "unicode"` if not using a Nerd Font.

## Step 5: Verify Installation

Test with PowerShell:

```powershell
echo '{"model":{"display_name":"Test"},"context_window":{"current_usage":{"input_tokens":50000},"context_window_size":200000}}' | node $HOME\bruno-hud\dist\index.js
```

Or with Git Bash:

```bash
echo '{"model":{"display_name":"Test"},"context_window":{"current_usage":{"input_tokens":50000},"context_window_size":200000}}' | node ~/bruno-hud/dist/index.js
```

You should see a bordered box with model information and a progress bar.

## Step 6: Restart Claude Code

Restart Claude Code for the changes to take effect. The HUD should now appear below your input.

## Troubleshooting

### HUD not showing up

1. **Check paths:** Ensure all paths in `settings.json` use forward slashes (`/`) or properly escaped backslashes (`\\`)
2. **Use the batch wrapper:** The `run-hud.cmd` file handles Windows-specific path issues
3. **Verify Node.js:** Run `node --version` to confirm Node.js 18+ is installed and in your PATH
4. **Check settings.json:** Ensure the JSON is valid (no trailing commas, proper quotes)

### Font icons not displaying

1. Verify the Nerd Font is installed in Windows Settings > Personalization > Fonts
2. Set your terminal (Windows Terminal, VS Code, etc.) to use "JetBrainsMono Nerd Font"
3. If icons still don't work, set `"iconMode": "unicode"` in `claude-hud.json`
