/**
 * Gradient progress bars with 256-color and truecolor support
 */

export type ColorMode = 'basic' | '256' | 'truecolor';

/**
 * ANSI escape codes
 */
const ESC = '\x1b[';
const RESET = '\x1b[0m';

/**
 * Detect the best color mode based on environment
 */
export function detectColorMode(): ColorMode {
  const colorTerm = process.env.COLORTERM || '';
  const term = process.env.TERM || '';

  // Check for truecolor support
  if (colorTerm === 'truecolor' || colorTerm === '24bit') {
    return 'truecolor';
  }

  // Check for 256-color support
  if (term.includes('256color') || colorTerm === '256') {
    return '256';
  }

  // Windows Terminal supports truecolor
  if (process.env.WT_SESSION) {
    return 'truecolor';
  }

  // iTerm2 supports truecolor
  if (process.env.TERM_PROGRAM === 'iTerm.app') {
    return 'truecolor';
  }

  // VS Code terminal supports truecolor
  if (process.env.TERM_PROGRAM === 'vscode') {
    return 'truecolor';
  }

  // Default to 256 as it's widely supported
  return '256';
}

/**
 * RGB color type
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Predefined color palette for gradients
 */
const COLORS = {
  green: { r: 0, g: 200, b: 80 },
  greenBright: { r: 50, g: 255, b: 100 },
  yellow: { r: 255, g: 200, b: 0 },
  orange: { r: 255, g: 140, b: 0 },
  red: { r: 255, g: 60, b: 60 },
  redDark: { r: 200, g: 0, b: 0 },
  cyan: { r: 0, g: 200, b: 255 },
  magenta: { r: 200, g: 100, b: 255 },
  dim: { r: 100, g: 100, b: 100 },
} as const;

/**
 * Convert RGB to 256-color code (approximate)
 */
function rgbTo256(rgb: RGB): number {
  // Use the 6x6x6 color cube (16-231)
  const r = Math.round(rgb.r / 255 * 5);
  const g = Math.round(rgb.g / 255 * 5);
  const b = Math.round(rgb.b / 255 * 5);
  return 16 + (36 * r) + (6 * g) + b;
}

/**
 * Interpolate between two RGB colors
 */
function interpolateRgb(from: RGB, to: RGB, ratio: number): RGB {
  return {
    r: Math.round(from.r + (to.r - from.r) * ratio),
    g: Math.round(from.g + (to.g - from.g) * ratio),
    b: Math.round(from.b + (to.b - from.b) * ratio),
  };
}

/**
 * Get ANSI foreground color code for RGB
 */
function fgRgb(rgb: RGB, mode: ColorMode): string {
  if (mode === 'truecolor') {
    return `${ESC}38;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }
  if (mode === '256') {
    return `${ESC}38;5;${rgbTo256(rgb)}m`;
  }
  // Basic mode - use closest standard color
  if (rgb.r > rgb.g && rgb.r > rgb.b) return `${ESC}31m`; // Red
  if (rgb.g > rgb.r && rgb.g > rgb.b) return `${ESC}32m`; // Green
  if (rgb.r > 200 && rgb.g > 200) return `${ESC}33m`; // Yellow
  return `${ESC}37m`; // White
}

/**
 * Get the color for a context percentage
 */
export function getContextGradientColor(percent: number, mode: ColorMode = '256'): string {
  let color: RGB;

  if (percent < 50) {
    // Green to bright green
    color = interpolateRgb(COLORS.green, COLORS.greenBright, percent / 50);
  } else if (percent < 70) {
    // Bright green to yellow
    color = interpolateRgb(COLORS.greenBright, COLORS.yellow, (percent - 50) / 20);
  } else if (percent < 85) {
    // Yellow to orange
    color = interpolateRgb(COLORS.yellow, COLORS.orange, (percent - 70) / 15);
  } else if (percent < 95) {
    // Orange to red
    color = interpolateRgb(COLORS.orange, COLORS.red, (percent - 85) / 10);
  } else {
    // Red to dark red
    color = interpolateRgb(COLORS.red, COLORS.redDark, (percent - 95) / 5);
  }

  return fgRgb(color, mode);
}

/**
 * Block characters for progress bar
 */
const BLOCKS = {
  full: '\u2588',      // █
  sevenEighths: '\u2589', // ▉
  threeQuarters: '\u258a', // ▊
  fiveEighths: '\u258b', // ▋
  half: '\u258c',      // ▌
  threeEighths: '\u258d', // ▍
  quarter: '\u258e',   // ▎
  eighth: '\u258f',    // ▏
  empty: '\u2591',     // ░
} as const;

/**
 * Get the sub-block character for fractional fill
 */
function getSubBlock(fraction: number): string {
  if (fraction >= 0.875) return BLOCKS.sevenEighths;
  if (fraction >= 0.75) return BLOCKS.threeQuarters;
  if (fraction >= 0.625) return BLOCKS.fiveEighths;
  if (fraction >= 0.5) return BLOCKS.half;
  if (fraction >= 0.375) return BLOCKS.threeEighths;
  if (fraction >= 0.25) return BLOCKS.quarter;
  if (fraction >= 0.125) return BLOCKS.eighth;
  return '';
}

/**
 * Render a gradient progress bar
 *
 * @param percent - Percentage (0-100)
 * @param width - Total width in characters
 * @param mode - Color mode to use
 * @returns Colored progress bar string
 */
export function gradientBar(
  percent: number,
  width: number = 10,
  mode: ColorMode = '256'
): string {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const fillWidth = (clampedPercent / 100) * width;
  const fullBlocks = Math.floor(fillWidth);
  const remainder = fillWidth - fullBlocks;
  const emptyBlocks = width - fullBlocks - (remainder > 0 ? 1 : 0);

  const color = getContextGradientColor(clampedPercent, mode);
  const dimColor = fgRgb(COLORS.dim, mode);

  let bar = color;

  // Add full blocks
  bar += BLOCKS.full.repeat(fullBlocks);

  // Add partial block if needed
  if (remainder > 0 && fullBlocks < width) {
    bar += getSubBlock(remainder);
  }

  // Add empty blocks
  bar += dimColor + BLOCKS.empty.repeat(emptyBlocks);

  return bar + RESET;
}

/**
 * Render a simple colored bar (no gradient, single color based on threshold)
 */
export function simpleBar(
  percent: number,
  width: number = 10,
  mode: ColorMode = '256'
): string {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clampedPercent / 100) * width);
  const empty = width - filled;

  const color = getContextGradientColor(clampedPercent, mode);
  const dimColor = fgRgb(COLORS.dim, mode);

  return color + BLOCKS.full.repeat(filled) + dimColor + BLOCKS.empty.repeat(empty) + RESET;
}

/**
 * Get a colored percentage string
 */
export function coloredPercent(percent: number, mode: ColorMode = '256'): string {
  const color = getContextGradientColor(percent, mode);
  return `${color}${percent}%${RESET}`;
}
