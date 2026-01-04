import { getContextPercent, getModelName } from '../stdin.js';
import { cyan, dim, red, bold } from './colors.js';
import { gradientBar, coloredPercent, detectColorMode } from './gradient.js';
import { getIcons } from './icons.js';
import { calculateLayout, } from './layout.js';
export function renderSessionLine(ctx, config, _width) {
    const model = getModelName(ctx.stdin);
    const percent = getContextPercent(ctx.stdin);
    // Use full terminal width for layout decisions (what to show)
    const layout = calculateLayout();
    const colorMode = config?.colorMode ?? detectColorMode();
    const iconMode = config?.iconMode ?? 'unicode';
    const icons = getIcons(iconMode);
    const left = [];
    const right = [];
    // LEFT SIDE (Critical info)
    // Model name - P0 critical
    left.push({
        content: cyan(bold(model)),
        priority: 0,
    });
    // Progress bar + percentage - P0 critical
    const bar = gradientBar(percent, layout.barWidth, colorMode);
    left.push({
        content: `${bar} ${coloredPercent(percent, colorMode)}`,
        priority: 0,
    });
    // Config counts - P2 secondary (compact format)
    const counts = [];
    if (ctx.claudeMdCount > 0 && config?.showClaudeMdCount !== false) {
        counts.push(`${ctx.claudeMdCount}${iconMode === 'nerd' ? icons.claudeMd : '#'}`);
    }
    if (ctx.rulesCount > 0 && config?.showRulesCount !== false) {
        counts.push(`${ctx.rulesCount}R`);
    }
    if (ctx.mcpCount > 0 && config?.showMcpCount !== false) {
        counts.push(`${ctx.mcpCount}M`);
    }
    if (ctx.hooksCount > 0 && config?.showHooksCount !== false) {
        counts.push(`${ctx.hooksCount}H`);
    }
    if (counts.length > 0) {
        left.push({
            content: dim(counts.join(' ')),
            priority: 2,
        });
    }
    // RIGHT SIDE (Secondary info)
    // Session duration - P1 important
    if (ctx.sessionDuration && config?.showSessionDuration !== false) {
        right.push({
            content: dim(ctx.sessionDuration),
            priority: 1,
        });
    }
    // Token breakdown at high usage - P3 optional
    if (percent >= 85) {
        const usage = ctx.stdin.context_window?.current_usage;
        if (usage) {
            const input = formatTokens(usage.input_tokens ?? 0);
            const cache = formatTokens((usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0));
            right.push({
                content: dim(`${input}+${cache}`),
                priority: 3,
            });
        }
    }
    // Compact warning - P0 critical (always show if needed)
    if (percent >= 95) {
        right.push({
            content: red(`${iconMode === 'nerd' ? icons.warning : '!'} COMPACT`),
            priority: 0,
        });
    }
    return { left, right };
}
function formatTokens(n) {
    if (n >= 1000000)
        return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)
        return `${(n / 1000).toFixed(0)}k`;
    return n.toString();
}
//# sourceMappingURL=session-line.js.map