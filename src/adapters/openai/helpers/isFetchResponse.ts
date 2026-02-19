import {FetchResponseLike} from '../types';

export function isFetchResponse(value: unknown): value is FetchResponseLike {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const v = value as FetchResponseLike;
    const body = v.body;
    return Boolean(body) && typeof (body as ReadableStream).getReader === 'function';
}
