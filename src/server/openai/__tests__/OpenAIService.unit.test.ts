jest.mock('openai/client', () => {
    const mockStream = {
        controller: {
            signal: {aborted: false},
            abort: jest.fn(),
        },
    };

    return {
        OpenAI: class MockOpenAI {
            responses = {
                create: jest.fn().mockImplementation(({stream}) => {
                    if (stream) {
                        return Promise.resolve(mockStream);
                    }
                    return Promise.resolve({});
                }),
            };
            conversations = {
                items: {
                    list: jest.fn().mockResolvedValue({
                        data: [
                            {type: 'message', content: 'Test message 1'},
                            {type: 'message', content: 'Test message 2'},
                            {type: 'other', content: 'Should be ignored'},
                        ],
                    }),
                },
            };
            chat = {
                completions: {
                    list: jest.fn(),
                },
            };
        },
    };
});

import {OpenAIService} from '../OpenAIService';
import {ResponseStream} from '../ResponseStream.js';
import {BASE_PROMPT_FOR_SUMMARIZATION} from '../consts.js';

describe('OpenAIService', () => {
    const testApiKey = 'test-api-key';
    const testModel = 'test-model';
    const testAgent = 'test-agent';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('createResponseStream() create a response stream with the correct arguments', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            const payload = {
                input: [{content: [{text: 'Test input', type: 'input_text'}], role: 'user'}],
                metadata: {custom: 'value'},
            };

            // @ts-expect-error
            const result = await service.createResponseStream(payload);

            // Check that responses.create was called with the right arguments
            expect(service.responses.create).toHaveBeenCalledWith({
                model: testModel,
                ...payload,
                stream: true,
                metadata: payload.metadata,
            });

            // Check that ResponseStream was created with the stream from responses.create
            expect(result).toBeInstanceOf(ResponseStream);
        });

        it('createResponseStream() should use agent metadata when no metadata is provided', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            const payload = {
                input: [{content: [{text: 'Test input', type: 'input_text'}], role: 'user'}],
            };

            // @ts-expect-error
            await service.createResponseStream(payload);

            // Check that responses.create was called with agent metadata
            expect(service.responses.create).toHaveBeenCalledWith({
                model: testModel,
                ...payload,
                stream: true,
                metadata: {agent: testAgent},
            });
        });

        it('summarizeConvTitle() should summarize conversation title with byLastItems', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.responses.create = jest.fn().mockResolvedValueOnce({
                output: [
                    {
                        type: 'message',
                        content: [{type: 'output_text', text: 'SUMMARIZED_TITLE'}],
                    },
                ],
            });

            const summarizePayload = {
                conversation: 'test-conversation-id',
                byLastItems: 10,
            };

            const title = await service.summarizeConvTitle(summarizePayload);

            expect(title).toBe('SUMMARIZED_TITLE');

            // Check that conversations.items.list was called with the right arguments
            expect(service.conversations.items.list).toHaveBeenCalledWith(
                summarizePayload.conversation,
                {
                    limit: summarizePayload.byLastItems,
                    order: 'desc',
                },
            );

            // Check that responses.create was called with the right arguments
            expect(service.responses.create).toHaveBeenCalledWith({
                model: testModel,
                input: [
                    {
                        content: [
                            {
                                text: BASE_PROMPT_FOR_SUMMARIZATION,
                                type: 'input_text',
                            },
                        ],
                        role: 'user',
                        status: 'completed',
                        type: 'message',
                    },
                    {
                        content: [
                            {
                                text: expect.stringContaining(
                                    'Create a short title for this conversation:',
                                ),
                                type: 'input_text',
                            },
                        ],
                        role: 'user',
                        status: 'completed',
                        type: 'message',
                    },
                ],
            });
        });

        it('summarizeConvTitle() should summarize conversation title with byFirstItems', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.responses.create = jest.fn().mockResolvedValueOnce({
                output: [
                    {
                        type: 'message',
                        content: [{type: 'output_text', text: 'SUMMARIZED_TITLE'}],
                    },
                ],
            });

            const summarizePayload = {
                conversation: 'test-conversation-id',
                byFirstItems: 5,
                promptForSummarization: 'Custom prompt',
            };

            await service.summarizeConvTitle(summarizePayload);

            // Check that conversations.items.list was called with the right arguments
            expect(service.conversations.items.list).toHaveBeenCalledWith(
                summarizePayload.conversation,
                {
                    limit: summarizePayload.byFirstItems,
                    order: 'asc',
                },
            );

            // Check that responses.create was called with the custom prompt
            expect(service.responses.create).toHaveBeenCalledWith({
                model: testModel,
                input: expect.arrayContaining([
                    expect.objectContaining({
                        content: [
                            {
                                text: summarizePayload.promptForSummarization,
                                type: 'input_text',
                            },
                        ],
                    }),
                ]),
            });
        });

        it('summarizeConvTitle() should throw an error when response has no valid output text', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.responses.create = jest.fn().mockResolvedValueOnce({
                output: [],
            });

            const summarizePayload = {
                conversation: 'test-conversation-id',
                byLastItems: 5,
            };

            // The method should throw an error
            await expect(service.summarizeConvTitle(summarizePayload)).rejects.toThrow(
                'Failed to generate title. Empty response',
            );
        });

        it('summarizeConvTitle() should use custom joinItems function if provided', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.responses.create = jest.fn().mockResolvedValueOnce({
                output: [
                    {
                        type: 'message',
                        content: [{type: 'output_text', text: 'SUMMARIZED_TITLE'}],
                    },
                ],
            });

            const customJoinItems = jest.fn().mockReturnValue('Custom joined content');
            const summarizePayload = {
                conversation: 'test-conversation-id',
                byFirstItems: 5,
                joinItems: customJoinItems,
            };

            await service.summarizeConvTitle(summarizePayload);

            // Check that custom joinItems was called
            expect(customJoinItems).toHaveBeenCalled();

            // Check that responses.create was called with the result of custom joinItems
            expect(service.responses.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: expect.arrayContaining([
                        expect.objectContaining({
                            content: [
                                {
                                    text: expect.stringContaining('Custom joined content'),
                                    type: 'input_text',
                                },
                            ],
                        }),
                    ]),
                }),
            );
        });

        it('getAllConvItems() should fetch all conversation items with default parameters', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            // Mock first page with has_more = true
            service.conversations.items.list = jest
                .fn()
                .mockResolvedValueOnce({
                    data: [
                        {id: 'item-1', type: 'message', content: 'Message 1'},
                        {id: 'item-2', type: 'message', content: 'Message 2'},
                    ],
                    has_more: true,
                })
                .mockResolvedValueOnce({
                    data: [
                        {id: 'item-3', type: 'message', content: 'Message 3'},
                        {id: 'item-4', type: 'message', content: 'Message 4'},
                    ],
                    has_more: false,
                });

            const result = await service.getAllConvItems('test-conversation-id');

            expect(result).toHaveLength(4);
            expect(result[0].id).toBe('item-1');
            expect(result[3].id).toBe('item-4');

            // Check that conversations.items.list was called twice
            expect(service.conversations.items.list).toHaveBeenCalledTimes(2);

            // First call should be without 'after' parameter
            expect(service.conversations.items.list).toHaveBeenNthCalledWith(
                1,
                'test-conversation-id',
                {
                    limit: 100,
                    after: undefined,
                    order: 'asc',
                },
            );

            // Second call should use 'after' from last item of first page
            expect(service.conversations.items.list).toHaveBeenNthCalledWith(
                2,
                'test-conversation-id',
                {
                    limit: 100,
                    after: 'item-2',
                    order: 'asc',
                },
            );
        });

        it('getAllConvItems() should fetch all items with custom fetchBy parameter', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.conversations.items.list = jest.fn().mockResolvedValueOnce({
                data: [
                    {id: 'item-1', type: 'message', content: 'Message 1'},
                    {id: 'item-2', type: 'message', content: 'Message 2'},
                ],
                has_more: false,
            });

            await service.getAllConvItems('test-conversation-id', 50);

            expect(service.conversations.items.list).toHaveBeenCalledWith('test-conversation-id', {
                limit: 50,
                after: undefined,
                order: 'asc',
            });
        });

        it('getAllConvItems() should fetch all items with desc order', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.conversations.items.list = jest.fn().mockResolvedValueOnce({
                data: [
                    {id: 'item-3', type: 'message', content: 'Message 3'},
                    {id: 'item-4', type: 'message', content: 'Message 4'},
                ],
                has_more: false,
            });

            const result = await service.getAllConvItems('test-conversation-id', 100, 'desc');

            expect(result).toHaveLength(2);
            expect(service.conversations.items.list).toHaveBeenCalledWith('test-conversation-id', {
                limit: 100,
                after: undefined,
                order: 'desc',
            });
        });

        it('getAllConvItems() should handle multiple pages correctly', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            // Mock three pages
            service.conversations.items.list = jest
                .fn()
                .mockResolvedValueOnce({
                    data: [{id: 'item-1', type: 'message', content: 'Message 1'}],
                    has_more: true,
                })
                .mockResolvedValueOnce({
                    data: [{id: 'item-2', type: 'message', content: 'Message 2'}],
                    has_more: true,
                })
                .mockResolvedValueOnce({
                    data: [{id: 'item-3', type: 'message', content: 'Message 3'}],
                    has_more: false,
                });

            const result = await service.getAllConvItems('test-conversation-id', 1);

            expect(result).toHaveLength(3);
            expect(result[0].id).toBe('item-1');
            expect(result[1].id).toBe('item-2');
            expect(result[2].id).toBe('item-3');
            expect(service.conversations.items.list).toHaveBeenCalledTimes(3);
        });

        it('getAllConvItems() should return empty array when no items', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.conversations.items.list = jest.fn().mockResolvedValueOnce({
                data: [],
                has_more: false,
            });

            const result = await service.getAllConvItems('test-conversation-id');

            expect(result).toEqual([]);
            expect(service.conversations.items.list).toHaveBeenCalledTimes(1);
        });

        it('getAllConvItems() should handle pagination with after parameter correctly', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            service.conversations.items.list = jest
                .fn()
                .mockResolvedValueOnce({
                    data: [
                        {id: 'item-1', type: 'message', content: 'Message 1'},
                        {id: 'item-2', type: 'message', content: 'Message 2'},
                        {id: 'item-3', type: 'message', content: 'Message 3'},
                    ],
                    has_more: true,
                })
                .mockResolvedValueOnce({
                    data: [
                        {id: 'item-4', type: 'message', content: 'Message 4'},
                        {id: 'item-5', type: 'message', content: 'Message 5'},
                    ],
                    has_more: false,
                });

            await service.getAllConvItems('test-conversation-id', 3, 'desc');

            // Verify that 'after' parameter is set to the last item's id from previous page
            expect(service.conversations.items.list).toHaveBeenNthCalledWith(
                2,
                'test-conversation-id',
                {
                    limit: 3,
                    after: 'item-3',
                    order: 'desc',
                },
            );
        });
    });
});
