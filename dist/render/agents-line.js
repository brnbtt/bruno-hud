import { green, magenta, dim, brightYellow } from './colors.js';
import { getIcons } from './icons.js';
import { calculateLayout, truncate, } from './layout.js';
export function renderAgentsLine(ctx, config, innerWidth) {
    const { agents } = ctx.transcript;
    const runningAgents = agents.filter((a) => a.status === 'running');
    const recentCompleted = agents.filter((a) => a.status === 'completed').slice(-2);
    const toShow = [...runningAgents, ...recentCompleted].slice(-3);
    if (toShow.length === 0) {
        return null;
    }
    // Use full terminal width for layout decisions (what to show)
    const layout = calculateLayout();
    // But use innerWidth for alignment if provided
    const alignWidth = innerWidth ?? layout.terminalWidth;
    const iconMode = config?.iconMode ?? 'unicode';
    const icons = getIcons(iconMode);
    // For agents, we return multiple lines via the content
    // But use layout for each agent line
    const lines = [];
    for (const agent of toShow) {
        const left = [];
        const right = [];
        // Status icon + type + model - LEFT (P0)
        const statusIcon = agent.status === 'running'
            ? brightYellow(iconMode === 'nerd' ? '\uf192' : '\u25cf')
            : green(iconMode === 'nerd' ? icons.completed : '\u2713');
        const type = magenta(agent.type);
        const model = agent.model ? dim(`[${agent.model}]`) : '';
        left.push({
            content: `${statusIcon} ${type}${model}`,
            priority: 0,
        });
        // Description - LEFT (P1)
        if (agent.description) {
            left.push({
                content: dim(truncate(agent.description, layout.maxDescLength)),
                priority: 1,
            });
        }
        // Elapsed time - RIGHT (P1)
        right.push({
            content: dim(formatElapsed(agent)),
            priority: 1,
        });
        // Render this agent's line
        const leftContent = left.filter(s => s.content).map(s => s.content).join(' ');
        const rightContent = right.filter(s => s.content).map(s => s.content).join(' ');
        if (!rightContent) {
            lines.push(leftContent);
        }
        else {
            // Align left and right using innerWidth for box fitting
            const leftWidth = leftContent.replace(/\x1b\[[0-9;]*m/g, '').length;
            const rightWidth = rightContent.replace(/\x1b\[[0-9;]*m/g, '').length;
            const gap = Math.max(2, alignWidth - leftWidth - rightWidth);
            if (gap >= 2) {
                lines.push(leftContent + ' '.repeat(gap) + rightContent);
            }
            else {
                // Not enough space, just show left content
                lines.push(leftContent);
            }
        }
    }
    // Return as single line with newlines (will be split by render/index.ts)
    return {
        left: [{ content: lines.join('\n'), priority: 0 }],
        right: [],
    };
}
function formatElapsed(agent) {
    const now = Date.now();
    const start = agent.startTime.getTime();
    const end = agent.endTime?.getTime() ?? now;
    const ms = end - start;
    if (ms < 1000)
        return '<1s';
    if (ms < 60000)
        return `${Math.round(ms / 1000)}s`;
    const mins = Math.floor(ms / 60000);
    const secs = Math.round((ms % 60000) / 1000);
    return `${mins}m${secs}s`;
}
//# sourceMappingURL=agents-line.js.map