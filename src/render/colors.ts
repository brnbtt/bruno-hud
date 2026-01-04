/**
 * ANSI color utilities with 256-color and truecolor support
 */

export const RESET = '\x1b[0m';

// Basic ANSI colors
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const ITALIC = '\x1b[3m';
const UNDERLINE = '\x1b[4m';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';

// Bright colors
const BRIGHT_RED = '\x1b[91m';
const BRIGHT_GREEN = '\x1b[92m';
const BRIGHT_YELLOW = '\x1b[93m';
const BRIGHT_BLUE = '\x1b[94m';
const BRIGHT_MAGENTA = '\x1b[95m';
const BRIGHT_CYAN = '\x1b[96m';

// Basic color functions
export function green(text: string): string {
  return `${GREEN}${text}${RESET}`;
}

export function brightGreen(text: string): string {
  return `${BRIGHT_GREEN}${text}${RESET}`;
}

export function yellow(text: string): string {
  return `${YELLOW}${text}${RESET}`;
}

export function brightYellow(text: string): string {
  return `${BRIGHT_YELLOW}${text}${RESET}`;
}

export function red(text: string): string {
  return `${RED}${text}${RESET}`;
}

export function brightRed(text: string): string {
  return `${BRIGHT_RED}${text}${RESET}`;
}

export function cyan(text: string): string {
  return `${CYAN}${text}${RESET}`;
}

export function brightCyan(text: string): string {
  return `${BRIGHT_CYAN}${text}${RESET}`;
}

export function blue(text: string): string {
  return `${BLUE}${text}${RESET}`;
}

export function magenta(text: string): string {
  return `${MAGENTA}${text}${RESET}`;
}

export function brightMagenta(text: string): string {
  return `${BRIGHT_MAGENTA}${text}${RESET}`;
}

export function white(text: string): string {
  return `${WHITE}${text}${RESET}`;
}

export function dim(text: string): string {
  return `${DIM}${text}${RESET}`;
}

export function bold(text: string): string {
  return `${BOLD}${text}${RESET}`;
}

export function italic(text: string): string {
  return `${ITALIC}${text}${RESET}`;
}

export function underline(text: string): string {
  return `${UNDERLINE}${text}${RESET}`;
}

// 256-color support
export function fg256(code: number): string {
  return `\x1b[38;5;${code}m`;
}

export function bg256(code: number): string {
  return `\x1b[48;5;${code}m`;
}

export function color256(text: string, fgCode: number, bgCode?: number): string {
  const fg = fg256(fgCode);
  const bg = bgCode !== undefined ? bg256(bgCode) : '';
  return `${fg}${bg}${text}${RESET}`;
}

// Truecolor (24-bit) support
export function fgRgb(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function bgRgb(r: number, g: number, b: number): string {
  return `\x1b[48;2;${r};${g};${b}m`;
}

export function colorRgb(text: string, r: number, g: number, b: number): string {
  return `${fgRgb(r, g, b)}${text}${RESET}`;
}

// Context color utilities
export function getContextColor(percent: number): string {
  if (percent >= 85) return RED;
  if (percent >= 70) return YELLOW;
  return GREEN;
}

export function getContextColorCode(percent: number): string {
  // Return the raw color code without reset
  if (percent >= 85) return RED;
  if (percent >= 70) return YELLOW;
  return GREEN;
}

// Legacy bar function (kept for compatibility, use gradient.ts for better bars)
export function coloredBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const color = getContextColor(percent);
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}

// Combine multiple style functions
export function style(text: string, ...styles: ((t: string) => string)[]): string {
  return styles.reduce((t, fn) => fn(t), text);
}
