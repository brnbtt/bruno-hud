import { renderSessionLine } from './session-line.js';
import { renderToolsLine } from './tools-line.js';
import { renderAgentsLine } from './agents-line.js';
import { renderTodosLine } from './todos-line.js';
import { RESET, dim } from './colors.js';
import { renderLayoutLine, getTerminalWidth, visibleWidth, truncateAnsi, } from './layout.js';
// Border characters (rounded corners)
const BORDER = {
    vertical: '\u2502', // │
    topLeft: '\u256d', // ╭
    topRight: '\u256e', // ╮
    bottomLeft: '\u2570', // ╰
    bottomRight: '\u256f', // ╯
    horizontal: '\u2500', // ─
};
export function render(ctx, config) {
    const termWidth = getTerminalWidth();
    // Use ~90% of terminal width, min 60, no max cap
    const boxWidth = Math.max(60, Math.floor(termWidth * 0.90));
    const innerWidth = boxWidth - 4; // Account for "│ " and " │"
    // Collect all layout lines - pass innerWidth so they use correct constraints
    const layoutLines = [
        renderSessionLine(ctx, config, innerWidth),
        renderToolsLine(ctx, config, innerWidth),
        renderAgentsLine(ctx, config, innerWidth),
        renderTodosLine(ctx, config, innerWidth),
    ];
    // Collect rendered lines
    const renderedLines = [];
    for (const layoutLine of layoutLines) {
        if (!layoutLine)
            continue;
        const rendered = renderLayoutLine(layoutLine, innerWidth);
        const subLines = rendered.split('\n');
        for (const line of subLines) {
            if (line)
                renderedLines.push(line);
        }
    }
    if (renderedLines.length === 0)
        return;
    const b = dim(BORDER.vertical);
    const h = dim(BORDER.horizontal);
    const tl = dim(BORDER.topLeft);
    const tr = dim(BORDER.topRight);
    const bl = dim(BORDER.bottomLeft);
    const br = dim(BORDER.bottomRight);
    // Top border
    console.log(`${RESET}${tl}${h.repeat(boxWidth - 2)}${tr}`);
    // Content lines with left and right borders
    for (let line of renderedLines) {
        // Truncate content if it exceeds innerWidth
        let lineWidth = visibleWidth(line);
        if (lineWidth > innerWidth) {
            line = truncateAnsi(line, innerWidth);
            lineWidth = visibleWidth(line);
        }
        const padding = Math.max(0, innerWidth - lineWidth);
        const paddedLine = line + ' '.repeat(padding);
        // Use non-breaking spaces to prevent line wrapping issues
        const outputLine = `${RESET}${b} ${paddedLine.replace(/ /g, '\u00A0')} ${b}`;
        console.log(outputLine);
    }
    // Bottom border
    console.log(`${RESET}${bl}${h.repeat(boxWidth - 2)}${br}`);
}
//# sourceMappingURL=index.js.map