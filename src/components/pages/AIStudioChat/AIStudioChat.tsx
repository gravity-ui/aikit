import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {v4 as uuidv4} from 'uuid';

import {useOpenAIStreamAdapter} from '../../../adapters/openai';
import {useFileUploadStore} from '../../../hooks/useFileUploadStore';
import type {
    ChatStatus,
    ChatType,
    FileAttachment,
    TAssistantMessage,
    TChatMessage,
    TSubmitData,
    TUserMessage,
} from '../../../types';
import {FileIcon} from '../../atoms/FileIcon';
import {AttachmentPicker} from '../../organisms/AttachmentPicker';
import {ChatContainer} from '../ChatContainer';

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

/**
 * Converts a File to a base64 data URL.
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

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
    const [streamResponse, setStreamResponse] = useState<Response | null>(null);
    const [streamOptions, setStreamOptions] = useState<StreamOptions | null>(null);

    const handleStreamEnd = useCallback((finalMessages: TChatMessage[]) => {
        const committed = finalMessages.filter(
            (msg) => msg.role !== 'assistant' || getMessageTextContent(msg) !== '',
        );

        setMessages(committed);
        setStreamResponse(null);
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

    const streamResult = useOpenAIStreamAdapter(streamResponse, {
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

    const hasResponse = Boolean(streamResponse);

    const displayMessages =
        hasResponse && streamResult.messages.length > 0 ? streamResult.messages : messages;

    const status = useMemo((): ChatStatus => {
        if (!hasResponse) {
            return isFetching ? 'submitted' : 'ready';
        }
        if (streamResult.status === 'streaming') return 'streaming';
        if (streamResult.status === 'error') return 'error';
        return 'ready';
    }, [hasResponse, isFetching, streamResult.status]);

    const {entries, addFiles, removeFile, reset, uploadedMetas} = useFileUploadStore<{
        id: string;
        name: string;
        mimeType?: string;
    }>({
        upload: async (file) => {
            await new Promise((r) => setTimeout(r, 300));
            return {id: file.name, name: file.name, mimeType: file.type || undefined};
        },
    });

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

                setStreamResponse(response);
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
                setStreamResponse(null);
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

            const storeFiles = entries.map((e) => e.file);
            const inputAttachments = data.attachments ?? [];
            const allFiles = [...storeFiles, ...inputAttachments];

            const imageFiles = allFiles.filter((f) => f.type.startsWith('image/'));
            const otherFiles = allFiles.filter((f) => !f.type.startsWith('image/'));
            const base64Images = await Promise.all(imageFiles.map(fileToBase64));

            const metaByName = new Map(uploadedMetas.map((m) => [m.name, m]));
            const fileAttachments: FileAttachment[] = otherFiles.map((f) => {
                const meta = metaByName.get(f.name);
                return {
                    id: meta?.id ?? f.name,
                    name: meta?.name ?? f.name,
                    mimeType: meta?.mimeType ?? (f.type || undefined),
                };
            });
            const fileIds = fileAttachments.map((f) => f.id);

            await performSend({
                previousMessages: messages,
                content: data.content,
                base64Images,
                perSendParams: {
                    ...perSendParams,
                    ...(fileIds.length > 0 ? {fileIds} : {}),
                    fileAttachments,
                    fileNames: allFiles.map((f) => f.name),
                },
            });

            reset();
        },
        [entries, messages, onBeforeSend, performSend, reset, uploadedMetas],
    );

    const handleCancel = useCallback(async () => {
        controller?.abort();
        setStreamResponse(null);
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

    const attachmentPicker = useMemo(
        () => (
            <AttachmentPicker
                uploadOnly
                fileDialogProps={{
                    title: 'Attach files',
                    multiple: true,
                    onCancel: reset,
                    onAdd: addFiles,
                    files: entries.map((entry) => ({
                        id: entry.id,
                        name: entry.file.name,
                        size: entry.file.size,
                        mimeType: entry.file.type || undefined,
                        status: (() => {
                            if (entry.status === 'uploading') return 'loading';
                            if (entry.status === 'done') return 'success';
                            if (entry.status === 'error') return 'error';
                            return undefined;
                        })(),
                        onRemove: () => removeFile(entry.id),
                    })),
                }}
            />
        ),
        [addFiles, entries, removeFile, reset],
    );

    const inputContextItems = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                content: (
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
                        <FileIcon
                            fileName={entry.file.name}
                            mimeType={entry.file.type || undefined}
                            size="s"
                        />
                        {entry.file.name}
                    </span>
                ),
                onRemove: () => removeFile(entry.id),
            })),
        [entries, removeFile],
    );

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
    }, [messages]);

    const handleSelectChat = useCallback(
        (chat: ChatType) => {
            const current = activeChatRef.current;
            if (current) {
                chatMessagesRef.current[current.id] = messages;
            }

            responseIdRef.current = null;
            setActiveChat(chat);
            setMessages(chatMessagesRef.current[chat.id] ?? []);
        },
        [messages],
    );

    const handleDeleteChat = useCallback(async (chat: ChatType) => {
        delete chatMessagesRef.current[chat.id];
        setChats((prev) => prev.filter((c) => c.id !== chat.id));

        if (activeChatRef.current?.id === chat.id) {
            responseIdRef.current = null;
            setActiveChat(null);
            setMessages([]);
        }
    }, []);

    return (
        <ChatContainer
            {...chatContainerProps}
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
                        inputContextItems,
                },
                footerProps: {
                    ...chatContainerProps.promptInputProps?.footerProps,
                    attachmentContent:
                        chatContainerProps.promptInputProps?.footerProps?.attachmentContent ??
                        attachmentPicker,
                },
            }}
        />
    );
}
