import {Avatar} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {MessageBalloon} from '../../atoms/MessageBalloon';
import {BaseMessage, BaseMessageProps} from '../../molecules/BaseMessage';

import './UserMessage.scss';

const b = block('user-message');

export type UserMessageProps = Pick<
    BaseMessageProps,
    'actions' | 'showActionsOnHover' | 'showTimestamp' | 'timestamp'
> & {
    content: string | React.ReactNode;
    format?: 'plain' | 'markdown';
    showAvatar?: boolean;
    avatarUrl?: string;
    className?: string;
    qa?: string;
};

export const UserMessage = (props: UserMessageProps) => {
    const {
        className,
        qa,
        content,
        actions,
        showActionsOnHover,
        showAvatar,
        avatarUrl = '',
        timestamp = '',
        showTimestamp,
        format = 'plain',
    } = props;

    return (
        <div className={b(null, className)} data-qa={qa}>
            {showAvatar ? <Avatar imgUrl={avatarUrl} size="s" view="filled" /> : null}
            <BaseMessage
                variant="user"
                actions={actions}
                showActionsOnHover={showActionsOnHover}
                showTimestamp={showTimestamp}
                timestamp={timestamp}
            >
                <MessageBalloon>
                    {format === 'markdown' ? (
                        <MarkdownRenderer content={content as string} />
                    ) : (
                        content
                    )}
                </MessageBalloon>
            </BaseMessage>
        </div>
    );
};
