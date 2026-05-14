import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {v4 as uuidv4} from 'uuid';

import {fetchResponseToStreamEvents, useOpenAIStreamAdapter} from '../../../adapters/openai';
import type {OpenAIStreamSource} from '../../../adapters/openai';
import {BaseMessageActionType} from '../../../types';
import type {
    ChatStatus,
    ChatType,
    DefaultMessageAction,
    FileAttachment,
    TAssistantMessage,
    TChatMessage,
    TSubmitData,
    TUserMessage,
    UserRating,
} from '../../../types';
import {InputContextProvider, useInputContext} from '../../molecules/InputContext';
import type {MessageListConfig} from '../ChatContainer';
import {ChatContainer} from '../ChatContainer';

import {normalizeMcpCallIds, omitMcpListToolsEvents} from './transforms';
import type {AIStudioChatProps} from './types';

function isFileAttachment(value: unknown): value is FileAttachment {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return typeof v.id === 'string' && typeof v.name === 'string';
}

function resolveFileAttachments(
    attachments: FileAttachment[] | undefined,
    fileIds: string[] | undefined,
): FileAttachment[] | undefined {
    if (attachments && attachments.length > 0) return attachments;
    if (fileIds && fileIds.length > 0) return fileIds.map((id) => ({id, name: id}));
    return undefined;
}

type ApiMessageContentPart =
    | {type: 'text'; text: string}
    | {type: 'image_url'; image_url: {url: string}};

type ApiMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string | ApiMessageContentPart[];
};

type StreamOptions = {
    initialMessages: TChatMessage[];
    assistantMessageId: string;
};

/**
 * Extracts plain text content from any TChatMessage variant.
 */
