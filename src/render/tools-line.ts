import type { RenderContext } from '../types.js';
import type { HudConfig } from '../config.js';
import { green, cyan, dim, brightYellow } from './colors.js';
import { getIcons, type IconMode } from './icons.js';
import { truncatePath } from '../platform.js';
import {
  calculateLayout,
  type LayoutLine,
  type LayoutSegment,
} from './layout.js';

export function renderToolsLine(ctx: RenderContext, config?: HudConfig, _width?: number): LayoutLine | null {
  const { tools } = ctx.transcript;

  if (tools.length === 0) {
    return null;
  }

  // Use full terminal width for layout decisions (what to show)
  const layout = calculateLayout();
  const iconMode: IconMode = config?.iconMode ?? 'unicode';
  const icons = getIcons(iconMode);

  const left: LayoutSegment[] = [];
  const right: LayoutSegment[] = [];

  // Running tools - LEFT side (P0 critical)
  const runningTools = tools.filter((t) => t.status === 'running');
  const completedTools = tools.filter((t) => t.status === 'completed' || t.status === 'error');

  for (const tool of runningTools.slice(-2)) {
    const target = tool.target ? truncatePath(tool.target, layout.maxPathLength) : '';
    const runningIcon = iconMode === 'nerd' ? '\uf192' : '\u25cf'; // ●
    const content = `${brightYellow(runningIcon)} ${cyan(tool.name)}${target ? dim(':' + target) : ''}`;
    left.push({ content, priority: 0 });
  }

  // Completed tools summary - RIGHT side (P2 secondary)
  const toolCounts = new Map<string, number>();
  for (const tool of completedTools) {
    toolCounts.set(tool.name, (toolCounts.get(tool.name) ?? 0) + 1);
  }

  const sortedTools = Array.from(toolCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, layout.maxToolsShown);

  if (sortedTools.length > 0) {
    const checkIcon = iconMode === 'nerd' ? icons.completed : '\u2713';
    const completedParts = sortedTools.map(([name, count]) =>
      `${name}${dim('\u00d7' + count)}`
    );
    right.push({
      content: `${green(checkIcon)} ${completedParts.join(' ')}`,
      priority: 2,
    });
  }

  // If no running tools, move completed to left
  if (left.length === 0 && right.length > 0) {
    return { left: right, right: [] };
  }

  return { left, right };
}
