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
        parts.push(message.content);
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
            const text = getMessageMarkdown(message, options);
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
