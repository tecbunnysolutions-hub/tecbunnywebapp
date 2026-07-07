import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MarkdownRenderer({ content }) {
    if (!content)
        return null;
    // Split by newlines to process blocks
    const lines = content.split('\n');
    const elements = [];
    let listBuffer = [];
    let inList = false;
    const flushList = (keyPrefix) => {
        if (listBuffer.length > 0) {
            elements.push(_jsx("ul", { className: "list-disc pl-6 my-4 space-y-3", children: listBuffer }, `${keyPrefix}-list`));
            listBuffer = [];
            inList = false;
        }
    };
    const processInline = (text) => {
        // Simple bold parser: **text**
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return _jsx("strong", { className: "font-bold text-foreground", children: part.slice(2, -2) }, i);
            }
            return part;
        });
    };
    lines.forEach((line, index) => {
        const key = `line-${index}`;
        const trimmed = line.trim();
        // Headers
        if (trimmed.startsWith('### ')) {
            flushList(key);
            elements.push(_jsx("h3", { className: "text-xl font-semibold text-foreground mt-8 mb-4 border-b border-border pb-2", children: processInline(trimmed.slice(4)) }, key));
        }
        else if (trimmed.startsWith('## ')) {
            flushList(key);
            elements.push(_jsx("h2", { className: "text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border pb-2", children: processInline(trimmed.slice(3)) }, key));
        }
        else if (trimmed.startsWith('# ')) {
            flushList(key);
            elements.push(_jsx("h1", { className: "text-3xl font-bold text-foreground mt-10 mb-6 border-b border-border pb-4", children: processInline(trimmed.slice(2)) }, key));
        }
        // List Items
        else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            inList = true;
            listBuffer.push(_jsx("li", { className: "text-muted-foreground leading-7", children: processInline(trimmed.slice(2)) }, key));
        }
        // Numbered Lists (1., 1), etc)
        else if (/^\d+\)\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
            flushList(key); // Close previous bullet list if any
            const match = trimmed.match(/^(\d+[\.\)])\s(.*)/);
            if (match) {
                elements.push(_jsxs("div", { className: "flex gap-3 mt-4 items-start", children: [_jsx("span", { className: "font-bold text-primary min-w-[1.5rem] text-right", children: match[1] }), _jsx("span", { className: "text-foreground leading-7", children: processInline(match[2]) })] }, key));
            }
            else {
                elements.push(_jsx("p", { className: "mb-4 text-muted-foreground leading-7", children: processInline(trimmed) }, key));
            }
        }
        // Regular Paragraphs
        else if (trimmed.length > 0) {
            flushList(key);
            elements.push(_jsx("p", { className: "mb-4 text-muted-foreground leading-7 text-base", children: processInline(trimmed) }, key));
        }
        // Empty lines
        else {
            flushList(key);
            elements.push(_jsx("div", { className: "h-2" }, key));
        }
    });
    flushList('final');
    return _jsx("div", { children: elements });
}
