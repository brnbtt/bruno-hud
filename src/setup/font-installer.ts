/**
 * Cross-platform Nerd Font installer
 *
 * Automatically downloads and installs JetBrainsMono Nerd Font
 * on Windows and macOS.
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { get } from 'node:https';
import { getPlatform } from '../platform.js';

const FONT_NAME = 'JetBrainsMono';
const FONT_VERSION = 'v3.3.0';
const FONT_URL = `https://github.com/ryanoasis/nerd-fonts/releases/download/${FONT_VERSION}/${FONT_NAME}.zip`;

export interface InstallResult {
  success: boolean;
  message: string;
  requiresRestart: boolean;
}

/**
 * Check if a Nerd Font is already installed
 */
export function isNerdFontInstalled(): boolean {
  const platform = getPlatform();

  try {
    if (platform.isWindows) {
      return checkWindowsFont();
    } else if (platform.isMac) {
      return checkMacFont();
    } else {
      return checkLinuxFont();
    }
  } catch {
    return false;
  }
}

function checkWindowsFont(): boolean {
  try {
    // Check user fonts registry
    const result = execSync(
      'reg query "HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /s 2>nul',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return result.toLowerCase().includes('nerd') ||
           result.toLowerCase().includes('jetbrainsmono');
  } catch {
    return false;
  }
}

function checkMacFont(): boolean {
  try {
    const result = execSync(
      'system_profiler SPFontsDataType 2>/dev/null | grep -i "nerd\\|jetbrainsmono"',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return result.length > 0;
  } catch {
    return false;
  }
}

function checkLinuxFont(): boolean {
  try {
    const result = execSync(
      'fc-list 2>/dev/null | grep -i "nerd\\|jetbrainsmono"',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * Install Nerd Font on the current platform
 */
export async function installNerdFont(): Promise<InstallResult> {
  const platform = getPlatform();

  // Check if already installed
  if (isNerdFontInstalled()) {
    return {
      success: true,
      message: 'Nerd Font is already installed',
      requiresRestart: false,
    };
  }

  try {
    if (platform.isWindows) {
      return await installWindowsFont();
    } else if (platform.isMac) {
      return await installMacFont();
    } else {
      return await installLinuxFont();
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to install font: ${error instanceof Error ? error.message : 'Unknown error'}`,
      requiresRestart: false,
    };
  }
}

/**
 * Windows font installation via PowerShell
 */
async function installWindowsFont(): Promise<InstallResult> {
  const script = `
$ErrorActionPreference = "Stop"
$fontUrl = "${FONT_URL}"
$tempDir = Join-Path $env:TEMP "nerd-font-install-$(Get-Random)"
$fontDir = Join-Path $env:LOCALAPPDATA "Microsoft\\Windows\\Fonts"

try {
    # Create temp directory
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

    # Download font
    $zipPath = Join-Path $tempDir "${FONT_NAME}.zip"
    Write-Host "Downloading ${FONT_NAME} Nerd Font..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $fontUrl -OutFile $zipPath -UseBasicParsing

    # Extract
    $extractPath = Join-Path $tempDir "fonts"
    Write-Host "Extracting fonts..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

    # Ensure fonts directory exists
    if (-not (Test-Path $fontDir)) {
        New-Item -ItemType Directory -Force -Path $fontDir | Out-Null
    }

    # Install fonts
    $regPath = "HKCU:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"
    Get-ChildItem "$extractPath\\*.ttf" | ForEach-Object {
        $destPath = Join-Path $fontDir $_.Name
        Copy-Item $_.FullName -Destination $destPath -Force

        $fontName = $_.BaseName -replace "NerdFont", "Nerd Font" -replace "NerdFontMono", "Nerd Font Mono"
        New-ItemProperty -Path $regPath -Name "$fontName (TrueType)" -Value $destPath -PropertyType String -Force | Out-Null
    }

    Write-Host "Font installed successfully!"
    exit 0
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
finally {
    # Cleanup
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}
`;

  return new Promise((resolve) => {
    const ps = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-Command', script], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => { stdout += data.toString(); });
    ps.stderr.on('data', (data) => { stderr += data.toString(); });

    ps.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          message: `${FONT_NAME} Nerd Font installed successfully. Please restart your terminal to use it.`,
          requiresRestart: true,
        });
      } else {
        resolve({
          success: false,
          message: `Font installation failed: ${stderr || stdout}`,
          requiresRestart: false,
        });
      }
    });

    ps.on('error', (error) => {
      resolve({
        success: false,
        message: `Failed to run PowerShell: ${error.message}`,
        requiresRestart: false,
      });
    });
  });
}

/**
 * macOS font installation via Homebrew
 */
async function installMacFont(): Promise<InstallResult> {
  return new Promise((resolve) => {
    // First check if Homebrew is installed
    try {
      execSync('which brew', { stdio: 'ignore' });
    } catch {
      resolve({
        success: false,
        message: 'Homebrew is not installed. Please install it first: https://brew.sh',
        requiresRestart: false,
      });
      return;
    }

    // Install via Homebrew
    const brew = spawn('brew', ['install', '--cask', 'font-jetbrains-mono-nerd-font'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    brew.stdout.on('data', (data) => { stdout += data.toString(); });
    brew.stderr.on('data', (data) => { stderr += data.toString(); });

    brew.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          message: `${FONT_NAME} Nerd Font installed successfully via Homebrew.`,
          requiresRestart: true,
        });
      } else {
        // Try adding the tap first
        try {
          execSync('brew tap homebrew/cask-fonts', { stdio: 'ignore' });
          execSync('brew install --cask font-jetbrains-mono-nerd-font', { stdio: 'ignore' });
          resolve({
            success: true,
            message: `${FONT_NAME} Nerd Font installed successfully via Homebrew.`,
            requiresRestart: true,
          });
        } catch {
          resolve({
            success: false,
            message: `Font installation failed: ${stderr || stdout}`,
            requiresRestart: false,
          });
        }
      }
    });

    brew.on('error', (error) => {
      resolve({
        success: false,
        message: `Failed to run Homebrew: ${error.message}`,
        requiresRestart: false,
      });
    });
  });
}

/**
 * Linux font installation
 */
async function installLinuxFont(): Promise<InstallResult> {
  const platform = getPlatform();
  const fontsDir = join(platform.homeDir, '.local', 'share', 'fonts');

  try {
    // Create fonts directory
    if (!existsSync(fontsDir)) {
      mkdirSync(fontsDir, { recursive: true });
    }

    // Download and extract using curl and unzip
    const tempDir = `/tmp/nerd-font-install-${Date.now()}`;
    const zipPath = `${tempDir}/${FONT_NAME}.zip`;

    execSync(`mkdir -p ${tempDir}`);
    execSync(`curl -fsSL "${FONT_URL}" -o "${zipPath}"`);
    execSync(`unzip -o "${zipPath}" -d "${tempDir}/fonts"`);
    execSync(`cp ${tempDir}/fonts/*.ttf "${fontsDir}/"`);
    execSync(`fc-cache -fv`);
    execSync(`rm -rf ${tempDir}`);

    return {
      success: true,
      message: `${FONT_NAME} Nerd Font installed to ${fontsDir}`,
      requiresRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to install font: ${error instanceof Error ? error.message : 'Unknown error'}`,
      requiresRestart: false,
    };
  }
}

/**
 * Get instructions for configuring the terminal to use the font
 */
export function getTerminalConfigInstructions(): string {
  const platform = getPlatform();

  if (platform.isWindows) {
    return `
To configure Windows Terminal to use the font:
1. Open Windows Terminal Settings (Ctrl+,)
2. Go to Profiles > Defaults > Appearance
3. Set "Font face" to "JetBrainsMono Nerd Font"
4. Save and restart the terminal

Or add this to your settings.json:
{
  "profiles": {
    "defaults": {
      "font": {
        "face": "JetBrainsMono Nerd Font"
      }
    }
  }
}`;
  } else if (platform.isMac) {
    return `
To configure iTerm2 to use the font:
1. Open iTerm2 Preferences (Cmd+,)
2. Go to Profiles > Text > Font
3. Select "JetBrainsMono Nerd Font"
4. Restart iTerm2

For Terminal.app:
1. Open Terminal Preferences (Cmd+,)
2. Go to Profiles > Font > Change
3. Select "JetBrainsMono Nerd Font"`;
  } else {
    return `
The font has been installed to ~/.local/share/fonts.
Configure your terminal emulator to use "JetBrainsMono Nerd Font".`;
  }
}
