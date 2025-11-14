/**
 * Data validation utilities
 */

import type {ChatType} from '../types';

/**
 * Validate chat structure
 * @param {unknown} chat - Value to validate as chat
 * @returns {boolean} True if value is a valid chat
 */
export function isValidChat(chat: unknown): chat is ChatType {
    return (
        typeof chat === 'object' &&
        chat !== null &&
        typeof (chat as ChatType).id === 'string' &&
        typeof (chat as ChatType).name === 'string' &&
        ((chat as ChatType).createTime === null ||
            typeof (chat as ChatType).createTime === 'string')
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
