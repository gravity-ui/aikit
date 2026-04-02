import type {TChatMessage} from '../../../types';
import type {ChatContainerProps} from '../ChatContainer';

/**
 * Props managed internally by AIStudioChat that are omitted from ChatContainerProps
 */
type ManagedChatContainerProps =
    | 'messages'
    | 'status'
    | 'error'
    | 'onSendMessage'
    | 'onCancel'
    | 'onRetry'
    | 'chats'
    | 'activeChat'
    | 'onSelectChat'
    | 'onCreateChat'
    | 'onDeleteChat'
    | 'onDeleteAllChats'
    | 'showHistory'
    | 'showNewChat';

/**
 * Props for AIStudioChat component
 */
export interface AIStudioChatProps extends Omit<ChatContainerProps, ManagedChatContainerProps> {
    /** URL of the OpenAI-compatible streaming API endpoint */
    apiUrl: string;

    /** Initial messages to pre-populate the chat (e.g., for restoring a session) */
    initialMessages?: TChatMessage[];

    /** Enable multi-chat history panel (default: false) */
    showHistory?: boolean;

    /** Show new chat button in header (defaults to the value of showHistory) */
    showNewChat?: boolean;

    /** System prompt sent with every request */
    systemPrompt?: string;

    /** Additional fetch options applied to every API request (e.g., auth headers) */
    requestInit?: Omit<RequestInit, 'body' | 'method' | 'signal'>;

    /**
     * Extra fields merged into the request body on every send.
     * Use for assistantId, promptVariables, conversationId, etc.
     * Per-request overrides take precedence (returned from onBeforeSend).
     */
    extraRequestParams?: Record<string, unknown>;

    /**
     * Enable token usage tracking in stream responses (default: true).
     * Set to false to disable tracking and reduce payload size.
     */
    trackTokenUsage?: boolean;

    /**
     * Called before each API request is made.
     * Return an object to merge into the request body for this specific send.
     * Return false/null/undefined to cancel the send entirely.
     */
    onBeforeSend?: (params: {
        content: string;
    }) => Promise<Record<string, unknown> | false | null | void>;
}
