/**
 * Data validation utilities
 */

import type {BaseMessageType, ChatType} from '../types';

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
 * Validate message structure
 * @param {unknown} message - Value to validate as message
 * @returns {boolean} True if value is a valid message
 */
export function isValidMessage(message: unknown): message is BaseMessageType {
    return (
        typeof message === 'object' &&
        message !== null &&
        typeof (message as BaseMessageType).id === 'string' &&
        typeof (message as BaseMessageType).type === 'string' &&
        typeof (message as BaseMessageType).author === 'string' &&
        typeof (message as BaseMessageType).timestamp === 'string' &&
        (message as BaseMessageType).data !== undefined
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
