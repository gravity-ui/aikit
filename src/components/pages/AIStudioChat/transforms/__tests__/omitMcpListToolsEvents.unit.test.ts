import type {OpenAIStreamEventLike} from '../../../../../adapters/openai';
import {omitMcpListToolsEvents} from '../omitMcpListToolsEvents';

async function* fromArray<T>(items: T[]): AsyncIterable<T> {
    for (const item of items) {
        yield item;
    }
}

async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = [];
    for await (const event of source) {
        out.push(event);
    }
    return out;
}

describe('omitMcpListToolsEvents', () => {
    it('drops the full mcp_list_tools lifecycle (added → in_progress → completed → done)', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.mcp_list_tools.in_progress',
                item_id: 'list-1',
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.mcp_list_tools.completed',
                item_id: 'list-1',
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.done',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1', tools: []},
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(omitMcpListToolsEvents(fromArray(events)));
        expect(result).toEqual([]);
    });

    it('drops a failed mcp_list_tools event referencing the same item_id', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-x'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.mcp_list_tools.failed',
                item_id: 'list-x',
                error: 'boom',
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(omitMcpListToolsEvents(fromArray(events)));
        expect(result).toEqual([]);
    });

    it('keeps mcp_call and text events untouched alongside mcp_list_tools', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.added',
                output_index: 1,
                item: {type: 'mcp_call', id: 'call-1', name: 'get-fake-post'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.done',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1', tools: []},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_text.delta',
                delta: 'hi',
            } as OpenAIStreamEventLike,
        ];

        const result = await collect(omitMcpListToolsEvents(fromArray(events)));
        expect(result).toHaveLength(2);
        expect((result[0] as {item: {id: string; type: string}}).item.type).toBe('mcp_call');
        expect(result[1]).toEqual({type: 'response.output_text.delta', delta: 'hi'});
    });

    it('handles SSE wrapper shape (event + data.item)', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                event: 'response.output_item.added',
                data: {
                    type: 'response.output_item.added',
                    output_index: 0,
                    item: {type: 'mcp_list_tools', id: 'list-sse'},
                },
            } as unknown as OpenAIStreamEventLike,
            {
                event: 'response.mcp_list_tools.completed',
                data: {
                    type: 'response.mcp_list_tools.completed',
                    item_id: 'list-sse',
                },
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(omitMcpListToolsEvents(fromArray(events)));
        expect(result).toEqual([]);
    });

    it('passes events with unknown item_id through (does not over-filter)', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.mcp_call.completed',
                item_id: 'call-1',
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(omitMcpListToolsEvents(fromArray(events)));
        expect(result).toEqual(events);
    });
});
