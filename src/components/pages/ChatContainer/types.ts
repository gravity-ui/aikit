import type {OptionsType} from '@diplodoc/transform/lib/typings';

import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../types';
import type {ContextItemConfig} from '../../molecules/PromptInputHeader';
import type {HeaderProps} from '../../organisms/Header';
import type {PromptInputProps} from '../../organisms/PromptInput';
import type {ChatContentProps} from '../../templates/ChatContent';
import type {EmptyContainerProps} from '../../templates/EmptyContainer';
import type {HistoryProps} from '../../templates/History';

/**
 * I18n configuration for all text labels in ChatContainer
 */
export interface ChatContainerI18nConfig {
    /** Header texts */
    header?: {
        /** Default header title */
        defaultTitle?: string;
        /** Tooltip for new chat button */
        newChatTooltip?: string;
        /** Tooltip for history button */
        historyTooltip?: string;
        /** Tooltip for close button */
        closeTooltip?: string;
    };
    /** Empty state texts */
    emptyState?: {
        /** Welcome title */
        title?: string;
        /** Welcome description */
        description?: string;
        /** Suggestions section title */
        suggestionsTitle?: string;
        /** Show more suggestions button text */
        showMoreText?: string;
    };
    /** Prompt input texts */
    promptInput?: {
        /** Placeholder text */
        placeholder?: string;
        /** Send button tooltip */
        sendTooltip?: string;
        /** Cancel button tooltip */
        cancelTooltip?: string;
    };
    /** History texts */
    history?: {
        /** Empty state placeholder */
        emptyPlaceholder?: string;
        /** Search placeholder */
        searchPlaceholder?: string;
    };
    /** Disclaimer text */
    disclaimer?: {
        /** Disclaimer text content */
        text?: string;
    };
}

/**
 * Welcome screen configuration
 */
export interface WelcomeConfig {
    /** Image or icon to display */
    image?: React.ReactNode;
    /** Title text */
    title?: string;
    /** Description text */
    description?: string;
    /** Suggestions section title */
    suggestionTitle?: string;
    /** Array of suggestions */
    suggestions?: Array<{
        /** Unique identifier for the suggestion */
        id: string;
        /** Suggestion text content that will be sent as message */
        content: string;
        /** Display title for the suggestion button (defaults to content if not provided) */
        label?: string;
    }>;
    /** Show more suggestions callback */
    showMore?: () => void;
    /** Show more button text */
    showMoreText?: string;
}

/**
 * Props for ChatContainer component
 */
export interface ChatContainerProps {
    // Chat data
    /** Array of chats for history */
    chats?: ChatType[];
    /** Currently active chat */
    activeChat?: ChatType | null;
    /** Array of messages in current chat */
    messages?: TChatMessage[];

    // Main callbacks
    /** Callback when user sends a message */
    onSendMessage: (data: TSubmitData) => Promise<void>;
    /** Callback when user selects a chat from history */
    onSelectChat?: (chat: ChatType) => void;
    /** Callback when user creates a new chat */
    onCreateChat?: () => void;
    /** Callback when user deletes a chat */
    onDeleteChat?: (chat: ChatType) => void;
    /** Callback when user deletes all chats */
    onDeleteAllChats?: () => Promise<void>;
    /** Callback when user closes the chat */
    onClose?: () => void;
    /** Callback when user cancels streaming */
    onCancel?: () => Promise<void>;

    // States
    /** Chat status: submitted, streaming, ready, error */
    status?: ChatStatus;
    /** Error state */
    error?: Error | null;
    /** Show message actions on hover */
    showActionsOnHover?: boolean;
    /** Callback to retry after error */
    onRetry?: () => void;

    // Context
    /** Array of context items to display in prompt input header */
    contextItems?: ContextItemConfig[];
    /** Transform options for markdown rendering */
    transformOptions?: OptionsType;

    // Component props overrides
    /** Props override for Header component */
    headerProps?: Partial<
        Omit<HeaderProps, 'handleNewChat' | 'handleHistoryToggle' | 'handleClose'>
    >;
    /** Props override for ChatContent component */
    contentProps?: Partial<Omit<ChatContentProps, 'view' | 'messageListProps'>>;
    /** Props override for EmptyContainer (welcome screen) */
    emptyContainerProps?: Partial<EmptyContainerProps>;
    /** Props override for PromptInput component */
    promptInputProps?: Partial<Omit<PromptInputProps, 'onSend' | 'onCancel'>>;
    /** Props override for History component */
    historyProps?: Partial<
        Omit<
            HistoryProps,
            'chats' | 'selectedChat' | 'onSelectChat' | 'onDeleteChat' | 'anchorElement'
        >
    >;

    // Configuration
    /** Welcome screen configuration for empty state */
    welcomeConfig?: WelcomeConfig;
    /** I18n configuration for all text labels */
    i18nConfig?: ChatContainerI18nConfig;
    /** Show chat history feature */
    showHistory?: boolean;
    /** Show new chat button */
    showNewChat?: boolean;
    /** Show close button */
    showClose?: boolean;

    // Styling
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}
