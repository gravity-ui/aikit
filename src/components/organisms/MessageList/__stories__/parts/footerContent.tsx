import type {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {TestMascot} from '../../../../../demo/TestMascot';

import {assistantMessage, userMessage} from './shared';

const footer = <TestMascot state="idle" size="4rem" decorative />;

export const WithFooterContent: StoryObj<MessageListProps> = {
    render: (args) => (
        <ContentWrapper width="480px" height="320px" display="flex">
            <MessageList {...args} />
        </ContentWrapper>
    ),
    args: {messages: [userMessage, assistantMessage], footerContent: footer},
};

export const VirtualizedWithFooterContent: StoryObj<MessageListProps> = {
    ...WithFooterContent,
    args: {
        messages: Array.from({length: 30}, (_, index) => ({
            ...assistantMessage,
            id: `footer-message-${index}`,
            content: `Virtualized message ${index + 1}`,
        })),
        footerContent: footer,
        virtualized: true,
    },
};
