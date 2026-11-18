import {composeStories} from '@storybook/react';

import {MessageList} from '..';
import {BaseMessageActionType} from '../../../../types/messages';
import * as DefaultMessageListStories from '../__stories__/MessageList.stories';

export const MessageListStories = composeStories(DefaultMessageListStories);

export function VirtualizedPopupReplacement({messageId}: {messageId: string}) {
    return (
        <div style={{height: 400, width: 480, display: 'flex'}}>
            <MessageList
                virtualized
                messages={[
                    {id: messageId, role: 'assistant', content: 'First reply'},
                    {id: 'second', role: 'assistant', content: 'Second reply'},
                ]}
                assistantActions={[
                    {
                        type: BaseMessageActionType.Dislike,
                        onClick: () => {},
                        popup: {getContent: () => 'Feedback for the original message'},
                    },
                ]}
            />
        </div>
    );
}
