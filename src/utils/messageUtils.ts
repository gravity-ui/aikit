/**
 * Message utilities
 */

import type {BaseMessage} from '../types';

/**
 * Generate unique ID for message
 */
export function generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format message timestamp
 */
export function formatMessageTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60000) {
        return 'just now';
    }

    // Less than an hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min ago`;
    }

    // Today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `yesterday at ${date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    }

    // Older
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Check if message is from user
 */
export function isUserMessage(message: BaseMessage): boolean {
    return message.author === 'user';
}

/**
 * Check if message is from assistant
 */
export function isAssistantMessage(message: BaseMessage): boolean {
    return message.author === 'assistant';
}

/**
 * Get last message from list
 */
export function getLastMessage(messages: BaseMessage[]): BaseMessage | null {
    return messages.length > 0 ? messages[messages.length - 1] : null;
}
