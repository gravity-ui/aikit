import {OpenAI} from 'openai/client.js';
import type {ClientOptions} from 'openai/client.js';
import type {ResponseCreateParamsStreaming} from 'openai/resources/responses/responses.js';

import {ResponseStream} from './ResponseStream.js';
import {BASE_PROMPT_FOR_SUMMARIZATION} from './consts.js';

type ExtraClientOptions = {
    model?: string;
    agent?: string;
};

type ConversationItemsPage = OpenAI.Conversations.ConversationItemsPage;

type BaseSummarizePayload = {
    conversation: string;
    promptForSummarization?: string;
    joinItems?: (items: ConversationItemsPage) => string;
};

type SummarizeConversationPayload =
    | (BaseSummarizePayload & {
          byLastItems: number;
      })
    | (BaseSummarizePayload & {
          byFirstItems: number;
      });

export class OpenAIService extends OpenAI {
    private model?: string;
    private agent?: string;

    constructor(options: ClientOptions & ExtraClientOptions) {
        super(options);

        this.model = options.model;
        this.agent = options.agent;
    }

    async createResponseStream(payload: ResponseCreateParamsStreaming) {
        const metadata = this.getMetadataForResponseStream(payload.metadata);

        const stream = await this.responses.create({
            model: this.model,
            ...payload,
            stream: true,
            metadata,
        });

        const responseStream = new ResponseStream(stream);

        return responseStream;
    }

    async summarizeConversationTitle(summarizePayload: SummarizeConversationPayload) {
        const {conversation, joinItems, promptForSummarization} = summarizePayload;

        let order: 'asc' | 'desc' = 'asc';
        let itemsForSummarize = 5;
        if ('byLastItems' in summarizePayload) {
            order = 'desc';
            itemsForSummarize = summarizePayload.byLastItems;
        }
        if ('byFirstItems' in summarizePayload) {
            order = 'asc';
            itemsForSummarize = summarizePayload.byFirstItems;
        }

        this.chat.completions.list();

        const convItems = await this.conversations.items.list(conversation, {
            limit: itemsForSummarize,
            order: order,
        });

        const conversationContext = joinItems
            ? joinItems(convItems)
            : this.joinConvItemsForSummarizingTitle(convItems);

        const systemPrompt = promptForSummarization ?? BASE_PROMPT_FOR_SUMMARIZATION;
        const userPrompt = `Create a short title for this conversation:\n\n${conversationContext}`;

        this.responses.create({
            model: this.model,
            input: [
                {
                    content: [
                        {
                            text: systemPrompt,
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
                            text: userPrompt,
                            type: 'input_text',
                        },
                    ],
                    role: 'user',
                    status: 'completed',
                    type: 'message',
                },
            ],
        });
    }

    private joinConvItemsForSummarizingTitle(itemsPage: ConversationItemsPage) {
        return itemsPage.data
            .map((item) => {
                if (item.type === 'message') {
                    return item.content;
                }
                return '';
            })
            .join('\n');
    }

    private getMetadataForResponseStream(
        payloadMetadata: ResponseCreateParamsStreaming['metadata'],
    ) {
        if (payloadMetadata) return payloadMetadata;

        if (this.agent) return {agent: this.agent};

        return undefined;
    }
}
