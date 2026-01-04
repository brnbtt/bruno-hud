import { platform, homedir } from 'node:os';
import { sep, basename, dirname, join, normalize } from 'node:path';

export interface PlatformInfo {
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  homeDir: string;
  pathSeparator: string;
}

let cachedPlatform: PlatformInfo | null = null;

export function getPlatform(): PlatformInfo {
  if (cachedPlatform) return cachedPlatform;

  const os = platform();
  cachedPlatform = {
    isWindows: os === 'win32',
    isMac: os === 'darwin',
    isLinux: os === 'linux',
    homeDir: homedir(),
    pathSeparator: sep,
  };

  return cachedPlatform;
}

/**
 * Normalize path separators to forward slashes for consistent handling
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Split a path by both Windows and Unix separators
 */
export function splitPath(path: string): string[] {
  return path.split(/[/\\]/).filter(Boolean);
}

/**
 * Get the filename from a path (cross-platform)
 */
export function getBasename(path: string): string {
  // Handle both separators
  const normalized = normalizePath(path);
  return basename(normalized);
}

/**
 * Get the directory from a path (cross-platform)
 */
export function getDirname(path: string): string {
  const normalized = normalizePath(path);
  return dirname(normalized);
}

/**
 * Join path segments using the platform-appropriate separator
 */
export function joinPath(...parts: string[]): string {
  return join(...parts);
}

/**
 * Expand ~ to home directory
 */
export function expandHome(path: string): string {
  if (path.startsWith('~')) {
    return join(getPlatform().homeDir, path.slice(1));
  }
  return path;
}

/**
 * Get Claude config directory path
 */
export function getClaudeConfigDir(): string {
  return join(getPlatform().homeDir, '.claude');
}

/**
 * Truncate a path intelligently, keeping the filename visible
 */
export function truncatePath(path: string, maxLen: number = 20): string {
  if (path.length <= maxLen) return path;

  const parts = splitPath(path);
  const filename = parts.pop() || path;

  if (filename.length >= maxLen) {
    return filename.slice(0, maxLen - 3) + '...';
  }

  return '.../' + filename;
}
