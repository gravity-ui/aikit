import type {OptionsType} from '@diplodoc/transform/lib/typings';

import {MessageListProps} from 'src/components/organisms/MessageList';

import type {ChatStatus, ChatType, TChatMessage, TSubmitData} from '../../../types';
import type {SuggestionsItem} from '../../../types/common';
import type {ContextIndicatorProps} from '../../atoms/ContextIndicator';
import type {DisclaimerProps} from '../../atoms/Disclaimer';
import type {ContextItemConfig} from '../../molecules/PromptInputHeader';
import type {HeaderProps} from '../../organisms/Header';
import type {PromptInputProps} from '../../organisms/PromptInput';
import type {ChatContentProps} from '../../templates/ChatContent';
import type {AlignmentConfig, EmptyContainerProps} from '../../templates/EmptyContainer';
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
    };
    /** Submit button tooltips */
    submitButton?: {
        /** Send button tooltip (enabled state) */
        sendTooltip?: string;
        /** Cancel button tooltip (cancelable state) */
        cancelTooltip?: string;
    };
    /** History texts */
    history?: {
        /** Empty state placeholder */
        emptyPlaceholder?: string;
        /** Empty filtered state placeholder (when search returns no results) */
        emptyFilteredPlaceholder?: string;
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
    /** Title text or custom React element */
    title?: React.ReactNode;
    /** Description text or custom React element */
    description?: React.ReactNode;
    /** Suggestions section title - can be string or custom React element */
    suggestionTitle?: React.ReactNode;
    /** Array of suggestions (title will be used as message content) */
    suggestions?: SuggestionsItem[];
    /** Alignment configuration for image, title, and description */
    alignment?: AlignmentConfig;
    /** Layout orientation for suggestions: 'grid' for horizontal, 'list' for vertical */
    layout?: 'grid' | 'list';
    /** Enable text wrapping inside suggestion buttons instead of ellipsis */
    wrapText?: boolean;
    /** Show default title when neither title nor i18nConfig.emptyState.title are provided */
    showDefaultTitle?: boolean;
    /** Show default description when neither description nor i18nConfig.emptyState.description are provided */
    showDefaultDescription?: boolean;
    /** Show more suggestions callback */
    showMore?: () => void;
    /** Show more button text */
    showMoreText?: string;
}

/**
 * MessageList configuration
 */
export type MessageListConfig = Omit<
    MessageListProps,
    'messages' | 'status' | 'onRetry' | 'showActionsOnHover' | 'transformOptions'
>;

/**
 * Unified test identifiers (`data-qa`) for ChatContainer and its subtree.
 *
 * - Pass a **string** for backward compatibility: only the root container gets `data-qa`.
 * - Pass **`{ prefix: 'x' }`** to opt in to `${prefix}-${suffix}` for every slot below (see README).
 * - Pass **explicit keys** to override individual elements; they win over `prefix` and nested `*Props.qa`.
 */
export interface ChatContainerQa {
    /** Applied to child slots when explicit keys are omitted; also used as root if `root` is omitted */
    prefix?: string;
    /** Root chat container */
    root?: string;
    /** Header root */
    header?: string;
    /** Overrides default `header-action-newChat` */
    headerNewChat?: string;
    /** Overrides default `header-action-history` */
    headerHistory?: string;
    /** Overrides default `header-action-folding` */
    headerFolding?: string;
    /** Overrides default `header-action-close` */
    headerClose?: string;
    /** ChatContent root */
    content?: string;
    /** Empty state (EmptyContainer) */
    emptyState?: string;
    /** MessageList scroll area */
    messageList?: string;
    /** Action popup in MessageList */
    actionPopup?: string;
    /** PromptInput root */
    promptInput?: string;
    promptInputHeader?: string;
    promptInputBody?: string;
    promptInputFooter?: string;
    /** Submit button in prompt footer */
    submitButton?: string;
    /** Disclaimer text block */
    disclaimer?: string;
    /** History list (inside popup) */
    history?: string;
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
    onDeleteChat?: (chat: ChatType) => Promise<void>;
    /** Callback when user deletes all chats */
    onDeleteAllChats?: () => Promise<void>;
    /** Callback when user folds or unfolds the chat */
    onFold?: (value: 'collapsed' | 'opened') => void;
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
    /** Show context indicator in prompt input header */
    showContextIndicator?: boolean;
    /** Props for the context indicator */
    contextIndicatorProps?: ContextIndicatorProps;
    /** Transform options for markdown rendering */
    transformOptions?: OptionsType;
    /** Should parse incomplete markdown (e.g., during streaming) */
    shouldParseIncompleteMarkdown?: boolean;

    // Configuration
    /** MessageList configuration for actions and loader behavior */
    messageListConfig?: MessageListConfig;

    // Component props overrides
    /** Props override for Header component */
    headerProps?: Partial<
        Omit<HeaderProps, 'handleNewChat' | 'handleHistoryToggle' | 'handleFolding' | 'handleClose'>
    >;
    /** Props override for ChatContent component */
    contentProps?: Partial<Omit<ChatContentProps, 'view' | 'messageListProps'>>;
    /** Props override for EmptyContainer (welcome screen) */
    emptyContainerProps?: Partial<EmptyContainerProps>;
    /** Props override for PromptInput component */
    promptInputProps?: Partial<Omit<PromptInputProps, 'onSend' | 'onCancel'>>;
    /** Props override for Disclaimer component */
    disclaimerProps?: Partial<DisclaimerProps>;
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
    /** Show folding button */
    showFolding?: boolean;
    /** Show close button */
    showClose?: boolean;
    /** Hide header title when chat is empty */
    hideTitleOnEmptyChat?: boolean;

    // Styling
    /** Additional CSS class */
    className?: string;
    /** Additional CSS class for header section */
    headerClassName?: string;
    /** Additional CSS class for content section */
    contentClassName?: string;
    /** Additional CSS class for footer section */
    footerClassName?: string;
    /**
     * QA/test identifiers. A string sets only the root `data-qa`. Use {@link ChatContainerQa} for a full map or `prefix`.
     */
    qa?: string | ChatContainerQa;
}
