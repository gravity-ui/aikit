/* eslint-disable no-console */
import {useEffect, useRef, useState} from 'react';

import {Dialog} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {v4 as uuid} from 'uuid';

import {TChatMessage, TSubmitData, TUserMessage} from 'src/types';
import type {ToolMessageContentData} from 'src/types/messages';

import {ChatContainer} from '../../../components/pages/ChatContainer';
import {ContentWrapper} from '../../../demo/ContentWrapper';
import {
    createMockOpenAIClientToolStream,
    createMockOpenAIStream,
} from '../../../utils/createMockOpenAIStream';
import {
    OpenAIStreamAdapterOptions,
    OpenAIStreamSource,
    useOpenAIStreamAdapter,
} from '../useOpenAIResponsesAdapter';

const CLIENT_TOOL_NAME = 'show_diff';

export default {
    title: 'adapters/useOpenAIResponseAdapter',
    component: ChatContainer,
} as Meta;

type Story = StoryObj<typeof ChatContainer>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper height="800px" width="600px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        messages: [],
        chats: [],
        showHistory: true,
        showNewChat: true,
        showFolding: false,
        showClose: false,
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [streamOptions, setStreamOptions] = useState<OpenAIStreamAdapterOptions>();
        const [streamSource, setStreamSource] = useState<OpenAIStreamSource | null>(null);
        const currentStream = useOpenAIStreamAdapter(streamSource, streamOptions);
        const responseIdRef = useRef<string | null>(null);

        const handleSendMessage = async (data: TSubmitData) => {
            const assistantMessageId = uuid();

            const userMessage: TUserMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };

            const initialMessages: TChatMessage[] = [...messages, userMessage];
            setMessages(initialMessages);

            setStreamOptions({initialMessages, assistantMessageId});

            setStreamSource({body: createMockOpenAIStream()});
        };

        useEffect(() => {
            const newMessages = currentStream.messages.filter(
                (msg) => msg.role !== 'assistant' || getMessageContent(msg) !== '',
            );

            const messagesWithRespId = newMessages.map((m) => ({
                ...m,
                respId: currentStream.responseId,
            }));

            setMessages(messagesWithRespId);
        }, [currentStream.messages, currentStream.responseId]);

        useEffect(() => {
            responseIdRef.current = currentStream.responseId;
        }, [currentStream.responseId]);

        const handleSelectChat = () => {};

        const handleCreateChat = () => {};

        const handleCancel = async () => {};

        return (
            <ChatContainer
                {...args}
                messages={messages}
                onSendMessage={handleSendMessage}
                onCancel={handleCancel}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateChat}
            />
        );
    },
    decorators: defaultDecorators,
};

function getMessageContent(message: TChatMessage): string {
    if (message.role === 'user') {
        return message.content;
    }

    const {content} = message;

    if (typeof content === 'string') {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') {
                    return item;
                }
                if (item.type === 'text' && item.data?.text) {
                    return item.data.text;
                }
                return '';
            })
            .join('\n');
    }

    if (content && typeof content === 'object' && 'type' in content) {
        if (content.type === 'text' && content.data?.text) {
            return content.data.text;
        }
    }

    return '';
}

export const WithClientTool: Story = {
    args: {
        messages: [],
        chats: [],
        showHistory: true,
        showNewChat: true,
        showFolding: false,
        showClose: false,
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [streamOptions, setStreamOptions] = useState<OpenAIStreamAdapterOptions>();
        const [streamSource, setStreamSource] = useState<OpenAIStreamSource | null>(null);
        const currentStream = useOpenAIStreamAdapter(streamSource, streamOptions);
        const responseIdRef = useRef<string | null>(null);
        const seenClientToolIdsRef = useRef<Set<string>>(new Set());
        const [clientToolRequest, setClientToolRequest] = useState<string | null>(null);

        const handleSendMessage = async (data: TSubmitData) => {
            const assistantMessageId = uuid();

            const userMessage: TUserMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
            };

            const initialMessages: TChatMessage[] = [...messages, userMessage];
            setMessages(initialMessages);

            setStreamOptions({initialMessages, assistantMessageId});

            setStreamSource({body: createMockOpenAIClientToolStream()});
        };

        useEffect(() => {
            const newMessages = currentStream.messages.filter(
                (msg) => msg.role !== 'assistant' || getMessageContent(msg) !== '',
            );

            const messagesWithRespId = newMessages.map((m) => ({
                ...m,
                respId: currentStream.responseId,
            }));

            setMessages(messagesWithRespId);
        }, [currentStream.messages, currentStream.responseId]);

        useEffect(() => {
            responseIdRef.current = currentStream.responseId;
        }, [currentStream.responseId]);

        useEffect(() => {
            for (const message of currentStream.messages) {
                if (message.role !== 'assistant' || !Array.isArray(message.content)) continue;
                for (const item of message.content) {
                    if (typeof item === 'string' || !item || item.type !== 'tool') continue;
                    const toolId = item.id;
                    const data = item.data as ToolMessageContentData;
                    if (
                        !toolId ||
                        data.toolName !== CLIENT_TOOL_NAME ||
                        !data.mcpRequest ||
                        seenClientToolIdsRef.current.has(toolId)
                    ) {
                        continue;
                    }
                    seenClientToolIdsRef.current.add(toolId);
                    setClientToolRequest(data.mcpRequest);
                }
            }
        }, [currentStream]);

        const handleSelectChat = () => {};

        const handleCreateChat = () => {};

        const handleCancel = async () => {};

        return (
            <>
                <ChatContainer
                    {...args}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onCancel={handleCancel}
                    onSelectChat={handleSelectChat}
                    onCreateChat={handleCreateChat}
                />
                <Dialog
                    open={clientToolRequest !== null}
                    onClose={() => setClientToolRequest(null)}
                >
                    <Dialog.Header caption={CLIENT_TOOL_NAME} />
                    <Dialog.Body>
                        <pre style={{margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                            {clientToolRequest}
                        </pre>
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonApply={() => setClientToolRequest(null)}
                        textButtonApply="Close"
                    />
                </Dialog>
            </>
        );
    },
    decorators: defaultDecorators,
};
