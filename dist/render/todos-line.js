import { green, dim, brightYellow } from './colors.js';
import { getIcons } from './icons.js';
import { calculateLayout, truncate, } from './layout.js';
export function renderTodosLine(ctx, config, _width) {
    const { todos } = ctx.transcript;
    if (!todos || todos.length === 0) {
        return null;
    }
    // Use full terminal width for layout decisions (what to show)
    const layout = calculateLayout();
    const iconMode = config?.iconMode ?? 'unicode';
    const icons = getIcons(iconMode);
    const inProgress = todos.find((t) => t.status === 'in_progress');
    const completed = todos.filter((t) => t.status === 'completed').length;
    const total = todos.length;
    const left = [];
    const right = [];
    // All complete state
    if (!inProgress) {
        if (completed === total && total > 0) {
            const checkIcon = iconMode === 'nerd' ? icons.todoDone : '\u2713';
            left.push({
                content: `${green(checkIcon)} ${dim('Done')}`,
                priority: 0,
            });
            right.push({
                content: dim(`${completed}/${total}`),
                priority: 1,
            });
            return { left, right };
        }
        return null;
    }
    // In-progress state
    const runningIcon = iconMode === 'nerd' ? '\uf0e7' : '\u25b8'; // ▸
    const content = truncate(inProgress.content, layout.maxDescLength);
    left.push({
        content: `${brightYellow(runningIcon)} ${content}`,
        priority: 0,
    });
    // Progress on right
    right.push({
        content: dim(`${completed}/${total}`),
        priority: 1,
    });
    return { left, right };
}
//# sourceMappingURL=todos-line.js.map