function getMessageTextContent(message: TChatMessage): string {
    if (message.role === 'user') {
        return typeof message.content === 'string' ? message.content : '';
    }

    const {content} = message as TAssistantMessage;

    if (typeof content === 'string') {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') return item;
                if (item.type === 'text' && item.data?.text) return item.data.text;
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

/**
 * Derives a human-readable chat name from the first user message.
 */
function deriveChatName(content: string): string {
    const trimmed = content.trim();
    return trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed || 'New chat';
}

type AIStudioChatInnerProps = Omit<AIStudioChatProps, 'fileUpload' | 'fileDialogTitle'>;

/**
 * AIStudioChat - a ready-to-use chat component with built-in OpenAI streaming support.
 *
 * Wraps ChatContainer and handles all state internally: streaming, message history,
 * multi-chat management, and cancellation. Requires only an `apiUrl` to start working.
 *
 * @param props - component props
 * @returns React component
 */
export function AIStudioChat(props: AIStudioChatProps) {
    const {fileUpload, fileDialogTitle, ...rest} = props;
    return (
        <InputContextProvider fileUpload={fileUpload} fileDialogTitle={fileDialogTitle}>
            <AIStudioChatInner {...rest} />
        </InputContextProvider>
    );
}

function AIStudioChatInner(props: AIStudioChatInnerProps) {
    const {
        apiUrl,
        initialMessages = [],
        showHistory = false,
        showNewChat = showHistory,
        systemPrompt,
        requestInit,
        extraRequestParams,
        trackTokenUsage = true,
        onBeforeSend,
        ...chatContainerProps
    } = props;

    const {prepareFilesForSend, reset, contextItems, attachmentContent} = useInputContext();

    // Current chat messages
    const [messages, setMessages] = useState<TChatMessage[]>(initialMessages);

    // Multi-chat state (used when showHistory=true)
    const [chats, setChats] = useState<ChatType[]>([]);
    const [activeChat, setActiveChat] = useState<ChatType | null>(null);

    // Per-chat message store (ref to avoid unnecessary re-renders on switch)
    const chatMessagesRef = useRef<Record<string, TChatMessage[]>>({});

    // Always-current reference to activeChat for use inside async callbacks
    // (intentionally mutable ref — not a forgotten dependency)
    const activeChatRef = useRef<ChatType | null>(null);
    activeChatRef.current = activeChat;

    // Tracks the last response id for conversation continuity (previous_response_id)
    const responseIdRef = useRef<string | null>(null);

    // Streaming state
    const [controller, setController] = useState<AbortController | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [streamSource, setStreamSource] = useState<OpenAIStreamSource | null>(null);
    const [streamOptions, setStreamOptions] = useState<StreamOptions | null>(null);

    const handleStreamEnd = useCallback((finalMessages: TChatMessage[]) => {
        const committed = finalMessages.filter(
            (msg) => msg.role !== 'assistant' || getMessageTextContent(msg) !== '',
        );

        setMessages(committed);
        setStreamSource(null);
        setStreamOptions(null);

        // Persist messages and update the last message preview in history
        const chat = activeChatRef.current;
        if (chat) {
            chatMessagesRef.current[chat.id] = committed;

            const lastMsg = committed[committed.length - 1];
            if (lastMsg) {
                setChats((prev) =>
                    prev.map((c) =>
                        c.id === chat.id ? {...c, lastMessage: getMessageTextContent(lastMsg)} : c,
                    ),
                );
            }
        }
    }, []);

    const streamResult = useOpenAIStreamAdapter(streamSource, {
        initialMessages: streamOptions?.initialMessages ?? [],
        assistantMessageId: streamOptions?.assistantMessageId ?? 'assistant-idle',
        onStreamEnd: handleStreamEnd,
        trackTokenUsage,
    });

    // Sync latest responseId to ref so next request can use it as previousResponseId
    useEffect(() => {
        if (streamResult.responseId) {
            responseIdRef.current = streamResult.responseId;
        }
    }, [streamResult.responseId]);

    const hasSource = Boolean(streamSource);

    const displayMessages =
        hasSource && streamResult.messages.length > 0 ? streamResult.messages : messages;

    const status = useMemo((): ChatStatus => {
        if (!hasSource) {
            return isFetching ? 'submitted' : 'ready';
        }
        if (streamResult.status === 'streaming') return 'streaming';
        if (streamResult.status === 'error') return 'error';
        return 'ready';
    }, [hasSource, isFetching, streamResult.status]);

    /**
     * Core send function. Takes an already-resolved set of previous messages and
     * pre-converted base64 images so it can be called both from handleSendMessage
     * (which converts File objects) and from handleRetry (which reuses stored images).
     */
    const performSend = useCallback(
        async ({
            previousMessages,
            content,
            base64Images = [],
            perSendParams = {},
        }: {
            previousMessages: TChatMessage[];
            content: string;
            base64Images?: string[];
            perSendParams?: Record<string, unknown>;
        }) => {
            // Auto-create a chat when history is enabled and no chat is active yet
            if (showHistory && !activeChatRef.current) {
                const newChat: ChatType = {
                    id: uuidv4(),
                    name: deriveChatName(content),
                    createTime: new Date().toISOString(),
                };
                chatMessagesRef.current[newChat.id] = [];
                activeChatRef.current = newChat;
                setActiveChat(newChat);
                setChats((prev) => [newChat, ...prev]);
            }

            const rawFileIds = Array.isArray(perSendParams.fileIds)
                ? (perSendParams.fileIds as string[])
                : undefined;
            const rawFileAttachments = Array.isArray(perSendParams.fileAttachments)
                ? (perSendParams.fileAttachments as unknown[]).filter(isFileAttachment)
                : undefined;
            const userMessage: TUserMessage = {
                id: uuidv4(),
                role: 'user',
                content,
                images: base64Images.length > 0 ? base64Images : undefined,
                fileAttachments: resolveFileAttachments(rawFileAttachments, rawFileIds),
            };
            const messagesWithUser: TChatMessage[] = [...previousMessages, userMessage];
            const assistantMessageId = uuidv4();

            setMessages(messagesWithUser);
            setIsFetching(true);

            const abortController = new AbortController();
            setController(abortController);

            try {
                // Last user message: plain text or multipart (text + images)
                const lastUserContent: ApiMessage['content'] =
                    base64Images.length > 0
                        ? [
                              {type: 'text', text: content},
                              ...base64Images.map((url) => ({
                                  type: 'image_url' as const,
                                  image_url: {url},
                              })),
                          ]
                        : content;

                const apiMessages: ApiMessage[] = [
                    ...(systemPrompt ? [{role: 'system' as const, content: systemPrompt}] : []),
                    ...previousMessages
                        .filter(
                            (msg) => msg.role !== 'assistant' || getMessageTextContent(msg) !== '',
                        )
                        .map((msg) => ({
                            role: msg.role as 'user' | 'assistant',
                            content: getMessageTextContent(msg),
                        })),
                    {role: 'user' as const, content: lastUserContent},
                ];

                const response = await fetch(apiUrl, {
                    ...requestInit,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream',
                        ...requestInit?.headers,
                    },
                    body: JSON.stringify({
                        messages: apiMessages,
                        ...extraRequestParams,
                        ...perSendParams,
                        ...(responseIdRef.current
                            ? {previousResponseId: responseIdRef.current}
                            : {}),
                    }),
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                setStreamSource(
                    normalizeMcpCallIds(
                        omitMcpListToolsEvents(fetchResponseToStreamEvents(response)),
                    ),
                );
                setStreamOptions({initialMessages: messagesWithUser, assistantMessageId});
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    const errorMessage: TAssistantMessage = {
                        id: uuidv4(),
                        role: 'assistant',
                        content: (error as Error).message,
                    };
                    setMessages((prev) => {
                        const filtered = prev.filter(
                            (msg) => msg.role !== 'assistant' || getMessageTextContent(msg) !== '',
                        );
                        return [...filtered, errorMessage];
                    });
                }
                setStreamSource(null);
                setStreamOptions(null);
            } finally {
                setIsFetching(false);
                setController(null);
            }
        },
        [showHistory, systemPrompt, requestInit, apiUrl, extraRequestParams],
    );

    const handleSendMessage = useCallback(
        async (data: TSubmitData) => {
            // Call onBeforeSend hook — allows caller to inject per-request params or cancel send
            let perSendParams: Record<string, unknown> = {};
            if (onBeforeSend) {
                const result = await onBeforeSend({content: data.content});
                if (result === false || result === null) return;
                if (result) perSendParams = result;
            }

            const {base64Images, perSendFileParams} = await prepareFilesForSend(data.attachments);

            await performSend({
                previousMessages: messages,
                content: data.content,
                base64Images,
                perSendParams: {
                    ...perSendParams,
                    ...perSendFileParams,
                },
            });

            reset();
        },
        [messages, onBeforeSend, performSend, prepareFilesForSend, reset],
    );

    const handleCancel = useCallback(async () => {
        controller?.abort();
        setStreamSource(null);
        setStreamOptions(null);
    }, [controller]);

    const handleRetry = useCallback(async () => {
        const lastUserMsg = [...messages]
            .reverse()
            .find((m): m is TUserMessage => m.role === 'user');
        if (!lastUserMsg) return;

        const lastUserIndex = messages.lastIndexOf(lastUserMsg);
        const trimmedMessages = messages.slice(0, lastUserIndex);

        await performSend({
            previousMessages: trimmedMessages,
            content: lastUserMsg.content,
            // Reuse images stored on the original message — no FileReader needed
            base64Images: lastUserMsg.images ?? [],
        });
    }, [messages, performSend]);

    const handleCreateChat = useCallback(() => {
        const current = activeChatRef.current;
        if (current) {
            chatMessagesRef.current[current.id] = messages;
        }

        responseIdRef.current = null;

        const newChat: ChatType = {
            id: uuidv4(),
            name: 'New chat',
            createTime: new Date().toISOString(),
        };
        chatMessagesRef.current[newChat.id] = [];
        setChats((prev) => [newChat, ...prev]);
        setActiveChat(newChat);
        setMessages([]);
        reset();
    }, [messages, reset]);

    const handleSelectChat = useCallback(
        (chat: ChatType) => {
            const current = activeChatRef.current;
            if (current) {
                chatMessagesRef.current[current.id] = messages;
            }

            responseIdRef.current = null;
            setActiveChat(chat);
            setMessages(chatMessagesRef.current[chat.id] ?? []);
            reset();
        },
        [messages, reset],
    );

    const handleDeleteChat = useCallback(
        async (chat: ChatType) => {
            delete chatMessagesRef.current[chat.id];
            setChats((prev) => prev.filter((c) => c.id !== chat.id));

            if (activeChatRef.current?.id === chat.id) {
                responseIdRef.current = null;
                setActiveChat(null);
                setMessages([]);
                reset();
            }
        },
        [reset],
    );

    /**
     * Update `userRating` on an assistant message inside the internal store.
     * Mirrors the change into the per-chat history map so it survives chat switches.
     */
    const setUserRating = useCallback((messageId: string, rating: UserRating | undefined) => {
        const updateRating = (msgs: TChatMessage[]): TChatMessage[] =>
            msgs.map((msg) =>
                msg.role === 'assistant' && msg.id === messageId
                    ? {...msg, userRating: rating}
                    : msg,
            );

        setMessages(updateRating);

        const chat = activeChatRef.current;
        if (chat && chatMessagesRef.current[chat.id]) {
            chatMessagesRef.current[chat.id] = updateRating(chatMessagesRef.current[chat.id]);
        }
    }, []);

    /**
     * Wrap consumer-provided Like/Unlike actions so the library toggles `userRating`
     * automatically before delegating to the original `onClick`. Other actions and
     * non-default (ReactNode) entries pass through unchanged.
     */
    const messageListConfig = useMemo<MessageListConfig | undefined>(() => {
        const original = chatContainerProps.messageListConfig;
        const originalAssistantActions = original?.assistantActions;
        if (!originalAssistantActions) return original;

        const wrappedAssistantActions = originalAssistantActions.map((action) => {
            const typed = action as DefaultMessageAction<TAssistantMessage>;
            const isLike = typed.type === BaseMessageActionType.Like;
            const isDislike = typed.type === BaseMessageActionType.Dislike;
            if (!isLike && !isDislike) return action;

            const targetRating: UserRating = isLike ? 'like' : 'dislike';
            const originalOnClick = typed.onClick;

            return {
                ...typed,
                onClick: (message: TAssistantMessage) => {
                    if (message.id) {
                        const nextRating =
                            message.userRating === targetRating ? undefined : targetRating;
                        setUserRating(message.id, nextRating);
                    }
                    originalOnClick(message);
                },
            };
        });

        return {
            ...original,
            assistantActions: wrappedAssistantActions,
        };
    }, [chatContainerProps.messageListConfig, setUserRating]);

    return (
        <ChatContainer
            {...chatContainerProps}
            messageListConfig={messageListConfig}
            messages={displayMessages}
            status={status}
            error={streamResult.error}
            onSendMessage={handleSendMessage}
            onCancel={handleCancel}
            onRetry={handleRetry}
            chats={showHistory ? chats : undefined}
            activeChat={showHistory ? activeChat : undefined}
            onSelectChat={showHistory ? handleSelectChat : undefined}
            onCreateChat={showHistory ? handleCreateChat : undefined}
            onDeleteChat={showHistory ? handleDeleteChat : undefined}
            showHistory={showHistory}
            showNewChat={showNewChat}
            promptInputProps={{
                ...chatContainerProps.promptInputProps,
                view: 'full',
                headerProps: {
                    ...chatContainerProps.promptInputProps?.headerProps,
                    contextItems:
                        chatContainerProps.promptInputProps?.headerProps?.contextItems ??
                        contextItems,
                },
                footerProps: {
                    ...chatContainerProps.promptInputProps?.footerProps,
                    attachmentContent:
                        chatContainerProps.promptInputProps?.footerProps?.attachmentContent ??
                        attachmentContent,
                },
            }}
        />
    );
}
