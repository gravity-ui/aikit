import {block} from '../../../utils/cn';
import {MessageList, type MessageListProps} from '../../organisms/MessageList';
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
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
}

/**
 * ChatContent - main chat content with state switching (EmptyContainer/MessageList).
 *
 * @param props - Component props
 * @returns React component
 */
export function ChatContent(props: ChatContentProps) {
    const {view, emptyContainerProps, messageListProps, className, qa} = props;

    const isEmptyView = view === 'empty';

    return (
        <div className={b(null, className)} data-qa={qa}>
            {isEmptyView
                ? emptyContainerProps && <EmptyContainer {...emptyContainerProps} />
                : messageListProps && (
                      <div className={b('message-list-container')}>
                          <MessageList {...messageListProps} />
                      </div>
                  )}
        </div>
    );
}
