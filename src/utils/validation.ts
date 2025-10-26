/**
 * Data validation utilities
 */

import type {BaseMessage, ChatType} from '../types';

/**
 * Validate chat structure
 */
export function isValidChat(chat: any): chat is ChatType {
    return (
        typeof chat === 'object' &&
        chat !== null &&
        typeof chat.id === 'string' &&
        typeof chat.name === 'string' &&
        (chat.createTime === null || typeof chat.createTime === 'string')
    );
}

/**
 * Validate message structure
 */
export function isValidMessage(message: any): message is BaseMessage {
    return (
        typeof message === 'object' &&
        message !== null &&
        typeof message.id === 'string' &&
        typeof message.type === 'string' &&
        typeof message.author === 'string' &&
        typeof message.timestamp === 'string' &&
        message.data !== undefined
    );
}

/**
 * Validate non-empty string
 */
export function isNonEmptyString(value: any): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
