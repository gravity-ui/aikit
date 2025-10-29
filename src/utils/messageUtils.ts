import {v4 as uuidv4} from 'uuid';

/**
 * Message utilities
 */

import type {BaseMessage} from '../types';

/**
 * Generate unique ID for message
 * @returns {string} Unique message identifier
 */
export function generateMessageId(): string {
    return uuidv4();
}

/**
 * Check if message is from user
 * @param {BaseMessage} message - Message to check
 * @returns {boolean} True if message is from user
 */
export function isUserMessage(message: BaseMessage): boolean {
    return message.author === 'user';
}

/**
 * Check if message is from assistant
 * @param {BaseMessage} message - Message to check
 * @returns {boolean} True if message is from assistant
 */
export function isAssistantMessage(message: BaseMessage): boolean {
    return message.author === 'assistant';
}

/**
 * Get last message from list
 * @param {BaseMessage[]} messages - Array of messages
 * @returns {BaseMessage | null} Last message or null if array is empty
 */
export function getLastMessage(messages: BaseMessage[]): BaseMessage | null {
    return messages.length > 0 ? messages[messages.length - 1] : null;
}
