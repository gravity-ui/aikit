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

    it('should accumulate refusal deltas into assistant message text', async () => {
        const stream = createMockStream([
            {type: 'response.refusal.delta', delta: 'I cannot ', item_id: 'out-1', output_index: 0},
            {type: 'response.refusal.delta', delta: 'do that.', item_id: 'out-1', output_index: 0},
            {
                type: 'response.refusal.done',
                item_id: 'out-1',
                output_index: 0,
                refusal: 'I cannot do that.',
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        expect(result.current.messages[0].content).toBe('I cannot do that.');
    });

    it('should append reasoning_summary_text deltas to thinking block', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'reasoning', id: 'reason-1'},
            },
            {type: 'response.reasoning_text.delta', item_id: 'reason-1', delta: 'Thinking... '},
            {type: 'response.reasoning_summary_text.delta', item_id: 'reason-1', delta: 'Summary '},
            {type: 'response.reasoning_summary_text.delta', item_id: 'reason-1', delta: 'text.'},
            {
                type: 'response.reasoning_summary_text.done',
                item_id: 'reason-1',
                text: 'Summary text.',
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            data?: {content?: string};
        }>;
        const thinkingPart = content.find((c) => c.type === 'thinking');
        expect(thinkingPart).toBeDefined();
        // Deltas (reasoning_text + reasoning_summary_text) are accumulated; summary .done may finalize
        expect(thinkingPart?.data?.content).toContain('Thinking... ');
        expect(thinkingPart?.data?.content).toContain('Summary text.');
    });

    it('should add tool for file_search_call and update on progress events', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'file_search_call', id: 'fs-1'},
            },
            {type: 'response.file_search_call.searching', item_id: 'fs-1'},
            {type: 'response.file_search_call.completed', item_id: 'fs-1'},
            {
                type: 'response.output_item.done',
                item: {
                    type: 'file_search_call',
                    id: 'fs-1',
                    status: 'completed',
                    results: [{file_id: 'f1', filename: 'doc.pdf'}],
                },
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            id?: string;
            data?: Record<string, unknown>;
        }>;
        const toolPart = content.find((c) => c.type === 'tool');
        expect(toolPart?.id).toBe('fs-1');
        expect(toolPart?.data?.toolName).toBe('File Search');
        expect(toolPart?.data?.status).toBe('success');
    });

    it('should add tool for web_search_call', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'web_search_call', id: 'ws-1'},
            },
            {type: 'response.web_search_call.in_progress', item_id: 'ws-1'},
            {
                type: 'response.output_item.done',
                item: {type: 'web_search_call', id: 'ws-1', status: 'completed'},
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            data?: Record<string, unknown>;
        }>;
        const toolPart = content.find((c) => c.type === 'tool');
        expect(toolPart?.data?.toolName).toBe('Web Search');
        expect(toolPart?.data?.status).toBe('success');
    });

    it('should add tool for code_interpreter_call', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'code_interpreter_call', id: 'ci-1'},
            },
            {type: 'response.code_interpreter_call.interpreting', item_id: 'ci-1'},
            {
                type: 'response.output_item.done',
                item: {
                    type: 'code_interpreter_call',
                    id: 'ci-1',
                    status: 'completed',
                    output: 'Result',
                },
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            data?: Record<string, unknown>;
        }>;
        const toolPart = content.find((c) => c.type === 'tool');
        expect(toolPart?.data?.toolName).toBe('Code Interpreter');
        expect(toolPart?.data?.status).toBe('success');
        expect(toolPart?.data?.headerContent).toBe('Result');
    });

    it('should add tool for image_generation_call', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'image_generation_call', id: 'img-1'},
            },
            {type: 'response.image_generation_call.generating', item_id: 'img-1'},
            {
                type: 'response.output_item.done',
                item: {type: 'image_generation_call', id: 'img-1', status: 'completed'},
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            data?: Record<string, unknown>;
        }>;
        const toolPart = content.find((c) => c.type === 'tool');
        expect(toolPart?.data?.toolName).toBe('Image Generation');
        expect(toolPart?.data?.status).toBe('success');
    });

    it('should add tool for mcp_list_tools and handle failed', async () => {
        const stream = createMockStream([
            {
                type: 'response.output_item.added',
                item: {type: 'mcp_list_tools', id: 'mcp-list-1'},
            },
            {type: 'response.mcp_list_tools.in_progress', item_id: 'mcp-list-1'},
            {
                type: 'response.mcp_list_tools.failed',
                item_id: 'mcp-list-1',
                error: 'Server unavailable',
            },
            {
                type: 'response.output_item.done',
                item: {
                    type: 'mcp_list_tools',
                    id: 'mcp-list-1',
                    status: 'failed',
                    error: 'Server unavailable',
                },
            },
            {type: 'response.done'},
        ]);

        const {result} = renderHook(() => useOpenAIStreamAdapter(stream, {initialMessages: []}));

        await waitFor(() => {
            expect(result.current.status).toBe('done');
        });

        const content = result.current.messages[0].content as Array<{
            type: string;
            data?: Record<string, unknown>;
        }>;
        const toolPart = content.find((c) => c.type === 'tool');
        expect(toolPart?.data?.toolName).toBe('MCP List Tools');
        expect(toolPart?.data?.status).toBe('error');
        expect(toolPart?.data?.headerContent).toBe('Server unavailable');
    });
});
