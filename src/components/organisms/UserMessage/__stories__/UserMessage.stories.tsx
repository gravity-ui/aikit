import {Meta, StoryFn} from '@storybook/react-webpack5';

import {UserMessage, type UserMessageProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/UserMessage',
    component: UserMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        data: {
            control: 'text',
            description: 'Message text',
        },
        actions: {
            control: 'object',
            description: 'Actions',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show actions on hover',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp',
        },
        timestamp: {
            control: 'text',
            description: 'Timestamp',
        },
        withAvatar: {
            control: 'boolean',
            description: 'Show avatar',
        },
        avatarUrl: {
            control: 'text',
            description: 'Avatar URL',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

const buttons = [
    {actionType: 'copy', onClick: () => ({})},
    {actionType: 'edit', onClick: () => ({})},
];

export const Playground: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} />
    </ContentWrapper>
);
Playground.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};

export const MarkdownFormat: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper width="480px">
        <UserMessage {...args} format="markdown" />
    </ContentWrapper>
);
MarkdownFormat.args = {
    content: `
Explain this code snippet: 

\`\`\`
CREATE TABLE log_counter (
  id           INT PRIMARY KEY, -- topicpartition table name id
  next_offset  BIGINT NOT NULL  -- next offset to assign
);

for i in NUM_PARTITIONS:
  CREATE TABLE topicpartition%d (
    id          BIGSERIAL PRIMARY KEY,
    -- strictly increasing offset (indexed by UNIQUE)
    c_offset    BIGINT UNIQUE NOT NULL,
    payload     BYTEA NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  INSERT INTO log_counter(id, next_offset) VALUES (%d, 1);

CREATE TABLE consumer_offsets (
  group_id     TEXT NOT NULL,     -- consumer group identifier
  -- topic-partition id (matches log_counter.id / topicpartitionN)
  topic_id     INT  NOT NULL,
  -- next offset the consumer group should claim
  next_offset  BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (group_id, topic_id)
);
\`\`\`
    `,
    actions: buttons,
};

export const ShowAvatar: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} showAvatar={true} />
    </ContentWrapper>
);
ShowAvatar.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};

export const ShowTimestamp: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper>
        <UserMessage {...args} showTimestamp={true} timestamp="1705312234567" />
    </ContentWrapper>
);
ShowTimestamp.args = {
    content: 'Analyze the project and suggest a better solution to implement a feature-name',
    actions: buttons,
};

export const PlainTextWithLineBreaks: StoryFn<UserMessageProps> = (args) => (
    <ContentWrapper width="480px">
        <UserMessage {...args} format="plain" />
    </ContentWrapper>
);
PlainTextWithLineBreaks.args = {
    content: `Analyze this code:

function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    return total;
}

Can it be improved?`,
    actions: buttons,
};
