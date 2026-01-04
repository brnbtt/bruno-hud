/**
 * Flexbox-like layout engine for terminal statusline
 *
 * Distributes content across terminal width with left/right anchoring
 */

export interface LayoutSegment {
  content: string;
  priority: number;  // Lower = more important (0 = critical, 3 = optional)
  minWidth?: number; // Minimum visible width needed
}

export interface LayoutLine {
  left: LayoutSegment[];
  right: LayoutSegment[];
}

/**
 * Get terminal width with fallback
 */
export function getTerminalWidth(): number {
  if (process.stdout.columns && process.stdout.columns > 0) {
    return process.stdout.columns;
  }
  const cols = process.env.COLUMNS;
  if (cols) {
    const parsed = parseInt(cols, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 80;
}

/**
 * Layout breakpoints
 */
export type LayoutMode = 'ultra-compact' | 'compact' | 'standard' | 'wide';

export function getLayoutMode(width: number): LayoutMode {
  if (width < 60) return 'ultra-compact';
  if (width < 80) return 'compact';
  if (width < 120) return 'standard';
  return 'wide';
}

/**
 * Strip ANSI escape codes for width calculation
 * Handles: SGR (colors), CSI sequences, OSC sequences
 */
export function stripAnsi(str: string): string {
  // Match SGR (Select Graphic Rendition) and other CSI sequences
  // Also match OSC sequences (like hyperlinks)
  return str
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')  // CSI sequences (colors, cursor, etc.)
    .replace(/\x1b\][^\x07]*\x07/g, '')      // OSC sequences
    .replace(/\x1b[PX^_][^\x1b]*\x1b\\/g, '') // DCS, SOS, PM, APC sequences
    .replace(/\x1b./g, '');                   // Any remaining escape sequences
}

/**
 * Calculate visible character width (excluding ANSI codes)
 */
export function visibleWidth(str: string): number {
  return stripAnsi(str).length;
}

/**
 * Truncate text with ellipsis (works with plain text)
 */
export function truncate(
  text: string,
  maxLen: number,
  position: 'end' | 'middle' | 'start' = 'end'
): string {
  if (text.length <= maxLen) return text;
  if (maxLen <= 3) return text.slice(0, maxLen);

  const ellipsis = '…';
  const availableLen = maxLen - 1;

  switch (position) {
    case 'start':
      return ellipsis + text.slice(-availableLen);
    case 'middle': {
      const halfLen = Math.floor(availableLen / 2);
      return text.slice(0, halfLen) + ellipsis + text.slice(-(availableLen - halfLen));
    }
    case 'end':
    default:
      return text.slice(0, availableLen) + ellipsis;
  }
}

/**
 * Truncate string with ANSI codes, preserving colors
 * Truncates based on visible width while keeping ANSI sequences intact
 */
export function truncateAnsi(str: string, maxWidth: number): string {
  const currentWidth = visibleWidth(str);
  if (currentWidth <= maxWidth) return str;
  if (maxWidth <= 0) return '';
  if (maxWidth <= 1) return '…';

  // We need to walk through the string character by character,
  // skipping ANSI sequences but counting visible characters
  let result = '';
  let visibleCount = 0;
  const targetWidth = maxWidth - 1; // Leave room for ellipsis
  let i = 0;

  while (i < str.length && visibleCount < targetWidth) {
    // Check for ANSI escape sequence
    if (str[i] === '\x1b') {
      // Find the end of the escape sequence
      let j = i + 1;

      // CSI sequence: ESC [ ... letter
      if (str[j] === '[') {
        j++;
        while (j < str.length && !/[a-zA-Z]/.test(str[j])) j++;
        j++; // Include the final letter
      }
      // OSC sequence: ESC ] ... BEL
      else if (str[j] === ']') {
        j++;
        while (j < str.length && str[j] !== '\x07') j++;
        j++; // Include BEL
      }
      // Other sequences: ESC + one char
      else {
        j++;
      }

      result += str.slice(i, j);
      i = j;
    } else {
      result += str[i];
      visibleCount++;
      i++;
    }
  }

  // Add ellipsis and reset code to ensure clean output
  return result + '…\x1b[0m';
}

/**
 * Render a layout line with flexbox-like distribution
 * @param line - The layout line with left/right segments
 * @param alignWidth - Width to use for alignment (e.g., innerWidth of box)
 */
export function renderLayoutLine(line: LayoutLine, alignWidth: number): string {
  // Use FULL terminal width for deciding what to show (priority filtering)
  const fullWidth = getTerminalWidth();
  const mode = getLayoutMode(fullWidth);

  // Filter segments by priority based on terminal width mode
  // But always include P0 (critical) items on both sides
  const maxPriority = mode === 'ultra-compact' ? 0
                    : mode === 'compact' ? 1
                    : mode === 'standard' ? 2
                    : 3;

  const leftSegments = line.left
    .filter(s => s.priority <= maxPriority && s.content)
    .map(s => s.content);

  // Always include P0 right segments, filter others by mode
  const rightSegments = line.right
    .filter(s => (s.priority === 0 || s.priority <= maxPriority) && s.content)
    .map(s => s.content);

  const leftContent = leftSegments.join('  ');
  const rightContent = rightSegments.join('  ');

  // If no right content, just return left
  if (!rightContent) {
    return leftContent;
  }

  // Use alignWidth (box inner width) for fitting content
  return alignLeftRight(leftContent, rightContent, alignWidth);
}

/**
 * Align content left and right within a fixed width
 */
export function alignLeftRight(left: string, right: string, totalWidth: number): string {
  const leftWidth = visibleWidth(left);
  const rightWidth = visibleWidth(right);
  const minGap = 2;

  const availableGap = totalWidth - leftWidth - rightWidth;

  // If not enough space, just return left content
  if (availableGap < minGap) {
    return left;
  }

  // Create gap with spaces
  const gap = ' '.repeat(availableGap);
  return left + gap + right;
}

/**
 * Calculate bar width based on terminal width
 */
export function getBarWidth(termWidth: number): number {
  const mode = getLayoutMode(termWidth);
  switch (mode) {
    case 'ultra-compact': return 8;
    case 'compact': return 12;
    case 'standard': return 15;
    case 'wide': return 20;
  }
}

/**
 * Get max description length based on terminal width
 */
export function getMaxDescLength(termWidth: number): number {
  const mode = getLayoutMode(termWidth);
  switch (mode) {
    case 'ultra-compact': return 20;
    case 'compact': return 30;
    case 'standard': return 40;
    case 'wide': return 60;
  }
}

/**
 * Layout constraints based on terminal width
 */
export interface LayoutConstraints {
  terminalWidth: number;
  mode: LayoutMode;
  barWidth: number;
  maxPathLength: number;
  maxDescLength: number;
  maxToolsShown: number;
  isCompact: boolean;
}

export function calculateLayout(width?: number): LayoutConstraints {
  const terminalWidth = width ?? getTerminalWidth();
  const mode = getLayoutMode(terminalWidth);

  return {
    terminalWidth,
    mode,
    barWidth: getBarWidth(terminalWidth),
    maxPathLength: mode === 'wide' ? 30 : mode === 'standard' ? 20 : 15,
    maxDescLength: getMaxDescLength(terminalWidth),
    maxToolsShown: mode === 'wide' ? 6 : mode === 'standard' ? 5 : 4,
    isCompact: mode === 'ultra-compact' || mode === 'compact',
  };
}
