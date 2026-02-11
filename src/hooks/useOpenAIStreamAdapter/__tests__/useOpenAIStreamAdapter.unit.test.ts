import {renderHook, waitFor} from '@testing-library/react';

import type {OpenAIStreamEventLike} from '../types';
import {useOpenAIStreamAdapter} from '../useOpenAIResponsesAdapter';

async function* createMockStream(
    events: OpenAIStreamEventLike[],
): AsyncIterable<OpenAIStreamEventLike> {
    for (const event of events) {
        yield event;
    }
}

describe('useOpenAIStreamAdapter', () => {
    it('should accumulate text deltas into a single assistant message', async () => {
        const stream = createMockStream([
            {type: 'response.output_text.delta', delta: 'Hello '},
            {type: 'response.output_text.delta', delta: 'world.'},
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        expect(result.current.error).toBeNull();
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0]).toMatchObject({
            role: 'assistant',
            content: 'Hello world.',
        });
    });

    it('should include MCP tool call in assistant message and not split on mcp output_item.done', async () => {
        const stream = createMockStream([
            {type: 'response.output_text.delta', delta: 'Calling tool... '},
            {
                type: 'response.output_item.added',
                item: {
                    type: 'mcp_call',
                    id: 'mcp-1',
                    name: 'file_search',
                    server_label: 'Files',
                },
            },
            {type: 'response.mcp_call.completed', item_id: 'mcp-1'},
            {
                type: 'response.output_item.done',
                item: {
                    type: 'mcp_call',
                    id: 'mcp-1',
                    status: 'completed',
                    output: '{"path":"/config.json"}',
                },
            },
            {type: 'response.output_text.delta', delta: ' Done.'},
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        expect(result.current.error).toBeNull();
        expect(result.current.messages).toHaveLength(1);

        const content = result.current.messages[0].content;
        expect(Array.isArray(content)).toBe(true);
        expect(content).toHaveLength(3); // text, tool, text

        const textParts = (content as Array<{type: string; data?: {text?: string}}>).filter(
            (c) => c.type === 'text',
        );
        expect(textParts.map((p) => p.data?.text).join('')).toBe('Calling tool...  Done.');

        const toolPart = (
            content as Array<{type: string; id?: string; data?: Record<string, unknown>}>
        ).find((c) => c.type === 'tool');
        expect(toolPart).toBeDefined();
        expect(toolPart?.id).toBe('mcp-1');
        expect(toolPart?.data?.toolName).toBe('file_search');
        expect(toolPart?.data?.status).toBe('success');
    });

    it('should add tool with waitingConfirmation for mcp_approval_request', async () => {
        const stream = createMockStream([
            {type: 'response.output_text.delta', delta: 'Need your approval. '},
            {
                type: 'response.output_item.added',
                item: {
                    type: 'mcp_approval_request',
                    id: 'mcpr_123',
                    name: 'roll',
                    server_label: 'dmcp',
                    arguments: '{"diceRollExpression":"2d4+1"}',
                },
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        expect(result.current.error).toBeNull();
        const content = result.current.messages[0].content;
        expect(Array.isArray(content)).toBe(true);
        const toolPart = (
            content as Array<{type: string; id?: string; data?: Record<string, unknown>}>
        ).find((c) => c.type === 'tool');
        expect(toolPart).toBeDefined();
        expect(toolPart?.id).toBe('mcpr_123');
        expect(toolPart?.data?.toolName).toBe('roll');
        expect(toolPart?.data?.status).toBe('waitingConfirmation');
        expect(toolPart?.data?.headerContent).toBe('{"diceRollExpression":"2d4+1"}');
    });

    it('should add tool with waitingSubmission for mcp_submission_request', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {
                    type: 'mcp_submission_request',
                    id: 'mcps_456',
                    name: 'submit_form',
                    server_label: 'Forms',
                    arguments: '{"field":"value"}',
                },
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content;
        const toolPart = (
            content as Array<{type: string; id?: string; data?: Record<string, unknown>}>
        ).find((c) => c.type === 'tool');
        expect(toolPart?.data?.status).toBe('waitingSubmission');
        expect(toolPart?.data?.headerContent).toBe('{"field":"value"}');
    });

    it('should use provided assistantMessageId', async () => {
        const stream = createMockStream([
            {type: 'response.output_text.delta', delta: 'Hi'},
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() =>
            useOpenAIStreamAdapter(stream, {
                initialMessages: [],
                assistantMessageId: 'custom-id-123',
            }),
        );

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        expect(result.current.messages[0].id).toBe('custom-id-123');
    });
});
