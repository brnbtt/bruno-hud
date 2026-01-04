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
export function green(text) {
    return `${GREEN}${text}${RESET}`;
}
export function brightGreen(text) {
    return `${BRIGHT_GREEN}${text}${RESET}`;
}
export function yellow(text) {
    return `${YELLOW}${text}${RESET}`;
}
export function brightYellow(text) {
    return `${BRIGHT_YELLOW}${text}${RESET}`;
}
export function red(text) {
    return `${RED}${text}${RESET}`;
}
export function brightRed(text) {
    return `${BRIGHT_RED}${text}${RESET}`;
}
export function cyan(text) {
    return `${CYAN}${text}${RESET}`;
}
export function brightCyan(text) {
    return `${BRIGHT_CYAN}${text}${RESET}`;
}
export function blue(text) {
    return `${BLUE}${text}${RESET}`;
}
export function magenta(text) {
    return `${MAGENTA}${text}${RESET}`;
}
export function brightMagenta(text) {
    return `${BRIGHT_MAGENTA}${text}${RESET}`;
}
export function white(text) {
    return `${WHITE}${text}${RESET}`;
}
export function dim(text) {
    return `${DIM}${text}${RESET}`;
}
export function bold(text) {
    return `${BOLD}${text}${RESET}`;
}
export function italic(text) {
    return `${ITALIC}${text}${RESET}`;
}
export function underline(text) {
    return `${UNDERLINE}${text}${RESET}`;
}
// 256-color support
export function fg256(code) {
    return `\x1b[38;5;${code}m`;
}
export function bg256(code) {
    return `\x1b[48;5;${code}m`;
}
export function color256(text, fgCode, bgCode) {
    const fg = fg256(fgCode);
    const bg = bgCode !== undefined ? bg256(bgCode) : '';
    return `${fg}${bg}${text}${RESET}`;
}
// Truecolor (24-bit) support
export function fgRgb(r, g, b) {
    return `\x1b[38;2;${r};${g};${b}m`;
}
export function bgRgb(r, g, b) {
    return `\x1b[48;2;${r};${g};${b}m`;
}
export function colorRgb(text, r, g, b) {
    return `${fgRgb(r, g, b)}${text}${RESET}`;
}
// Context color utilities
export function getContextColor(percent) {
    if (percent >= 85)
        return RED;
    if (percent >= 70)
        return YELLOW;
    return GREEN;
}
export function getContextColorCode(percent) {
    // Return the raw color code without reset
    if (percent >= 85)
        return RED;
    if (percent >= 70)
        return YELLOW;
    return GREEN;
}
// Legacy bar function (kept for compatibility, use gradient.ts for better bars)
export function coloredBar(percent, width = 10) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const color = getContextColor(percent);
    return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
// Combine multiple style functions
export function style(text, ...styles) {
    return styles.reduce((t, fn) => fn(t), text);
}
//# sourceMappingURL=colors.js.map