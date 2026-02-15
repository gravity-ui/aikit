jest.mock('openai/client.js', () => {
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

            // @ts-ignore
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

            // @ts-ignore
            await service.createResponseStream(payload);

            // Check that responses.create was called with agent metadata
            expect(service.responses.create).toHaveBeenCalledWith({
                model: testModel,
                ...payload,
                stream: true,
                metadata: {agent: testAgent},
            });
        });

        it('summarizeConversationTitle() should summarize conversation title with byLastItems', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            const summarizePayload = {
                conversation: 'test-conversation-id',
                byLastItems: 10,
            };

            await service.summarizeConversationTitle(summarizePayload);

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

        it('summarizeConversationTitle() should summarize conversation title with byFirstItems', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            const summarizePayload = {
                conversation: 'test-conversation-id',
                byFirstItems: 5,
                promptForSummarization: 'Custom prompt',
            };

            await service.summarizeConversationTitle(summarizePayload);

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

        it('summarizeConversationTitle() should use custom joinItems function if provided', async () => {
            const service = new OpenAIService({
                apiKey: testApiKey,
                model: testModel,
                agent: testAgent,
            });

            const customJoinItems = jest.fn().mockReturnValue('Custom joined content');
            const summarizePayload = {
                conversation: 'test-conversation-id',
                byFirstItems: 5,
                joinItems: customJoinItems,
            };

            await service.summarizeConversationTitle(summarizePayload);

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
    });
});
