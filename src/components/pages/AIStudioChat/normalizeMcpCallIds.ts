import type {OpenAIStreamEventLike} from '../../../adapters/openai';

type EventRecord = Record<string, unknown>;
type ItemRecord = {type?: string; id?: string} & Record<string, unknown>;

function readEventType(e: EventRecord): string | undefined {
    const top = e.type as string | undefined;
    if (top) return top;
    const data = e.data as EventRecord | undefined;
    const fromData = data?.type as string | undefined;
    if (fromData) return fromData;
    return e.event as string | undefined;
}

function readEventItem(e: EventRecord): ItemRecord | undefined {
    const top = e.item as ItemRecord | undefined;
    if (top) return top;
    const data = e.data as EventRecord | undefined;
    return data?.item as ItemRecord | undefined;
}

function readEventOutputIndex(e: EventRecord): number | undefined {
    const top = e.output_index;
    if (typeof top === 'number') return top;
    const data = e.data as EventRecord | undefined;
    const fromData = data?.output_index;
    return typeof fromData === 'number' ? fromData : undefined;
}

function rewriteItemIdInEvent(
    event: OpenAIStreamEventLike,
    normalizedId: string,
): OpenAIStreamEventLike {
    const e = event as EventRecord;
    const next: EventRecord = {...e};

    const topItem = e.item as ItemRecord | undefined;
    if (topItem) {
        next.item = {...topItem, id: normalizedId};
    }

    const data = e.data as EventRecord | undefined;
    if (data) {
        const dataItem = data.item as ItemRecord | undefined;
        const nextData: EventRecord = {...data};
        if (dataItem) {
            nextData.item = {...dataItem, id: normalizedId};
        }
        next.data = nextData;
    }

    return next as OpenAIStreamEventLike;
}

/**
 * Workaround for a Yandex Responses-compatible backend that assigns an mcp_call item
 * a temporary id (prefixed `000_…`) during streaming, then swaps it for a different
 * permanent id in `response.output_item.done`. Without this rewrite, the downstream
 * tool-card lookup misses the existing part and renders a duplicate card. The
 * `output_index` field stays stable across the item's lifecycle, so it serves as the
 * canonical identity used to remap the done event's id back to the first-seen one.
 */
export async function* normalizeMcpCallIds(
    source: AsyncIterable<OpenAIStreamEventLike>,
): AsyncIterable<OpenAIStreamEventLike> {
    const outputIndexToMcpCallId = new Map<number, string>();

    for await (const event of source) {
        const e = event as EventRecord;
        const type = readEventType(e);
        const item = readEventItem(e);
        const outputIndex = readEventOutputIndex(e);

        if (
            type === 'response.output_item.added' &&
            item?.type === 'mcp_call' &&
            typeof item.id === 'string' &&
            typeof outputIndex === 'number'
        ) {
            outputIndexToMcpCallId.set(outputIndex, item.id);
            yield event;
            continue;
        }

        if (
            type === 'response.output_item.done' &&
            item?.type === 'mcp_call' &&
            typeof outputIndex === 'number' &&
            outputIndexToMcpCallId.has(outputIndex)
        ) {
            const originalId = outputIndexToMcpCallId.get(outputIndex) as string;
            if (typeof item.id === 'string' && item.id !== originalId) {
                yield rewriteItemIdInEvent(event, originalId);
                continue;
            }
        }

        yield event;
    }
}
