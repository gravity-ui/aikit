import type {OpenAIStreamEventLike} from '../../../../../adapters/openai';
import {normalizeMcpCallIds} from '../normalizeMcpCallIds';

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

describe('normalizeMcpCallIds', () => {
    it('rewrites mcp_call id in output_item.done back to the id seen in output_item.added', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 1,
                item: {type: 'mcp_call', id: '000_temp', name: 'get-fake-post'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.mcp_call.completed',
                item_id: '000_temp',
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.done',
                output_index: 1,
                item: {type: 'mcp_call', id: 'final-id', name: 'get-fake-post', output: '{}'},
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(normalizeMcpCallIds(fromArray(events)));
        const doneItem = (result[2] as {item: {id: string}}).item;
        expect(doneItem.id).toBe('000_temp');
        // upstream events untouched
        expect((result[0] as {item: {id: string}}).item.id).toBe('000_temp');
        expect((result[1] as {item_id: string}).item_id).toBe('000_temp');
    });

    it('handles SSE wrapper shape (event + data.item) the same way', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                event: 'response.output_item.added',
                data: {
                    type: 'response.output_item.added',
                    output_index: 1,
                    item: {type: 'mcp_call', id: '000_804cf5dd', name: 'get-fake-post'},
                },
            } as unknown as OpenAIStreamEventLike,
            {
                event: 'response.output_item.done',
                data: {
                    type: 'response.output_item.done',
                    output_index: 1,
                    item: {type: 'mcp_call', id: '88fff374', name: 'get-fake-post', output: '{}'},
                },
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(normalizeMcpCallIds(fromArray(events)));
        const doneData = (result[1] as {data: {item: {id: string}}}).data;
        expect(doneData.item.id).toBe('000_804cf5dd');
    });

    it('does not touch mcp_list_tools events even when ids differ', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.done',
                output_index: 0,
                item: {type: 'mcp_list_tools', id: 'list-1', tools: []},
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(normalizeMcpCallIds(fromArray(events)));
        expect((result[1] as {item: {id: string}}).item.id).toBe('list-1');
    });

    it('passes events without output_index or item through unchanged', async () => {
        const events: OpenAIStreamEventLike[] = [
            {type: 'response.created'} as unknown as OpenAIStreamEventLike,
            {type: 'response.output_text.delta', delta: 'hi'} as OpenAIStreamEventLike,
            {type: 'response.completed'} as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(normalizeMcpCallIds(fromArray(events)));
        expect(result).toEqual(events);
    });

    it('keeps id unchanged when done id already matches the added id', async () => {
        const events: OpenAIStreamEventLike[] = [
            {
                type: 'response.output_item.added',
                output_index: 1,
                item: {type: 'mcp_call', id: 'same-id'},
            } as unknown as OpenAIStreamEventLike,
            {
                type: 'response.output_item.done',
                output_index: 1,
                item: {type: 'mcp_call', id: 'same-id', output: '{}'},
            } as unknown as OpenAIStreamEventLike,
        ];

        const result = await collect(normalizeMcpCallIds(fromArray(events)));
        expect((result[1] as {item: {id: string}}).item.id).toBe('same-id');
        // event reference preserved when no rewrite needed
        expect(result[1]).toBe(events[1]);
    });
});
