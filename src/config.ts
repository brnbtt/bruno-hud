/**
 * HUD configuration management
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { getPlatform, getClaudeConfigDir } from './platform.js';
import { detectColorMode, type ColorMode } from './render/gradient.js';
import { detectIconMode, type IconMode } from './render/icons.js';
import type { SpinnerStyle } from './render/spinner.js';

export interface HudConfig {
  // Icon display mode
  iconMode: IconMode;

  // Color mode for gradients
  colorMode: ColorMode;

  // Animation settings
  animationsEnabled: boolean;
  spinnerStyle: SpinnerStyle;

  // Display settings
  compactMode: boolean | 'auto';

  // Feature toggles
  showClaudeMdCount: boolean;
  showRulesCount: boolean;
  showMcpCount: boolean;
  showHooksCount: boolean;
  showSessionDuration: boolean;
}

const DEFAULT_CONFIG: HudConfig = {
  iconMode: 'unicode',
  colorMode: '256',
  animationsEnabled: true,
  spinnerStyle: 'braille',
  compactMode: 'auto',
  showClaudeMdCount: true,
  showRulesCount: true,
  showMcpCount: true,
  showHooksCount: true,
  showSessionDuration: true,
};

const CONFIG_FILENAME = 'claude-hud.json';

/**
 * Get the config file path
 */
export function getConfigPath(): string {
  return join(getClaudeConfigDir(), CONFIG_FILENAME);
}

/**
 * Load config from file, falling back to defaults
 */
export function loadConfig(): HudConfig {
  const configPath = getConfigPath();

  try {
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf8');
      const loaded = JSON.parse(content) as Partial<HudConfig>;
      return { ...DEFAULT_CONFIG, ...loaded };
    }
  } catch {
    // Ignore errors, use defaults
  }

  // Auto-detect settings for default config
  return {
    ...DEFAULT_CONFIG,
    iconMode: detectIconMode(),
    colorMode: detectColorMode(),
  };
}

/**
 * Save config to file
 */
export function saveConfig(config: Partial<HudConfig>): void {
  const configPath = getConfigPath();
  const dir = dirname(configPath);

  try {
    // Ensure directory exists
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Merge with existing config
    const existing = loadConfig();
    const merged = { ...existing, ...config };

    writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (error) {
    // Silently fail - config is not critical
    console.error('[claude-hud] Failed to save config:', error);
  }
}

/**
 * Check if Nerd Font mode is enabled
 */
export function isNerdFontEnabled(config: HudConfig): boolean {
  return config.iconMode === 'nerd';
}

/**
 * Get effective compact mode based on config and terminal width
 */
export function isCompactMode(config: HudConfig, terminalWidth: number): boolean {
  if (config.compactMode === 'auto') {
    return terminalWidth < 80;
  }
  return config.compactMode;
}

// Cache the config to avoid repeated file reads
let cachedConfig: HudConfig | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get config with caching
 */
export function getConfig(): HudConfig {
  const now = Date.now();

  if (cachedConfig && (now - cacheTime) < CACHE_TTL) {
    return cachedConfig;
  }

  cachedConfig = loadConfig();
  cacheTime = now;
  return cachedConfig;
}

/**
 * Reset config cache (useful for testing)
 */
export function resetConfigCache(): void {
  cachedConfig = null;
  cacheTime = 0;
}
