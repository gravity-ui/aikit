import type {TSubmitData} from '../../../types';

import type {AIStudioChatProps} from './types';

/** Resolve application mapping once and keep a serialized snapshot for retries. */
export async function serializeChatRequest(
    request: Record<string, unknown>,
    data: TSubmitData,
    transform: AIStudioChatProps['transformRequest'],
    retryBody?: string,
): Promise<string | false> {
    if (retryBody !== undefined) return retryBody;
    const mapped = transform ? await transform(request, data) : request;
    return mapped === false ? false : JSON.stringify(mapped);
}
