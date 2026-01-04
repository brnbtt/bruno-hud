/**
 * Nerd Font icons with ASCII fallbacks
 *
 * Nerd Fonts: https://www.nerdfonts.com/cheat-sheet
 */

export interface IconSet {
  // Session line
  model: string;
  claudeMd: string;
  rules: string;
  mcps: string;
  hooks: string;
  timer: string;
  warning: string;

  // Status indicators
  running: string;
  completed: string;
  error: string;
  pending: string;

  // Tools & agents
  agent: string;
  tool: string;

  // Todos
  todoActive: string;
  todoDone: string;
  todoItem: string;

  // Separators
  separator: string;
  separatorThin: string;
}

/**
 * Nerd Font icon set - requires a Nerd Font to be installed
 */
export const NERD_ICONS: IconSet = {
  // Session line
  model: '\uf108',        // nf-fa-desktop
  claudeMd: '\uf15c',     // nf-fa-file_text
  rules: '\uf0cb',        // nf-fa-list_ol
  mcps: '\uf1e6',         // nf-fa-plug
  hooks: '\uf069',        // nf-fa-asterisk
  timer: '\uf017',        // nf-fa-clock_o
  warning: '\uf071',      // nf-fa-exclamation_triangle

  // Status indicators
  running: '\uf110',      // nf-fa-spinner (static, we use braille for animation)
  completed: '\uf00c',    // nf-fa-check
  error: '\uf00d',        // nf-fa-times
  pending: '\uf10c',      // nf-fa-circle_o

  // Tools & agents
  agent: '\uf135',        // nf-fa-rocket
  tool: '\uf0ad',         // nf-fa-wrench

  // Todos
  todoActive: '\uf04b',   // nf-fa-play
  todoDone: '\uf00c',     // nf-fa-check
  todoItem: '\uf111',     // nf-fa-circle

  // Separators
  separator: '\ue0b0',    // Powerline arrow
  separatorThin: '\u2502', // Box drawing vertical
};

/**
 * Unicode fallback icons - works without Nerd Fonts
 */
export const UNICODE_ICONS: IconSet = {
  // Session line
  model: '\u25a0',        // Black square
  claudeMd: '#',
  rules: 'R',
  mcps: 'M',
  hooks: 'H',
  timer: '\u23f1',        // Stopwatch
  warning: '\u26a0',      // Warning sign

  // Status indicators
  running: '\u25cf',      // Black circle
  completed: '\u2713',    // Check mark
  error: '\u2717',        // Cross mark
  pending: '\u25cb',      // White circle

  // Tools & agents
  agent: '@',
  tool: '*',

  // Todos
  todoActive: '\u25b8',   // Right-pointing triangle
  todoDone: '\u2713',     // Check mark
  todoItem: '\u2022',     // Bullet

  // Separators
  separator: '|',
  separatorThin: '|',
};

/**
 * ASCII fallback icons - works everywhere
 */
export const ASCII_ICONS: IconSet = {
  // Session line
  model: '[M]',
  claudeMd: '#',
  rules: 'R',
  mcps: 'M',
  hooks: 'H',
  timer: 'T',
  warning: '!',

  // Status indicators
  running: '*',
  completed: '+',
  error: 'x',
  pending: 'o',

  // Tools & agents
  agent: '@',
  tool: '*',

  // Todos
  todoActive: '>',
  todoDone: '+',
  todoItem: '-',

  // Separators
  separator: '|',
  separatorThin: '|',
};

export type IconMode = 'nerd' | 'unicode' | 'ascii';

/**
 * Get the appropriate icon set based on mode
 */
export function getIcons(mode: IconMode = 'unicode'): IconSet {
  switch (mode) {
    case 'nerd':
      return NERD_ICONS;
    case 'ascii':
      return ASCII_ICONS;
    case 'unicode':
    default:
      return UNICODE_ICONS;
  }
}

/**
 * Detect the best icon mode based on environment
 */
export function detectIconMode(): IconMode {
  // Check for Nerd Font indicator in environment
  const term = process.env.TERM_PROGRAM || '';
  const nerdFontEnv = process.env.NERD_FONT || process.env.CLAUDE_HUD_NERD_FONT;

  if (nerdFontEnv === '1' || nerdFontEnv === 'true') {
    return 'nerd';
  }

  // Check if running in a modern terminal that likely supports Unicode
  const modernTerminals = ['vscode', 'iTerm.app', 'Apple_Terminal', 'Windows Terminal'];
  if (modernTerminals.some(t => term.includes(t))) {
    return 'unicode';
  }

  // Default to unicode as it's widely supported
  return 'unicode';
}
