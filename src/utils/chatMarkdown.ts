import {Lexer, type Token} from 'marked';

import type {TChatMessage, TMessageContent} from '../types/messages';

export interface ChatMarkdownOptions {
    /** Localized role labels used in Markdown headings. */
    roleLabels?: {user: string; assistant: string};
    /** Return only user-visible Markdown for custom content; never serialize raw payloads. */
    getContentMarkdown?: (
        content: TMessageContent,
        message: TChatMessage<TMessageContent>,
    ) => string | undefined;
}

function escapeMarkdownSyntax(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/[\\`*_{}[\]()<>#+.!|~-]/g, '\\$&');
}

function escapePlainText(text: string): string {
    let cursor = 0;
    let result = '';
    for (const match of text.matchAll(/(?:https?:\/\/|www\.)[^\s<>]+/gi)) {
        const token = Lexer.lexInline(match[0])[0];
        if (token?.type !== 'link') continue;
        const offset = match.index;
        const href = token.href.replace(/&/g, '&amp;').replace(/</g, '%3C').replace(/>/g, '%3E');
        result += escapeMarkdownSyntax(text.slice(cursor, offset));
        result += `[${escapeMarkdownSyntax(token.raw)}](<${href}>)`;
        cursor = offset + token.raw.length;
    }
    return result + escapeMarkdownSyntax(text.slice(cursor));
}

function rewriteChildren(raw: string, tokens: Token[], rewrite: (token: Token) => string): string {
    let cursor = 0;
    let result = '';
    for (const token of tokens) {
        const offset = raw.indexOf(token.raw, cursor);
        if (offset < 0) continue;
        result += raw.slice(cursor, offset) + rewrite(token);
        cursor = offset + token.raw.length;
    }
    return result + raw.slice(cursor);
}

function closeCodeFence(raw: string): string {
    const fence = raw.match(/^ {0,3}(`{3,}|~{3,})/);
    if (!fence) return raw;
    const closing = new RegExp(`\\n {0,3}${fence[1][0]}{${fence[1].length},}[ \\t]*(?:\\n)?$`);
    return closing.test(raw) ? raw : `${raw}\n${fence[1]}\n`;
}

/** Resolve references per message before joining independent Markdown documents. */
function isolateMarkdown(markdown: string): string {
    const rewrite = (token: Token): string => {
        if (token.type === 'def') return '';
        if (
            (token.type === 'link' || token.type === 'image') &&
            /^!?\[/.test(token.raw) &&
            token.raw.endsWith(']')
        ) {
            const href = token.href
                .replace(/</g, '%3C')
                .replace(/>/g, '%3E')
                .replace(/\s/g, encodeURIComponent);
            const title = token.title
                ? ` "${token.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
                : '';
            return `${token.type === 'image' ? '!' : ''}[${token.text}](<${href}>${title})`;
        }
        if (token.type === 'code') {
            return closeCodeFence(token.raw);
        }
        if (token.type === 'blockquote') {
            const text = (token.tokens ?? []).map(rewrite).join('');
            return text === token.text
                ? token.raw
                : text
                      .split('\n')
                      .map((line) => `> ${line}`)
                      .join('\n') + '\n';
        }
        if (token.type === 'list') return rewriteChildren(token.raw, token.items, rewrite);
        if (token.type === 'list_item') {
            const text = (token.tokens ?? []).map(rewrite).join('');
            if (text === token.text) return token.raw;
            const prefix = token.raw.match(/^\s*(?:[-+*]|\d+[.)])\s+/)?.[0] ?? '- ';
            const checkbox = token.task ? `[${token.checked ? 'x' : ' '}] ` : '';
            const trailingNewlines = token.raw.match(/\n+$/)?.[0] ?? '';
            const body = text.replace(/\n+$/, '');
            return (
                prefix +
                checkbox +
                body.split('\n').join(`\n${' '.repeat(prefix.length)}`) +
                trailingNewlines
            );
        }
        if (token.type === 'table') {
            return rewriteChildren(
                token.raw,
                [...token.header, ...token.rows.flat()].map((cell) => ({
                    type: 'text',
                    raw: cell.text,
                    text: cell.text,
                    tokens: cell.tokens,
                })),
                rewrite,
            );
        }
        return 'tokens' in token && token.tokens
            ? rewriteChildren(token.raw, token.tokens, rewrite)
            : token.raw;
    };
    return Lexer.lex(markdown).map(rewrite).join('');
}

/** Extract public text only. Thinking, tool payloads and unknown content are excluded by default. */
export function getMessageMarkdown(
    message: TChatMessage<TMessageContent>,
    options: ChatMarkdownOptions = {},
): string {
    if (message.role !== 'user' && message.role !== 'assistant') {
        return '';
    }
    const parts: string[] = [];
    if (typeof message.content === 'string') {
        parts.push(
            message.role === 'user' && message.format !== 'markdown'
                ? escapePlainText(message.content)
                : message.content,
        );
    } else {
        const content = Array.isArray(message.content) ? message.content : [message.content];
        for (const item of content) {
            if (item.type === 'text') {
                if (
                    typeof item.data === 'object' &&
                    item.data !== null &&
                    'text' in item.data &&
                    typeof item.data.text === 'string'
                ) {
                    parts.push(item.data.text);
                }
            } else if (item.type !== 'thinking' && item.type !== 'tool') {
                const text = options.getContentMarkdown?.(item, message);
                if (text) parts.push(text);
            }
        }
    }
    if (message.role === 'user') {
        for (const file of message.fileAttachments ?? []) {
            parts.push(file.name.replace(/[\\`*_{}[\]()<>#+.!|~-]/g, '\\$&'));
        }
        for (const image of message.images ?? []) {
            // Inline image data can be large and is not a portable attachment link.
            if (/^https?:\/\//i.test(image)) {
                parts.push(
                    `<${image.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\s/g, encodeURIComponent)}>`,
                );
            }
        }
    }
    return parts.filter((part) => part.trim()).join('\n\n');
}

/** Preserve source order and Markdown, without reading rendered or virtualized DOM content. */
export function serializeChatMarkdown(
    messages: readonly TChatMessage<TMessageContent>[],
    options: ChatMarkdownOptions = {},
): string {
    const labels = options.roleLabels ?? {user: 'User', assistant: 'Assistant'};
    return messages
        .flatMap((message) => {
            const text = isolateMarkdown(getMessageMarkdown(message, options));
            return text ? [`## ${labels[message.role]}\n\n${text}`] : [];
        })
        .join('\n\n');
}

export function downloadChatMarkdown(markdown: string, filename = 'chat.md'): void {
    const url = URL.createObjectURL(new Blob([markdown], {type: 'text/markdown;charset=utf-8'}));
    const link = document.createElement('a');
    try {
        link.href = url;
        // eslint-disable-next-line no-control-regex
        link.download = filename.replace(/[\\/\u0000-\u001f]/g, '_').replace(/(?:\.md)?$/, '.md');
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        // Allow the browser to start consuming the object URL before releasing it.
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }
}
