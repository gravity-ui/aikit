import type {OpenAIStreamEventLike} from '../../../../adapters/openai';

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

function readReferencedItemId(e: EventRecord): string | undefined {
    const top = e.item_id;
    if (typeof top === 'string') return top;
    const data = e.data as EventRecord | undefined;
    const fromData = data?.item_id;
    if (typeof fromData === 'string') return fromData;
    const item = readEventItem(e);
    return typeof item?.id === 'string' ? item.id : undefined;
}

/**
 * Drops events tied to `mcp_list_tools` output items so the chat surface does not
 * render an "MCP List Tools" card. The available-tools listing is implementation
 * detail and clutters the conversation. We record item ids announced via
 * `response.output_item.added` (and the matching `done`) and skip any other event
 * that references them (`response.mcp_list_tools.*`, etc.).
 */
export async function* omitMcpListToolsEvents(
    source: AsyncIterable<OpenAIStreamEventLike>,
): AsyncIterable<OpenAIStreamEventLike> {
    const mcpListToolsItemIds = new Set<string>();

    for await (const event of source) {
        const e = event as EventRecord;
        const type = readEventType(e);
        const item = readEventItem(e);

        if (
            (type === 'response.output_item.added' || type === 'response.output_item.done') &&
            item?.type === 'mcp_list_tools'
        ) {
            if (typeof item.id === 'string') {
                mcpListToolsItemIds.add(item.id);
            }
            continue;
        }

        if (mcpListToolsItemIds.size > 0) {
            const refId = readReferencedItemId(e);
            if (refId && mcpListToolsItemIds.has(refId)) {
                continue;
            }
        }

        yield event;
    }
}
