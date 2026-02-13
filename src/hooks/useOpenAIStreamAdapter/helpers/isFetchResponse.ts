import {FetchResponseLike} from '../types';

/**
 * Checks whether the value is a fetch Response (or an object with a ReadableStream body).
 *
 * @param value - Value to check
 * @returns {boolean} True if value is FetchResponseLike
 */
export function isFetchResponse(value: unknown): value is FetchResponseLike {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const v = value as FetchResponseLike;
    return v.body !== null && typeof (v.body as ReadableStream).getReader === 'function';
}
