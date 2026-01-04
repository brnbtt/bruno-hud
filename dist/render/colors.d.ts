/**
 * ANSI color utilities with 256-color and truecolor support
 */
export declare const RESET = "\u001B[0m";
export declare function green(text: string): string;
export declare function brightGreen(text: string): string;
export declare function yellow(text: string): string;
export declare function brightYellow(text: string): string;
export declare function red(text: string): string;
export declare function brightRed(text: string): string;
export declare function cyan(text: string): string;
export declare function brightCyan(text: string): string;
export declare function blue(text: string): string;
export declare function magenta(text: string): string;
export declare function brightMagenta(text: string): string;
export declare function white(text: string): string;
export declare function dim(text: string): string;
export declare function bold(text: string): string;
export declare function italic(text: string): string;
export declare function underline(text: string): string;
export declare function fg256(code: number): string;
export declare function bg256(code: number): string;
export declare function color256(text: string, fgCode: number, bgCode?: number): string;
export declare function fgRgb(r: number, g: number, b: number): string;
export declare function bgRgb(r: number, g: number, b: number): string;
export declare function colorRgb(text: string, r: number, g: number, b: number): string;
export declare function getContextColor(percent: number): string;
export declare function getContextColorCode(percent: number): string;
export declare function coloredBar(percent: number, width?: number): string;
export declare function style(text: string, ...styles: ((t: string) => string)[]): string;
//# sourceMappingURL=colors.d.ts.map