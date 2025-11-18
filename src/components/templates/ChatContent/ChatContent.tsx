import {block} from '../../../utils/cn';
import {Disclaimer, type DisclaimerProps} from '../../atoms/Disclaimer';
import {MessageList, type MessageListProps} from '../../organisms/MessageList';
import {PromptInput, type PromptInputProps} from '../../organisms/PromptInput';
import {EmptyContainer, type EmptyContainerProps} from '../EmptyContainer';

import './ChatContent.scss';

const b = block('chat-content');

/**
 * ChatContent display mode
 */
export type ChatContentView = 'empty' | 'chat';

/**
 * Props for ChatContent component
 */
export interface ChatContentProps {
    /** Display mode: 'empty' - EmptyContainer, 'chat' - MessageList */
    view: ChatContentView;
    /** Props for EmptyContainer (used when view='empty') */
    emptyContainerProps?: EmptyContainerProps;
    /** Props for MessageList (used when view='chat') */
    messageListProps?: MessageListProps;
    /** Props for PromptInput (always displayed) */
    promptInputProps?: PromptInputProps;
    /** Props for Disclaimer (always displayed) */
    disclaimerProps?: DisclaimerProps;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}

/**
 * ChatContent - main chat content with state switching (EmptyContainer/MessageList).
 * PromptInput is always displayed, regardless of the mode.
 *
 * @param props - Component props
 * @returns React component
 */
export function ChatContent(props: ChatContentProps) {
    const {
        view,
        emptyContainerProps,
        messageListProps,
        promptInputProps,
        disclaimerProps,
        className,
        qa,
    } = props;

    const isEmptyView = view === 'empty';
    const showFooter = promptInputProps || disclaimerProps;

    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('content')}>
                {isEmptyView
                    ? emptyContainerProps && <EmptyContainer {...emptyContainerProps} />
                    : messageListProps && <MessageList {...messageListProps} />}
            </div>
            {showFooter && (
                <div className={b('prompt-input')}>
                    {promptInputProps && <PromptInput {...promptInputProps} />}
                    {disclaimerProps && <Disclaimer {...disclaimerProps} />}
                </div>
            )}
        </div>
    );
}
