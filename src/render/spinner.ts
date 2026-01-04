/**
 * Animated spinner using braille patterns
 *
 * The spinner animates by deriving the frame from the current timestamp,
 * creating smooth animation at the ~300ms refresh rate.
 */

/**
 * Braille pattern spinner frames - smooth dot rotation
 * These create a pleasing circular animation effect
 */
export const BRAILLE_FRAMES = [
  '\u280b', // ⠋
  '\u2819', // ⠙
  '\u2839', // ⠹
  '\u2838', // ⠸
  '\u283c', // ⠼
  '\u2834', // ⠴
  '\u2826', // ⠦
  '\u2827', // ⠧
  '\u2807', // ⠇
  '\u280f', // ⠏
] as const;

/**
 * Block spinner frames - more visible, bolder look
 */
export const BLOCK_FRAMES = [
  '\u2596', // ▖
  '\u2598', // ▘
  '\u259d', // ▝
  '\u2597', // ▗
] as const;

/**
 * Classic ASCII spinner frames - works everywhere
 */
export const ASCII_FRAMES = ['|', '/', '-', '\\'] as const;

/**
 * Dots spinner - simple and clean
 */
export const DOTS_FRAMES = ['.  ', '.. ', '...', ' ..', '  .', '   '] as const;

export type SpinnerStyle = 'braille' | 'block' | 'ascii' | 'dots';

/**
 * Get the appropriate frames for the spinner style
 */
function getFrames(style: SpinnerStyle): readonly string[] {
  switch (style) {
    case 'braille':
      return BRAILLE_FRAMES;
    case 'block':
      return BLOCK_FRAMES;
    case 'dots':
      return DOTS_FRAMES;
    case 'ascii':
    default:
      return ASCII_FRAMES;
  }
}

/**
 * Get the current spinner frame based on timestamp
 *
 * @param timestamp - Optional timestamp (defaults to Date.now())
 * @param style - Spinner style to use
 * @param interval - Animation interval in ms (default 80ms for smooth animation)
 * @returns The current spinner frame character
 */
export function getSpinnerFrame(
  timestamp?: number,
  style: SpinnerStyle = 'braille',
  interval: number = 80
): string {
  const frames = getFrames(style);
  const time = timestamp ?? Date.now();
  const frameIndex = Math.floor(time / interval) % frames.length;
  return frames[frameIndex];
}

/**
 * Get a static spinner character (for completed/paused states)
 */
export function getStaticSpinner(style: SpinnerStyle = 'braille'): string {
  const frames = getFrames(style);
  return frames[0];
}

/**
 * Create a spinner with color
 */
export function coloredSpinner(
  color: (text: string) => string,
  timestamp?: number,
  style: SpinnerStyle = 'braille'
): string {
  return color(getSpinnerFrame(timestamp, style));
}
