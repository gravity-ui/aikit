/**
 * Data validation utilities
 */

import type {BaseMessage, ChatType} from '../types';

/**
 * Validate chat structure
 * @param {unknown} chat - Value to validate as chat
 * @returns {boolean} True if value is a valid chat
 */
export function isValidChat(chat: unknown): chat is ChatType {
    if (typeof chat !== 'object' || chat === null) {
        return false;
    }

    const c = chat as Record<string, unknown>;
    return (
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        (c.createTime === null || typeof c.createTime === 'string')
    );
}

/**
 * Validate message structure
 * @param {unknown} message - Value to validate as message
 * @returns {boolean} True if value is a valid message
 */
export function isValidMessage(message: unknown): message is BaseMessage {
    if (typeof message !== 'object' || message === null) {
        return false;
    }

    const m = message as Record<string, unknown>;
    return (
        typeof m.id === 'string' &&
        typeof m.type === 'string' &&
        typeof m.author === 'string' &&
        typeof m.timestamp === 'string' &&
        m.data !== undefined
    );
}

/**
 * Validate non-empty string
 * @param {unknown} value - Value to validate as non-empty string
 * @returns {boolean} True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
